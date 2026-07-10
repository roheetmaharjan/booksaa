import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBusinessSubscription } from "@/lib/subscription-pricing";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Only vendor accounts can access this dashboard." },
        { status: 403 }
      );
    }

    const vendor = await prisma.vendors.findUnique({
      where: {
        userId: session.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        autoRenewEnabled: true,
        lastPaymentAttemptAt: true,
        defaultLocationId: true,
        subscriptionExpiresAt: true,
        status: true,
        trialEndsAt: true,

        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            billing_cycle: true,
            professional: true,
            location: true,
            extraLocationPrice: true,
            extraProfessionalPrice: true,
          },
        },

        // fetch latest subscription with all entitlements
        subscriptions: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            status: true,
            createdAt: true,
            entitlements: {
              select: {
                type: true,
                quantity: true,
                source: true,
              },
            },
          },
        },

        locations: {
          where: {
            isActive: true,
          },
          orderBy: [
            { isDefault: "desc" },
            { createdAt: "asc" },
          ],
          select: {
            id: true,
            name: true,
            address: true,
            isDefault: true,
            isActive: true,
          },
        },

        professionals: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        },

        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Business not found for this account." },
        { status: 404 }
      );
    }

    // Get entitlements from latest subscription
    const entitlements = vendor.subscriptions?.[0]?.entitlements ?? [];

    // Sum ALL entitlements per type (PLAN base + ADDON extras = total selected)
    const professionalLimit =
      entitlements
        .filter((e) => e.type === "PROFESSIONAL")
        .reduce((sum, e) => sum + Number(e.quantity), 0) ||
      Number(vendor.plan.professional || 1);

    const locationLimit =
      entitlements
        .filter((e) => e.type === "LOCATION")
        .reduce((sum, e) => sum + Number(e.quantity), 0) ||
      Number(vendor.plan.location || 1);

    const latestSubscription = vendor.subscriptions?.[0];

    const subscription = calculateBusinessSubscription({
      plan: vendor.plan,
      locations: vendor.locations,
      professionals: vendor.professionals,
      professionalLimit,
      locationLimit,
      subscriptionStatus:    latestSubscription?.status ?? null,
      trialEndsAt:           vendor.trialEndsAt,
      subscriptionExpiresAt: vendor.subscriptionExpiresAt,
      subscriptionCreatedAt: latestSubscription?.createdAt,
    });

    const defaultLocation =
      vendor.locations.find((l) => l.id === vendor.defaultLocationId) ||
      vendor.locations.find((l) => l.isDefault) ||
      vendor.locations[0] ||
      null;

    return NextResponse.json({
      vendorId: vendor.id,

      vendor: {
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        image: vendor.image,

        defaultLocationId: defaultLocation?.id || null,

        locations: vendor.locations,

        owner: vendor.user,

        plan: {
          id: vendor.plan.id,
          name: vendor.plan.name,
          price: vendor.plan.price,
          billing_cycle: vendor.plan.billing_cycle,
          professional: vendor.plan.professional,
          location: vendor.plan.location,
          extraLocationPrice: vendor.plan.extraLocationPrice,
          extraProfessionalPrice: vendor.plan.extraProfessionalPrice,
        },

        subscription,
        subscriptionExpiresAt: vendor.subscriptionExpiresAt,
        trialEndsAt: vendor.trialEndsAt,
        subscriptionStatus: vendor.subscriptions?.[0]?.status ?? null,

        autoRenewEnabled: vendor.autoRenewEnabled,
        lastPaymentAttemptAt: vendor.lastPaymentAttemptAt,
      },
    });
  } catch (error) {
    console.error("Error resolving current business:", error);

    return NextResponse.json(
      {
        error: "Unable to resolve current business.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}