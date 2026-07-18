import { prisma } from "@/lib/prisma";

export const ENTITLEMENT_TYPE = {
  LOCATION: "LOCATION",
  PROFESSIONAL: "PROFESSIONAL",
};

const ACTIVE_SUBSCRIPTION_STATUSES = ["ACTIVE", "TRIAL_ACTIVE", "TRIAL_EXPIRING"];

function positiveInt(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function buildSubscriptionEntitlements({ plan, locationCount, professionalCount }) {
  const includedLocations = positiveInt(plan?.location, 1);
  const includedProfessionals = positiveInt(plan?.professional, 1);
  const totalLocations = Math.max(positiveInt(locationCount, 1), includedLocations);
  const totalProfessionals = Math.max(positiveInt(professionalCount, 1), includedProfessionals);
  const extraLocations = Math.max(totalLocations - includedLocations, 0);
  const extraProfessionals = Math.max(totalProfessionals - includedProfessionals, 0);

  const rows = [
    {
      type: ENTITLEMENT_TYPE.LOCATION,
      quantity: includedLocations,
      source: "PLAN",
      price: null,
    },
    {
      type: ENTITLEMENT_TYPE.PROFESSIONAL,
      quantity: includedProfessionals,
      source: "PLAN",
      price: null,
    },
  ];

  if (extraLocations > 0) {
    rows.push({
      type: ENTITLEMENT_TYPE.LOCATION,
      quantity: extraLocations,
      source: "ADDON",
      price: plan?.extraLocationPrice ?? 0,
    });
  }

  if (extraProfessionals > 0) {
    rows.push({
      type: ENTITLEMENT_TYPE.PROFESSIONAL,
      quantity: extraProfessionals,
      source: "ADDON",
      price: plan?.extraProfessionalPrice ?? 0,
    });
  }

  return rows;
}

export async function createVendorSubscription(tx, {
  vendorId,
  plan,
  planId = plan?.id,
  status = "ACTIVE",
  locationCount = plan?.location || 1,
  professionalCount = plan?.professional || 1,
  expiryDate,
}) {
  const subscription = await tx.vendorSubscription.create({
    data: {
      vendorId,
      planId,
      status,
      expiryDate,
      entitlements: {
        create: buildSubscriptionEntitlements({
          plan,
          locationCount,
          professionalCount,
        }),
      },
    },
    include: { entitlements: true },
  });

  return subscription;
}

export async function getActiveVendorSubscription(vendorId, client = prisma) {
  return client.vendorSubscription.findFirst({
    where: {
      vendorId,
      status: { in: ACTIVE_SUBSCRIPTION_STATUSES },
    },
    orderBy: { createdAt: "desc" },
    include: { entitlements: true },
  });
}

export function getSubscriptionLimits(subscription, plan) {
  const entitlements = subscription?.entitlements || [];

  if (!entitlements.length) {
    return {
      locationLimit: positiveInt(plan?.location, 1),
      professionalLimit: positiveInt(plan?.professional, 1),
    };
  }

  const limits = {
    locationLimit: 0,
    professionalLimit: 0,
  };

  for (const entitlement of entitlements) {
    const quantity = positiveInt(entitlement.quantity, 0);
    if (entitlement.type === ENTITLEMENT_TYPE.LOCATION) {
      limits.locationLimit += quantity;
    }
    if (entitlement.type === ENTITLEMENT_TYPE.PROFESSIONAL) {
      limits.professionalLimit += quantity;
    }
  }

  return limits;
}

export async function ensureEntitlementLimit(tx, {
  subscriptionId,
  type,
  currentLimit,
  nextLimit,
  price,
}) {
  const quantity = positiveInt(nextLimit, 1) - positiveInt(currentLimit, 1);
  if (quantity <= 0) return null;

  return tx.subscriptionEntitlement.create({
    data: {
      subscriptionId,
      type,
      quantity,
      source: "ADDON",
      price: price ?? 0,
    },
  });
}
