export function getSubscriptionState(expiryDate) {
  if (!expiryDate) {
    return {
      expiryDate: null,
      daysRemaining: null,
      isExpired: false,
      isExpiringSoon: false,
    };
  }

  const now = new Date();
  const expiry = new Date(expiryDate);

  const daysRemaining = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    expiryDate,
    daysRemaining,
    isExpired: daysRemaining <= 0,
    isExpiringSoon: daysRemaining > 0 && daysRemaining <= 7,
  };
}