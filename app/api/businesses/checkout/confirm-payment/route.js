import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { confirmPaymentIntent, getStripeAccount, attachPaymentMethod, setDefaultPaymentMethod } from "@/lib/stripe-client";
import { createVendorSubscription } from "@/lib/subscriptions";
import { sendSubscriptionUpgradeEmail } from "@/lib/emails/subscriptionUpgradeSuccess";

export async function POST(request) {
  try {
    const session = await getCurrentSession();

    if (!session || session.role !== "VENDOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentIntentId, planId, paymentMethodId, saveCard } = await request.json();

    if (!paymentIntentId || !planId) {
      return NextResponse.json({ error: "paymentIntentId and planId are required" }, { status: 400 });
    }

    // Get vendor
    const vendor = await prisma.vendors.findFirst({
      where: { userId: session.id },
      include: { user: true, subscriptions: { take: 1 } },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Verify plan exists
    const plan = await prisma.plans.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        price: true,
        billing_cycle: true,
        professional: true,
        location: true,
        extraLocationPrice: true,
        extraProfessionalPrice: true,
        duration: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Confirm payment
    const paymentIntent = await confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: `Payment failed with status: ${paymentIntent.status}` }, { status: 400 });
    }

    // Attach payment method if provided and saveCard is true
    if (paymentMethodId && saveCard) {
      try {
        await attachPaymentMethod(paymentMethodId, vendor.id);

        // Set as default if no default exists
        const existingMethods = await prisma.vendorPaymentMethod.findFirst({
          where: { vendorId: vendor.id },
        });

        if (!existingMethods) {
          await setDefaultPaymentMethod(paymentMethodId, vendor.id);
        }

        // Save payment method to database
        await prisma.vendorPaymentMethod.create({
          data: {
            vendorId: vendor.id,
            stripePaymentMethodId: paymentMethodId,
            isDefault: !existingMethods,
          },
        });
      } catch (error) {
        console.error("Error saving payment method:", error);
        // Don't fail the whole request, payment already succeeded
      }
    }

    // Calculate new expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    // Update vendor with new plan and expiry
    await prisma.vendors.update({
      where: { id: vendor.id },
      data: {
        planId: planId,
        subscriptionExpiresAt: expiryDate,
        autoRenewEnabled: true,
      },
    });

    // Create/update subscription inside a transaction
    await prisma.$transaction(async (tx) => {
      // Deactivate any existing active subscriptions first
      await tx.vendorSubscription.updateMany({
        where: {
          vendorId: vendor.id,
          status: { in: ["ACTIVE", "TRIAL_ACTIVE", "TRIAL_EXPIRING"] },
        },
        data: { status: "INACTIVE" },
      });

      await createVendorSubscription(tx, {
        vendorId: vendor.id,
        plan,
        planId: plan.id,
        status: "ACTIVE",
        locationCount: plan.location || 1,
        professionalCount: plan.professional || 1,
      });
    });

    // Create payment history record
    await prisma.subscriptionPaymentHistory.create({
      data: {
        vendorId: vendor.id,
        subscriptionId: vendor.subscriptions[0]?.id,
        type: "INITIAL",
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        stripePaymentIntentId: paymentIntentId,
        status: "SUCCEEDED",
        chargedAt: new Date(paymentIntent.created * 1000),
      },
    });

    // Send confirmation email
    try {
      await sendSubscriptionUpgradeEmail({
        email: vendor.user.email,
        vendorName: vendor.name,
        planName: plan.name,
        amount: paymentIntent.amount / 100,
        expiryDate,
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription upgraded successfully",
      expiryDate,
      planName: plan.name,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json({ error: error.message || "Failed to confirm payment" }, { status: 500 });
  }
}
