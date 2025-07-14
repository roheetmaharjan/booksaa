import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, context) {
  const { id } = context.params;

  if (!id) {
    return new NextResponse(JSON.stringify({ error: "category ID missing" }));
  }

  try {
    const deletedUser = await prisma.category.delete({
      where: { id: id },
    });

    return new NextResponse(JSON.stringify(deletedUser), { status: 200 });
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
    const body = await req.json();
    const { name,image } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id }, // UUID string
      data: { 
        name,
        ...(image && { image }),
       },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: error.message || "Category not found" },
      { status: 500 }
    );
  }
}