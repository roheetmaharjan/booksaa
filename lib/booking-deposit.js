function paymentError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export function normalizeDepositType(depositType) {
  if (depositType === null || depositType === undefined || depositType === "") return null;
  if (depositType === "percent") return "percentage";
  if (depositType === "percentage" || depositType === "fixed") return depositType;
  throw paymentError("Deposit type must be percentage or fixed.");
}

export function roundCurrencyAmount(amount, currencyCode = "USD") {
  const value = Number(amount);
  if (!Number.isFinite(value)) throw paymentError("Payment amount must be a valid number.");
  const fractionDigits = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).resolvedOptions().maximumFractionDigits;
  const factor = 10 ** fractionDigits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function toMinorCurrencyUnits(amount, currencyCode = "USD") {
  const fractionDigits = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).resolvedOptions().maximumFractionDigits;
  return Math.round(roundCurrencyAmount(amount, currencyCode) * (10 ** fractionDigits));
}

export function validateServicePaymentConfiguration({
  price,
  prepaymentType,
  depositType,
  depositValue,
  allowPayAtBusiness,
}) {
  const servicePrice = Number(price);
  if (!Number.isFinite(servicePrice) || servicePrice < 0) {
    throw paymentError("Service price must be a non-negative number.");
  }
  if (!["pay_later", "deposit", "full"].includes(prepaymentType)) {
    throw paymentError("Select a valid service payment rule.");
  }
  if (typeof allowPayAtBusiness !== "boolean") {
    throw paymentError("Pay-at-business availability must be a boolean.");
  }

  if (prepaymentType === "full") {
    return {
      prepaymentType,
      depositType: null,
      depositValue: null,
      allowPayAtBusiness,
    };
  }

  const normalizedDepositType = normalizeDepositType(depositType);
  const hasDepositValue = depositValue !== null && depositValue !== undefined && depositValue !== "";
  if (!normalizedDepositType && !hasDepositValue && prepaymentType !== "deposit") {
    return {
      prepaymentType: "pay_later",
      depositType: null,
      depositValue: null,
      allowPayAtBusiness,
    };
  }
  if (!normalizedDepositType) {
    throw paymentError("Select a deposit type.");
  }
  const value = Number(depositValue);
  if (!hasDepositValue || !Number.isFinite(value) || value <= 0) {
    throw paymentError("Deposit amount must be greater than zero.");
  }
  if (normalizedDepositType === "percentage" && value > 100) {
    throw paymentError("Percentage deposits must be between 0 and 100.");
  }
  if (normalizedDepositType === "fixed" && value > servicePrice) {
    throw paymentError("Fixed deposits cannot exceed the service price.");
  }

  return {
    prepaymentType: "deposit",
    depositType: normalizedDepositType,
    depositValue: value,
    allowPayAtBusiness,
  };
}

export function getEffectivePaymentRequirement(service, settings = {}) {
  const onlinePaymentsEnabled = settings.onlinePaymentsEnabled !== false;
  const canPayLater = settings.cashPaymentsEnabled !== false
    || (settings.payAtBusinessEnabled !== false && service.allowPayAtBusiness !== false);
  const configuredRequirement = service.prepaymentType === "full"
    ? "full"
    : service.depositType
      ? "deposit"
      : "pay_later";

  if (!onlinePaymentsEnabled && canPayLater) return "pay_later";
  if (configuredRequirement === "deposit" && settings.depositsEnabled === false) {
    return canPayLater ? "pay_later" : onlinePaymentsEnabled ? "full" : "pay_later";
  }
  if (configuredRequirement === "pay_later" && !canPayLater && onlinePaymentsEnabled) {
    return "full";
  }
  return configuredRequirement;
}

export function calculateRequiredPaymentAmount(service, paymentRequirement, currencyCode = "USD") {
  const price = Number(service.price);
  if (!Number.isFinite(price) || price < 0) {
    throw paymentError("Service price must be a non-negative number.");
  }
  const requirement = paymentRequirement ?? (
    service.prepaymentType === "full" ? "full" : service.depositType ? "deposit" : "pay_later"
  );
  if (requirement === "full") return roundCurrencyAmount(price, currencyCode);
  if (requirement !== "deposit" || !service.depositType) return 0;

  const type = normalizeDepositType(service.depositType);
  const value = Number(service.depositValue);
  if (!type || service.depositValue === null || service.depositValue === undefined || !Number.isFinite(value) || value < 0) {
    throw paymentError("The service deposit configuration is invalid.");
  }
  if (type === "percentage" && value > 100) {
    throw paymentError("Percentage deposits must be between 0 and 100.");
  }

  const amount = type === "fixed" ? value : price * (value / 100);
  return roundCurrencyAmount(Math.min(price, amount), currencyCode);
}

export function calculateBookingTotals(services = [], options = {}) {
  const currencyCode = options.currencyCode || "USD";
  const taxRate = Number(options.taxRate || 0);
  const subtotal = roundCurrencyAmount(services.reduce((sum, service) => sum + Number(service.price || 0), 0), currencyCode);
  const requiredDeposit = roundCurrencyAmount(services.reduce(
    (sum, service) => sum + calculateRequiredPaymentAmount(service, undefined, currencyCode),
    0,
  ), currencyCode);
  const taxAmount = roundCurrencyAmount(subtotal * taxRate, currencyCode);
  const total = roundCurrencyAmount(subtotal + taxAmount, currencyCode);

  return {
    subtotal,
    taxAmount,
    total,
    requiredDeposit,
    remainingBalance: roundCurrencyAmount(Math.max(0, total - requiredDeposit), currencyCode),
  };
}
