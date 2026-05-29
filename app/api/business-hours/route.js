import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isPresent(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export async function PUT(req) {
  try {
    const { vendorId, locationId, hours } = await req.json();

    if (!vendorId || !locationId || !Array.isArray(hours)) {
      return NextResponse.json(
        { error: "vendorId, locationId, and hours are required." },
        { status: 400 }
      );
    }

    const location = await prisma.location.findFirst({
      where: { id: locationId, vendorId },
      select: { id: true },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found for this business." },
        { status: 404 }
      );
    }

    await prisma.$transaction(
      hours
        .filter((hour) => isPresent(hour.day))
        .map((hour) =>
          prisma.businessHour.upsert({
            where: {
              locationId_day: {
                locationId,
                day: String(hour.day),
              },
            },
            update: {
              vendorId,
              isOpen: !!(hour.isOpen ?? hour.open),
              openTime:
                hour.isOpen || hour.open ? String(hour.openTime || "") || null : null,
              closeTime:
                hour.isOpen || hour.open ? String(hour.closeTime || "") || null : null,
            },
            create: {
              vendorId,
              locationId,
              day: String(hour.day),
              isOpen: !!(hour.isOpen ?? hour.open),
              openTime:
                hour.isOpen || hour.open ? String(hour.openTime || "") || null : null,
              closeTime:
                hour.isOpen || hour.open ? String(hour.closeTime || "") || null : null,
            },
          })
        )
    );

    const updatedHours = await prisma.businessHour.findMany({
      where: { vendorId, locationId },
      orderBy: { day: "asc" },
    });

    return NextResponse.json(updatedHours, { status: 200 });
  } catch (error) {
    console.error("Business hours update failed:", error);
    return NextResponse.json(
      { error: "Failed to update business hours." },
      { status: 500 }
    );
  }
}
