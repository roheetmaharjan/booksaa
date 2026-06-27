import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentVendorOrThrow } from "@/lib/customer-crm";

export async function POST(req, { params }) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const { id: targetId } = await params;
    const { sourceId } = await req.json();

    if (!sourceId || sourceId === targetId) {
      return NextResponse.json({ error: "Choose a different customer to merge." }, { status: 400 });
    }

    const [target, source] = await Promise.all([
      prisma.customer.findFirst({ where: { id: targetId, vendorId: vendor.id } }),
      prisma.customer.findFirst({ where: { id: sourceId, vendorId: vendor.id } }),
    ]);

    if (!target || !source) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.bookings.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } }),
      prisma.customerNote.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } }),
      prisma.customerInvoice.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } }),
      prisma.customerCommunication.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } }),
      prisma.customer.update({
        where: { id: targetId },
        data: {
          phone: target.phone || source.phone,
          email: target.email || source.email,
          address: target.address || source.address,
          notes: [target.notes, source.notes].filter(Boolean).join("\n\n"),
          tags: [...new Set([...(target.tags || []), ...(source.tags || [])])],
          loyaltyPoints: target.loyaltyPoints + source.loyaltyPoints,
          earnedPoints: target.earnedPoints + source.earnedPoints,
          redeemedPoints: target.redeemedPoints + source.redeemedPoints,
        },
      }),
      prisma.customer.delete({ where: { id: sourceId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to merge customers." }, { status: error.status || 500 });
  }
}
