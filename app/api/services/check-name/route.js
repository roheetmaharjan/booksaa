import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ exists: false });
  }

  const exists = await prisma.service.findFirst({
    where: { name },
  });

  return NextResponse.json({ exists: !!exists });
}
