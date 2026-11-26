import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getVerifiedEmail } from "@/lib/guest-booking-otp";
import { getEffectivePaymentRequirement, getGuestBookingSelection, getRequiredDeposit, hashVerificationToken } from "@/lib/public-booking";
import { DEFAULT_VENDOR_SETTINGS, getZonedDayBounds, isBookingWithinWindow } from "@/lib/business-settings";
import { roundCurrencyAmount, toMinorCurrencyUnits } from "@/lib/booking-deposit";

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const verifiedEmail = getVerifiedEmail(body.verifiedEmailToken);
    if (!verifiedEmail) {
      return NextResponse.json({ success: false, message: "Verify your email before continuing." }, { status: 401 });
    }

    const vendor = await prisma.vendors.findFirst({
      where: { slug },
      select: {
        id: true,
        name: true,
        stripeSecretKey: true,
        stripePublishableKey: true,
        settings: {
          select: {
            onlineBookingEnabled: true,
            onlinePaymentsEnabled: true,
            depositsEnabled: true,
            currencyCode: true,
            timeZone: true,
            cashPaymentsEnabled: true,
            payAtBusinessEnabled: true,
            minAdvanceNoticeMinutes: true,
            maxAdvanceBookingDays: true,
          },
        },
      },
    });
    if (!vendor) {
      return NextResponse.json({ success: false, message: "Business not found." }, { status: 404 });
    }
    const settings = { ...DEFAULT_VENDOR_SETTINGS, ...vendor.settings };
    if (!settings.onlineBookingEnabled || (!settings.onlinePaymentsEnabled && !settings.cashPaymentsEnabled && !settings.payAtBusinessEnabled)) {
      return NextResponse.json({ success: false, message: "Online booking is currently unavailable for this business." }, { status: 403 });
    }
    if (!settings.onlinePaymentsEnabled) {
      return NextResponse.json({ success: false, message: "Online payments are currently unavailable for this business." }, { status: 403 });
    }
    const selection = getGuestBookingSelection(body, settings.timeZone);
    if (!isBookingWithinWindow(selection.scheduledAt, selection.date, settings, settings.timeZone)) {
      return NextResponse.json({ success: false, message: "The selected time is outside this business's booking window." }, { status: 409 });
    }

    const service = await prisma.service.findFirst({
      where: { id: selection.serviceId, vendorId: vendor.id, locationId: selection.locationId },
    });
    if (!service) {
      return NextResponse.json({ success: false, message: "The selected service is no longer available." }, { status: 404 });
    }

    const paymentAmount = roundCurrencyAmount(service.price, settings.currencyCode);
    const bookingService = { ...service, price: paymentAmount };
    const paymentRequirement = getEffectivePaymentRequirement(bookingService, settings);
    const deposit = getRequiredDeposit({ ...bookingService, prepaymentType: paymentRequirement }, settings);
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
      timeZone: settings.timeZone,
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

    const dayBounds = getZonedDayBounds(selection.date, settings.timeZone);
    if (!dayBounds) {
      return NextResponse.json({ success: false, message: "Unable to determine the selected business day." }, { status: 400 });
    }
    const existingBookings = await prisma.bookings.findMany({
      where: {
        locationId: selection.locationId,
        professionalId: selection.professionalId,
        scheduledAt: { gte: dayBounds.start, lt: dayBounds.end },
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
      amount: toMinorCurrencyUnits(deposit, settings.currencyCode),
      currency: settings.currencyCode.toLowerCase(),
      receipt_email: verifiedEmail,
      description: `Guest booking deposit: ${service.name}`,
      metadata: {
        guestBooking: "true",
        vendorId: vendor.id,
        serviceId: service.id,
        paymentAmount: String(paymentAmount),
        paymentRequirement,
        depositAmount: String(deposit),
        depositType: service.depositType || "",
        depositValue: service.depositValue === null ? "" : String(service.depositValue),
        locationId: selection.locationId,
        professionalId: selection.professionalId || "",
        date: selection.date,
        startTime: selection.startTime,
        currencyCode: settings.currencyCode,
        verificationId: hashVerificationToken(body.verifiedEmailToken),
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      publishableKey: vendor.stripePublishableKey,
      depositAmount: deposit,
      paymentRequirement,
      currencyCode: settings.currencyCode,
    });
  } catch (error) {
    console.error("Guest booking payment setup failed:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Unable to set up the deposit payment." },
      { status: error.status || 500 },
    );
  }
}
