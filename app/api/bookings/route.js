import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { createCustomerCode, findCustomerDuplicates, getCurrentVendorOrThrow, normalizeEmail, normalizePhone } from "@/lib/customer-crm";
import { sendPaymentLinkEmail, sendBookingConfirmationEmail } from "@/lib/sendBookingEmails";
import { BookingStatus } from "@/constants/enums";

// Helper to calculate deposit required for a service
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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const locationId = searchParams.get("locationId");
    const professionalId = searchParams.get("professionalId");
    const startDate = searchParams.get("startDate") || searchParams.get("start");
    const endDate = searchParams.get("endDate") || searchParams.get("end");
    const vendorId = searchParams.get("vendorId");

    // Dynamic auto-expiration of unpaid payment-link bookings
    const now = new Date();
    await prisma.bookings.updateMany({
      where: {
        status: "PENDING_PAYMENT",
        paymentLinkExpiresAt: { lt: now },
      },
      data: {
        status: BookingStatus.PAYMENT_EXPIRED,
      },
    });

    // Build filter object
    const where = {};

    if (vendorId) {
      try {
        // Get all professionals for this vendor
        const professionals = await prisma.professional.findMany({
          where: { vendorId },
          select: { id: true },
        });
        where.professionalId = { in: professionals.map((p) => p.id) };
      } catch (error) {
        console.error("Error fetching professionals:", error);
      }
    }

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    // Date range filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.date.lt = end;
      }
    }

    // Fetch bookings with relations
    const bookings = await prisma.bookings.findMany({
      where,
      include: {
        service: true,
        customer: true,
        payments: {
          orderBy: { createdAt: "asc" },
        },
        professional: {
          include: {
            role: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return Response.json({ bookings: bookings || [] }, { status: 200 });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return Response.json({ bookings: [] }, { status: 200 });
  }
}

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const body = await req.json();

    // Support single serviceId or array of serviceIds
    const serviceIds = Array.isArray(body.serviceIds)
      ? body.serviceIds
      : body.serviceId
      ? [body.serviceId]
      : [];

    if (serviceIds.length === 0 || !body.scheduledAt) {
      return Response.json({ error: "Service and scheduled time are required." }, { status: 400 });
    }

    // Fetch details of selected services
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        vendorId: vendor.id,
      },
    });

    if (services.length !== serviceIds.length) {
      return Response.json({ error: "One or more services not found for this business." }, { status: 404 });
    }

    // Customer resolution
    const email = normalizeEmail(body.customerEmail);
    const phone = normalizePhone(body.customerPhone);
    let customer = null;

    if (body.customerId) {
      customer = await prisma.customer.findFirst({
        where: { id: body.customerId, vendorId: vendor.id },
      });
    }

    if (!customer && (email || phone || body.customerName)) {
      const duplicates = await findCustomerDuplicates(vendor.id, { email, phone });
      customer = duplicates[0] || null;

      if (!customer && body.customerName) {
        customer = await prisma.customer.create({
          data: {
            vendorId: vendor.id,
            customerCode: await createCustomerCode(vendor.id),
            fullName: body.customerName,
            email,
            phone,
            notes: body.notes || null,
          },
        });
      }
    }

    const customerName = customer?.fullName || body.customerName || "Customer";
    const customerEmail = customer?.email || email;

    // Fetch professional details if any
    const professional = body.professionalId
      ? await prisma.professional.findFirst({ where: { id: body.professionalId, vendorId: vendor.id } })
      : null;

    // Calculate pricing and payment requirements
    let totalAmount = 0;
    let totalDepositRequired = 0;
    const servicesPaymentInfo = services.map((svc) => {
      const deposit = getDepositRequired(svc);
      totalAmount += svc.price;
      totalDepositRequired += deposit;
      return {
        serviceId: svc.id,
        price: svc.price,
        depositRequired: deposit,
        prepaymentType: svc.prepaymentType,
      };
    });

    const totalRemainingBalance = totalAmount - totalDepositRequired;

    // Group ID to link these bookings
    const paymentGroupId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Determine target booking status and payment status based on payment option chosen
    const paymentOption = body.paymentOption || "pay_later"; // options: collect_now_cash, collect_now_card, send_link, pay_at_business, pay_later
    let targetBookingStatus = "CONFIRMED";
    let targetPaymentStatus = "UNPAID";
    let paidAmount = 0;
    let remainingBalance = totalAmount;
    let paymentMethod = null;
    let stripePaymentIntentId = body.stripePaymentIntentId || null;
    let paymentLink = null;
    let paymentLinkExpiresAt = null;

    if (paymentOption === "collect_now_cash") {
      targetBookingStatus = "CONFIRMED";
      paidAmount = totalDepositRequired > 0 ? totalDepositRequired : totalAmount; // Default to paying deposit, or full if no deposit
      remainingBalance = totalAmount - paidAmount;
      targetPaymentStatus = paidAmount >= totalAmount ? "PAID" : (paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID");
      paymentMethod = "CASH";
    } else if (paymentOption === "collect_now_card") {
      targetBookingStatus = "CONFIRMED";
      paidAmount = totalDepositRequired > 0 ? totalDepositRequired : totalAmount;
      remainingBalance = totalAmount - paidAmount;
      targetPaymentStatus = paidAmount >= totalAmount ? "PAID" : (paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID");
      paymentMethod = "CARD";
    } else if (paymentOption === "send_link") {
      targetBookingStatus = "CONFIRMED";
      targetPaymentStatus = totalDepositRequired > 0 ? "PARTIALLY_PAID" : "UNPAID";
      paidAmount = 0;
      remainingBalance = totalAmount;
      paymentLinkExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      const origin = req.headers.get("origin") || "http://localhost:3000";
      paymentLink = `${origin}/pay/${paymentGroupId}`;
    } else {
      // pay_later (standard when no prepayment is required)
      targetBookingStatus = "PENDING_PAYMENT";
      targetPaymentStatus = "UNPAID";
      paidAmount = 0;
      remainingBalance = totalAmount;
      paymentMethod = "PAY_LATER";
    }

    // Sequential booking creation
    let currentStartTime = new Date(body.scheduledAt);
    const createdBookings = [];

    for (let i = 0; i < services.length; i++) {
      const svc = services[i];
      const duration = svc.duration || 30;
      const scheduledEnd = new Date(currentStartTime.getTime() + duration * 60 * 1000);

      // Distribute payment amounts proportionally to the service price
      const serviceWeight = svc.price / (totalAmount || 1);
      const svcPaidAmount = paidAmount * serviceWeight;
      const svcRemainingBalance = svc.price - svcPaidAmount;
      const svcDeposit = getDepositRequired(svc);

      // Format start and end time strings (HH:mm)
      const pad = (n) => String(n).padStart(2, '0');
      const startTimeStr = `${pad(currentStartTime.getHours())}:${pad(currentStartTime.getMinutes())}`;
      const endTimeStr = `${pad(scheduledEnd.getHours())}:${pad(scheduledEnd.getMinutes())}`;

      const booking = await prisma.bookings.create({
        data: {
          date: currentStartTime,
          scheduledAt: currentStartTime,
          scheduledEnd: scheduledEnd,
          startTime: startTimeStr,
          endTime: endTimeStr,
          userId: session.id,
          serviceId: svc.id,
          locationId: body.locationId || svc.locationId || null,
          professionalId: body.professionalId || null,
          customerId: customer?.id || null,
          customerName,
          customerEmail,
          customerPhone: phone,
          notes: body.notes || null,
          status: targetBookingStatus,
          paymentRequirement: svc.prepaymentType,
          paymentAmount: svc.price,
          paymentStatus: targetPaymentStatus,
          paidAmount: svcPaidAmount,
          remainingBalance: svcRemainingBalance,
          stripePaymentIntentId,
          paymentLink,
          paymentLinkExpiresAt,
          paymentGroupId,
          payments: svcPaidAmount > 0 ? {
            create: {
              amount: svcPaidAmount,
              method: paymentMethod,
              type: svcPaidAmount < svc.price ? "DEPOSIT" : "BALANCE",
              status: "PAID",
            },
          } : undefined,
        },
      });

      createdBookings.push(booking);

      // Advance time for next service
      currentStartTime = scheduledEnd;
    }

    // Handle notifications / emails
    const bookingDetailsForEmail = createdBookings.map((b, idx) => ({
      serviceName: services[idx].name,
      professionalName: professional?.name || "Staff Member",
      scheduledAt: b.scheduledAt,
      startTime: b.startTime,
      price: b.paymentAmount,
    }));

    if (paymentOption === "send_link" && customerEmail) {
      await sendPaymentLinkEmail(
        customerEmail,
        customerName,
        bookingDetailsForEmail,
        paymentLink,
        totalDepositRequired > 0 ? totalDepositRequired : totalAmount
      );
    } else if (targetBookingStatus === "CONFIRMED" && customerEmail) {
      await sendBookingConfirmationEmail(customerEmail, customerName, bookingDetailsForEmail);
    }

    return Response.json({
      booking: createdBookings[0], // Return first booking for calendar backwards compatibility
      bookings: createdBookings,
      paymentGroupId,
      paymentLink,
    }, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return Response.json({ error: error.message || "Unable to create booking." }, { status: error.status || 500 });
  }
}
