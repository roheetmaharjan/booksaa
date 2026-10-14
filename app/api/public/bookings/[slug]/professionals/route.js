import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const locationId = searchParams.get("locationId");
    const serviceId = searchParams.get("serviceId");

    if (!slug || !locationId || !serviceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Business, location and service are required",
        },
        { status: 400 }
      );
    }

    const business = await prisma.vendors.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        vendorId: business.id,
        location: {
          is: { id: locationId },
        },
      },
      select: { id: true },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    const professionals = await prisma.professional.findMany({
      where: {
        vendorId: business.id,
        locationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { professionals },
    });
  } catch (error) {
    console.error("Professionals API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load professionals" },
      { status: 500 }
    );
  }
}