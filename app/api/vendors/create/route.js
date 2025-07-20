import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstname,
      lastname,
      name,
      email,
      categoryId,
      status = "PENDING",
      planId,
    } = body;
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exist", status: 400 });
    }
    // Validate required fields
    if (!firstname||!lastname||!name || !categoryId || planID) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get category by name
    const categoryRecord = await prisma.category.findUnique({
      where: { name: categoryId },
    });

    if (!categoryRecord) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Create vendor
    const newVendor = await prisma.vendors.create({
      data: {
        id: Date.now().toString(), // or use uuid if preferred
        name,
        firstname,
        lastname,
        email,
        categoryID: categoryRecord.id,
        planId: planId.id,
        status,
      },
    });

    return NextResponse.json({ vendor: newVendor }, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
