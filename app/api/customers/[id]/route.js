import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSelect, findCustomerDuplicates, getCurrentVendorOrThrow, normalizeEmail, normalizePhone, normalizeTags } from "@/lib/customer-crm";

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function bookingAmount(booking) {
  return Number(booking.paymentAmount || booking.service?.price || 0);
}

function buildProfile(customer, fallbackBookings = []) {
  const bookings = [...(customer.bookings || []), ...fallbackBookings]
    .filter((booking, index, items) => items.findIndex((item) => item.id === booking.id) === index)
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
  const completed = bookings.filter((booking) => booking.status === "COMPLETED");
  const upcoming = bookings.find((booking) => new Date(booking.scheduledAt) >= new Date() && !["CANCELED", "COMPLETED"].includes(booking.status));
  const lifetimeSpending = completed.reduce((sum, booking) => sum + bookingAmount(booking), 0);

  return {
    ...customer,
    bookings,
    statistics: {
      totalVisits: completed.length,
      totalBookings: bookings.length,
      lifetimeSpending,
      averageSpending: completed.length ? lifetimeSpending / completed.length : 0,
      lastVisit: completed[0]?.scheduledAt || bookings[0]?.scheduledAt || null,
      nextAppointment: upcoming?.scheduledAt || null,
      cancellationCount: bookings.filter((booking) => booking.status === "CANCELED").length,
      noShowCount: 0,
    },
  };
}

async function getCustomerForVendor(id, vendorId) {
  return prisma.customer.findFirst({
    where: { id, vendorId },
    select: {
      ...customerSelect(),
      noteEntries: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      communications: { orderBy: { createdAt: "desc" } },
      bookings: {
        orderBy: { scheduledAt: "desc" },
        include: {
          service: { select: { name: true, price: true } },
          professional: { select: { name: true } },
        },
      },
    },
  });
}

export async function GET(req, { params }) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const { id } = await params;
    const customer = await getCustomerForVendor(id, vendor.id);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const matchFilters = [];
    if (customer.email) matchFilters.push({ customerEmail: customer.email });
    if (customer.phone) matchFilters.push({ customerPhone: customer.phone });

    const fallbackBookings =
      matchFilters.length > 0
        ? await prisma.bookings.findMany({
            where: {
              customerId: null,
              OR: matchFilters,
              service: { vendorId: vendor.id },
            },
            orderBy: { scheduledAt: "desc" },
            include: {
              service: { select: { name: true, price: true } },
              professional: { select: { name: true } },
            },
          })
        : [];

    return NextResponse.json({ customer: buildProfile(customer, fallbackBookings) });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load customer." }, { status: error.status || 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.customer.findFirst({ where: { id, vendorId: vendor.id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

    const data = {
      fullName: body.fullName !== undefined ? String(body.fullName).trim() : undefined,
      phone: body.phone !== undefined ? normalizePhone(body.phone) : undefined,
      email: body.email !== undefined ? normalizeEmail(body.email) : undefined,
      gender: body.gender !== undefined ? body.gender || null : undefined,
      dateOfBirth: body.dateOfBirth !== undefined ? parseDate(body.dateOfBirth) : undefined,
      address: body.address !== undefined ? body.address || null : undefined,
      profilePhoto: body.profilePhoto !== undefined ? body.profilePhoto || null : undefined,
      notes: body.notes !== undefined ? body.notes || null : undefined,
      status: body.status || undefined,
      tags: body.tags !== undefined ? normalizeTags(body.tags) : undefined,
      preferredStaffId: body.preferredStaffId !== undefined ? body.preferredStaffId || null : undefined,
      preferredStaffName: body.preferredStaffName !== undefined ? body.preferredStaffName || null : undefined,
      preferredServiceId: body.preferredServiceId !== undefined ? body.preferredServiceId || null : undefined,
      preferredServiceName: body.preferredServiceName !== undefined ? body.preferredServiceName || null : undefined,
      loyaltyPoints: body.loyaltyPoints !== undefined ? Number(body.loyaltyPoints || 0) : undefined,
      earnedPoints: body.earnedPoints !== undefined ? Number(body.earnedPoints || 0) : undefined,
      redeemedPoints: body.redeemedPoints !== undefined ? Number(body.redeemedPoints || 0) : undefined,
      membershipLevel: body.membershipLevel !== undefined ? body.membershipLevel || null : undefined,
    };

    const duplicates = await findCustomerDuplicates(vendor.id, data, id);
    if (duplicates.length > 0 && !body.ignoreDuplicate) {
      return NextResponse.json({ error: "Possible duplicate customer.", duplicates }, { status: 409 });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data,
      select: customerSelect(),
    });

    return NextResponse.json({ customer });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to update customer." }, { status: error.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const { id } = await params;
    const existing = await prisma.customer.findFirst({ where: { id, vendorId: vendor.id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to delete customer." }, { status: error.status || 500 });
  }
}
