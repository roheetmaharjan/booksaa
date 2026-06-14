'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';

export default function PlanSelector({ currentPlanId, onSelectPlan }) {
  const [business, setBusiness] = useState(null); // raw API response { vendorId, vendor }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/businesses/current');
      setBusiness(response); // store full response
    } catch (err) {
      setError(err.message || 'Failed to load business information');
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

  // ─── Destructure from correct paths ────────────────────────────────────────
  const vendor       = business?.vendor;
  const plan         = vendor?.plan;
  const subscription = vendor?.subscription;

  if (!plan) {
    return (
      <div className="rounded-lg border p-6 text-center text-gray-500">
        No active plan found.
      </div>
    );
  }

  const expiryDate = subscription?.expiryDate
    ? new Date(subscription.expiryDate)
    : null;

  // Purchased limits (plan base + addons)
  const professionalLimit = subscription?.professionalCount   ?? plan.professional ?? 1;
  const locationLimit     = subscription?.activeLocationCount ?? plan.location     ?? 1;

  // Actual usage
  const actualLocations    = subscription?.actualLocationCount    ?? vendor?.locations?.length ?? 0;
  const actualProfessionals = subscription?.actualProfessionalCount ?? 0;

  // Extra add-ons above plan base
  const extraLocations     = subscription?.extraLocations     ?? 0;
  const extraProfessionals = subscription?.extraProfessionals ?? 0;

  // Pricing
  const basePrice              = subscription?.basePrice              ?? Number(plan.price ?? 0);
  const extraLocationTotal     = subscription?.extraLocationTotal     ?? 0;
  const extraProfessionalTotal = subscription?.extraProfessionalTotal ?? 0;
  const totalPrice             = subscription?.totalPrice             ?? basePrice;
  const billingCycle           = subscription?.billingCycle           ?? plan.billing_cycle ?? 'monthly';
  const cycleLabel             = billingCycle === 'monthly' ? 'month' : 'year';

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
              <span className="text-gray-600">Business</span>
              <span className="font-medium">{vendor?.name ?? '—'}</span>
            </div>

            {/* Billing cycle */}
            <div className="flex justify-between">
              <span className="text-gray-600">Billing Cycle</span>
              <span className="capitalize">{billingCycle}</span>
            </div>

            {/* Expiry */}
            <div className="flex justify-between">
              <span className="text-gray-600">Expires</span>
              <span>{expiryDate ? expiryDate.toLocaleDateString() : 'Not set'}</span>
            </div>

            <hr />

            {/* Usage */}
            <div className="flex justify-between">
              <span className="text-gray-600">Professionals</span>
              <span>{actualProfessionals} used / {professionalLimit} purchased</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Locations</span>
              <span>{actualLocations} used / {locationLimit} purchased</span>
            </div>

            <hr />

            {/* Price breakdown */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>
                  Base plan — {subscription?.includedLocations ?? plan.location ?? 1} location{(subscription?.includedLocations ?? 1) !== 1 ? 's' : ''},{' '}
                  {subscription?.includedProfessionals ?? plan.professional ?? 1} professional{(subscription?.includedProfessionals ?? 1) !== 1 ? 's' : ''}
                </span>
                <span>${Number(basePrice).toFixed(2)}</span>
              </div>

              {extraLocations > 0 && (
                <div className="flex justify-between">
                  <span>
                    +{extraLocations} extra location{extraLocations !== 1 ? 's' : ''}{' '}
                    × ${Number(plan.extraLocationPrice ?? 0).toFixed(2)}
                  </span>
                  <span>${Number(extraLocationTotal).toFixed(2)}</span>
                </div>
              )}

              {extraProfessionals > 0 && (
                <div className="flex justify-between">
                  <span>
                    +{extraProfessionals} extra professional{extraProfessionals !== 1 ? 's' : ''}{' '}
                    × ${Number(plan.extraProfessionalPrice ?? 0).toFixed(2)}
                  </span>
                  <span>${Number(extraProfessionalTotal).toFixed(2)}</span>
                </div>
              )}
            </div>

            <hr />

            {/* Total */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Cost</span>
              <span>${Number(totalPrice).toFixed(2)}/{cycleLabel}</span>
            </div>

          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={() => onSelectPlan?.(plan.id)}>
        Continue to Payment
      </Button>
    </div>
  );
}
