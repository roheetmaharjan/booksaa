import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const vendor = await prisma.vendors.findUnique({
      where: { id },
      include: {
        plan:true,
        category: true,
        user: true,
      },
    });

    if (!vendor) {
      return new Response(JSON.stringify({ error: 'Vendor not found' }), { status: 404 });
    }

    const joinedAtDateOnly = vendor.joinedAt.toISOString().slice(0,10);
    const trialEndsAtDateOnly = vendor.trialEndsAt.toISOString().slice(0,10)

    const result = {
      ...vendor,
      joinedAt : joinedAtDateOnly,
      trialEndsAt : trialEndsAtDateOnly,
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching vendor' }), { status: 500 });
  }
}
