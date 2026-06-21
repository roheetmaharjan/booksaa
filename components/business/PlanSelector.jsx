"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";

export default function PlanSelector({ currentPlanId, onSelectPlan }) {
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionCounts, setSubscriptionCounts] = useState({
    professionals: 1,
    locations: 1,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  useEffect(() => {
    if (business?.vendor) {
      const { plan, subscription } = business.vendor;
      setSubscriptionCounts({
        professionals: Number(subscription?.professionalCount ?? plan?.professional ?? 1),
        locations: Number(subscription?.activeLocationCount ?? plan?.location ?? 1),
      });
    }
  }, [business]);

  const fetchBusiness = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/businesses/current");
      setBusiness(response);
    } catch (err) {
      setError(err.message || "Failed to load business information");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading current plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p>{error}</p>
        <Button variant="outline" className="mt-3" onClick={fetchBusiness}>
          Retry
        </Button>
      </div>
    );
  }

  const vendor = business?.vendor;
  const plan = vendor?.plan;
  const subscription = vendor?.subscription;

  if (!plan) {
    return <div className="rounded-lg border p-6 text-center text-gray-500">No active plan found.</div>;
  }

  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;

  const includedLocations = Number(subscription?.includedLocations ?? plan.location ?? 1);
  const includedProfessionals = Number(subscription?.includedProfessionals ?? plan.professional ?? 1);

  // Current entitlement totals — the minimums the user cannot go below
  const professionalLimit = Number(subscription?.professionalCount ?? plan.professional ?? 1);
  const locationLimit = Number(subscription?.activeLocationCount ?? plan.location ?? 1);

  const basePrice = Number(subscription?.basePrice ?? plan.price ?? 0);
  const billingCycle = subscription?.billingCycle ?? plan.billing_cycle ?? "monthly";
  const cycleLabel = billingCycle === "monthly" ? "month" : "year";

  const extraLocationPrice = Number(plan.extraLocationPrice ?? 0);
  const extraProfessionalPrice = Number(plan.extraProfessionalPrice ?? 0);

  const extraLocations = Math.max(subscriptionCounts.locations - includedLocations, 0);
  const extraProfessionals = Math.max(subscriptionCounts.professionals - includedProfessionals, 0);

  const extraLocationTotal = extraLocations * extraLocationPrice;
  const extraProfessionalTotal = extraProfessionals * extraProfessionalPrice;

  const totalPrice = basePrice + extraLocationTotal + extraProfessionalTotal;

  const handleContinue = () => {
    onSelectPlan?.(plan.id, {
      locationCount: subscriptionCounts.locations,
      professionalCount: subscriptionCounts.professionals,
      basePrice,
      includedLocations,
      includedProfessionals,
      extraLocations,
      extraProfessionals,
      extraLocationPrice,
      extraProfessionalPrice,
      extraLocationTotal,
      extraProfessionalTotal,
      totalPrice,
      billingCycle,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Current Subscription</h2>
        <p className="text-gray-500">Review your current subscription details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{plan.name} Plan</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Business */}
            <div className="flex justify-between">
              <span className="text-gray-600">Business Name</span>
              <span className="font-medium">{vendor?.name ?? "—"}</span>
            </div>

            {/* Billing cycle */}
            <div className="flex justify-between">
              <span className="text-gray-600">Billing Cycle</span>
              <span className="capitalize">{billingCycle}</span>
            </div>

            {/* Next Expiry Date */}
            <div className="flex justify-between">
              <span className="text-gray-600">Next Expiry Date</span>
              <span>{expiryDate ? expiryDate.toLocaleDateString() : "Not set"}</span>
            </div>

            <hr />

            {/* Usage */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">Includes</p>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Change
                </Button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <p className="text-gray-600 flex">Professionals</p>
                    <small className="text-gray-600">${extraLocationPrice.toFixed(2)} for additional Location</small>
                  </div>
                  <span className="font-medium">{subscriptionCounts.professionals} </span>
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <p className="text-gray-600 flex">Locations</p>
                    <small className="text-gray-600">${extraProfessionalPrice.toFixed(2)} for additional Professional</small>
                  </div>
                  <span className="font-medium">{subscriptionCounts.locations} </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <NumberPicker label="Professionals" value={subscriptionCounts.professionals} minValue={professionalLimit} onChange={(value) => setSubscriptionCounts((prev) => ({ ...prev, professionals: value }))} />

                <NumberPicker label="Locations" value={subscriptionCounts.locations} minValue={locationLimit} onChange={(value) => setSubscriptionCounts((prev) => ({ ...prev, locations: value }))} />
              </div>
            )}
            <hr />

            {/* Total */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Cost</span>
              <span>
                ${totalPrice.toFixed(2)}/{cycleLabel}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      {!isEditing ? (
        <Button className="w-full" onClick={handleContinue}>
          Continue to Payment
        </Button>
      ) : (
        <div className="flex flex-wrap gap-3 justify-end flex-row">
          <Button
            variant="outline"
            onClick={() => {
              setSubscriptionCounts({
                professionals: professionalLimit,
                locations: locationLimit,
              });
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => setIsEditing(false)}>Save</Button>
        </div>
      )}
    </div>
  );
}

function NumberPicker({ label, value, minValue = 1, onChange }) {
  const decrement = () => onChange(Math.max(minValue, value - 1));
  const increment = () => onChange(value + 1);

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm flex-1">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= minValue}
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-600 text-lg font-medium
            hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          −
        </button>
        <div className="min-w-[3rem] h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white font-semibold text-sm text-slate-900 px-3">{value}</div>
        <button
          type="button"
          onClick={increment}
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-600 text-lg font-medium
            hover:bg-slate-50 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}
