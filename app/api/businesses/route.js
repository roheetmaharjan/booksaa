import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AccountStatus } from "@/constants/enums";

export async function GET(req) {
  try {
    const vendors = await prisma.vendors.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        isComplete : true,
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
        joinedAt: true,
        trialEndsAt: true,
      },
    });

    // if (!vendors || vendors.length === 0) {
    //   return new Response(JSON.stringify({ error: "Vendor not found" }), {
    //     status: 404,
    //   });
    // }

    // Process each vendor
    const processedVendors = vendors.map((vendor) => {
      let joinedAtDateOnly = vendor.joinedAt
        ? vendor.joinedAt.toISOString().slice(0, 10)
        : null;
      let trialEndsAtDateOnly = vendor.trialEndsAt
        ? vendor.trialEndsAt.toISOString().slice(0, 10)
        : null;

      let accountStatus = vendor.status;
      if (vendor.trialEndsAt) {
        const now = new Date();
        const trialEnd = new Date(vendor.trialEndsAt);
        if (now > trialEnd) {
          accountStatus = AccountStatus.TRIAL_EXPIRED;
        } else {
          const diffMs = trialEnd - now;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          accountStatus =
            diffDays <= 3
              ? AccountStatus.TRIAL_EXPIRING
              : AccountStatus.TRIAL_ACTIVE;
        }
      }

      return {
        ...vendor,
        joinedAtDateOnly,
        trialEndsAtDateOnly,
        accountStatus,
      };
    });

    return new Response(JSON.stringify(processedVendors), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching data", error);
    return new Response(
      JSON.stringify({ error: "Error fetching data" }),
      { status: 500 }
    );
  }
}