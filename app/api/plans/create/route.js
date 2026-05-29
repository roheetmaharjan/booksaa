// app/api/categories/create/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

export async function POST(req) {
  try {
    const {
      name,
      price,
      trial_period,
      billing_cycle,
      duration,
      professional,
      location,
      extraProfessionalPrice,
      extraLocationPrice,
    } =
      await req.json();

    if (
      isBlank(name) ||
      isBlank(price) ||
      isBlank(trial_period) ||
      isBlank(billing_cycle) ||
      isBlank(duration) ||
      isBlank(professional) ||
      isBlank(location)
    ) {
      return NextResponse.json(
        {
          error:
            "Name, price, trial period, billing cycle, included professionals, included locations, and duration are required",
        },
        { status: 400 }
      );
    }

    const planName = String(name).trim();
    const exists = await prisma.plans.findUnique({
      where: { name: planName },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Plan already exists" },
        { status: 409 }
      );
    }

    const [plan] = await prisma.$queryRaw`
      INSERT INTO "Plans" (
        "id",
        "name",
        "price",
        "trial_period",
        "billing_cycle",
        "duration",
        "professional",
        "location",
        "extraProfessionalPrice",
        "extraLocationPrice"
      )
      VALUES (
        ${randomUUID()},
        ${planName},
        ${Number(price)},
        ${Number(trial_period)},
        ${String(billing_cycle)},
        ${Number(duration)},
        ${Number(professional)},
        ${Number(location)},
        ${isBlank(extraProfessionalPrice) ? 0 : Number(extraProfessionalPrice)},
        ${isBlank(extraLocationPrice) ? 0 : Number(extraLocationPrice)}
      )
      RETURNING *
    `;

    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    console.error("Plan create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
