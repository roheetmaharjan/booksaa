import Stripe from "stripe";
import { prisma } from "./prisma";

let stripeInstance = null;

async function getStripeClient() {
  if (stripeInstance) return stripeInstance;

  const account = await prisma.stripeAccount.findFirst();
  if (!account || !account.stripeSecretKey) {
    throw new Error("Stripe account not configured");
  }

  stripeInstance = new Stripe(account.stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  return stripeInstance;
}

export async function createStripeCustomer(vendorId, vendorName, email) {
  const stripe = await getStripeClient();

  const customer = await stripe.customers.create({
    email,
    name: vendorName,
    metadata: { vendorId },
  });

  await prisma.vendors.update({
    where: { id: vendorId },
    data: { stripeCustomerId: customer.id },
  });

  return customer;
}

export async function getOrCreateStripeCustomer(vendorId, vendorName, email) {
  const vendor = await prisma.vendors.findUnique({
    where: { id: vendorId },
    select: { stripeCustomerId: true },
  });

  if (vendor?.stripeCustomerId) {
    const stripe = await getStripeClient();
    return stripe.customers.retrieve(vendor.stripeCustomerId);
  }

  return createStripeCustomer(vendorId, vendorName, email);
}

export async function createPaymentIntent(vendorId, amount, currency = "usd", metadata = {}) {
  const stripe = await getStripeClient();
  const vendor = await prisma.vendors.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      name: true,
      stripeCustomerId: true,
      user: {
        select: { email: true },
      },
    },
  });

  if (!vendor?.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: vendor.user?.email, // now available
      name: vendor.name, // now available
      metadata: { vendorId: vendor.id },
    });

    await prisma.vendors.update({
      where: { id: vendor.id },
      data: { stripeCustomerId: customer.id },
    });

    vendor.stripeCustomerId = customer.id;
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    customer: vendor.stripeCustomerId,
    metadata: { vendorId, ...metadata },
    setup_future_usage: 'off_session',
  });

  return intent;
}

export async function confirmPaymentIntent(paymentIntentId) {
  const stripe = await getStripeClient();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function listPaymentMethods(vendorId) {
  const stripe = await getStripeClient();
  const vendor = await prisma.vendors.findUnique({
    where: { id: vendorId },
    select: { stripeCustomerId: true },
  });

  if (!vendor?.stripeCustomerId) return [];

  const methods = await stripe.paymentMethods.list({
    customer: vendor.stripeCustomerId,
    type: "card",
  });

  return methods.data;
}

export async function deletePaymentMethod(paymentMethodId) {
  const stripe = await getStripeClient();
  return stripe.paymentMethods.detach(paymentMethodId);
}

export async function attachPaymentMethod(paymentMethodId, vendorId) {
  const stripe = await getStripeClient();
  const vendor = await prisma.vendors.findUnique({
    where: { id: vendorId },
    select: { stripeCustomerId: true },
  });

  if (!vendor?.stripeCustomerId) {
    throw new Error("Vendor has no Stripe customer ID");
  }

  return stripe.paymentMethods.attach(paymentMethodId, {
    customer: vendor.stripeCustomerId,
  });
}

export async function setDefaultPaymentMethod(paymentMethodId, vendorId) {
  const stripe = await getStripeClient();
  const vendor = await prisma.vendors.findUnique({
    where: { id: vendorId },
    select: { stripeCustomerId: true },
  });

  if (!vendor?.stripeCustomerId) {
    throw new Error("Vendor has no Stripe customer ID");
  }

  await stripe.customers.update(vendor.stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  return true;
}

export async function chargeCustomer(vendorId, amount, currency = "usd", description = "Subscription charge") {
  const stripe = await getStripeClient();
  const vendor = await prisma.vendors.findUnique({
    where: { id: vendorId },
    select: { stripeCustomerId: true },
  });

  if (!vendor?.stripeCustomerId) {
    throw new Error("Vendor has no Stripe customer ID");
  }

  const charge = await stripe.charges.create({
    amount: Math.round(amount * 100),
    currency,
    customer: vendor.stripeCustomerId,
    description,
  });

  return charge;
}

export async function getStripeAccount() {
  return prisma.stripeAccount.findFirst();
}

export async function saveStripeAccount(secretKey, publishableKey, live = false) {
  const existing = await prisma.stripeAccount.findFirst();

  if (existing) {
    return prisma.stripeAccount.update({
      where: { id: existing.id },
      data: {
        stripeSecretKey: secretKey,
        stripePublishableKey: publishableKey,
        live,
        setupComplete: true,
      },
    });
  }

  return prisma.stripeAccount.create({
    data: {
      stripeSecretKey: secretKey,
      stripePublishableKey: publishableKey,
      live,
      setupComplete: true,
    },
  });
}

export async function verifyStripeKeys(secretKey, publishableKey) {
  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });
    const account = await stripe.accounts.retrieve();
    return { valid: true, account };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export { getStripeClient };
