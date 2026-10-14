import test from "node:test";
import assert from "node:assert/strict";

import { getSubscriptionState, isActiveSubscriptionStatus, resolveSubscriptionExpiryDate } from "../../lib/subscription-state.js";

test("subscription expiry is resolved from the trial end before the paid subscription expiry", () => {
  const expiryDate = resolveSubscriptionExpiryDate({
    subscriptionStatus: "TRIAL_ACTIVE",
    trialEndsAt: "2026-10-20T00:00:00.000Z",
    subscriptionExpiresAt: "2027-01-01T00:00:00.000Z",
  });

  assert.equal(expiryDate.toISOString(), "2026-10-20T00:00:00.000Z");
});

test("subscription state consistently reports expired and active trials", () => {
  const expired = getSubscriptionState({
    subscriptionStatus: "TRIAL_ACTIVE",
    trialEndsAt: "2026-10-13T00:00:00.000Z",
  }, new Date("2026-10-14T00:00:00.000Z"));
  const active = getSubscriptionState({
    subscriptionStatus: "TRIAL_ACTIVE",
    trialEndsAt: "2026-10-20T00:00:00.000Z",
  }, new Date("2026-10-14T00:00:00.000Z"));

  assert.equal(expired.isExpired, true);
  assert.equal(expired.accountStatus, "TRIAL_EXPIRED");
  assert.equal(expired.isActive, false);
  assert.equal(active.isExpired, false);
  assert.equal(active.accountStatus, "TRIAL_ACTIVE");
  assert.equal(active.isActive, true);
});

test("active subscription statuses are defined by the shared utility", () => {
  assert.equal(isActiveSubscriptionStatus("ACTIVE"), true);
  assert.equal(isActiveSubscriptionStatus("TRIAL_EXPIRING"), true);
  assert.equal(isActiveSubscriptionStatus("TRIAL_EXPIRED"), false);
});
