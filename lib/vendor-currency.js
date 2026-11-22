export function getCurrencySymbol(currencyCode = "USD") {
  if (currencyCode === "NPR") return "Rs.";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value || currencyCode;
}

export function formatVendorCurrency(value, currencyCode = "USD") {
  const amount = Number(value || 0);
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

  if (currencyCode === "NPR") return `Rs. ${formattedAmount}`;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number.isFinite(amount) ? amount : 0);
}
