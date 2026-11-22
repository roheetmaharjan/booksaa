export const COUNTRY_DEFAULTS = {
  NP: { currencyCode: "NPR", timeZone: "Asia/Kathmandu" },
  AU: { currencyCode: "AUD", timeZone: "Australia/Sydney" },
  US: { currencyCode: "USD", timeZone: "America/New_York" },
};

export function applyCountrySuggestions(countryCode, current, manuallyChanged) {
  const defaults = COUNTRY_DEFAULTS[countryCode];
  if (!defaults) return current;

  return {
    ...current,
    countryCode,
    currencyCode: manuallyChanged.currencyCode ? current.currencyCode : defaults.currencyCode,
    timeZone: manuallyChanged.timeZone ? current.timeZone : defaults.timeZone,
  };
}
