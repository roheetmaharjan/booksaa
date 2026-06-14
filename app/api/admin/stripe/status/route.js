import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { getStripeAccount } from '@/lib/stripe-client';

export async function GET(request) {
  try {
    const session = await getCurrentSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await getStripeAccount();

    if (!account) {
      return NextResponse.json({
        configured: false,
        live: false,
        setupComplete: false,
      });
    }

    return NextResponse.json({
      configured: true,
      live: account.live,
      setupComplete: account.setupComplete,
      publishableKey: account.stripePublishableKey,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
  } catch (error) {
    console.error('Stripe status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get Stripe status' },
      { status: 500 }
    );
  }
}
