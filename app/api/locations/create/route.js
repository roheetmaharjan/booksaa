import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const {
    vendorId,
    address,
    latitude,
    longitude,
    city,
    postal_code,
    offerAtBusiness,
    offerAtClient,
    serviceAreas,
  } = await req.json();

  if (
    !vendorId ||
    !address ||
    !latitude ||
    !longitude ||
    !city ||
    !postal_code ||
    !offerAtBusiness ||
    !offerAtClient ||
    !serviceAreas
  ) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.location.findUnique({
      where: { latitude, longitude },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Location already exists" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId },
      include: {
        plan: true,
        locations: true,
      },
    });
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    const maxLocations = vendor.plan.location;
    const currentCount = vendor.locations.length;

    if (currentCount >= maxLocations) {
      return NextResponse.json(
        {
          message:
            "You can add only one location. Purchase more to add more location",
        },
        { status: 403 }
      );
    }

    const location = await prisma.location.create({
      data: {
        vendorId,
        address,
        latitude,
        longitude,
        offerAtBusiness,
        offerAtClient,
        serviceAreas,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Cannot added location" },
      { status: 500 }
    );
  }
}
