import { ListObjectsV2Command } from "@aws-sdk/client-s3";

import { s3, STORAGE_BUCKET } from "@/lib/storage";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return Response.json(
        { error: "vendorId is required" },
        { status: 400 }
      );
    }

    const prefix = `vendors/${vendorId}/gallery/`;

    const command = new ListObjectsV2Command({
      Bucket: STORAGE_BUCKET,
      Prefix: prefix,
    });

    const result = await s3.send(command);

    return Response.json({
      files: (result.Contents || []).map((file) => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
      })),
    });
  } catch (error) {
    console.error("Storage list error:", error);

    return Response.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}