import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Location ID missing" }, { status: 400 });
  }
  try {
    const location = await prisma.location.findUnique({
      where: { id },
    });
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Location" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Location ID missing" }, { status: 400 });
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const existing = await prisma.location.findUnique({
      where: { id },
      include: { vendor: { select: { id: true, userId: true, locations: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const isAdmin = session.role === "ADMIN";
    const isOwner = session.role === "VENDOR" && existing.vendor?.userId === session.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You do not have access to update this location." },
        { status: 403 }
      );
    }

    if (existing.isDefault && body.isActive === false) {
      return NextResponse.json(
        { error: "Choose another default location before deactivating this one." },
        { status: 400 }
      );
    }

    const shouldBeDefault = !!body.isDefault;
    const location = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.location.updateMany({
          where: { vendorId: existing.vendorId },
          data: { isDefault: false },
        });
      }

      const updated = await tx.location.update({
        where: { id },
        data: {
          name: body.name !== undefined ? body.name?.trim() || null : undefined,
          phone: body.phone !== undefined ? body.phone?.trim() || null : undefined,
          photos: body.photos !== undefined ? body.photos || null : undefined,
          address: body.address !== undefined ? body.address : undefined,
          latitude: body.latitude !== undefined ? Number(body.latitude) : undefined,
          longitude: body.longitude !== undefined ? Number(body.longitude) : undefined,
          offerAtClient:
            body.offerAtClient !== undefined ? !!body.offerAtClient : undefined,
          offerAtBusiness:
            body.offerAtBusiness !== undefined ? !!body.offerAtBusiness : undefined,
          travelFee:
            body.travelFee !== undefined ? Number(body.travelFee) : undefined,
          maxTravelDistance:
            body.maxTravelDistance !== undefined
              ? Number(body.maxTravelDistance)
              : undefined,
          isActive: body.isActive !== undefined ? !!body.isActive : undefined,
          isDefault: shouldBeDefault ? true : undefined,
        },
      });

      if (shouldBeDefault) {
        await tx.vendors.update({
          where: { id: existing.vendorId },
          data: { defaultLocationId: id },
        });
      }

      return updated;
    });

    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    console.error("Failed to update location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}
