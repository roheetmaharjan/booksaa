import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AccountStatus } from "@/constants/enums";
import { calculateBusinessSubscription } from "@/lib/subscription-pricing";

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

    const [subscription] = await prisma.$queryRaw`
      SELECT
        "subscriptionProfessionalCount",
        "subscriptionLocationCount"
      FROM "Vendors"
      WHERE "id" = ${id}
    `;

    const activeLocations = vendor.locations.filter((location) => location.isActive);
    const selectedLocation =
      activeLocations.find((location) => location.id === requestedLocationId) ||
      activeLocations.find((location) => location.id === vendor.defaultLocationId) ||
      activeLocations[0] ||
      vendor.locations[0] ||
      null;

    const joinedAtDateOnly = vendor.joinedAt.toISOString().slice(0, 10);
    const trialEndsAtDateOnly = vendor.trialEndsAt
      ? vendor.trialEndsAt.toISOString().slice(0, 10)
      : null;
    
    //Check the status
    const now = new Date();
    const trialEnd = new Date(vendor.trialEndsAt);

    let accountStatus = vendor.status;

    if(vendor.trialEndsAt){
      if(now > trialEnd){
        accountStatus = AccountStatus.TRIAL_EXPIRED;
      }else{
        const diffMs = trialEnd - now;
        const diffDays = Math.ceil (diffMs / (1000 * 60 * 60 * 24));
        accountStatus =
          diffDays <=3 
            ? AccountStatus.TRIAL_EXPIRING
            : AccountStatus.TRIAL_ACTIVE;
      }
    }



    const result = {
      ...vendor,
      location: selectedLocation,
      selectedLocation,
      selectedLocationId: selectedLocation?.id || null,
      services: selectedLocation
        ? vendor.services.filter((service) => service.locationId === selectedLocation.id)
        : vendor.services,
      professionals: selectedLocation
        ? vendor.professionals.filter((professional) => professional.locationId === selectedLocation.id)
        : vendor.professionals,
      businessHours: selectedLocation
        ? vendor.businessHours.filter((hour) => hour.locationId === selectedLocation.id)
        : vendor.businessHours,
      billingSummary: calculateBusinessSubscription({
        plan: vendor.plan,
        locations: vendor.locations,
        professionals: vendor.professionals,
        subscriptionLocationCount: subscription?.subscriptionLocationCount,
        subscriptionProfessionalCount: subscription?.subscriptionProfessionalCount,
      }),
      joinedAt: joinedAtDateOnly,
      trialEndsAt: trialEndsAtDateOnly,
      status : accountStatus
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching business" }), {
      status: 500,
    });
  }
}
export async function PUT(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Vendor Id is missing" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    const name = data.name;
    const description = data.description;
    const phone = data.phone;
    const cancellation_policy = data.cancellation_policy;
    const planId = data.planId;
    const categoryId = data.categoryId

    const userFirstname = data.user?.firstname;
    const userLastname = data.user?.lastname;


    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const updatedVendor = await prisma.vendors.update({
      where: { id },
      data: {
        name,
        description,
        phone,
        cancellation_policy,
        planId,
        categoryId
      },
      include:{user:true}
    });

    if (updatedVendor.userId && (userFirstname||userLastname)){
      await prisma.users.update({
        where:{id : updatedVendor.userId},
        data:{
          firstname: userFirstname,
          lastname:userLastname
        }
      })
    }

    return NextResponse.json(
      { message: "Vendor updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "You cannot delete active vendors." },
        { status: 403 }
      );
    }

    await prisma.vendors.delete({
      where: { id },
    });

    await prisma.users.delete({
      where: { id: vendor.userId },
    });
    return NextResponse.json(
      { success: true, message: "Vendor and user deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}
