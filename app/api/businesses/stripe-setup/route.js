import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { getCurrentVendorOrThrow } from "@/lib/customer-crm";
import { verifyStripeKeys } from "@/lib/stripe-client";

export async function GET(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);

    const vendorDetails = await prisma.vendors.findUnique({
      where: { id: vendor.id },
      select: {
        stripePublishableKey: true,
        stripeSecretKey: true,
      },
    });

    return NextResponse.json({
      stripePublishableKey: vendorDetails?.stripePublishableKey || "",
      hasSecretKey: !!vendorDetails?.stripeSecretKey,
    });
  } catch (error) {
    console.error("GET Stripe credentials error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve credentials" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);

    const { stripePublishableKey, stripeSecretKey } = await req.json();

    if (!stripePublishableKey?.trim() || !stripeSecretKey?.trim()) {
      return NextResponse.json(
        { error: "Stripe Publishable Key and Secret Key are required." },
        { status: 400 }
      );
    }

    // Verify the Stripe keys
    const verification = await verifyStripeKeys(stripeSecretKey, stripePublishableKey);
    if (!verification.valid) {
      return NextResponse.json(
        { error: `Invalid Stripe credentials: ${verification.error}` },
        { status: 400 }
      );
    }

    // Update vendor credentials
    await prisma.vendors.update({
      where: { id: vendor.id },
      data: {
        stripePublishableKey: stripePublishableKey.trim(),
        stripeSecretKey: stripeSecretKey.trim(),
      },
    });

    return NextResponse.json({ success: true, message: "Stripe credentials verified and saved successfully." });
  } catch (error) {
    console.error("POST Stripe credentials error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save credentials" },
      { status: error.status || 500 }
    );
  }
}
