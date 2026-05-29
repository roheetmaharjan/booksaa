import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getActiveVendorSubscription, getSubscriptionLimits } from "@/lib/subscriptions";

export async function POST(req) {
  const { vendorId, locationId, name, email, phone, role, status } = await req.json();

  if (!vendorId || !locationId || !name || !email || !phone || !role || !status) {
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
        locations: true,
      },
    });
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    const location = await prisma.location.findFirst({
      where: { id: locationId, vendorId },
    });

    if (!location) {
      return NextResponse.json(
        { message: "Location not found for this business" },
        { status: 404 }
      );
    }

    const subscription = await getActiveVendorSubscription(vendorId);
    const { professionalLimit } = getSubscriptionLimits(subscription, vendor.plan);
    const currentProfessionalCount = vendor.professionals.length;

    if (currentProfessionalCount >= professionalLimit) {
      return NextResponse.json(
        {
          message: `Professional limit reached. Your subscription allows ${professionalLimit} professional${professionalLimit !== 1 ? "s" : ""}.`,
        },
        { status: 403 }
      );
    }

    const professional = await prisma.professional.create({
      data: { name, email, phone, roleId: role, status, vendorId, locationId },
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
