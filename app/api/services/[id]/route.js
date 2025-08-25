import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, {params}) {
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