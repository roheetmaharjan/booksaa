import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const [plan] = await prisma.$queryRaw`
      UPDATE "Plans"
      SET
        "price" = ${Number(body.price || 0)},
        "professional" = ${Number(body.professional || 1)},
        "location" = ${Number(body.location || 1)},
        "extraProfessionalPrice" = ${Number(body.extraProfessionalPrice || 0)},
        "extraLocationPrice" = ${Number(body.extraLocationPrice || 0)}
      WHERE "id" = ${id}
      RETURNING *
    `;

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan, { status: 200 });
  } catch (error) {
    console.error("Plan update error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
