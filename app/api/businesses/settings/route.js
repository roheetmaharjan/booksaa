import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getVendorSettings, isSupportedTimeZone, updateVendorSettings } from "@/lib/business-settings";
import { prisma } from "@/lib/prisma";

const booleanFields = [
  "onlineBookingEnabled",
  "manualBookingApproval",
  "allowCustomerCancellations",
  "allowCustomerRescheduling",
  "cashPaymentsEnabled",
  "onlinePaymentsEnabled",
  "payAtBusinessEnabled",
  "depositsEnabled",
  "defaultAllowPayAtBusiness",
  "notifyNewBooking",
  "notifyBookingConfirmation",
  "notifyBookingCancellation",
  "notifyBookingReminder",
  "notifyPaymentConfirmation",
];

const stringFields = ["businessEmail", "website", "countryCode", "currencyCode", "timeZone", "dateFormat", "timeFormat", "paymentInstructions", "defaultPrepaymentType"];

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function validateSettings(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Settings must be an object." };
  }

  const allowedFields = new Set([
    ...booleanFields,
    ...stringFields,
    "minAdvanceNoticeMinutes",
    "maxAdvanceBookingDays",
    "cancellationDeadlineHours",
    "defaultDepositPercentage",
  ]);
  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    return { error: "One or more settings are not supported." };
  }

  const settings = {};
  for (const field of booleanFields) {
    if (input[field] !== undefined) {
      if (typeof input[field] !== "boolean") return { error: `${field} must be a boolean.` };
      settings[field] = input[field];
    }
  }

  for (const field of stringFields) {
    if (input[field] === undefined) continue;
    if (input[field] === null && ["businessEmail", "website", "paymentInstructions"].includes(field)) {
      settings[field] = null;
      continue;
    }
    if (typeof input[field] !== "string") return { error: `${field} must be a string.` };
    const value = input[field].trim();
    if (field === "businessEmail" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { error: "Enter a valid business email." };
    }
    if (field === "website" && value) {
      try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) return { error: "Website must use http or https." };
      } catch {
        return { error: "Enter a valid website URL." };
      }
    }
    if (field === "countryCode" && !["NP", "AU", "US"].includes(value)) return { error: "Select a supported country." };
    if (field === "currencyCode" && !["NPR", "AUD", "USD"].includes(value)) return { error: "Select a supported currency." };
    if (field === "timeZone" && !isSupportedTimeZone(value)) return { error: "Select a valid IANA timezone." };
    if (field === "dateFormat" && !["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].includes(value)) return { error: "Select a supported date format." };
    if (field === "timeFormat" && !["12h", "24h"].includes(value)) return { error: "Select a supported time format." };
    if (field === "defaultPrepaymentType" && !["pay_later", "deposit", "full"].includes(value)) return { error: "Select a supported default payment rule." };
    if (field === "paymentInstructions" && value.length > 2000) return { error: "Payment instructions must be 2000 characters or fewer." };
    settings[field] = value || null;
  }

  const integerRanges = {
    minAdvanceNoticeMinutes: [0, 525600],
    maxAdvanceBookingDays: [1, 730],
    cancellationDeadlineHours: [0, 8760],
  };
  for (const [field, [min, max]] of Object.entries(integerRanges)) {
    if (input[field] === undefined) continue;
    if (input[field] === null && field === "cancellationDeadlineHours") {
      settings[field] = null;
      continue;
    }
    const value = Number(input[field]);
    if (!Number.isInteger(value) || value < min || value > max) {
      return { error: `${field} must be between ${min} and ${max}.` };
    }
    settings[field] = value;
  }

  if (input.defaultDepositPercentage !== undefined) {
    if (input.defaultDepositPercentage === null || input.defaultDepositPercentage === "") {
      settings.defaultDepositPercentage = null;
    } else {
      const value = Number(input.defaultDepositPercentage);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return { error: "Default deposit percentage must be between 0 and 100." };
      }
      settings.defaultDepositPercentage = value;
    }
  }

  return { settings };
}

async function getVendorFromSession(request) {
  const session = await getCurrentSession();
  if (!session) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const slug = new URL(request.url).searchParams.get("slug");
  if (session.role === "VENDOR") {
    const vendor = await prisma.vendors.findUnique({
      where: { userId: session.id },
      select: { id: true, slug: true },
    });
    if (!vendor) {
      const error = new Error("Business not found for this account.");
      error.status = 404;
      throw error;
    }
    if (slug && vendor.slug !== slug) {
      const error = new Error("You do not have access to this business.");
      error.status = 403;
      throw error;
    }
    return vendor;
  }

  if (session.role === "ADMIN" && slug) {
    const vendor = await prisma.vendors.findFirst({
      where: { slug },
      select: { id: true, slug: true },
    });
    if (vendor) return vendor;
  }

  const error = new Error("You do not have permission to access business settings.");
  error.status = 403;
  throw error;
}

export async function GET(request) {
  try {
    const vendor = await getVendorFromSession(request);
    const [settings, serviceCount, paymentCount] = await Promise.all([
      getVendorSettings(vendor.id),
      prisma.service.count({ where: { vendorId: vendor.id } }),
      prisma.payment.count({ where: { booking: { service: { vendorId: vendor.id } } } }),
    ]);

    return NextResponse.json({
      settings,
      currencyChangeWarningRequired: serviceCount > 0 || paymentCount > 0,
    });
  } catch (error) {
    console.error("GET business settings failed:", error);
    return NextResponse.json({ error: error.message || "Unable to load business settings." }, { status: error.status || 500 });
  }
}

export async function PUT(request) {
  try {
    const vendor = await getVendorFromSession(request);
    const validation = validateSettings(await request.json());
    if (validation.error) return badRequest(validation.error);

    const currentSettings = await getVendorSettings(vendor.id);
    const nextSettings = { ...currentSettings, ...validation.settings };
    if (nextSettings.defaultPrepaymentType === "deposit"
      && !(Number(nextSettings.defaultDepositPercentage) > 0)) {
      return badRequest("Set a default deposit percentage before choosing deposits as the default payment rule.");
    }

    const settings = await updateVendorSettings(vendor.id, validation.settings);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PUT business settings failed:", error);
    return NextResponse.json({ error: error.message || "Unable to save business settings." }, { status: error.status || 500 });
  }
}
