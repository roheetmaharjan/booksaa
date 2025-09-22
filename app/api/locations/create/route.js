import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function POST(req) {
  try {
    const {
      vendorId,
      address,
      latitude,
      longitude,
      offerAtClient,
      offerAtBusiness,
      travelFee,
      maxTravelDistance,
      isActive,
    } = await req.json();

    // Basic validation
    if (!vendorId || !address) {
      return NextResponse.json(
        { error: "vendorId and address are required" },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        vendorId,
        address,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        offerAtClient: !!offerAtClient,
        offerAtBusiness: !!offerAtBusiness,
        travelFee: travelFee ? Number(travelFee) : 0.0,
        maxTravelDistance: maxTravelDistance ? Number(maxTravelDistance) : 5.0,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}