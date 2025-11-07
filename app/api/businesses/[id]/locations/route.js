import { prisma } from "@/lib/prisma";
import { includes } from "lodash";
import { NextResponse } from "next/server";
export async function GET(req, { params }) {
  try {
    const { id: vendorId } = await params;

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 });
    }

    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const locations = await prisma.location.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(locations, { status: 200 });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
