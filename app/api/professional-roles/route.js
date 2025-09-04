import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.professionalRole.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(roles);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const role = await prisma.professionalRole.create({
      data: { name },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}