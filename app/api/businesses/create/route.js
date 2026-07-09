import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/sendInviteEmail";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createVendorSubscription } from "@/lib/subscriptions";
import { slugifyText } from "@/lib/utils";

export async function POST(req) {
  const body = await req.json();
  const { firstname, lastname, email, categoryId, planId, name, userId } = body;
  const normalizedEmail = email?.trim().toLowerCase();
  const slug = slugifyText(name);

  if (!firstname || !lastname || !normalizedEmail || !categoryId || !planId || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let user = await prisma.users.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });

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
      email: normalizedEmail,
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

  const vendor = await prisma.$transaction(async (tx) => {
    const created = await tx.vendors.create({
      data: {
        name,
        slug,
        categoryId,
        planId,
        trialEndsAt,
        joinedAt: now,
        userId: user.id,
        status: "INACTIVE",
      },
    });

    await createVendorSubscription(tx, {
      vendorId: created.id,
      plan,
      status: "ACTIVE",
    });

    return created;
  });

  const token = crypto.randomUUID();

  await prisma.invitation.create({
    data: {
      email: normalizedEmail,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    },
  });

  await sendInviteEmail(normalizedEmail, token);

  return NextResponse.json({ success: true });
}
