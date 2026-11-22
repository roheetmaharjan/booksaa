import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_VENDOR_SETTINGS, getZonedDateParts, getZonedDayBounds, isBookingWithinWindow, zonedDateTimeToDate } from "@/lib/business-settings";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const { searchParams } = new URL(request.url);

    const locationId = searchParams.get("locationId");
    const serviceId = searchParams.get("serviceId");
    const professionalId = searchParams.get("professionalId");
    const date = searchParams.get("date");

    if (!slug || !locationId || !serviceId || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "Business, location, service and date are required",
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
        settings: {
          select: {
            onlineBookingEnabled: true,
            timeZone: true,
            timeFormat: true,
            minAdvanceNoticeMinutes: true,
            maxAdvanceBookingDays: true,
          },
        },

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

    const settings = { ...DEFAULT_VENDOR_SETTINGS, ...business.settings };
    if (!settings.onlineBookingEnabled || (!settings.onlinePaymentsEnabled && !settings.cashPaymentsEnabled && !settings.payAtBusinessEnabled)) {
      return NextResponse.json({ success: false, message: "Online booking is currently unavailable for this business." }, { status: 403 });
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

    const professional = professionalId ? await prisma.professional.findFirst({
      where: {
        id: professionalId,
        vendorId: business.id,
        locationId,
      },
      select: {
        id: true,
        name: true,
      },
    }) : null;

    if (professionalId && !professional) {
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

    const selectedDate = zonedDateTimeToDate(date, "12:00", settings.timeZone);
    if (!selectedDate) {
      return NextResponse.json({ success: false, message: "A valid appointment date is required." }, { status: 400 });
    }
    const weekday = getZonedDateParts(selectedDate, settings.timeZone).weekday;

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

    const dayBounds = getZonedDayBounds(date, settings.timeZone);
    if (!dayBounds) {
      return NextResponse.json({ success: false, message: "Unable to determine the selected business day." }, { status: 400 });
    }

    const bookings = await prisma.bookings.findMany({
      where: {
        locationId,
        professionalId: professionalId || null,
        scheduledAt: {
          gte: dayBounds.start,
          lt: dayBounds.end,
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
      timeZone: settings.timeZone,
      timeFormat: settings.timeFormat,
      minAdvanceNoticeMinutes: settings.minAdvanceNoticeMinutes,
      maxAdvanceBookingDays: settings.maxAdvanceBookingDays,
    });

    return NextResponse.json({
      success: true,
      data: {
        date,
        timeZone: settings.timeZone,
        professional: professional ? { id: professional.id, name: professional.name } : null,
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

function generateSlots({ date, openTime, closeTime, duration, bookings, timeZone, timeFormat, minAdvanceNoticeMinutes, maxAdvanceBookingDays, interval = 15 }) {
  const slots = [];

  const [openHour, openMinute] = openTime.split(":").map(Number);
  const [closeHour, closeMinute] = closeTime.split(":").map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;
  const now = new Date();
  const bookingWindow = { minAdvanceNoticeMinutes, maxAdvanceBookingDays };
  const today = getZonedDateParts(now, timeZone);
  const todayKey = `${today.year}-${today.month}-${today.day}`;
  const distance = Math.floor((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86400000);
  if (distance < 0 || distance > maxAdvanceBookingDays) return slots;

  for (let startMinutes = openMinutes; startMinutes + duration <= closeMinutes; startMinutes += interval) {
    const start = zonedDateTimeToDate(date, formatLocalTime(startMinutes), timeZone);
    if (!start) continue;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    const isBooked = bookings.some((booking) => {
      const existingStart = new Date(booking.scheduledAt);
      const existingEnd = booking.scheduledEnd ? new Date(booking.scheduledEnd) : new Date(existingStart.getTime() + duration * 60 * 1000);

      return start < existingEnd && end > existingStart;
    });

    slots.push({
      time: formatTime(startMinutes, timeFormat),
      available: !isBooked && isBookingWithinWindow(start, date, bookingWindow, timeZone, now),
    });
  }

  return slots;
}

function formatLocalTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
// function parseTimeToMinutes(timeString) {
//   if (!timeString || typeof timeString !== "string") return Number.NaN;

//   const [hours, minutes] = timeString.split(":").map(Number);

//   if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.NaN;

//   return hours * 60 + minutes;
// }

function formatTime(minutes, timeFormat) {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  if (timeFormat === "24h") return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}
