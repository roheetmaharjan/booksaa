import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const { searchParams } = new URL(request.url);

    const locationId = searchParams.get("locationId");
    const serviceId = searchParams.get("serviceId");
    const professionalId = searchParams.get("professionalId");
    const date = searchParams.get("date");

    if (!slug || !locationId || !serviceId || !professionalId || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "Business, location, service, professional and date are required",
        },
        { status: 400 },
      );
    }

    // -----------------------------------
    // 1. Get business
    // -----------------------------------

    const business = await prisma.vendors.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,

        locations: {
          where: {
            id: locationId,
          },
          select: {
            id: true,
            name: true,
            address: true,
            businessHours: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          message: "Business not found",
        },
        { status: 404 },
      );
    }

    // -----------------------------------
    // 2. Get location
    // -----------------------------------

    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        vendorId: business.id,
      },
      include: {
        businessHours: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          message: "Location not found",
        },
        { status: 404 },
      );
    }

    // -----------------------------------
    // 3. Get service
    // -----------------------------------

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        vendorId: business.id,
        location: {
          is: {
            id: locationId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        duration: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "Service not found",
        },
        { status: 404 },
      );
    }

    // -----------------------------------
    // 4. Get professional
    // -----------------------------------

    const professional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        vendorId: business.id,
        locationId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!professional) {
      return NextResponse.json(
        {
          success: false,
          message: "Professional not found",
        },
        { status: 404 },
      );
    }

    // -----------------------------------
    // 5. Get business hours for date
    // -----------------------------------

    const selectedDate = new Date(`${date}T00:00:00`);

    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Kathmandu",
    }).format(selectedDate);

    const today = location.businessHours.find((item) => item.day === weekday);

    if (!today || !today.isOpen || !today.openTime || !today.closeTime) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          slots: [],
        },
      });
    }

    // -----------------------------------
    // 6. Get existing bookings
    // -----------------------------------

    const startOfDay = new Date(`${date}T00:00:00+05:45`);
    const endOfDay = new Date(`${date}T23:59:59+05:45`);

    const bookings = await prisma.bookings.findMany({
      where: {
        locationId,
        professionalId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELED", "PAYMENT_EXPIRED"],
        },
      },
      select: {
        scheduledAt: true,
        scheduledEnd: true,
        startTime: true,
        endTime: true,
      },
    });

    // -----------------------------------
    // 7. Generate slots
    // -----------------------------------

    const slots = generateSlots({
      date,
      openTime: today.openTime,
      closeTime: today.closeTime,
      duration: service.duration,
      bookings,
    });

    return NextResponse.json({
      success: true,
      data: {
        date,
        professional: {
          id: professional.id,
          name: professional.name,
        },
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
        },
        slots,
      },
    });
  } catch (error) {
    console.error("Availability API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong",
        error: error.stack || null,
      },
      { status: 500 },
    );
  }
}

function generateSlots({ date, openTime, closeTime, duration, bookings, interval = 15 }) {
  const slots = [];

  const [openHour, openMinute] = openTime.split(":").map(Number);
  const [closeHour, closeMinute] = closeTime.split(":").map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  for (let startMinutes = openMinutes; startMinutes + duration <= closeMinutes; startMinutes += interval) {
    const endMinutes = startMinutes + duration;

    const start = createNepalDate(date, startMinutes);
    const end = createNepalDate(date, endMinutes);

    const isBooked = bookings.some((booking) => {
      const existingStart = new Date(booking.scheduledAt);
      const existingEnd = booking.scheduledEnd ? new Date(booking.scheduledEnd) : new Date(existingStart.getTime() + duration * 60 * 1000);

      return start < existingEnd && end > existingStart;
    });

    slots.push({
      time: formatTime(startMinutes),
      available: !isBooked,
    });
  }

  return slots;
}

function createNepalDate(date, minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:45`);
}
// function parseTimeToMinutes(timeString) {
//   if (!timeString || typeof timeString !== "string") return Number.NaN;

//   const [hours, minutes] = timeString.split(":").map(Number);

//   if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.NaN;

//   return hours * 60 + minutes;
// }

function formatTime(minutes) {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}
