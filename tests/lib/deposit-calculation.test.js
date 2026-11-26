import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateBookingTotals,
  calculateRequiredPaymentAmount,
  getEffectivePaymentRequirement,
  normalizeDepositType,
  roundCurrencyAmount,
  validateServicePaymentConfiguration,
} from '../../lib/booking-deposit.js';

test('calculates subtotal, tax, total, deposit and balance for deposit-based services', () => {
  const services = [
    { id: 's1', name: 'Haircut', price: 80, prepaymentType: 'deposit', depositType: 'percentage', depositValue: 20 },
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

test('calculates and rounds percentage and capped fixed deposits', () => {
  assert.equal(
    calculateRequiredPaymentAmount(
      { price: 29.99, depositType: 'percentage', depositValue: 12.5 },
      'deposit',
      'USD',
    ),
    3.75,
  );
  assert.equal(
    calculateRequiredPaymentAmount(
      { price: 20, depositType: 'fixed', depositValue: 50 },
      'deposit',
      'USD',
    ),
    20,
  );
  assert.equal(
    calculateRequiredPaymentAmount(
      { price: 100, prepaymentType: 'pay_later', depositType: 'fixed', depositValue: 25 },
    ),
    25,
  );
  assert.equal(calculateRequiredPaymentAmount({ price: 20, depositType: null }, 'pay_later'), 0);
  assert.equal(roundCurrencyAmount(100.5, 'JPY'), 101);
});

test('normalizes legacy percentage spelling and rejects invalid service deposits', () => {
  assert.equal(normalizeDepositType('percent'), 'percentage');
  assert.deepEqual(
    validateServicePaymentConfiguration({
      price: 100,
      prepaymentType: 'pay_later',
      depositType: 'percent',
      depositValue: 25,
      allowPayAtBusiness: true,
    }),
    {
      prepaymentType: 'deposit',
      depositType: 'percentage',
      depositValue: 25,
      allowPayAtBusiness: true,
    },
  );
  assert.throws(() => validateServicePaymentConfiguration({
    price: 100,
    prepaymentType: 'deposit',
    depositType: 'percentage',
    depositValue: 101,
    allowPayAtBusiness: true,
  }), /between 0 and 100/);
  assert.throws(() => validateServicePaymentConfiguration({
    price: 100,
    prepaymentType: 'deposit',
    depositType: 'fixed',
    depositValue: -1,
    allowPayAtBusiness: true,
  }), /greater than zero/);
  assert.throws(() => validateServicePaymentConfiguration({
    price: 100,
    prepaymentType: 'deposit',
    depositType: 'fixed',
    depositValue: 101,
    allowPayAtBusiness: true,
  }), /cannot exceed the service price/);
});

test('applies service pay-at-business preference without changing global methods', () => {
  const service = { prepaymentType: 'pay_later', depositType: null, allowPayAtBusiness: false };
  assert.equal(
    getEffectivePaymentRequirement(service, {
      onlinePaymentsEnabled: true,
      payAtBusinessEnabled: true,
      cashPaymentsEnabled: false,
    }),
    'full',
  );
  assert.equal(
    getEffectivePaymentRequirement(service, {
      onlinePaymentsEnabled: true,
      payAtBusinessEnabled: true,
      cashPaymentsEnabled: true,
    }),
    'pay_later',
  );
});
