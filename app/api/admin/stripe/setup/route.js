import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { saveStripeAccount, verifyStripeKeys } from '@/lib/stripe-client';

export async function POST(request) {
  try {
    const session = await getCurrentSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { secretKey, publishableKey, live } = await request.json();

    if (!secretKey || !publishableKey) {
      return NextResponse.json(
        { error: 'Missing required fields: secretKey, publishableKey' },
        { status: 400 }
      );
    }

    // Verify keys are valid
    const verification = await verifyStripeKeys(secretKey, publishableKey);
    if (!verification.valid) {
      return NextResponse.json(
        { error: `Invalid Stripe keys: ${verification.error}` },
        { status: 400 }
      );
    }

    // Save to database
    const account = await saveStripeAccount(secretKey, publishableKey, live === true);

    return NextResponse.json({
      message: 'Stripe account configured successfully',
      live: account.live,
      setupComplete: account.setupComplete,
    });
  } catch (error) {
    console.error('Stripe setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup Stripe account' },
      { status: 500 }
    );
  }
}
