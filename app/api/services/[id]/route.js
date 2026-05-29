import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const { id } = await params;

  if (!id) {
    return new NextResponse(JSON.stringify({ error: "service ID missing" }));
  }

  try {
    const deletedService = await prisma.service.delete({
      where: { id: id },
    });

    return new NextResponse(JSON.stringify(deletedService), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Service not found" }), {
      status: 404,
    });
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Service ID missing" }, { status: 400 });
  }

  try {
    const { name, description, price, duration, locationId } = await req.json();
    
    if (!name || !price || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        duration: Number(duration),
        locationId: locationId || undefined,
      },
    });

    return NextResponse.json(updatedService, { status: 200 });
  } catch (error) {
    console.error("Update fail: ", error);
    return NextResponse.json(
      { error: error.message || "Service Edit Fail" },
      { status: 400 }
    );
  }
}

export async function GET(req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Service ID missing" }, { status: 400 });
  }
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}
