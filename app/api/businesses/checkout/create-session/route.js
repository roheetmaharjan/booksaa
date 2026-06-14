import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { createPaymentIntent, getStripeAccount } from '@/lib/stripe-client';
import { calculateBusinessSubscription } from '@/lib/subscription-pricing';

export async function POST(request) {
  try {
    const session = await getCurrentSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    // Get vendor with everything needed for pricing
    const vendor = await prisma.vendors.findFirst({
      where: { userId: session.id },
      include: {
        user: true,
        locations: {
          where: { isActive: true },
          select: { id: true, isActive: true },
        },
        professionals: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            entitlements: {
              select: { type: true, quantity: true, source: true },
            },
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Verify new plan exists with all pricing fields
    const newPlan = await prisma.plans.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        price: true,
        billing_cycle: true,
        professional: true,
        location: true,
        extraLocationPrice: true,
        extraProfessionalPrice: true,
      },
    });

    if (!newPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Resolve limits from entitlements (same logic as /api/businesses/current)
    const latestSubscription = vendor.subscriptions?.[0];
    const entitlements = latestSubscription?.entitlements ?? [];

    const professionalLimit =
      entitlements
        .filter((e) => e.type === 'PROFESSIONAL')
        .reduce((sum, e) => sum + Number(e.quantity), 0) ||
      Number(newPlan.professional || 1);

    const locationLimit =
      entitlements
        .filter((e) => e.type === 'LOCATION')
        .reduce((sum, e) => sum + Number(e.quantity), 0) ||
      Number(newPlan.location || 1);

    // Calculate total price for the new plan with existing usage
    const pricing = calculateBusinessSubscription({
      plan: newPlan,
      locations: vendor.locations,
      professionals: vendor.professionals,
      professionalLimit,
      locationLimit,
    });

    // Get Stripe publishable key
    const stripeAccount = await getStripeAccount();
    if (!stripeAccount) {
      return NextResponse.json(
        { error: 'Stripe account not configured' },
        { status: 500 }
      );
    }

    // Create payment intent
    const intent = await createPaymentIntent(
      vendor.id,
      pricing.totalPrice,
      'usd',
      {
        planId,
        planName: newPlan.name,
        vendorName: vendor.name,
      }
    );

    return NextResponse.json({
      clientSecret: intent.client_secret,
      publishableKey: stripeAccount.stripePublishableKey,
      amount: Math.round(pricing.totalPrice * 100),
      currency: 'usd',
      planName: newPlan.name,
      vendorEmail: vendor.user.email,
      // Send breakdown so frontend can display it
      pricing: {
        basePrice: pricing.basePrice,
        extraLocations: pricing.extraLocations,
        extraProfessionals: pricing.extraProfessionals,
        extraLocationTotal: pricing.extraLocationTotal,
        extraProfessionalTotal: pricing.extraProfessionalTotal,
        totalPrice: pricing.totalPrice,
        billingCycle: pricing.billingCycle,
      },
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}