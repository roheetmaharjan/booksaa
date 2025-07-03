import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const products = await prisma.product.findMany();
    return Response.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}