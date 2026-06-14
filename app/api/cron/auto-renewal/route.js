import { NextResponse } from 'next/server';
import {
  processAutoRenewals,
  sendSubscriptionWarnings,
  retryFailedPayments,
} from '@/lib/auto-renewal';

export async function GET(request) {
  try {
    // Verify the request is from Vercel Cron or authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting auto-renewal cron job');

    // Process main auto-renewals
    const renewalResult = await processAutoRenewals();

    // Send warning emails for subscriptions expiring in 7 days
    const warningResult = await sendSubscriptionWarnings();

    // Retry failed payments
    const retryResult = await retryFailedPayments();

    const result = {
      status: 'success',
      timestamp: new Date().toISOString(),
      processAutoRenewals: renewalResult,
      sendSubscriptionWarnings: warningResult,
      retryFailedPayments: retryResult,
    };

    console.log('Auto-renewal cron job completed', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Auto-renewal cron job failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
