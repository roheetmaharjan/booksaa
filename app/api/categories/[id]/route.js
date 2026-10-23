import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, {params}) {
  const { id } = await params;

  if (!id) {
    return new NextResponse(JSON.stringify({ error: "Category ID missing" }));
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can delete categories" }, { status: 403 });
    }

    const deletedCategory = await prisma.category.delete({
      where: { id: id },
    });

    return new NextResponse(JSON.stringify(deletedCategory), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Category not found" }), {
      status: 404,
    });
  }
}

export async function PATCH(req, context) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Category ID missing" }, { status: 400 });
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can update categories" }, { status: 403 });
    }

    const { name, image } = await req.json();
    const normalizedName = typeof name === "string" ? name.trim() : "";
    if (!normalizedName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (image !== undefined && (typeof image !== "string" || !image.startsWith("categories/"))) {
      return NextResponse.json({ error: "Invalid category image key" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: normalizedName,
        ...(image !== undefined && { image }),
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: error.message || "Category update failed" },
      { status: 500 }
    );
  }
}
