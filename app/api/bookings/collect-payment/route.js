import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { getCurrentVendorOrThrow } from "@/lib/customer-crm";
import Stripe from "stripe";

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    const vendorDetails = await getCurrentVendorOrThrow(session);

    const { amount } = await req.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "A valid payment amount is required" }, { status: 400 });
    }

    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorDetails.id },
      select: { stripeSecretKey: true, stripePublishableKey: true },
    });

    if (!vendor || !vendor.stripeSecretKey) {
      return NextResponse.json({ error: "Stripe is not configured for this business. Please configure it in Settings." }, { status: 400 });
    }

    const stripe = new Stripe(vendor.stripeSecretKey, { apiVersion: "2023-10-16" });

    // Create payment intent using the vendor's secret key
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: {
        vendorId: vendorDetails.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: vendor.stripePublishableKey,
    });
  } catch (error) {
    console.error("Create collect-payment intent error:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment intent" }, { status: 500 });
  }
}
