import { prisma } from './prisma';
import { chargeCustomer } from './stripe-client';
import { sendAutoRenewalSuccess } from './emails/autoRenewalSuccess';
import { sendAutoRenewalFailed } from './emails/autoRenewalFailed';
import { sendSubscriptionWarning } from './emails/subscriptionExpiringWarning';

const RETRY_DAYS = 3;
const MAX_RETRIES = 3;

export async function processAutoRenewals() {
  try {
    // Find vendors whose subscription is expiring in 2 days and auto-renewal is enabled
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const vendors = await prisma.vendors.findMany({
      where: {
        subscriptionExpiresAt: {
          lte: twoDaysFromNow,
          gte: new Date(),
        },
        autoRenewEnabled: true,
        stripeCustomerId: { not: null },
      },
      include: {
        user: true,
        plan: true,
        paymentMethods: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    console.log(`Processing ${vendors.length} vendors for auto-renewal`);

    for (const vendor of vendors) {
      if (vendor.paymentMethods.length === 0) {
        console.log(`Vendor ${vendor.id} has no default payment method`);
        continue;
      }

      try {
        const charge = await chargeCustomer(
          vendor.id,
          vendor.plan.price,
          'usd',
          `Auto-renewal for plan: ${vendor.plan.name}`
        );

        // Calculate new expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + vendor.plan.duration);

        // Update vendor
        await prisma.vendors.update({
          where: { id: vendor.id },
          data: {
            subscriptionExpiresAt: expiryDate,
            lastPaymentAttemptAt: new Date(),
          },
        });

        // Create payment history
        await prisma.subscriptionPaymentHistory.create({
          data: {
            vendorId: vendor.id,
            type: 'RENEWAL',
            amount: vendor.plan.price,
            currency: 'USD',
            stripePaymentIntentId: charge.id,
            status: 'SUCCEEDED',
            chargedAt: new Date(),
          },
        });

        // Send success email
        await sendAutoRenewalSuccess({
          email: vendor.user.email,
          vendorName: vendor.name,
          planName: vendor.plan.name,
          amount: vendor.plan.price,
          expiryDate,
        });

        console.log(`Successfully renewed subscription for vendor ${vendor.id}`);
      } catch (error) {
        console.error(`Failed to charge vendor ${vendor.id}:`, error);

        const existingHistory = await prisma.subscriptionPaymentHistory.findFirst({
          where: {
            vendorId: vendor.id,
            status: 'FAILED',
            type: 'RENEWAL',
          },
          orderBy: { createdAt: 'desc' },
        });

        const retryCount = existingHistory ? (existingHistory.nextRetryAt ? 1 : 0) : 0;

        if (retryCount < MAX_RETRIES) {
          const nextRetry = new Date();
          nextRetry.setDate(nextRetry.getDate() + RETRY_DAYS);

          await prisma.subscriptionPaymentHistory.create({
            data: {
              vendorId: vendor.id,
              type: 'RENEWAL',
              amount: vendor.plan.price,
              currency: 'USD',
              status: 'FAILED',
              failureMessage: error.message,
              nextRetryAt: nextRetry,
            },
          });

          // Send failed email
          await sendAutoRenewalFailed({
            email: vendor.user.email,
            vendorName: vendor.name,
            error: error.message,
            retryDate: nextRetry,
          });
        }
      }
    }

    return { processed: vendors.length };
  } catch (error) {
    console.error('Error in processAutoRenewals:', error);
    throw error;
  }
}

export async function sendSubscriptionWarnings() {
  try {
    // Find vendors whose subscription is expiring in 7 days, with auto-renewal enabled, but no default payment method
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const vendors = await prisma.vendors.findMany({
      where: {
        subscriptionExpiresAt: sevenDaysFromNow,
        autoRenewEnabled: true,
        paymentMethods: {
          none: {
            isDefault: true,
          },
        },
      },
      include: {
        user: true,
        plan: true,
      },
    });

    console.log(`Sending warning emails to ${vendors.length} vendors`);

    for (const vendor of vendors) {
      try {
        await sendSubscriptionWarning({
          email: vendor.user.email,
          vendorName: vendor.name,
          expiryDate: vendor.subscriptionExpiresAt,
        });
      } catch (error) {
        console.error(`Failed to send warning email to vendor ${vendor.id}:`, error);
      }
    }

    return { warned: vendors.length };
  } catch (error) {
    console.error('Error in sendSubscriptionWarnings:', error);
    throw error;
  }
}

export async function retryFailedPayments() {
  try {
    // Find failed payments that should be retried
    const retryablePayments = await prisma.subscriptionPaymentHistory.findMany({
      where: {
        status: 'FAILED',
        type: 'RENEWAL',
        nextRetryAt: {
          lte: new Date(),
        },
      },
      include: {
        vendor: {
          include: {
            user: true,
            plan: true,
            paymentMethods: {
              where: { isDefault: true },
              take: 1,
            },
          },
        },
      },
    });

    console.log(`Retrying ${retryablePayments.length} failed payments`);

    for (const payment of retryablePayments) {
      if (payment.vendor.paymentMethods.length === 0) {
        console.log(`Vendor ${payment.vendor.id} still has no default payment method`);
        continue;
      }

      try {
        const charge = await chargeCustomer(
          payment.vendor.id,
          payment.vendor.plan.price,
          'usd',
          `Retry auto-renewal for plan: ${payment.vendor.plan.name}`
        );

        // Update the original payment record
        await prisma.subscriptionPaymentHistory.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCEEDED',
            stripePaymentIntentId: charge.id,
            chargedAt: new Date(),
          },
        });

        // Calculate new expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + payment.vendor.plan.duration);

        // Update vendor
        await prisma.vendors.update({
          where: { id: payment.vendor.id },
          data: {
            subscriptionExpiresAt: expiryDate,
            lastPaymentAttemptAt: new Date(),
          },
        });

        // Send success email
        await sendAutoRenewalSuccess({
          email: payment.vendor.user.email,
          vendorName: payment.vendor.name,
          planName: payment.vendor.plan.name,
          amount: payment.vendor.plan.price,
          expiryDate,
        });

        console.log(`Successfully retried payment for vendor ${payment.vendor.id}`);
      } catch (error) {
        console.error(`Failed to retry charge for vendor ${payment.vendor.id}:`, error);
      }
    }

    return { retried: retryablePayments.length };
  } catch (error) {
    console.error('Error in retryFailedPayments:', error);
    throw error;
  }
}
