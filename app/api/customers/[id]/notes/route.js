import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentVendorOrThrow } from "@/lib/customer-crm";

export async function POST(req, { params }) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const { id } = await params;
    const body = await req.json();

    const customer = await prisma.customer.findFirst({ where: { id, vendorId: vendor.id }, select: { id: true } });
    if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    if (!body.content?.trim()) return NextResponse.json({ error: "Note content is required." }, { status: 400 });

    const note = await prisma.customerNote.create({
      data: {
        customerId: id,
        content: body.content,
        staffName: body.staffName || session.name || "Staff",
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to add note." }, { status: error.status || 500 });
  }
}
