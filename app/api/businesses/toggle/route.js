import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function PUT(request) {
  try {
    const session = await getCurrentSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
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

    // Update auto-renewal setting
    const updated = await prisma.vendors.update({
      where: { id: vendor.id },
      data: { autoRenewEnabled: enabled },
    });

    return NextResponse.json({
      success: true,
      message: `Auto-renewal ${enabled ? 'enabled' : 'disabled'} successfully`,
      autoRenewEnabled: updated.autoRenewEnabled,
    });
  } catch (error) {
    console.error('Auto-renewal toggle error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle auto-renewal' },
      { status: 500 }
    );
  }
}
