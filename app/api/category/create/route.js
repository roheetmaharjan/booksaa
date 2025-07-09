import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, image } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: { name }
    });

    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name,
        image: image || null
      }
    });

    return NextResponse.json({ category: newCategory }, { status: 201 });

  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
