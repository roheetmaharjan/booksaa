import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { listPaymentMethods } from '@/lib/stripe-client';

export async function GET(request) {
  try {
    const session = await getCurrentSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get vendor
    const vendor = await prisma.vendors.findFirst({
      where: { userId: session.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Get payment methods from database (cached version)
    const paymentMethods = await prisma.vendorPaymentMethod.findMany({
      where: { vendorId: vendor.id },
      select: {
        id: true,
        stripePaymentMethodId: true,
        isDefault: true,
        last4Digits: true,
        brand: true,
        expiryMonth: true,
        expiryYear: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      paymentMethods,
      hasDefaultMethod: paymentMethods.some(m => m.isDefault),
    });
  } catch (error) {
    console.error('List payment methods error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list payment methods' },
      { status: 500 }
    );
  }
}
