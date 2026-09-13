import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { getCurrentVendorOrThrow } from "@/lib/customer-crm";

export async function GET(_req, { params }) {
  try {
    const { id, sessionId } = await params;
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const details = await prisma.vendors.findUnique({ where: { id: vendor.id }, select: { stripeSecretKey: true } });
    if (!details?.stripeSecretKey) return NextResponse.json({ error: "Stripe is not configured for this business." }, { status: 400 });
    const stripe = new Stripe(details.stripeSecretKey, { apiVersion: "2023-10-16" });
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const ids = (checkout.metadata?.bookingIds || "").split(",").filter(Boolean);
    if (!ids.includes(id) || checkout.metadata?.vendorId !== vendor.id) return NextResponse.json({ error: "Payment session does not match this booking." }, { status: 403 });
    if (checkout.payment_status !== "paid") return NextResponse.json({ paid: false, status: checkout.payment_status });
    const bookings = await prisma.bookings.findMany({ where: { id: { in: ids }, service: { vendorId: vendor.id } }, select: { id: true, paymentAmount: true } });
    await prisma.$transaction(bookings.map((booking) => prisma.bookings.update({ where: { id: booking.id }, data: { status: "COMPLETED", paymentStatus: "PAID", paidAmount: Number(booking.paymentAmount), remainingBalance: 0, paymentMethod: "QR", stripePaymentIntentId: typeof checkout.payment_intent === "string" ? checkout.payment_intent : null } })));
    return NextResponse.json({ paid: true });
  } catch (error) {
    console.error("QR checkout status error:", error);
    return NextResponse.json({ error: error.message || "Unable to verify QR payment" }, { status: 500 });
  }
}
