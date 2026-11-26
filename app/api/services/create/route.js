import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVendorSettings } from "@/lib/business-settings";
import { validateServicePaymentConfiguration } from "@/lib/booking-deposit";

export async function POST(req) {
  try {
    const {
      name,
      price,
      duration,
      description,
      color,
      vendorId,
      locationId,
      prepaymentType: requestedPrepaymentType,
      depositType: requestedDepositType,
      depositValue: requestedDepositValue,
      allowPayAtBusiness: requestedAllowPayAtBusiness,
    } = await req.json();

    // Validate required fields
    if (!vendorId || !locationId) {
      return NextResponse.json(
        { error: "Vendor ID and Location Id are required" },
        { status: 400 }
      );
    }

    if (!name?.trim() || isNaN(Number(price)) || isNaN(Number(duration))) {
      return NextResponse.json(
        { error: "Invalid input: name, price, and duration are required" },
        { status: 400 }
      );
    }

    // Check vendor exists
    const vendorExists = await prisma.vendors.findUnique({
      where: { id: vendorId },
    });

    if (!vendorExists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const locationExists = await prisma.location.findFirst({
      where: { id: locationId, vendorId },
    });

    if (!locationExists) {
      return NextResponse.json(
        { error: "Location not found for this business" },
        { status: 404 }
      );
    }

    // Check if service name already exists for this vendor
    const exists = await prisma.service.findUnique({
      where: {
        name_vendorId_locationId: {
          name: name.trim(),
          vendorId,
          locationId
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Service name is already taken" },
        { status: 409 }
      );
    }

    const vendorSettings = await getVendorSettings(vendorId);
    const prepaymentType = requestedPrepaymentType ?? vendorSettings.defaultPrepaymentType;
    const depositType = prepaymentType === "deposit"
      ? requestedDepositType || "percentage"
      : requestedDepositType;
    const depositValue = prepaymentType === "deposit"
      ? requestedDepositValue === undefined || requestedDepositValue === null || requestedDepositValue === ""
        ? depositType === "percentage" || depositType === "percent"
          ? vendorSettings.defaultDepositPercentage
          : requestedDepositValue
        : requestedDepositValue
      : requestedDepositValue;
    const paymentConfiguration = validateServicePaymentConfiguration({
      price,
      prepaymentType,
      depositType,
      depositValue,
      allowPayAtBusiness: requestedAllowPayAtBusiness ?? vendorSettings.defaultAllowPayAtBusiness,
    });

    const service = await prisma.service.create({
      data: {
        name,
        description,
        color: color || "#2563eb",
        price: parseFloat(price),
        duration: parseFloat(duration),
        vendorId,
        locationId,
        ...paymentConfiguration,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error("Service create error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}
