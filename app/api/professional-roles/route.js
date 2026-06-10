import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session || !["ADMIN", "VENDOR"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getCurrentSession();

    if (!session || !["ADMIN", "VENDOR"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    const roleName = String(name || "").trim();

    if (!roleName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const role = await prisma.professionalRole.create({
      data: { name: roleName },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Role already exists" }, { status: 409 });
    }

    console.error(error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
