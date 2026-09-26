import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { getCurrentVendorOrThrow } from "@/lib/customer-crm";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const { bookingIds = [id], amountPaid } = await req.json();
    const ids = [...new Set(bookingIds)];
    if (!ids.includes(id)) ids.unshift(id);
    const bookings = await prisma.bookings.findMany({ where: { id: { in: ids }, service: { vendorId: vendor.id } }, include: { service: true } });
    if (bookings.length !== ids.length) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    const amount = Number(amountPaid);
    const outstanding = bookings.reduce((sum, booking) => sum + Math.max(0, Number(booking.paymentAmount) - Number(booking.paidAmount)), 0);
    if (!Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) !== Math.round(outstanding * 100)) {
      return NextResponse.json({ error: `QR payment must collect the outstanding balance of ${outstanding.toFixed(2)}.` }, { status: 400 });
    }
    const details = await prisma.vendors.findUnique({ where: { id: vendor.id }, select: { stripeSecretKey: true } });
    if (!details?.stripeSecretKey) return NextResponse.json({ error: "Stripe is not configured for this business." }, { status: 400 });
    const stripe = new Stripe(details.stripeSecretKey, { apiVersion: "2023-10-16" });
    const origin = req.headers.get("origin") || new URL(req.url).origin;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment", currency: "usd", payment_method_types: ["card"],
      customer_email: bookings[0].customerEmail || undefined,
      line_items: [{ price_data: { currency: "usd", product_data: { name: `Appointment — ${bookings[0].customerName || "Customer"}` }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
      metadata: { bookingIds: ids.join(","), vendorId: vendor.id },
      success_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pay/cancelled`,
    });
    return NextResponse.json({ sessionId: checkout.id, checkoutUrl: checkout.url });
  } catch (error) {
    console.error("QR checkout creation error:", error);
    return NextResponse.json({ error: error.message || "Unable to create QR payment" }, { status: 500 });
  }
}
