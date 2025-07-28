import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const vendor = await prisma.vendors.findUnique({
      where: { id },
      include: {
        category: true,
        user: true,
      },
    });

    if (!vendor) {
      return new Response(JSON.stringify({ error: 'Vendor not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(vendor), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching vendor' }), { status: 500 });
  }
}
