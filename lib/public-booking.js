import { createHash } from "node:crypto";
import { zonedDateTimeToDate } from "./time-zones.js";
import {
  calculateRequiredPaymentAmount,
  getEffectivePaymentRequirement as resolveEffectivePaymentRequirement,
} from "./booking-deposit.js";

function selectionError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export function getGuestBookingSelection(body, timeZone = "Asia/Kathmandu") {
  const serviceId = typeof body.serviceId === "string" ? body.serviceId : "";
  const locationId = typeof body.locationId === "string" ? body.locationId : "";
  const professionalId = typeof body.professionalId === "string" && body.professionalId ? body.professionalId : null;
  const date = typeof body.date === "string" ? body.date : "";
  const time = typeof body.time === "string" ? body.time : "";
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const twentyFourHourMatch = time.match(/^(\d{2}):(\d{2})$/);

  if (!serviceId || !locationId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || (!timeMatch && !twentyFourHourMatch)) {
    throw selectionError("A valid service, location, date, and appointment time are required.");
  }

  let hour;
  let minute;
  if (timeMatch) {
    const [, rawHour, rawMinute, rawPeriod] = timeMatch;
    hour = Number(rawHour);
    minute = Number(rawMinute);
    const period = rawPeriod.toUpperCase();

    if (hour < 1 || hour > 12 || minute > 59) {
      throw selectionError("The selected appointment time is invalid.");
    }

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
  } else {
    hour = Number(twentyFourHourMatch[1]);
    minute = Number(twentyFourHourMatch[2]);
    if (hour > 23 || minute > 59) throw selectionError("The selected appointment time is invalid.");
  }

  const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  const scheduledAt = zonedDateTimeToDate(date, startTime, timeZone);

  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || !scheduledAt) {
    throw selectionError("The selected appointment date is invalid.");
  }

  return {
    serviceId,
    locationId,
    professionalId,
    date,
    time,
    startTime,
    startMinutes: hour * 60 + minute,
    scheduledAt,
  };
}

export function getRequiredDeposit(service, settings) {
  const paymentRequirement = getEffectivePaymentRequirement(service, settings);
  return calculateRequiredPaymentAmount(service, paymentRequirement, settings?.currencyCode || "USD");
}

export function getEffectivePaymentRequirement(service, settings) {
  return resolveEffectivePaymentRequirement(service, settings);
}

export function hashVerificationToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
