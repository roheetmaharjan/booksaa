import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "VENDOR") {
      return NextResponse.json({ error: "Only vendor accounts can access this dashboard." }, { status: 403 });
    }

    const vendor = await prisma.vendors.findUnique({
      where: { userId: session.id },
      select: {
        id: true,
        name: true,
        image: true,
        defaultLocationId: true,
        locations: {
          where: { isActive: true },
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
          select: {
            id: true,
            name: true,
            address: true,
            isDefault: true,
          },
        },
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Business not found for this account." }, { status: 404 });
    }

    const defaultLocation = vendor.locations.find((location) => location.id === vendor.defaultLocationId) || vendor.locations.find((location) => location.isDefault) || vendor.locations[0] || null;

    return NextResponse.json({
      vendorId: vendor.id,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        image: vendor.image,
        defaultLocationId: defaultLocation?.id || null,
        locations: vendor.locations,
        owner: vendor.user,
      },
    });
  } catch (error) {
    console.error("Error resolving current business:", error);
    return NextResponse.json({ error: "Unable to resolve current business." }, { status: 500 });
  }
}
