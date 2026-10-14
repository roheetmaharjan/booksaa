import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionState } from "@/lib/subscription-state";

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
        status: true,
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

      const accountStatus = getSubscriptionState({
        subscriptionStatus: vendor.status,
        trialEndsAt: vendor.trialEndsAt,
      }).accountStatus;

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