export function calculateBusinessSubscription({
  plan,
  locations = [],
  professionals = [],
  locationLimit,
  professionalLimit,
  subscriptionStatus,
  trialEndsAt,
  subscriptionExpiresAt,
  subscriptionCreatedAt,
}) {
  const basePrice = Number(plan?.price || 0);
  const includedLocations = Number(plan?.location || 1);
  const includedProfessionals = Number(plan?.professional || 1);
  const extraLocationPrice = Number(plan?.extraLocationPrice || 0);
  const extraProfessionalPrice = Number(plan?.extraProfessionalPrice || 0);

  const actualLocationCount = locations.filter((l) => l.isActive !== false).length;
  const actualProfessionalCount = professionals.length;
  const activeLocationCount = Math.max(
    actualLocationCount,
    Number(locationLimit || includedLocations),
  );
  const professionalCount = Math.max(
    actualProfessionalCount,
    Number(professionalLimit || includedProfessionals),
  );
  const extraLocations = Math.max(activeLocationCount - includedLocations, 0);
  const extraProfessionals = Math.max(professionalCount - includedProfessionals, 0);
  const extraLocationTotal = extraLocations * extraLocationPrice;
  const extraProfessionalTotal = extraProfessionals * extraProfessionalPrice;

  // ── Expiry date resolution ────────────────────────────────────────────────
  const expiryDate = (() => {
    if (subscriptionStatus === 'TRIAL_ACTIVE' && trialEndsAt) {
      return new Date(trialEndsAt);
    }
    if (subscriptionExpiresAt) {
      return new Date(subscriptionExpiresAt);
    }
    // Fallback: calculate from subscription createdAt + billing cycle
    if (subscriptionCreatedAt) {
      const start = new Date(subscriptionCreatedAt);
      if ((plan?.billing_cycle || 'monthly') === 'monthly') {
        start.setMonth(start.getMonth() + 1);
      } else {
        start.setFullYear(start.getFullYear() + 1);
      }
      return start;
    }
    return null;
  })();

  return {
    basePrice,
    billingCycle: plan?.billing_cycle || 'monthly',
    includedLocations,
    includedProfessionals,
    actualLocationCount,
    actualProfessionalCount,
    activeLocationCount,
    professionalCount,
    extraLocations,
    extraProfessionals,
    extraLocationPrice,
    extraProfessionalPrice,
    extraLocationTotal,
    extraProfessionalTotal,
    totalPrice: basePrice + extraLocationTotal + extraProfessionalTotal,
    expiryDate,         // ← Date object or null
    subscriptionStatus, // ← pass-through for convenience
  };
}