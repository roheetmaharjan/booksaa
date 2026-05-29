export function calculateBusinessSubscription({
  plan,
  locations = [],
  professionals = [],
  locationLimit,
  professionalLimit,
}) {
  const basePrice = Number(plan?.price || 0);
  const includedLocations = Number(plan?.location || 1);
  const includedProfessionals = Number(plan?.professional || 1);
  const extraLocationPrice = Number(plan?.extraLocationPrice || 0);
  const extraProfessionalPrice = Number(plan?.extraProfessionalPrice || 0);

  const actualLocationCount = locations.filter((location) => location.isActive !== false).length;
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

  return {
    basePrice,
    billingCycle: plan?.billing_cycle || "monthly",
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
  };
}
