// app/api/categories/create/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, description, price, duration } = await req.json();

    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: "Name, price, duration is required" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: { name, description, price, duration },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error("Service create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
