import { prisma } from "@/lib/prisma";

export async function getCurrentVendorOrThrow(session) {
  if (!session) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  if (session.role !== "VENDOR") {
    const error = new Error("Only vendor accounts can access customers.");
    error.status = 403;
    throw error;
  }

  const vendor = await prisma.vendors.findUnique({
    where: { userId: session.id },
    select: { id: true, name: true },
  });

  if (!vendor) {
    const error = new Error("Business not found for this account.");
    error.status = 404;
    throw error;
  }

  return vendor;
}

export function normalizeTags(value) {
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function normalizeEmail(value) {
  return value ? String(value).trim().toLowerCase() : null;
}

export function normalizePhone(value) {
  return value ? String(value).trim() : null;
}

export function customerSelect() {
  return {
    id: true,
    customerCode: true,
    fullName: true,
    phone: true,
    email: true,
    gender: true,
    dateOfBirth: true,
    address: true,
    profilePhoto: true,
    notes: true,
    status: true,
    tags: true,
    preferredStaffId: true,
    preferredStaffName: true,
    preferredServiceId: true,
    preferredServiceName: true,
    loyaltyPoints: true,
    earnedPoints: true,
    redeemedPoints: true,
    membershipLevel: true,
    dateJoined: true,
    createdAt: true,
    updatedAt: true,
  };
}

export async function findCustomerDuplicates(vendorId, { email, phone }, excludeId) {
  const clauses = [];
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  if (normalizedEmail) clauses.push({ email: normalizedEmail });
  if (normalizedPhone) clauses.push({ phone: normalizedPhone });
  if (clauses.length === 0) return [];

  return prisma.customer.findMany({
    where: {
      vendorId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: clauses,
    },
    select: {
      id: true,
      customerCode: true,
      fullName: true,
      phone: true,
      email: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function createCustomerCode(vendorId) {
  const count = await prisma.customer.count({ where: { vendorId } });
  return `CUST-${String(count + 1).padStart(5, "0")}`;
}
