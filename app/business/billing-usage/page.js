"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UpgradeButton from "@/components/business/UpgradeButton";
import { api } from "@/utils/api";
import { AlertTriangle, CreditCard, MapPin, Users } from "lucide-react";

export default function BillingUsagePage() {
  const [data, setData] = useState(null); // raw API response { vendorId, vendor }
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);

      const [fullData, methods] = await Promise.all([api.get("/api/businesses/current"), api.get("/api/businesses/payment-methods/list")]);

      setData(fullData);
      setPaymentMethods(methods.paymentMethods || []);

      // vendor lives inside fullData.vendor
      const vendor = fullData?.vendor;
      setAutoRenewEnabled(vendor?.autoRenewEnabled !== false);

      if (vendor?.subscription?.expiryDate) {
        const daysUntilExpiry = Math.ceil((new Date(vendor.subscription.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        setShowWarning(daysUntilExpiry <= 7);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoRenewal = async () => {
    try {
      const result = await api.put("/api/businesses/toggle", {
        enabled: !autoRenewEnabled,
      });

      setAutoRenewEnabled(result.autoRenewEnabled);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (!window.confirm("Are you sure you want to delete this payment method?")) return;
    try {
      await api.delete(`/api/businesses/payment-methods/${methodId}`);
      setPaymentMethods((prev) => prev.filter((m) => m.id !== methodId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading billing information...</p>
      </div>
    );
  }

  if (!data?.vendor) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Unable to load billing information</AlertDescription>
        </Alert>
      </div>
    );
  }

  // ─── Destructure from correct paths ──────────────────────────────────────────
  const vendor = data.vendor;
  const plan = vendor.plan;
  const subscription = vendor.subscription; // from calculateBusinessSubscription
  const expiryDate = vendor.subscription?.expiryDate ? new Date(vendor.subscription.expiryDate) : null;

  const subscriptionStatus = vendor.subscription?.subscriptionStatus ?? null;

  // Limits = what they purchased (plan base + addons), surfaced by calculateBusinessSubscription
  const professionalLimit = subscription?.professionalCount ?? plan?.professional ?? 1;
  const locationLimit = subscription?.activeLocationCount ?? plan?.location ?? 1;

  // Actual usage
  const actualProfessionals = subscription?.actualProfessionalCount ?? 0;
  const actualLocations = subscription?.actualLocationCount ?? 0;


  // Pricing breakdown
  const basePrice = subscription?.basePrice ?? plan?.price ?? 0;
  const totalPrice = subscription?.totalPrice ?? basePrice;
  const billingCycle = subscription?.billingCycle ?? plan?.billing_cycle ?? "monthly";

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-container gap-1">
          <h1 className="page-title">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and payment methods</p>
        </div>
      </div>
      <div className="page-container">

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showWarning && expiryDate && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your subscription expires on {expiryDate.toLocaleDateString()}.{paymentMethods.length === 0 && " Please add a payment method to enable auto-renewal."}
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-7">
            {/* ── Current Subscription ─────────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <CardTitle className="card-title mb-2">Current Subscription</CardTitle>
                    <CardDescription>Your active plan and renewal details</CardDescription>
                  </div>
                  <div className="flex flex-wrap justify-between flex-1 gap-3 items-center">
                    {subscriptionStatus && (
                      <Badge variant="outline" className={subscriptionStatus === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200 text-[10px]" : subscriptionStatus === "TRIAL_ACTIVE" ? "bg-blue-50 text-blue-700 border-blue-200 text-[10px]" : "bg-gray-50 text-gray-700 text-[10px]"}>
                        {subscriptionStatus?.replace("_", " ")}
                      </Badge>
                    )}
                    <UpgradeButton vendor={vendor} showWarning={showWarning} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Plan overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="text-base font-semibold">{plan?.name ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="text-base font-semibold">
                      <span>${Number(totalPrice).toFixed(2)}</span>
                      <span className="text-sm font-normal text-gray-500">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Billing Cycle</p>
                    <p className="text-base font-semibold capitalize">{billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="text-base font-semibold">{expiryDate ? expiryDate.toLocaleDateString() : "Not set"}</p>
                  </div>
                </div>

                <hr />

                <div className="space-y-1">
                  <h3 className="font-semibold">Includes</h3>
                  <p>{locationLimit} Location</p>
                  <p>{professionalLimit} Professionals</p>
                </div>
                <hr/>

                {/* Usage: locations */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Current Plan Usage</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Locations */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          Locations
                        </div>
                        <span className="text-sm text-gray-500">
                          {actualLocations} of {locationLimit} used
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((actualLocations / locationLimit) * 100, 100)}%` }} />
                      </div>
                    </div>

                    {/* Professionals */}
                    <div className=" space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Users className="h-4 w-4 text-gray-500" />
                          Professionals
                        </div>
                        <span className="text-sm text-gray-500">
                          {actualProfessionals} of {professionalLimit} Used
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((actualProfessionals / professionalLimit) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
            {/* ── Payment Methods ──────────────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="card-title">
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 h-full">
                {paymentMethods.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                    <p className="mb-3">No payment methods saved. Add one to enable auto-renewal.</p>
                    <UpgradeButton vendor={vendor} isCompact showWarning={showWarning} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between px-4 py-5 rounded-xl border">
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-gray-400 h-5 w-5" />
                          <div>
                            <p className="font-semibold">
                              xxx-xxxx-xxxx-{method.last4Digits}
                            </p>
                            <div className="flex flex-row gap-2 mt-1">
                              <p className="text-sm text-gray-600">
                                Expires: {method.expiryMonth}/{method.expiryYear}
                              </p> <span className="text-gray-300">|</span> 
                              <p className="text-sm text-gray-600">Type: {method.brand || "Card"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge variant="outline" className="bg-gray-50 text-[10px] uppercase">
                              Default
                            </Badge>
                          )}
                          <Button variant="link" size="sm" onClick={() => handleDeletePaymentMethod(method.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* ── Auto-Renewal ─────────────────────────────────────────────────────── */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between pt-5">
                  <div>
                    <CardTitle className="card-title mb-2">
                      Automatic Renewal
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{autoRenewEnabled ? "Your subscription will automatically renew on the expiry date" : "Auto-renewal is disabled. Your subscription will not renew automatically."}</p>
                  </div>
                  <Switch
                    id="auto-renew"
                    checked={autoRenewEnabled}
                    onCheckedChange={handleToggleAutoRenewal}
                  />
                </div>

                {!autoRenewEnabled && (
                  <Alert className="mt-4">
                    <AlertDescription>Without auto-renewal, you'll need to manually renew your subscription before it expires.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* ── Billing History ──────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="card-title">Billing History</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>No Billing History</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
  );
}
