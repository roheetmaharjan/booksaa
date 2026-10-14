"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/api";

export default function SubscriptionExpiredPage({ businessSlug }) {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSubscription() {
      if (!businessSlug) {
        setError("Business information is missing. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        const result = await api.get("/api/businesses/current");
        if (cancelled) return;
        if (result.vendor?.slug !== businessSlug) {
          setError("You do not have access to this business subscription.");
          return;
        }
        setVendor(result.vendor);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || "Unable to load subscription details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSubscription();
    return () => {
      cancelled = true;
    };
  }, [businessSlug]);

  const handleUpgrade = () => {
    const query = new URLSearchParams({
      businessSlug,
      returnTo: `/${businessSlug}`,
    });
    router.push(`/upgrade?${query.toString()}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-8">
      <Card className="w-full max-w-xl border-slate-200 shadow-sm">
        <CardHeader className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Subscription expired</p>
          <CardTitle className="text-2xl text-slate-900">Your business subscription has expired</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Upgrade your plan to continue using the subscription features for your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <p className="text-sm text-slate-500">Loading subscription details...</p>
          ) : error ? (
            <p role="alert" className="text-sm text-red-600">{error}</p>
          ) : (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p><span className="text-slate-500">Business:</span> <strong>{vendor?.name}</strong></p>
              {vendor?.plan?.name && <p className="mt-1"><span className="text-slate-500">Current plan:</span> <strong>{vendor.plan.name}</strong></p>}
              {vendor?.subscription?.expiryDate && (
                <p className="mt-1">
                  <span className="text-slate-500">Expired on:</span>{" "}
                  <strong>{new Date(vendor.subscription.expiryDate).toLocaleDateString()}</strong>
                </p>
              )}
            </div>
          )}
          <Button className="w-full sm:w-auto" disabled={loading || !businessSlug} onClick={handleUpgrade}>
            Upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
