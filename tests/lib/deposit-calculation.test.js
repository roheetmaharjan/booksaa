import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateBookingTotals } from '../../lib/booking-deposit.js';

test('calculates subtotal, tax, total, deposit and balance for deposit-based services', () => {
  const services = [
    { id: 's1', name: 'Haircut', price: 80, prepaymentType: 'deposit', depositType: 'percent', depositValue: 20 },
    { id: 's2', name: 'Blowout', price: 20, prepaymentType: 'deposit', depositType: 'fixed', depositValue: 10 },
  ];

  const totals = calculateBookingTotals(services, { taxRate: 0.08 });

  assert.equal(totals.subtotal, 100);
  assert.equal(totals.taxAmount, 8);
  assert.equal(totals.total, 108);
  assert.equal(totals.requiredDeposit, 26);
  assert.equal(totals.remainingBalance, 82);
});

test('handles services with no deposit requirement', () => {
  const totals = calculateBookingTotals([
    { id: 's1', name: 'Consultation', price: 25, prepaymentType: 'pay_later', depositType: null, depositValue: null },
  ], { taxRate: 0.1 });

  assert.equal(totals.subtotal, 25);
  assert.equal(totals.taxAmount, 2.5);
  assert.equal(totals.total, 27.5);
  assert.equal(totals.requiredDeposit, 0);
  assert.equal(totals.remainingBalance, 27.5);
});
