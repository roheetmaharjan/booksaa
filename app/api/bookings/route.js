import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { createCustomerCode, findCustomerDuplicates, getCurrentVendorOrThrow, normalizeEmail, normalizePhone } from "@/lib/customer-crm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const locationId = searchParams.get("locationId");
    const professionalId = searchParams.get("professionalId");
    const startDate = searchParams.get("startDate") || searchParams.get("start");
    const endDate = searchParams.get("endDate") || searchParams.get("end");
    const vendorId = searchParams.get("vendorId");

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
    // Return empty array on error instead of failing
    return Response.json({ bookings: [] }, { status: 200 });
  }
}

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const body = await req.json();

    if (!body.serviceId || !body.scheduledAt) {
      return Response.json({ error: "Service and scheduled time are required." }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: { id: body.serviceId, vendorId: vendor.id },
      select: { id: true, locationId: true, price: true },
    });

    if (!service) {
      return Response.json({ error: "Service not found for this business." }, { status: 404 });
    }

    const email = normalizeEmail(body.customerEmail);
    const phone = normalizePhone(body.customerPhone);
    let customer = null;

    if (body.customerId) {
      customer = await prisma.customer.findFirst({
        where: { id: body.customerId, vendorId: vendor.id },
        select: { id: true },
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
          select: { id: true },
        });
      }
    }

    const scheduledAt = new Date(body.scheduledAt);
    const scheduledEnd = body.scheduledEnd ? new Date(body.scheduledEnd) : null;

    const booking = await prisma.bookings.create({
      data: {
        date: scheduledAt,
        scheduledAt,
        scheduledEnd,
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        userId: session.id,
        serviceId: service.id,
        locationId: body.locationId || service.locationId || null,
        professionalId: body.professionalId || null,
        customerId: customer?.id || null,
        customerName: body.customerName || null,
        customerEmail: email,
        customerPhone: phone,
        notes: body.notes || null,
        paymentRequirement: body.paymentRequirement || "pay_later",
        paymentAmount: Number(body.paymentAmount || service.price || 0),
      },
      include: {
        service: true,
        professional: { include: { role: true } },
      },
    });

    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return Response.json({ error: error.message || "Unable to create booking." }, { status: error.status || 500 });
  }
}
