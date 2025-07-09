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
      categoryID
    } = body;

    if (
      !name ||
      !location ||
      !description ||
      !cancellation_policy ||
      !categoryID
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newVendor = await prisma.vendor.create({
      data: {
        id: Date.now().toString(), // Prisma expects string
        name,
        location,
        description,
        cancellation_policy,
        categoryID,
        status: 'ACTIVE' // or use body.status if provided
      },
    });

    return NextResponse.json({ newVendor }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid JSON or Server Error" }, { status: 400 });
  }
}
