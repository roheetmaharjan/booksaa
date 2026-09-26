import { cookies } from "next/headers";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3, STORAGE_BUCKET } from "@/lib/storage";

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    if (!sessionUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.role !== "VENDOR") {
      return Response.json({ error: "Only vendors can delete assets" }, { status: 403 });
    }

    const { key } = await request.json();

    if (!key) {
      return Response.json({ error: "key is required" }, { status: 400 });
    }

    const vendor = await prisma.vendors.findUnique({
      where: {
        userId: sessionUser.id,
      },
      select: {
        id: true,
        photos: true,
      },
    });

    if (!vendor) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Make sure this key belongs to this vendor's gallery
    const prefix = `vendors/${vendor.id}/gallery/`;

    if (!key.startsWith(prefix)) {
      return Response.json({ error: "Invalid gallery asset" }, { status: 403 });
    }

    // Delete from storage
    await s3.send(
      new DeleteObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: key,
      }),
    );

    // Remove from vendor.photos
    let photos = [];

    if (vendor.photos) {
      try {
        const parsed = JSON.parse(vendor.photos);

        if (Array.isArray(parsed)) {
          photos = parsed;
        }
      } catch {
        photos = [];
      }
    }

    photos = photos.filter((photo) => photo !== key);

    await prisma.vendors.update({
      where: {
        id: vendor.id,
      },
      data: {
        photos: JSON.stringify(photos),
      },
    });

    return Response.json({
      success: true,
      key,
    });
  } catch (error) {
    console.error("Storage delete error:", error);

    return Response.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
