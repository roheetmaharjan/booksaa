export const ACTIVE_SUBSCRIPTION_STATUSES = ["ACTIVE", "TRIAL_ACTIVE", "TRIAL_EXPIRING"];
const ACTIVE_SUBSCRIPTION_STATUS_SET = new Set(ACTIVE_SUBSCRIPTION_STATUSES);
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function isActiveSubscriptionStatus(status) {
  return ACTIVE_SUBSCRIPTION_STATUS_SET.has(status);
}

export function resolveSubscriptionExpiryDate({
  subscriptionStatus,
  trialEndsAt,
  subscriptionExpiresAt,
  subscriptionCreatedAt,
  billingCycle,
}) {
  if (["TRIAL_ACTIVE", "TRIAL_EXPIRING"].includes(subscriptionStatus) && trialEndsAt) {
    return new Date(trialEndsAt);
  }

  if (subscriptionExpiresAt) return new Date(subscriptionExpiresAt);

  if (subscriptionCreatedAt) {
    const expiryDate = new Date(subscriptionCreatedAt);
    if (billingCycle === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    return expiryDate;
  }

  return null;
}

export function getSubscriptionState(subscription = {}, now = new Date()) {
  const input = subscription instanceof Date || typeof subscription === "string"
    ? { subscriptionExpiresAt: subscription }
    : subscription || {};
  const expiryDate = resolveSubscriptionExpiryDate(input);

  if (!expiryDate || Number.isNaN(expiryDate.getTime())) {
    return {
      expiryDate: null,
      daysRemaining: null,
      isExpired: input.subscriptionStatus === "TRIAL_EXPIRED",
      isExpiringSoon: false,
      isActive: isActiveSubscriptionStatus(input.subscriptionStatus) && input.subscriptionStatus !== "TRIAL_EXPIRED",
      accountStatus: input.subscriptionStatus,
    };
  }

  const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / DAY_IN_MILLISECONDS);
  const isExpired = daysRemaining <= 0 || input.subscriptionStatus === "TRIAL_EXPIRED";
  const isTrial = ["TRIAL_ACTIVE", "TRIAL_EXPIRING"].includes(input.subscriptionStatus);
  const accountStatus = isTrial
    ? isExpired
      ? "TRIAL_EXPIRED"
      : daysRemaining <= 3
        ? "TRIAL_EXPIRING"
        : "TRIAL_ACTIVE"
    : input.subscriptionStatus;

  return {
    expiryDate,
    daysRemaining,
    isExpired,
    isExpiringSoon: !isExpired && daysRemaining <= 7,
    isActive: isActiveSubscriptionStatus(input.subscriptionStatus) && !isExpired,
    accountStatus,
  };
}
