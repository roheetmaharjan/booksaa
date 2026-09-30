import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { businessSlug } = params;

    if (!businessSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Business slug is required",
        },
        { status: 400 }
      );
    }

    const business = await prisma.vendors.findUnique({
      where: {
        slug: businessSlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        timezone: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          message: "Business not found",
        },
        { status: 404 }
      );
    }

    if (!business.bookingSettings?.enabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Online booking is not available for this business",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          logo: business.logo,
          description: business.description,
          phone: business.phone,
          email: business.email,
          address: business.address,
          timezone: business.timezone,
        },
      },
    });
  } catch (error) {
    console.error("Public booking API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}