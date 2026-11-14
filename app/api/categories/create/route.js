// app/api/categories/create/route.js
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create categories' }, { status: 403 });
    }

    const { name, image } = await req.json();
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (!normalizedName || typeof image !== 'string' || !image.startsWith('categories/')) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 });
    }

    const exists = await prisma.category.findUnique({
      where: { name: normalizedName },
    });

    if (exists) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name: normalizedName, image },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error('Category create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
