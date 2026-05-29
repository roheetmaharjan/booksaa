import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/sendWelcomeEmail";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth";

function isPresent(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function missingFields(payload) {
  const required = [
    "firstname",
    "lastname",
    "email",
    "password",
    "name",
    "categoryId",
    "planId",
    "address",
    "city",
    "postal_code",
    "country",
    "state",
  ];

  return required.filter((field) => !isPresent(payload[field]));
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (email) {
      const user = await prisma.users.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true },
      });

      return NextResponse.json({ exists: !!user });
    }

    const [categories, plans, professionalRoles] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.$queryRaw`
        SELECT
          "id",
          "name",
          "price",
          "duration",
          "trial_period",
          "billing_cycle",
          "professional",
          "location",
          "extraProfessionalPrice",
          "extraLocationPrice"
        FROM "Plans"
        ORDER BY "price" ASC
      `,
      prisma.professionalRole.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    return NextResponse.json({ categories, plans, professionalRoles });
  } catch (error) {
    console.error("Business signup options failed:", error);
    return NextResponse.json(
      { error: "Unable to load signup options." },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const missing = missingFields(body);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", fields: missing },
        { status: 400 },
      );
    }

    if (String(body.password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (!body.offerAtBusiness && !body.offerAtClient) {
      return NextResponse.json(
        { error: "Select at least one service location option." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        email: {
          equals: String(body.email).trim().toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 400 },
      );
    }

    const plan = await prisma.plans.findUnique({
      where: { id: body.planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 400 },
      );
    }

    const role = await prisma.role.findUnique({
      where: { name: "VENDOR" },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Vendor role is not configured." },
        { status: 500 },
      );
    }

    const now = new Date();
    const hasTrial = Number(plan.trial_period) > 0;
    const trialEndsAt = hasTrial
      ? new Date(now.getTime() + Number(plan.trial_period) * 24 * 60 * 60 * 1000)
      : null;
    const password = await bcrypt.hash(body.password, 10);
    const setup = body.setup || {};
    const services = Array.isArray(setup.services) ? setup.services : [];
    const professionals = Array.isArray(setup.professionals)
      ? setup.professionals
      : [];
    const businessHours = Array.isArray(setup.businessHours)
      ? setup.businessHours
      : [];
    const subscriptionProfessionalCount = Math.max(
      Number(body.subscriptionProfessionalCount || 1),
      1,
    );
    const subscriptionLocationCount = Math.max(
      Number(body.subscriptionLocationCount || 1),
      1,
    );

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          firstname: body.firstname,
          lastname: body.lastname,
          email: String(body.email).toLowerCase(),
          phone: body.phone || null,
          password,
          roleId: role.id,
          status: "ACTIVE",
        },
        include: { role: true },
      });

      const vendor = await tx.vendors.create({
        data: {
          name: body.name,
          categoryId: body.categoryId,
          planId: body.planId,
          joinedAt: now,
          trialEndsAt,
          userId: user.id,
          status: hasTrial ? "TRIAL_ACTIVE" : "ACTIVE",
        },
      });

      await tx.$executeRaw`
        UPDATE "Vendors"
        SET
          "subscriptionProfessionalCount" = ${subscriptionProfessionalCount},
          "subscriptionLocationCount" = ${subscriptionLocationCount}
        WHERE "id" = ${vendor.id}
      `;

      const location = await tx.location.create({
        data: {
          name: body.locationName || "Main Location",
          vendorId: vendor.id,
          address: body.address,
          phone: body.locationPhone || body.phone || null,
          latitude: isPresent(body.latitude) ? Number(body.latitude) : null,
          longitude: isPresent(body.longitude) ? Number(body.longitude) : null,
          offerAtBusiness: !!body.offerAtBusiness,
          offerAtClient: !!body.offerAtClient,
          travelFee: isPresent(body.travelFee) ? Number(body.travelFee) : 0,
          maxTravelDistance: isPresent(body.maxTravelDistance)
            ? Number(body.maxTravelDistance)
            : 5,
          isActive: true,
          isDefault: true,
        },
      });

      await tx.vendors.update({
        where: { id: vendor.id },
        data: { defaultLocationId: location.id },
      });

      const serviceCreates = services
        .filter(
          (service) =>
            isPresent(service.name) &&
            isPresent(service.price) &&
            isPresent(service.duration),
        )
        .map((service) =>
          tx.service.create({
            data: {
              name: String(service.name).trim(),
              description: isPresent(service.description)
                ? String(service.description).trim()
                : null,
              price: Number(service.price),
              duration: Number(service.duration),
              vendorId: vendor.id,
              locationId: location.id,
            },
          }),
        );

      const professionalCreates = professionals
        .filter(
          (professional) =>
            isPresent(professional.name) &&
            isPresent(professional.email) &&
            isPresent(professional.phone) &&
            isPresent(professional.roleId),
        )
        .map((professional) =>
          tx.professional.create({
            data: {
              name: String(professional.name).trim(),
              email: String(professional.email).trim().toLowerCase(),
              phone: String(professional.phone).trim(),
              roleId: professional.roleId,
              status: professional.status || "ACTIVE",
              vendorId: vendor.id,
              locationId: location.id,
            },
          }),
        );

      const hourCreates = businessHours
        .filter((hour) => isPresent(hour.day))
        .map((hour) =>
          tx.$executeRaw`
            INSERT INTO "BusinessHour" ("id", "vendorId", "locationId", "day", "isOpen", "openTime", "closeTime", "createdAt", "updatedAt")
            VALUES (
              ${randomUUID()},
              ${vendor.id},
              ${location.id},
              ${String(hour.day)},
              ${!!hour.isOpen},
              ${hour.isOpen && isPresent(hour.openTime) ? String(hour.openTime) : null},
              ${hour.isOpen && isPresent(hour.closeTime) ? String(hour.closeTime) : null},
              NOW(),
              NOW()
            )
          `,
        );

      await Promise.all([
        ...serviceCreates,
        ...professionalCreates,
        ...hourCreates,
      ]);

      return { user, vendor, location };
    });

    try {
      await sendWelcomeEmail(
        result.user.email,
        `${result.user.firstname} ${result.user.lastname}`.trim(),
      );
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    const sessionUser = {
      id: result.user.id,
      name: result.user.firstname,
      email: result.user.email,
      role: result.user.role.name,
    };
    const token = await createSessionToken(sessionUser);
    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      vendor: {
        id: result.vendor.id,
        name: result.vendor.name,
        status: result.vendor.status,
        trialEndsAt: result.vendor.trialEndsAt,
        subscriptionProfessionalCount,
        subscriptionLocationCount,
      },
      trial: {
        active: hasTrial,
        days: Number(plan.trial_period) || 0,
        endsAt: trialEndsAt,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Business signup failed:", error);
    return NextResponse.json(
      { error: "Unable to create business account." },
      { status: 500 },
    );
  }
}
