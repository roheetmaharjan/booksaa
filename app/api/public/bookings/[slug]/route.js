import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageImageUrl } from "@/lib/storage-view";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Business slug is required",
        },
        { status: 400 },
      );
    }

    const business = await prisma.vendors.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        photos: true,
        description: true,
        phone: true,

        locations: {
          select: {
            id: true,
            name: true,
            address: true,
            photos: true,
            businessHours: {
              select: {
                day: true,
                isOpen: true,
                openTime: true,
                closeTime: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },

        services: locationId
          ? {
              where: {
                location: {
                  is: {
                    id: locationId,
                  },
                },
              },
              select: {
                id: true,
                name: true,
                vendorId: true,
                price: true,
                duration: true,
                depositValue: true,
                depositType: true,
                prepaymentType: true,
              },
            }
          : false,
      },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          message: "Business not found",
        },
        { status: 404 },
      );
    }

    const location = locationId ? business.locations.find((item) => item.id === locationId) : null;

    if (locationId && !location) {
      return NextResponse.json(
        {
          success: false,
          message: "Location not found for this business",
        },
        { status: 404 },
      );
    }

    const businessStatus = location ? getBusinessStatus(location.businessHours || []) : null;

    let galleryKeys = [];
    try {
      const parsedPhotos = JSON.parse(business.photos || "[]");
      if (Array.isArray(parsedPhotos)) galleryKeys = parsedPhotos.filter((key) => typeof key === "string" && key.startsWith(`vendors/${business.id}/gallery/`));
    } catch {
      galleryKeys = [];
    }
    const signImage = (key) => getStorageImageUrl(key).catch(() => null);
    const gallery = (await Promise.all(galleryKeys.map(async (key) => ({ key, url: await signImage(key) })))).filter((photo) => photo.url);
    const profileImage = business.image?.startsWith(`vendors/${business.id}/branding/`) ? await signImage(business.image) : business.image;

    return NextResponse.json({
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          image: business.image,
          imageUrl: profileImage,
          description: business.description,
          phone: business.phone,
          gallery,
        },
        locations: business.locations,
        location: location ? { ...location, status: businessStatus } : null,

        services: business.services || [],
      },
    });
  } catch (error) {
    console.error("Public booking API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

function getBusinessStatus(businessHours) {
  const now = new Date();

  // Current time in Nepal
  const nepalTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const day = nepalTime.find((part) => part.type === "weekday")?.value;
  const hour = nepalTime.find((part) => part.type === "hour")?.value;
  const minute = nepalTime.find((part) => part.type === "minute")?.value;

  const currentMinutes = Number(hour) * 60 + Number(minute);

  const today = businessHours.find((item) => item.day === day);

  if (!today || !today.isOpen || !today.openTime || !today.closeTime) {
    return {
      isOpen: false,
      label: "Closed",
    };
  }

  const [openHour, openMinute] = today.openTime.split(":").map(Number);
  const [closeHour, closeMinute] = today.closeTime.split(":").map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  return {
    isOpen,
    label: isOpen ? "Open" : "Closed",
  };
}
