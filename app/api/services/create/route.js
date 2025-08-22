import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, price, duration, description, vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    if (!name?.trim() || isNaN(Number(price)) || isNaN(Number(duration))) {
      return NextResponse.json(
        { error: "Invalid input: name, price, duration are required" },
        { status: 400 }
      );
    }

    const vendorExists = await prisma.vendors.findUnique({
      where: { id: vendorId },
    });

    if (!vendorExists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const exists = await prisma.service.findUnique({
      where: { name },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Name already exists" },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseFloat(duration, 10),
        vendorId,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error("Service create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
