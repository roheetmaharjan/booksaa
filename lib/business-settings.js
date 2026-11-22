import { prisma } from "@/lib/prisma";
import { isSupportedTimeZone } from "@/lib/time-zones.js";

export { getZonedDateParts, getZonedDayBounds, isBookingWithinWindow, isSupportedTimeZone, zonedDateTimeToDate } from "@/lib/time-zones.js";

export const DEFAULT_VENDOR_SETTINGS = {
  businessEmail: null,
  website: null,
  countryCode: "NP",
  currencyCode: "USD",
  timeZone: "Asia/Kathmandu",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  onlineBookingEnabled: true,
  manualBookingApproval: false,
  minAdvanceNoticeMinutes: 0,
  maxAdvanceBookingDays: 365,
  allowCustomerCancellations: true,
  allowCustomerRescheduling: true,
  cancellationDeadlineHours: null,
  cashPaymentsEnabled: true,
  onlinePaymentsEnabled: true,
  payAtBusinessEnabled: true,
  depositsEnabled: true,
  defaultDepositPercentage: null,
  paymentInstructions: null,
  notifyNewBooking: false,
  notifyBookingConfirmation: true,
  notifyBookingCancellation: false,
  notifyBookingReminder: false,
  notifyPaymentConfirmation: false,
};

export async function getVendorSettings(vendorId) {
  const settings = await prisma.vendorSettings.findUnique({ where: { vendorId } });
  return { ...DEFAULT_VENDOR_SETTINGS, ...settings, vendorId };
}

export async function updateVendorSettings(vendorId, settings) {
  return prisma.vendorSettings.upsert({
    where: { vendorId },
    create: { vendorId, ...settings },
    update: settings,
  });
}

