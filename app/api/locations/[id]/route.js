import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET({ params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Location ID missing" }, { status: 400 });
  }
  try {
    const location = await prisma.location.findUnique({
      where: { id },
    });
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Location" },
      { status: 500 }
    );
  }
}