// app/api/categories/create/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { name, image } = await req.json();

    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 });
    }

    const exists = await prisma.category.findUnique({
      where: { name },
    });

    if (exists) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name, image },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error('Category create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
