import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getVerifiedEmail } from "@/lib/guest-booking-otp";
import { sendGuestBookingConfirmationEmail } from "@/lib/emails/guestBooking";
import { getGuestBookingSelection, getRequiredDeposit, hashVerificationToken } from "@/lib/public-booking";

function getMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function apiError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function POST(request, { params }) {
  let paymentIntentToRefund = null;
  let stripeClient = null;

  try {
    const { slug } = await params;
    const body = await request.json();
    const email = getVerifiedEmail(body.verifiedEmailToken);
    if (!email) {
      return NextResponse.json({ success: false, message: "Verify your email before confirming the booking." }, { status: 401 });
    }

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
    if (!fullName || fullName.length > 120) {
      return NextResponse.json({ success: false, message: "Enter your full name." }, { status: 400 });
    }

    const selection = getGuestBookingSelection(body);
    const vendor = await prisma.vendors.findFirst({
      where: { slug },
      select: { id: true, userId: true, name: true, stripeSecretKey: true },
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
    if (!Number.isFinite(deposit) || deposit < 0) {
      return NextResponse.json({ success: false, message: "The service payment requirement is invalid." }, { status: 400 });
    }

    let stripePaymentIntentId = null;
    if (deposit > 0) {
      if (!body.paymentIntentId || !vendor.stripeSecretKey) {
        return NextResponse.json({ success: false, message: "Complete the required deposit payment to confirm this booking." }, { status: 400 });
      }

      stripeClient = new Stripe(vendor.stripeSecretKey, { apiVersion: "2023-10-16" });
      const paymentIntent = await stripeClient.paymentIntents.retrieve(body.paymentIntentId);
      const metadata = paymentIntent.metadata || {};
      const paymentMatches =
        paymentIntent.status === "succeeded" &&
        paymentIntent.currency === "usd" &&
        paymentIntent.amount === Math.round(deposit * 100) &&
        metadata.guestBooking === "true" &&
        metadata.vendorId === vendor.id &&
        metadata.serviceId === service.id &&
        metadata.locationId === selection.locationId &&
        metadata.professionalId === (selection.professionalId || "") &&
        metadata.date === selection.date &&
        metadata.startTime === selection.startTime &&
        metadata.verificationId === hashVerificationToken(body.verifiedEmailToken);

      if (!paymentMatches) {
        return NextResponse.json({ success: false, message: "The deposit payment could not be verified." }, { status: 400 });
      }

      const existingPaymentBooking = await prisma.bookings.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: { service: true, professional: true, location: true },
      });
      if (existingPaymentBooking) {
        let emailSent = true;
        let emailError = null;
        try {
          await sendGuestBookingConfirmationEmail({
            email,
            name: existingPaymentBooking.customerName || fullName,
            businessName: vendor.name,
            serviceName: existingPaymentBooking.service.name,
            professionalName: existingPaymentBooking.professional?.name,
            locationName: existingPaymentBooking.location?.name || "Business location",
            date: selection.date,
            time: existingPaymentBooking.startTime,
            paidAmount: existingPaymentBooking.paidAmount,
          });
        } catch (error) {
          emailSent = false;
          emailError = "Your booking is confirmed, but we could not send the confirmation email.";
          console.error("Guest booking confirmation email retry failed:", error);
        }
        return NextResponse.json({ success: true, booking: existingPaymentBooking, emailSent, emailError });
      }

      paymentIntentToRefund = paymentIntent.id;
      stripePaymentIntentId = paymentIntent.id;
    } else if (body.paymentIntentId) {
      return NextResponse.json({ success: false, message: "This service does not require a card payment." }, { status: 400 });
    }

    const professional = selection.professionalId
      ? await prisma.professional.findFirst({
          where: {
            id: selection.professionalId,
            vendorId: vendor.id,
            locationId: selection.locationId,
          },
          select: { id: true, name: true },
        })
      : null;
    if (selection.professionalId && !professional) {
      throw apiError("The selected professional is no longer available.", 409);
    }

    const location = await prisma.location.findFirst({
      where: { id: selection.locationId, vendorId: vendor.id },
      select: {
        id: true,
        name: true,
        businessHours: {
          select: { day: true, isOpen: true, openTime: true, closeTime: true },
        },
      },
    });
    if (!location) {
      throw apiError("The selected location is no longer available.", 409);
    }
    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Kathmandu",
    }).format(selection.scheduledAt);
    const hours = location?.businessHours.find((item) => item.day === weekday);
    const closeMinutes = hours?.closeTime ? getMinutes(hours.closeTime) : 0;
    const openMinutes = hours?.openTime ? getMinutes(hours.openTime) : Number.MAX_SAFE_INTEGER;
    const duration = Number(service.duration);
    if (!hours?.isOpen || !Number.isFinite(duration) || duration <= 0 || selection.startMinutes < openMinutes || selection.startMinutes + duration > closeMinutes) {
      throw apiError("The selected time is no longer available. Please choose another appointment time.", 409);
    }

    if (selection.scheduledAt <= new Date()) {
      throw apiError("The selected appointment time has passed.", 409);
    }

    const startTime = selection.startTime;
    const endTime = formatTime(selection.startMinutes + duration);
    const scheduledEnd = new Date(selection.scheduledAt.getTime() + duration * 60 * 1000);
    const dayStart = new Date(`${selection.date}T00:00:00+05:45`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const { booking, alreadyConfirmed } = await prisma.$transaction(async (transaction) => {
      const previousBooking = await transaction.bookings.findFirst({
        where: {
          serviceId: service.id,
          locationId: selection.locationId,
          professionalId: selection.professionalId,
          scheduledAt: selection.scheduledAt,
          customerEmail: email,
          stripePaymentIntentId,
          status: { notIn: ["CANCELED", "PAYMENT_EXPIRED"] },
        },
      });
      if (previousBooking) return { booking: previousBooking, alreadyConfirmed: true };

      const overlappingBookings = await transaction.bookings.findMany({
        where: {
          locationId: selection.locationId,
          professionalId: selection.professionalId,
          scheduledAt: { gte: dayStart, lt: dayEnd },
          status: { notIn: ["CANCELED", "PAYMENT_EXPIRED"] },
        },
        select: { scheduledAt: true, scheduledEnd: true },
      });

      const overlaps = overlappingBookings.some((existing) => {
        const existingStart = new Date(existing.scheduledAt);
        const existingEnd = existing.scheduledEnd ? new Date(existing.scheduledEnd) : new Date(existingStart.getTime() + duration * 60 * 1000);
        return selection.scheduledAt < existingEnd && scheduledEnd > existingStart;
      });
      if (overlaps) {
        throw apiError("That appointment time has just been booked. Please choose another time.", 409);
      }

      let customer = await transaction.customer.findFirst({
        where: { vendorId: vendor.id, email },
      });
      if (customer) {
        customer = await transaction.customer.update({
          where: { id: customer.id },
          data: { fullName, phone: phone || customer.phone },
        });
      } else {
        const customerCount = await transaction.customer.count({ where: { vendorId: vendor.id } });
        customer = await transaction.customer.create({
          data: {
            vendorId: vendor.id,
            customerCode: `CUST-${String(customerCount + 1).padStart(5, "0")}`,
            fullName,
            email,
            phone,
          },
        });
      }

      const paidAmount = deposit > 0 ? Math.round(deposit * 100) / 100 : 0;
      const booking = await transaction.bookings.create({
        data: {
          date: selection.scheduledAt,
          scheduledAt: selection.scheduledAt,
          scheduledEnd,
          startTime,
          endTime,
          userId: vendor.userId,
          serviceId: service.id,
          locationId: location.id,
          professionalId: professional?.id || null,
          customerId: customer.id,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          status: "CONFIRMED",
          paymentRequirement: service.prepaymentType || "pay_later",
          paymentAmount: service.price,
          paymentStatus: paidAmount >= service.price ? "PAID" : paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID",
          paidAmount,
          remainingBalance: Math.max(0, Number(service.price) - paidAmount),
          stripePaymentIntentId,
          paymentGroupId: randomUUID(),
          payments: paidAmount > 0
            ? {
                create: {
                  amount: paidAmount,
                  method: "CARD",
                  type: paidAmount >= service.price ? "BALANCE" : "DEPOSIT",
                  status: "PAID",
                },
              }
            : undefined,
        },
      });
      return { booking, alreadyConfirmed: false };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    let emailSent = true;
    let emailError = null;
    try {
      await sendGuestBookingConfirmationEmail({
        email,
        name: fullName,
        businessName: vendor.name,
        serviceName: service.name,
        professionalName: professional?.name,
        locationName: location.name || "Business location",
        date: selection.date,
        time: selection.time,
        paidAmount: deposit,
      });
    } catch (error) {
      emailSent = false;
      emailError = "Your booking is confirmed, but we could not send the confirmation email.";
      console.error("Guest booking confirmation email failed:", error);
    }

    return NextResponse.json({ success: true, booking, emailSent, emailError }, { status: alreadyConfirmed ? 200 : 201 });
  } catch (error) {
    console.error("Guest booking confirmation failed:", error);
    let message = error.code === "P2034"
      ? "That appointment time has just been booked. Please choose another time."
      : error.message || "Unable to confirm the booking.";
    if (paymentIntentToRefund && stripeClient) {
      try {
        await stripeClient.refunds.create({ payment_intent: paymentIntentToRefund });
        message = `${message} The deposit payment has been refunded.`;
      } catch (refundError) {
        console.error("Refund failed after guest booking slot conflict:", refundError);
        message = `${message} Your card was charged and the refund could not be started automatically; contact the business.`;
      }
    }
    const status = error.code === "P2034" ? 409 : error.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
