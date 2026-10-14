import { redirect } from "next/navigation";

import { VendorLayoutShell } from "@/components/components_vendor/VendorLayoutShell";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionState } from "@/lib/subscription-state";

export default async function VendorLayout({ children }) {
  const session = await getCurrentSession();

  if (session?.role === "VENDOR") {
    const vendor = await prisma.vendors.findUnique({
      where: { userId: session.id },
      select: {
        slug: true,
        status: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
        plan: {
          select: {
            billing_cycle: true,
          },
        },
        subscriptions: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            status: true,
            expiryDate: true,
            createdAt: true,
          },
        },
      },
    });

    const latestSubscription = vendor?.subscriptions?.[0];
    const subscriptionState = getSubscriptionState({
      subscriptionStatus: latestSubscription?.status ?? vendor?.status,
      trialEndsAt: vendor?.trialEndsAt,
      subscriptionExpiresAt: latestSubscription?.expiryDate ?? vendor?.subscriptionExpiresAt,
      subscriptionCreatedAt: latestSubscription?.createdAt,
      billingCycle: vendor?.plan?.billing_cycle,
    });

    if (vendor?.slug && subscriptionState.isExpired) {
      redirect(`/subscription-expired?businessSlug=${encodeURIComponent(vendor.slug)}`);
    }
  }

  return <VendorLayoutShell>{children}</VendorLayoutShell>;
}
