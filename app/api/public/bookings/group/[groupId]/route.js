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

    // Helper to calculate deposit required
    function getDepositRequired(service) {
      if (service.prepaymentType === "full") {
        return service.price;
      }
      if (service.prepaymentType === "deposit") {
        if (service.depositType === "fixed") {
          return Number(service.depositValue || 0);
        }
        if (service.depositType === "percent") {
          return service.price * (Number(service.depositValue || 0) / 100);
        }
      }
      return 0;
    }

    let totalAmount = 0;
    let totalDepositRequired = 0;
    let totalPaid = 0;

    const servicesList = bookings.map((b) => {
      const deposit = getDepositRequired(b.service);
      totalAmount += b.service.price;
      totalDepositRequired += deposit;
      totalPaid += b.paidAmount;

      return {
        id: b.id,
        serviceName: b.service.name,
        professionalName: b.professional?.name || "Staff Member",
        scheduledAt: b.scheduledAt,
        startTime: b.startTime,
        price: b.service.price,
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

    const totalRemainingBalance = totalAmount - totalPaid;
    const amountToPay = Math.max(0, totalDepositRequired - totalPaid);

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
