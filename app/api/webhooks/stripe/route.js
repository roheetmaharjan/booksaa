import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getStripeAccount } from '@/lib/stripe-client';

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    const stripeAccount = await getStripeAccount();
    if (!stripeAccount) {
      console.error('Stripe account not configured');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeAccount.stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object);
        break;

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const vendorId = paymentIntent.metadata?.vendorId;
    if (!vendorId) return;

    console.log(`Payment succeeded for vendor ${vendorId}`);

    // Update payment history if not already updated
    const existing = await prisma.subscriptionPaymentHistory.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!existing) {
      await prisma.subscriptionPaymentHistory.create({
        data: {
          vendorId,
          type: 'INITIAL',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          stripePaymentIntentId: paymentIntent.id,
          status: 'SUCCEEDED',
          chargedAt: new Date(paymentIntent.created * 1000),
        },
      });
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const vendorId = paymentIntent.metadata?.vendorId;
    if (!vendorId) return;

    console.log(`Payment failed for vendor ${vendorId}`);

    // Create payment history record
    await prisma.subscriptionPaymentHistory.create({
      data: {
        vendorId,
        type: 'RENEWAL',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        stripePaymentIntentId: paymentIntent.id,
        status: 'FAILED',
        failureMessage: paymentIntent.last_payment_error?.message || 'Payment declined',
      },
    });
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleChargeDispute(dispute) {
  try {
    console.log(`Charge dispute created: ${dispute.id}`);

    // Log for manual review by admin
    // In production, you might send an email to admin
    await prisma.subscriptionPaymentHistory.create({
      data: {
        vendorId: dispute.metadata?.vendorId || 'unknown',
        type: 'RENEWAL',
        status: 'FAILED',
        failureMessage: `Dispute: ${dispute.reason}`,
      },
    });
  } catch (error) {
    console.error('Error handling dispute:', error);
  }
}

async function handlePaymentMethodDetached(paymentMethod) {
  try {
    console.log(`Payment method detached: ${paymentMethod.id}`);

    // This is handled in the app, just log for audit trail
  } catch (error) {
    console.error('Error handling payment method detached:', error);
  }
}
