import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    if (!locationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Location Id is required",
        },
        {
          status: 400,
        },
      );
    }
    const professionals = await prisma.professional.findMany({
      where: {
        locationId: locationId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json({
      success: true,
      data: professionals,
    });
  } catch {
    console.error("Error Fetching Professionals", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch professionals",
      },
      {
        status: 500,
      },
    );
  }
}
