import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { deletePaymentMethod, setDefaultPaymentMethod } from '@/lib/stripe-client';

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { methodId } = params;

    if (!methodId) {
      return NextResponse.json(
        { error: 'methodId is required' },
        { status: 400 }
      );
    }

    // Get vendor
    const vendor = await prisma.vendors.findFirst({
      where: { userId: session.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Get the payment method to be deleted
    const paymentMethod = await prisma.vendorPaymentMethod.findUnique({
      where: { id: methodId },
    });

    if (!paymentMethod || paymentMethod.vendorId !== vendor.id) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // Delete from Stripe
    try {
      await deletePaymentMethod(paymentMethod.stripePaymentMethodId);
    } catch (error) {
      console.error('Error deleting from Stripe:', error);
      // Continue anyway, delete from our database
    }

    // Delete from database
    await prisma.vendorPaymentMethod.delete({
      where: { id: methodId },
    });

    // If this was the default, set another as default
    if (paymentMethod.isDefault) {
      const nextMethod = await prisma.vendorPaymentMethod.findFirst({
        where: { vendorId: vendor.id },
      });

      if (nextMethod) {
        await prisma.vendorPaymentMethod.update({
          where: { id: nextMethod.id },
          data: { isDefault: true },
        });

        try {
          await setDefaultPaymentMethod(nextMethod.stripePaymentMethodId, vendor.id);
        } catch (error) {
          console.error('Error setting default payment method:', error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
