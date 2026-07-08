import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AccountStatus } from "@/constants/enums";
import { getCurrentSession } from "@/lib/auth";
import { calculateBusinessSubscription } from "@/lib/subscription-pricing";
import { createVendorSubscription, getActiveVendorSubscription, getSubscriptionLimits } from "@/lib/subscriptions";
import { slugify } from "@/utils/slugify";

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const requestedLocationId = searchParams.get("locationId");
    const vendor = await prisma.vendors.findUnique({
      where: { id },
      include: {
        locations: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
          include: {
            services: true,
            professionals: {
              include: {
                role: true,
              },
            },
            businessHours: {
              orderBy: { day: "asc" },
            },
          },
        },
        category: true,
        services: {
          include: {
            location: {
              select: { id: true, name: true, address: true, isDefault: true },
            },
          },
        },
        plan: true,
        professionals: {
          include: {
            role: true,
            location: {
              select: { id: true, name: true, address: true, isDefault: true },
            },
          },
        },
        businessHours: true,
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    if (!vendor) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
      });
    }

    const session = await getCurrentSession();
    if (session?.role === "VENDOR" && vendor.userId !== session.id) {
      return NextResponse.json({ error: "You do not have access to this business." }, { status: 403 });
    }

    const subscription = await getActiveVendorSubscription(id);
    const subscriptionLimits = getSubscriptionLimits(subscription, vendor.plan);

    const activeLocations = vendor.locations.filter((location) => location.isActive);
    const selectedLocation = activeLocations.find((location) => location.id === requestedLocationId) || activeLocations.find((location) => location.id === vendor.defaultLocationId) || activeLocations[0] || vendor.locations[0] || null;

    const joinedAtDateOnly = vendor.joinedAt.toISOString().slice(0, 10);
    const trialEndsAtDateOnly = vendor.trialEndsAt ? vendor.trialEndsAt.toISOString().slice(0, 10) : null;

    //Check the status
    const now = new Date();
    const trialEnd = new Date(vendor.trialEndsAt);

    let accountStatus = vendor.status;

    if (vendor.status === AccountStatus.TRIAL_ACTIVE && vendor.trialEndsAt) {
      if (now > trialEnd) {
        accountStatus = AccountStatus.TRIAL_EXPIRED;
      } else {
        const diffDays = Math.ceil(
          (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        accountStatus =
          diffDays <= 3
            ? AccountStatus.TRIAL_EXPIRING
            : AccountStatus.TRIAL_ACTIVE;
      }
    }

    const result = {
      ...vendor,
      location: selectedLocation,
      selectedLocation,
      selectedLocationId: selectedLocation?.id || null,
      services: selectedLocation ? vendor.services.filter((service) => service.locationId === selectedLocation.id) : vendor.services,
      professionals: selectedLocation ? vendor.professionals.filter((professional) => professional.locationId === selectedLocation.id) : vendor.professionals,
      businessHours: selectedLocation ? vendor.businessHours.filter((hour) => hour.locationId === selectedLocation.id) : vendor.businessHours,
      billingSummary: calculateBusinessSubscription({
        plan: vendor.plan,
        locations: vendor.locations,
        professionals: vendor.professionals,
        locationLimit: subscriptionLimits.locationLimit,
        professionalLimit: subscriptionLimits.professionalLimit,
      }),
      subscription,
      subscriptionEntitlements: subscription?.entitlements || [],
      subscriptionLocationLimit: subscriptionLimits.locationLimit,
      subscriptionProfessionalLimit: subscriptionLimits.professionalLimit,
      joinedAt: joinedAtDateOnly,
      trialEndsAt: trialEndsAtDateOnly,
      status: accountStatus,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    return new Response(JSON.stringify({ error: "Error fetching business" }), {
      status: 500,
    });
  }
}
export async function PUT(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Vendor Id is missing" }, { status: 400 });
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const name = data.name;
    const description = data.description;
    const phone = data.phone;
    const cancellation_policy = data.cancellation_policy;
    const planId = data.planId;
    const categoryId = data.categoryId;

    const userFirstname = data.user?.firstname;
    const userLastname = data.user?.lastname;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedVendor = await prisma.$transaction(async (tx) => {
      const existingVendor = await tx.vendors.findUnique({
        where: { id },
        include: {
          plan: true,
          locations: true,
          professionals: true,
        },
      });

      if (!existingVendor) {
        throw new Error("Vendor not found");
      }

      const isAdmin = session.role === "ADMIN";
      const isOwner = session.role === "VENDOR" && existingVendor.userId === session.id;

      if (!isAdmin && !isOwner) {
        throw new Error("Forbidden");
      }

      const updated = await tx.vendors.update({
        where: { id },
        data: {
          name,
          slug: slugify(name),
          description,
          phone,
          cancellation_policy,
          planId: isAdmin ? planId : existingVendor.planId,
          categoryId,
        },
        include: { user: true },
      });

      if (isAdmin && planId && planId !== existingVendor.planId) {
        const nextPlan = await tx.plans.findUnique({ where: { id: planId } });
        const activeSubscription = await getActiveVendorSubscription(id, tx);

        if (activeSubscription) {
          await tx.vendorSubscription.update({
            where: { id: activeSubscription.id },
            data: { status: "ENDED" },
          });
        }

        await createVendorSubscription(tx, {
          vendorId: id,
          plan: nextPlan,
          status: "ACTIVE",
          locationCount: Math.max(existingVendor.locations.filter((location) => location.isActive !== false).length, Number(nextPlan?.location || 1)),
          professionalCount: Math.max(existingVendor.professionals.length, Number(nextPlan?.professional || 1)),
        });
      }

      return updated;
    });

    if (updatedVendor.userId && (userFirstname || userLastname)) {
      await prisma.users.update({
        where: { id: updatedVendor.userId },
        data: {
          firstname: userFirstname,
          lastname: userLastname,
        },
      });
    }

    return NextResponse.json({ message: "Vendor updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating vendor:", error);
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "You do not have access to update this business." }, { status: 403 });
    }
    if (error.message === "Vendor not found") {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Vendor ID missing" }, { status: 400 });
  }

  try {
    const vendor = await prisma.vendors.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }
    if (vendor.status === "ACTIVE") {
      return NextResponse.json({ error: "You cannot delete active vendors." }, { status: 403 });
    }

    await prisma.vendors.delete({
      where: { id },
    });

    await prisma.users.delete({
      where: { id: vendor.userId },
    });
    return NextResponse.json({ success: true, message: "Vendor and user deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
  }
}
