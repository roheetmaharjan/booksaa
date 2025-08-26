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
    return new NextResponse(JSON.stringify({ error: "Service ID missing" }));
  }
  try {
    const name = await req.formData.get("name");
    const description = await req.formData.get("description");
    const price = await req.formData.get("price");
    const duration = await req.formData.get("duration");

    const updatedService = await prisma.services.update({
      where: { id },
      data: { name, description, price, duration },
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
