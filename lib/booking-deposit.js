export function calculateBookingTotals(services = [], options = {}) {
  const taxRate = Number(options.taxRate || 0);

  const subtotal = services.reduce((sum, service) => sum + Number(service.price || 0), 0);

  const requiredDeposit = services.reduce((sum, service) => {
    if (service.prepaymentType === 'full') {
      return sum + Number(service.price || 0);
    }

    if (service.prepaymentType === 'deposit') {
      if (service.depositType === 'fixed') {
        return sum + Number(service.depositValue || 0);
      }

      if (service.depositType === 'percent') {
        return sum + (Number(service.price || 0) * Number(service.depositValue || 0) / 100);
      }
    }

    return sum;
  }, 0);

  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    total,
    requiredDeposit,
    remainingBalance: Math.max(0, total - requiredDeposit),
  };
}
