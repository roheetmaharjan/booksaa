import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getCurrentSession } from "@/lib/auth";
import { calculateBusinessSubscription } from "@/lib/subscription-pricing";
import {
  getActiveVendorSubscription,
  getSubscriptionLimits,
} from "@/lib/subscriptions";

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    const {
      vendorId,
      name,
      phone,
      photos,
      address,
      latitude,
      longitude,
      offerAtClient,
      offerAtBusiness,
      travelFee,
      maxTravelDistance,
      isActive,
      isDefault,
    } = await req.json();

    // Basic validation
    if (!vendorId || !address) {
      return NextResponse.json(
        { error: "vendorId and address are required" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId },
      include: {
      plan: true,
      locations: true,
      professionals: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (session?.role !== "ADMIN" && vendor.userId !== session?.id) {
      return NextResponse.json(
        { error: "You can only add locations for your own business." },
        { status: 403 }
      );
    }

    const subscription = await getActiveVendorSubscription(vendorId);
    const subscriptionLimits = getSubscriptionLimits(subscription, vendor.plan);
    const nextIsActive = isActive !== undefined ? !!isActive : true;
    const currentActiveLocationCount = vendor.locations.filter((item) => item.isActive !== false).length;

    if (nextIsActive && currentActiveLocationCount >= subscriptionLimits.locationLimit) {
      return NextResponse.json(
        {
          error: `Location limit reached. Your subscription allows ${subscriptionLimits.locationLimit} location${subscriptionLimits.locationLimit !== 1 ? "s" : ""}. Add a location add-on from Usage & Billing to create more.`,
        },
        { status: 403 }
      );
    }

    const shouldBeDefault = !!isDefault || !vendor.defaultLocationId;
    const location = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.location.updateMany({
          where: { vendorId },
          data: { isDefault: false },
        });
      }

      const created = await tx.location.create({
        data: {
          name: name?.trim() || "New Location",
          phone: phone?.trim() || null,
          photos: photos || null,
          vendorId,
          address,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          offerAtClient: !!offerAtClient,
          offerAtBusiness: !!offerAtBusiness,
          travelFee: travelFee ? Number(travelFee) : 0.0,
          maxTravelDistance: maxTravelDistance ? Number(maxTravelDistance) : 5.0,
          isActive: nextIsActive,
          isDefault: shouldBeDefault,
        },
      });

      if (shouldBeDefault) {
        await tx.vendors.update({
          where: { id: vendorId },
          data: { defaultLocationId: created.id },
        });
      }

      return created;
    });

    const billingSummary = calculateBusinessSubscription({
      plan: vendor.plan,
      locations: [...vendor.locations, location],
      professionals: vendor.professionals,
      locationLimit: subscriptionLimits.locationLimit,
      professionalLimit: subscriptionLimits.professionalLimit,
    });

    return NextResponse.json({ ...location, billingSummary }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}
