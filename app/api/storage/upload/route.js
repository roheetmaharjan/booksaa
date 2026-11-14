import { cookies } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { s3, STORAGE_BUCKET } from "@/lib/storage";
import { ASSET_TYPES } from "@/constants/storage";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    if (!sessionUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { fileName, contentType, type, resourceId } = body;

    if (!fileName || !contentType || !type) {
      return Response.json({ error: "fileName, contentType and type are required" }, { status: 400 });
    }
    const allowedTypes = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    if (!allowedTypes[contentType]) {
      return Response.json({ error: "Only JPG, PNG and WebP files are allowed" }, { status: 400 });
    }
    if (!Object.values(ASSET_TYPES).includes(type)) {
      return Response.json({ error: "Invalid asset type" }, { status: 400 });
    }

    if (type === ASSET_TYPES.CATEGORY) {
      if (sessionUser.role !== "ADMIN") {
        return Response.json({ error: "Only admins can upload category images" }, { status: 403 });
      }

      const fileId = crypto.randomUUID();
      const key = `categories/${fileId}.${allowedTypes[contentType]}`;
      const command = new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: key,
        ContentType: contentType,
      });
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

      return Response.json({ uploadUrl, key });
    }

    if (sessionUser.role !== "VENDOR") {
      return Response.json({ error: "Only vendors can upload this asset type" }, { status: 403 });
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
      return Response.json({ error: "Vendor not Found" }, { status: 401 });
    }

    const requiresResourceId = [ASSET_TYPES.SERVICE, ASSET_TYPES.PROFESSIONAL, ASSET_TYPES.CUSTOMER].includes(type);

    if (requiresResourceId && !resourceId) {
      return Response.json({ error: "resourceId is required" }, { status: 400 });
    }

    const fileId = crypto.randomUUID();

    let key;

    switch (type) {
      case ASSET_TYPES.BRANDING:
        key = `vendors/${vendor.id}/branding/${fileId}.${allowedTypes[contentType]}`;
        break;

      case ASSET_TYPES.GALLERY:
        key = `vendors/${vendor.id}/gallery/${fileId}.${allowedTypes[contentType]}`;
        break;

      case ASSET_TYPES.SERVICE:
        key = `vendors/${vendor.id}/services/${resourceId}/${fileId}.${allowedTypes[contentType]}`;
        break;

      case ASSET_TYPES.PROFESSIONAL:
        key = `vendors/${vendor.id}/professionals/${resourceId}/${fileId}.${allowedTypes[contentType]}`;
        break;

      case ASSET_TYPES.CUSTOMER:
        key = `vendors/${vendor.id}/customers/${resourceId}/${fileId}.${allowedTypes[contentType]}`;
        break;

      default:
        return Response.json(
          { error: "Invalid asset type" },
          { status: 400 }
        );
    }

    const command = new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    return Response.json({
      uploadUrl,
      key,
    });
  } catch (error) {
    console.error("Storage upload URL error:", error);

    return Response.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}
