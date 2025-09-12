import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendInviteEmail } from "@/lib/sendInviteEmail";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { firstname, lastname, email, categoryId, planId, name, userId } = body;

  if (!firstname || !lastname || !email || !categoryId || !planId || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let user = await prisma.users.findUnique({ where: { email } });

  if (user) {
    return NextResponse.json(
      { error: "Email Already Exists" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash("INVITED", 10);

  user = await prisma.users.create({
    data: {
      firstname,
      lastname,
      email,
      password: hashed,
      role: {
        connect: {
          name: "VENDOR",
        },
      },
      status: "INACTIVE",
    },
  });

  const plan = await prisma.plans.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return new Response(JSON.stringify({ error: "Plan not found" }), {
      status: 400,
    });
  }

  const now = new Date();
  let trialEndsAt = null;
  if (plan.trial_period && plan.trial_period > 0) {
    trialEndsAt = new Date(
      now.getTime() + plan.trial_period * 24 * 60 * 60 * 1000
    );
  }

  const vendor = await prisma.vendors.create({
    data: {
      name,
      categoryId,
      planId,
      trialEndsAt,
      joinedAt: now,
      userId: user.id,
      status: "INACTIVE",
    },
  });

  const token = uuidv4();

  await prisma.invitation.create({
    data: {
      email,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    },
  });

  await sendInviteEmail(email, token);

  return NextResponse.json({ success: true });
}
