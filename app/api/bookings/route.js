import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getPaymentAmount(service) {
  if (!service) return 0;
  if (service.prepaymentType === "full") return Number(service.price || 0);
  if (service.prepaymentType !== "deposit") return 0;

  const depositValue = Number(service.depositValue || 0);
  if (service.depositType === "fixed") return depositValue;
  return Number(service.price || 0) * (depositValue / 100);
}

async function getVendorForSession(session) {
  if (!session || session.role !== "VENDOR") return null;
  return prisma.vendors.findUnique({
    where: { userId: session.id },
    select: { id: true },
  });
}

export async function GET(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getVendorForSession(session);

    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const professionalId = searchParams.get("professionalId");
    const locationId = searchParams.get("locationId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where = {
      service: {
        vendorId: vendor.id,
        ...(locationId ? { locationId } : {}),
      },
      ...(professionalId ? { professionalId } : {}),
      ...(start && end
        ? {
            scheduledAt: {
              gte: new Date(start),
              lte: new Date(end),
            },
          }
        : {}),
    };

    const bookings = await prisma.bookings.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        service: true,
        professional: {
          select: { id: true, name: true },
        },
        user: {
          select: { firstname: true, lastname: true, email: true },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Booking list error:", error);
    return NextResponse.json({ error: "Unable to load bookings" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getVendorForSession(session);

    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const serviceId = data.serviceId;
    const professionalId = data.professionalId;
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

    if (!serviceId || !professionalId || !scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Service, professional, and appointment time are required." }, { status: 400 });
    }

    if (scheduledAt <= new Date()) {
      return NextResponse.json({ error: "Appointments can only be booked for a future date and time." }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        vendorId: vendor.id,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found for this business." }, { status: 404 });
    }

    const professional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        vendorId: vendor.id,
        ...(service.locationId ? { locationId: service.locationId } : {}),
      },
    });

    if (!professional) {
      return NextResponse.json({ error: "Professional not found for this service location." }, { status: 404 });
    }

    const booking = await prisma.bookings.create({
      data: {
        date: scheduledAt,
        scheduledAt,
        userId: session.id,
        serviceId,
        professionalId,
        customerName: data.customerName?.trim() || null,
        customerEmail: data.customerEmail?.trim() || null,
        customerPhone: data.customerPhone?.trim() || null,
        notes: data.notes?.trim() || null,
        paymentRequirement: service.prepaymentType || "pay_later",
        paymentAmount: getPaymentAmount(service),
        status: "CONFIRMED",
      },
      include: {
        service: true,
        professional: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Booking create error:", error);
    return NextResponse.json({ error: "Unable to create booking" }, { status: 500 });
  }
}
