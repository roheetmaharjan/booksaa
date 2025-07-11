// app/api/upload/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { nanoid } from 'nanoid';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file received' }, { status: 400 });
    }

    // Validating type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Image too large' }, { status: 400 });
    }

    // Prepare to save the file
    const ext = file.name.split('.').pop();
    const filename = `${nanoid()}.${ext}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `${filename}` }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
