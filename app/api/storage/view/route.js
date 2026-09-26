import { cookies } from "next/headers";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { s3, STORAGE_BUCKET } from "@/lib/storage";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    const sessionUser = await verifySessionToken(token);

    if (!sessionUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.role !== "VENDOR") {
      return Response.json({ error: "Only vendors can view assets" }, { status: 403 });
    }

    const vendor = await prisma.vendors.findUnique({
      where: {
        userId: sessionUser.id,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { keys } = await request.json();

    if (!Array.isArray(keys)) {
      return Response.json({ error: "keys must be an array" }, { status: 400 });
    }

    const allowedPrefixes = [
      `vendors/${vendor.id}/gallery/`,
      `vendors/${vendor.id}/branding/`,
    ];

    const validKeys = keys.filter(
      (key) => typeof key === "string" && allowedPrefixes.some((prefix) => key.startsWith(prefix)),
    );

    const images = await Promise.all(
      validKeys.map(async (key) => {
        const command = new GetObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: key,
        });

        const url = await getSignedUrl(s3, command, {
          expiresIn: 3600,
        });

        return {
          key,
          url,
        };
      }),
    );

    return Response.json({
      images,
    });
  } catch (error) {
    console.error("Storage view error:", error);

    return Response.json({ error: "Failed to load photos" }, { status: 500 });
  }
}
