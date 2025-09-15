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

    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId },
      include: {
        plan: true,
        professionals: true,
      },
    });
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    const maxProfessionals = vendor.plan.professional;
    const currentCount = vendor.professionals.length;

    if (currentCount >= maxProfessionals) {
      return NextResponse.json(
        {
          message:
            "You can add only one professional. Purchase more to add more professionals",
        },
        { status: 403 }
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
