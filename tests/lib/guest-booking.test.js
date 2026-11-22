import test from "node:test";
import assert from "node:assert/strict";

import { createOtpChallenge, createVerifiedEmailToken, getVerifiedEmail, verifyOtpChallenge } from "../../lib/guest-booking-otp.js";
import { getEffectivePaymentRequirement, getGuestBookingSelection, getRequiredDeposit } from "../../lib/public-booking.js";
import { getZonedDayBounds, zonedDateTimeToDate } from "../../lib/time-zones.js";
import { applyCountrySuggestions } from "../../lib/regional-preferences.js";

test("OTP challenge only verifies the matching six-digit code", () => {
  const challenge = createOtpChallenge("guest@example.com", "012345");

  assert.equal(verifyOtpChallenge(challenge, "012345"), "guest@example.com");
  assert.equal(verifyOtpChallenge(challenge, "012346"), null);
  assert.equal(verifyOtpChallenge(challenge, "12345"), null);
  assert.equal(verifyOtpChallenge(`${challenge}tampered`, "012345"), null);
});

test("verified email tokens contain the verified address and reject tampering", () => {
  const token = createVerifiedEmailToken("guest@example.com");

  assert.equal(getVerifiedEmail(token), "guest@example.com");
  assert.equal(getVerifiedEmail(`${token}tampered`), null);
});

test("guest booking selection converts Nepal appointment time to a timestamp", () => {
  const selection = getGuestBookingSelection({
    serviceId: "service",
    locationId: "location",
    professionalId: "",
    date: "2026-10-15",
    time: "9:30 AM",
  });

  assert.equal(selection.startTime, "09:30");
  assert.equal(selection.scheduledAt.toISOString(), "2026-10-15T03:45:00.000Z");
  assert.equal(selection.professionalId, null);
});

test("guest booking selection supports 24-hour time in the business timezone", () => {
  const selection = getGuestBookingSelection({
    serviceId: "service",
    locationId: "location",
    date: "2026-01-15",
    time: "13:30",
  }, "Australia/Sydney");

  assert.equal(selection.startTime, "13:30");
  assert.equal(selection.scheduledAt.toISOString(), "2026-01-15T02:30:00.000Z");
});

test("timezone conversion rejects nonexistent local times during daylight-saving transitions", () => {
  assert.equal(zonedDateTimeToDate("2026-10-04", "02:30", "Australia/Sydney"), null);
});

test("business-day bounds account for daylight-saving changes", () => {
  const bounds = getZonedDayBounds("2026-10-04", "Australia/Sydney");
  assert.equal((bounds.end.getTime() - bounds.start.getTime()) / 3600000, 23);
});

test("country changes suggest defaults without replacing manually changed regional values", () => {
  const current = { countryCode: "NP", currencyCode: "USD", timeZone: "Asia/Kathmandu" };
  assert.deepEqual(applyCountrySuggestions("AU", current, { currencyCode: false, timeZone: false }), {
    countryCode: "AU",
    currencyCode: "AUD",
    timeZone: "Australia/Sydney",
  });
  assert.deepEqual(applyCountrySuggestions("US", { ...current, currencyCode: "AUD", timeZone: "America/Chicago" }, { currencyCode: true, timeZone: true }), {
    countryCode: "US",
    currencyCode: "AUD",
    timeZone: "America/Chicago",
  });
});

test("deposit calculation follows the existing service prepayment rules", () => {
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "full" }), 80);
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "deposit", depositType: "percent", depositValue: 25 }), 20);
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "deposit", depositType: "fixed", depositValue: 15 }), 15);
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "pay_later" }), 0);
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "deposit", depositType: "percent", depositValue: 25 }, { onlinePaymentsEnabled: true, depositsEnabled: false }), 0);
  assert.equal(getEffectivePaymentRequirement({ price: 80, prepaymentType: "full" }, { onlinePaymentsEnabled: false, payAtBusinessEnabled: true, cashPaymentsEnabled: false }), "pay_later");
});
