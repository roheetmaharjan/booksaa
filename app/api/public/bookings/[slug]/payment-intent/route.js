import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getVerifiedEmail } from "@/lib/guest-booking-otp";
import { getGuestBookingSelection, getRequiredDeposit, hashVerificationToken } from "@/lib/public-booking";

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const verifiedEmail = getVerifiedEmail(body.verifiedEmailToken);
    if (!verifiedEmail) {
      return NextResponse.json({ success: false, message: "Verify your email before continuing." }, { status: 401 });
    }

    const selection = getGuestBookingSelection(body);
    const vendor = await prisma.vendors.findFirst({
      where: { slug },
      select: { id: true, name: true, stripeSecretKey: true, stripePublishableKey: true },
    });
    if (!vendor) {
      return NextResponse.json({ success: false, message: "Business not found." }, { status: 404 });
    }

    const service = await prisma.service.findFirst({
      where: { id: selection.serviceId, vendorId: vendor.id, locationId: selection.locationId },
    });
    if (!service) {
      return NextResponse.json({ success: false, message: "The selected service is no longer available." }, { status: 404 });
    }

    const deposit = getRequiredDeposit(service);
    if (!Number.isFinite(deposit) || deposit <= 0) {
      return NextResponse.json({ success: false, message: "This service does not require a deposit." }, { status: 400 });
    }
    if (!vendor.stripeSecretKey || !vendor.stripePublishableKey) {
      return NextResponse.json({ success: false, message: "Card payments are not configured for this business. Please contact the business." }, { status: 503 });
    }

    const location = await prisma.location.findFirst({
      where: { id: selection.locationId, vendorId: vendor.id },
      select: {
        businessHours: {
          select: { day: true, isOpen: true, openTime: true, closeTime: true },
        },
      },
    });
    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Kathmandu",
    }).format(selection.scheduledAt);
    const hours = location?.businessHours.find((item) => item.day === weekday);
    const startMinutes = selection.startMinutes;
    const endMinutes = startMinutes + Number(service.duration);
    const openMinutes = hours?.openTime ? Number(hours.openTime.slice(0, 2)) * 60 + Number(hours.openTime.slice(3, 5)) : Number.MAX_SAFE_INTEGER;
    const closeMinutes = hours?.closeTime ? Number(hours.closeTime.slice(0, 2)) * 60 + Number(hours.closeTime.slice(3, 5)) : 0;
    if (!hours?.isOpen || startMinutes < openMinutes || endMinutes > closeMinutes || selection.scheduledAt <= new Date()) {
      return NextResponse.json({ success: false, message: "The selected time is no longer available. Choose another appointment time." }, { status: 409 });
    }

    if (selection.professionalId) {
      const professional = await prisma.professional.findFirst({
        where: {
          id: selection.professionalId,
          vendorId: vendor.id,
          locationId: selection.locationId,
        },
        select: { id: true },
      });
      if (!professional) {
        return NextResponse.json({ success: false, message: "The selected professional is no longer available." }, { status: 404 });
      }
    }

    const dayStart = new Date(`${selection.date}T00:00:00+05:45`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const existingBookings = await prisma.bookings.findMany({
      where: {
        locationId: selection.locationId,
        professionalId: selection.professionalId,
        scheduledAt: { gte: dayStart, lt: dayEnd },
        status: { notIn: ["CANCELED", "PAYMENT_EXPIRED"] },
      },
      select: { scheduledAt: true, scheduledEnd: true },
    });
    const scheduledEnd = new Date(selection.scheduledAt.getTime() + Number(service.duration) * 60 * 1000);
    const conflicts = existingBookings.some((booking) => {
      const existingStart = new Date(booking.scheduledAt);
      const existingEnd = booking.scheduledEnd ? new Date(booking.scheduledEnd) : new Date(existingStart.getTime() + Number(service.duration) * 60 * 1000);
      return selection.scheduledAt < existingEnd && scheduledEnd > existingStart;
    });
    if (conflicts) {
      return NextResponse.json({ success: false, message: "The selected time has just been booked. Choose another appointment time." }, { status: 409 });
    }

    const stripe = new Stripe(vendor.stripeSecretKey, { apiVersion: "2023-10-16" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(deposit * 100),
      currency: "usd",
      receipt_email: verifiedEmail,
      description: `Guest booking deposit: ${service.name}`,
      metadata: {
        guestBooking: "true",
        vendorId: vendor.id,
        serviceId: service.id,
        locationId: selection.locationId,
        professionalId: selection.professionalId || "",
        date: selection.date,
        startTime: selection.startTime,
        verificationId: hashVerificationToken(body.verifiedEmailToken),
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      publishableKey: vendor.stripePublishableKey,
      depositAmount: deposit,
    });
  } catch (error) {
    console.error("Guest booking payment setup failed:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Unable to set up the deposit payment." },
      { status: error.status || 500 },
    );
  }
}
