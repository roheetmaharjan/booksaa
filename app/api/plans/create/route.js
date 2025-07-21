// app/api/categories/create/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, price, trial_period, billing_cycle, duration } =
      await req.json();

    if (!name || !price || !trial_period || !billing_cycle || !duration) {
      return NextResponse.json(
        {
          error:
            "Name, price, trial period, billing cycle and duration are required",
        },
        { status: 400 }
      );
    }

    const exists = await prisma.plans.findUnique({
      where: { name },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Plan already exists" },
        { status: 409 }
      );
    }

    const plan = await prisma.plans.create({
      data: {
        name,
        price: parseFloat(price),
        trial_period: parseInt(trial_period),
        billing_cycle,
        duration: parseInt(duration),
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    console.error("Plan create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
