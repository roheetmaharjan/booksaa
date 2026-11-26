import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { groupId } = await params;

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const now = new Date();

    // Auto-expire bookings in this group if past deadline
    await prisma.bookings.updateMany({
      where: {
        paymentGroupId: groupId,
        status: "PENDING_PAYMENT",
        paymentLinkExpiresAt: { lt: now },
      },
      data: {
        status: "PAYMENT_EXPIRED",
      },
    });

    const bookings = await prisma.bookings.findMany({
      where: { paymentGroupId: groupId },
      include: {
        service: true,
        professional: {
          select: {
            name: true,
          },
        },
      },
    });

    if (bookings.length === 0) {
      return NextResponse.json({ error: "Booking group not found" }, { status: 404 });
    }

    let totalAmount = 0;
    let totalDepositRequired = 0;
    let totalPaid = 0;
    let totalRemainingBalance = 0;
    let amountToPay = 0;

    const servicesList = bookings.map((b) => {
      const price = Number(b.paymentAmount);
      const deposit = Number(b.depositAmount || 0);
      const paidAmount = Number(b.paidAmount || 0);
      totalAmount += price;
      totalDepositRequired += deposit;
      totalPaid += paidAmount;
      totalRemainingBalance += Math.max(0, price - paidAmount);
      amountToPay += Math.max(0, deposit - paidAmount);

      return {
        id: b.id,
        serviceName: b.service.name,
        professionalName: b.professional?.name || "Staff Member",
        scheduledAt: b.scheduledAt,
        startTime: b.startTime,
        price,
        depositRequired: deposit,
        status: b.status,
      };
    });

    const firstBooking = bookings[0];
    const isExpired = firstBooking.status === "PAYMENT_EXPIRED" || (firstBooking.paymentLinkExpiresAt && new Date(firstBooking.paymentLinkExpiresAt) < now);

    // Fetch vendor details
    const vendor = await prisma.vendors.findUnique({
      where: { id: firstBooking.service.vendorId },
      select: {
        name: true,
        stripePublishableKey: true,
      },
    });

    return NextResponse.json({
      paymentGroupId: groupId,
      vendorName: vendor?.name || "Our Business",
      stripePublishableKey: vendor?.stripePublishableKey || "",
      services: servicesList,
      totalAmount,
      depositRequired: totalDepositRequired,
      paidAmount: totalPaid,
      remainingBalance: totalRemainingBalance,
      amountToPay,
      status: firstBooking.status,
      isExpired,
      paymentLinkExpiresAt: firstBooking.paymentLinkExpiresAt,
      customerEmail: firstBooking.customerEmail,
      customerName: firstBooking.customerName,
    });
  } catch (error) {
    console.error("Fetch public booking group error:", error);
    return NextResponse.json({ error: "Failed to load booking group details" }, { status: 500 });
  }
}
