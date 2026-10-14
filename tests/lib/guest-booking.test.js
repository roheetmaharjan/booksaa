import test from "node:test";
import assert from "node:assert/strict";

import { createOtpChallenge, createVerifiedEmailToken, getVerifiedEmail, verifyOtpChallenge } from "../../lib/guest-booking-otp.js";
import { getGuestBookingSelection, getRequiredDeposit } from "../../lib/public-booking.js";

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

test("deposit calculation follows the existing service prepayment rules", () => {
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "full" }), 80);
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "deposit", depositType: "percent", depositValue: 25 }), 20);
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "deposit", depositType: "fixed", depositValue: 15 }), 15);
  assert.equal(getRequiredDeposit({ price: 80, prepaymentType: "pay_later" }), 0);
});
