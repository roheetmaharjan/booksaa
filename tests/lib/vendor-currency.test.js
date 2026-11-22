import test from "node:test";
import assert from "node:assert/strict";

import { formatVendorCurrency, getCurrencySymbol } from "../../lib/vendor-currency.js";

test("formats vendor prices in NPR with the Rs. prefix", () => {
  assert.equal(formatVendorCurrency(1234.5, "NPR"), "Rs. 1,234.50");
  assert.equal(getCurrencySymbol("NPR"), "Rs.");
});

test("formats other vendor currencies with their standard currency symbol", () => {
  assert.equal(formatVendorCurrency(1234.5, "USD"), "$1,234.50");
  assert.equal(getCurrencySymbol("USD"), "$");
});
