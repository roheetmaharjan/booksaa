import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, price, duration, description, vendorId } = await req.json();

    // Validate required fields
    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    if (!name?.trim() || isNaN(Number(price)) || isNaN(Number(duration))) {
      return NextResponse.json(
        { error: "Invalid input: name, price, and duration are required" },
        { status: 400 }
      );
    }

    // Check vendor exists
    const vendorExists = await prisma.vendors.findUnique({
      where: { id: vendorId },
    });

    if (!vendorExists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Check if service name already exists for this vendor
    const exists = await prisma.service.findUnique({
      where: {
        name_vendorId: {
          name,
          vendorId,
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Service name is already taken" },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseFloat(duration),
        vendorId,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error("Service create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
