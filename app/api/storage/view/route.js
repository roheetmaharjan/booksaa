import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { getStorageImageUrl } from "@/lib/storage-view";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    const sessionUser = await verifySessionToken(token);

    if (!sessionUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keys } = await request.json();

    if (!Array.isArray(keys)) {
      return Response.json({ error: "keys must be an array" }, { status: 400 });
    }

    let allowedPrefixes;
    if (sessionUser.role === "ADMIN") {
      allowedPrefixes = ["categories/"];
    } else if (sessionUser.role === "VENDOR") {
      const vendor = await prisma.vendors.findUnique({
        where: { userId: sessionUser.id },
        select: { id: true },
      });

      if (!vendor) {
        return Response.json({ error: "Vendor not found" }, { status: 404 });
      }

      allowedPrefixes = [
        `vendors/${vendor.id}/gallery/`,
        `vendors/${vendor.id}/branding/`,
      ];
    } else {
      return Response.json({ error: "You do not have access to view these assets" }, { status: 403 });
    }

    const validKeys = keys.filter(
      (key) => typeof key === "string" && allowedPrefixes.some((prefix) => key.startsWith(prefix)),
    );

    const images = await Promise.all(
      validKeys.map(async (key) => {
        const url = await getStorageImageUrl(key);

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
