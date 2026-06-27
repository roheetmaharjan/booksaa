import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createCustomerCode,
  customerSelect,
  findCustomerDuplicates,
  getCurrentVendorOrThrow,
  normalizeEmail,
  normalizePhone,
  normalizeTags,
} from "@/lib/customer-crm";

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function customerPayload(body) {
  return {
    fullName: String(body.fullName || body.name || "").trim(),
    phone: normalizePhone(body.phone),
    email: normalizeEmail(body.email),
    gender: body.gender || null,
    dateOfBirth: parseDate(body.dateOfBirth),
    address: body.address || null,
    profilePhoto: body.profilePhoto || null,
    notes: body.notes || null,
    status: body.status || "ACTIVE",
    tags: normalizeTags(body.tags),
    preferredStaffId: body.preferredStaffId || null,
    preferredStaffName: body.preferredStaffName || null,
    preferredServiceId: body.preferredServiceId || null,
    preferredServiceName: body.preferredServiceName || null,
    loyaltyPoints: Number(body.loyaltyPoints || 0),
    earnedPoints: Number(body.earnedPoints || 0),
    redeemedPoints: Number(body.redeemedPoints || 0),
    membershipLevel: body.membershipLevel || null,
  };
}

function bookingAmount(booking) {
  return Number(booking.paymentAmount || booking.service?.price || 0);
}

function buildStats(customers) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return {
    totalCustomers: customers.length,
    newThisMonth: customers.filter((customer) => {
      const joined = new Date(customer.dateJoined);
      return joined.getMonth() === month && joined.getFullYear() === year;
    }).length,
    returningCustomers: customers.filter((customer) => customer._count?.bookings > 1).length,
    vipCustomers: customers.filter((customer) => customer.tags?.some((tag) => tag.toLowerCase() === "vip")).length,
    inactiveCustomers: customers.filter((customer) => customer.status === "INACTIVE").length,
    birthdaysThisMonth: customers.filter((customer) => customer.dateOfBirth && new Date(customer.dateOfBirth).getMonth() === month).length,
  };
}

function attachComputed(customer) {
  const bookings = customer.bookings || [];
  const completed = bookings.filter((booking) => booking.status === "COMPLETED");
  const lastVisit = completed[0]?.scheduledAt || bookings[0]?.scheduledAt || null;
  const upcoming = bookings.find((booking) => new Date(booking.scheduledAt) >= new Date() && !["CANCELED", "COMPLETED"].includes(booking.status));
  const lifetimeSpending = completed.reduce((sum, booking) => sum + bookingAmount(booking), 0);

  return {
    ...customer,
    lastVisit,
    nextAppointment: upcoming?.scheduledAt || null,
    totalBookings: bookings.length,
    totalVisits: completed.length,
    lifetimeSpending,
    averageSpending: completed.length ? lifetimeSpending / completed.length : 0,
    cancellationCount: bookings.filter((booking) => booking.status === "CANCELED").length,
    noShowCount: 0,
  };
}

export async function GET(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q")?.trim();
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "latest";
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || 10), 1), 100);

    const where = {
      vendorId: vendor.id,
      ...(status && status !== "ALL" ? { status } : {}),
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const customersForStats = await prisma.customer.findMany({
      where: { vendorId: vendor.id },
      select: { dateJoined: true, dateOfBirth: true, status: true, tags: true, _count: { select: { bookings: true } } },
    });

    const allMatches = await prisma.customer.findMany({
      where,
      select: {
        ...customerSelect(),
        _count: { select: { bookings: true, invoices: true, noteEntries: true, communications: true } },
        bookings: {
          orderBy: { scheduledAt: "desc" },
          include: {
            service: { select: { name: true, price: true } },
            professional: { select: { name: true } },
          },
        },
      },
    });

    const computed = allMatches.map(attachComputed);
    computed.sort((a, b) => {
      if (sort === "alpha") return a.fullName.localeCompare(b.fullName);
      if (sort === "latest") return new Date(b.lastVisit || b.updatedAt) - new Date(a.lastVisit || a.updatedAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = computed.length;
    const customers = computed.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
      stats: buildStats(customersForStats),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load customers." }, { status: error.status || 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const body = await req.json();
    const data = customerPayload(body);

    if (!data.fullName) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }

    const duplicates = await findCustomerDuplicates(vendor.id, data);
    if (duplicates.length > 0 && !body.ignoreDuplicate) {
      return NextResponse.json({ error: "Possible duplicate customer.", duplicates }, { status: 409 });
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        vendorId: vendor.id,
        customerCode: await createCustomerCode(vendor.id),
      },
      select: customerSelect(),
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to create customer." }, { status: error.status || 500 });
  }
}
