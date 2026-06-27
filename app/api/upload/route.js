// app/api/upload/route.js
import { deleteImagesFromR2, uploadImageToR2 } from "@/lib/cloudflare-r2";
import { getCurrentSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const folder = formData.get("folder") || "uploads";
    const files = [...formData.getAll("files"), formData.get("file")].filter((file) => file && typeof file !== "string");

    if (files.length === 0) {
      return NextResponse.json({ error: "No image file received" }, { status: 400 });
    }

    const uploaded = await Promise.all(files.map((file) => uploadImageToR2(file, folder)));

    return NextResponse.json(
      {
        files: uploaded,
        url: uploaded[0]?.url,
        key: uploaded[0]?.key,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keys = [] } = await req.json();
    await deleteImagesFromR2(Array.isArray(keys) ? keys : []);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete images" }, { status: 500 });
  }
}
