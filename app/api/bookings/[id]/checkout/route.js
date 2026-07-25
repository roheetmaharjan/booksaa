import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { getCurrentVendorOrThrow } from "@/lib/customer-crm";

const bookingSelect = {
  id: true,
  date: true,
  createdAt: true,
  status: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  paymentAmount: true,
  paymentRequirement: true,
  paymentStatus: true,
  paidAmount: true,
  remainingBalance: true,
  paymentMethod: true,
  notes: true,
  scheduledAt: true,
  scheduledEnd: true,
  startTime: true,
  endTime: true,
  service: {
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      locationId: true,
    },
  },
  professional: {
    select: {
      id: true,
      name: true,
    },
  },
  location: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  customer: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
    },
  },
};

function normalizePaymentMethod(method) {
  const normalized = String(method || "").toUpperCase();
  if (["CASH", "CARD", "GIFT_CARD", "SPLIT"].includes(normalized)) {
    return normalized;
  }
  return "CARD";
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.bookings.findFirst({
      where: {
        id,
        service: { vendorId: vendor.id },
      },
      select: bookingSelect,
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Booking checkout fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load booking checkout data" },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const { amountPaid, paymentMethod } = await req.json();

    if (amountPaid === undefined || isNaN(Number(amountPaid)) || Number(amountPaid) < 0) {
      return NextResponse.json({ error: "A valid amount paid is required" }, { status: 400 });
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

    const booking = await prisma.bookings.findFirst({
      where: {
        id,
        service: { vendorId: vendor.id },
      },
      select: {
        id: true,
        paymentAmount: true,
        paidAmount: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const paidAmount = Number(amountPaid);
    const newPaidAmount = booking.paidAmount + paidAmount;
    const newRemainingBalance = Math.max(0, booking.paymentAmount - newPaidAmount);

    let paymentStatus = "UNPAID";
    if (newPaidAmount >= booking.paymentAmount) {
      paymentStatus = "PAID";
    } else if (newPaidAmount > 0) {
      paymentStatus = "PARTIALLY_PAID";
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id },
      data: {
        status: newPaidAmount >= booking.paymentAmount ? "COMPLETED" : booking.status,
        paidAmount: newPaidAmount,
        remainingBalance: newRemainingBalance,
        paymentStatus,
        paymentMethod: normalizedPaymentMethod,
      },
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error("Booking checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process booking checkout" },
      { status: error.status || 500 }
    );
  }
}
