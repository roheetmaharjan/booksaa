import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    const sessionUser = await verifySessionToken(token);

    if (!sessionUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.role !== "VENDOR") {
      return Response.json({ error: "Only vendors can save assets" }, { status: 403 });
    }

    const { key, type } = await request.json();

    if (!key || !type) {
      return Response.json({ error: "key and type are required" }, { status: 400 });
    }

    const vendor = await prisma.vendors.findUnique({
      where: {
        userId: sessionUser.id,
      },
      select: {
        id: true,
        image: true,
        photos: true,
      },
    });

    if (!vendor) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Business logo
    if (type === "branding") {
      const expectedPrefix = `vendors/${vendor.id}/branding/`;

      if (!key.startsWith(expectedPrefix)) {
        return Response.json({ error: "Invalid branding asset" }, { status: 400 });
      }

      await prisma.vendors.update({
        where: { id: vendor.id },
        data: {
          image: key,
        },
      });

      return Response.json({
        success: true,
        key,
      });
    }

    // Gallery
    if (type === "gallery") {
      const expectedPrefix = `vendors/${vendor.id}/gallery/`;

      if (!key.startsWith(expectedPrefix)) {
        return Response.json({ error: "Invalid gallery asset" }, { status: 400 });
      }

      let currentPhotos = [];

      if (vendor.photos) {
        try {
          const parsed = JSON.parse(vendor.photos);

          if (Array.isArray(parsed)) {
            currentPhotos = parsed;
          }
        } catch {
          currentPhotos = [];
        }
      }

      const photos = [...currentPhotos, key];

      await prisma.vendors.update({
        where: { id: vendor.id },
        data: {
          photos: JSON.stringify(photos),
        },
      });

      return Response.json({
        success: true,
        key,
      });
    }

    return Response.json({ error: "Invalid asset type" }, { status: 400 });
  } catch (error) {
    console.error("Storage complete error:", error);

    return Response.json({ error: "Failed to save asset" }, { status: 500 });
  }
}
