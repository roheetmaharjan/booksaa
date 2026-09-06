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

    const { amountPaid, paymentMethod, bookingIds } = await req.json();

    if (amountPaid === undefined || isNaN(Number(amountPaid)) || Number(amountPaid) < 0) {
      return NextResponse.json({ error: "A valid amount paid is required" }, { status: 400 });
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

    const requestedIds = [...new Set(Array.isArray(bookingIds) && bookingIds.length ? bookingIds : [id])];
    if (!requestedIds.includes(id)) requestedIds.unshift(id);

    const bookings = await prisma.bookings.findMany({
      where: {
        id: { in: requestedIds },
        service: { vendorId: vendor.id },
      },
      select: {
        id: true,
        paymentAmount: true,
        paidAmount: true,
        status: true,
      },
    });

    if (bookings.length !== requestedIds.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const paidAmount = Number(amountPaid);
    const totalOutstanding = bookings.reduce((sum, booking) => sum + Math.max(0, Number(booking.paymentAmount) - Number(booking.paidAmount)), 0);
    const updatedBookings = await prisma.$transaction(bookings.map((booking) => {
      const outstanding = Math.max(0, Number(booking.paymentAmount) - Number(booking.paidAmount));
      const allocation = totalOutstanding ? Math.min(outstanding, paidAmount * (outstanding / totalOutstanding)) : 0;
      const newPaidAmount = Number(booking.paidAmount) + allocation;
      const newRemainingBalance = Math.max(0, Number(booking.paymentAmount) - newPaidAmount);
      const paymentStatus = newPaidAmount >= Number(booking.paymentAmount) ? "PAID" : newPaidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID";
      return prisma.bookings.update({ where: { id: booking.id }, data: { status: newRemainingBalance === 0 ? "COMPLETED" : booking.status, paidAmount: newPaidAmount, remainingBalance: newRemainingBalance, paymentStatus, paymentMethod: normalizedPaymentMethod } });
    }));

    return NextResponse.json({ success: true, bookings: updatedBookings });
  } catch (error) {
    console.error("Booking checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process booking checkout" },
      { status: error.status || 500 }
    );
  }
}
