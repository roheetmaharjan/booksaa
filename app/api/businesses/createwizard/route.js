import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/sendInviteEmail";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  console.log("Body Item", body);
  const {
    vendorId,
    firstname,
    lastname,
    email,
    categoryId,
    planId,
    name,
    userId,
    address,
    locationName,
    locationPhone,
    city,
    postal_code,
    state,
    latitude,
    longitude,
    offerAtBusiness,
    offerAtClient,
    travelFee,
    maxTravelDistance,
    isActive,
  } = body;
  const normalizedEmail = email?.trim().toLowerCase();
  if (
    (
      !firstname ||
      !lastname ||
      !normalizedEmail ||
      !categoryId ||
      !planId ||
      !name ||
      !address ||
      !city ||  
      !postal_code ||
      !state ||
      !latitude ||
      !longitude ||
      !offerAtBusiness ||
      !offerAtClient ||
      !travelFee ||
      !maxTravelDistance)
  ) {
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

  const location = await prisma.location.create({
    data: {
      name: locationName || "Main Location",
      phone: locationPhone || null,
      vendorId: vendor.id,
      address,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      offerAtClient: !!offerAtClient,
      offerAtBusiness: !!offerAtBusiness,
      travelFee: travelFee ? Number(travelFee) : 0.0,
      maxTravelDistance: maxTravelDistance ? Number(maxTravelDistance) : 5.0,
      isActive: isActive !== undefined ? !!isActive : true,
      isDefault: true,
    },
  });

  await prisma.vendors.update({
    where: { id: vendor.id },
    data: { defaultLocationId: location.id },
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
