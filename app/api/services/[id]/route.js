import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateServicePaymentConfiguration } from "@/lib/booking-deposit";

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
    const {
      name,
      description,
      price,
      duration,
      color,
      locationId,
      prepaymentType: requestedPrepaymentType,
      depositType: requestedDepositType,
      depositValue: requestedDepositValue,
      allowPayAtBusiness: requestedAllowPayAtBusiness,
    } = await req.json();
    
    if (!name || !price || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingService = await prisma.service.findUnique({
      where: { id },
    });
    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const paymentConfiguration = validateServicePaymentConfiguration({
      price,
      prepaymentType: requestedPrepaymentType ?? existingService.prepaymentType,
      depositType: requestedPrepaymentType === undefined ? existingService.depositType : requestedDepositType,
      depositValue: requestedPrepaymentType === undefined ? existingService.depositValue : requestedDepositValue,
      allowPayAtBusiness: requestedAllowPayAtBusiness ?? existingService.allowPayAtBusiness,
    });

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        color: color || "#2563eb",
        price: Number(price),
        duration: Number(duration),
        locationId: locationId || undefined,
        ...paymentConfiguration,
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
