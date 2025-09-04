import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { vendorId, name, email, phone, role, status } = await req.json();

  if (!vendorId || !name || !email || !phone || !role || !status) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.professional.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Professional already exists with this email" },
        { status: 400 }
      );
    }

    const professional = await prisma.professional.create({
      data: { name, email, phone, roleId: role, status, vendorId },
    });

    return NextResponse.json(professional, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
