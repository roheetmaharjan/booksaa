import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      location,
      description,
      cancellation_policy,
      phone,
      image,
      category,
      status = "ACTIVE" // default status if not provided
    } = body;

    // Validate required fields
    if (!name || !location || !cancellation_policy || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get category by name
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category }
    });

    if (!categoryRecord) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Create vendor
    const newVendor = await prisma.vendor.create({
      data: {
        id: Date.now().toString(), // or use uuid if preferred
        name,
        location,
        description: description || null,
        cancellation_policy,
        phone: phone || null,
        image: image || null,
        categoryID: categoryRecord.id,
        status
      }
    });

    return NextResponse.json({ vendor: newVendor }, { status: 201 });

  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
