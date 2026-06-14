"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import PlanSelector from "@/components/business/PlanSelector";
import PaymentForm from "@/components/business/PaymentForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEP_SELECT_PLAN = "select-plan";
const STEP_PAYMENT = "payment";
const STEP_SUCCESS = "success";

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(STEP_SELECT_PLAN);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [data, setData] = useState(null); // raw API response { vendorId, vendor }
  const [paymentSession, setPaymentSession] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendorInfo();

    if (searchParams.get("success") === "true") {
      setCurrentStep(STEP_SUCCESS);
    }
  }, []);

  const fetchVendorInfo = async () => {
    try {
      const response = await api.get("/api/businesses/current");
      setData(response);
    } catch (err) {
      setError("Failed to load business information");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = async (planId) => {
    setSelectedPlanId(planId);
    setError(null);

    try {
      const session = await api.post("/api/businesses/checkout/create-session", {
        planId,
      });

      setPaymentSession(session);
      setCurrentStep(STEP_PAYMENT);
    } catch (err) {
      setError(err.message || "Failed to create checkout session");
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep(STEP_SUCCESS);
  };

  const handleBackToPlan = () => {
    setCurrentStep(STEP_SELECT_PLAN);
    setSelectedPlanId(null);
    setPaymentSession(null);
  };

  const handleReturnToBilling = () => {
    router.push("/business/billing-usage");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // ─── Destructure from correct paths ────────────────────────────────────────
  const vendor = data?.vendor;
  const plan = vendor?.plan;
  const subscription = vendor?.subscription;

  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upgrade Your Plan</h1>
          <p className="text-gray-600 mt-2">
            {currentStep === STEP_SELECT_PLAN && "Select a new plan to unlock more features"}
            {currentStep === STEP_PAYMENT && "Complete your payment"}
            {currentStep === STEP_SUCCESS && "Your subscription has been upgraded"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center gap-4">
          {[
            { step: STEP_SELECT_PLAN, label: "1. Select Plan" },
            { step: STEP_PAYMENT, label: "2. Payment" },
            { step: STEP_SUCCESS, label: "3. Confirm" },
          ].map(({ step, label }) => (
            <div key={step} className={`flex-1 py-2 px-4 rounded-lg text-center font-semibold ${currentStep === step ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>
              {label}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

        {/* Current plan summary (shown on plan selection step) */}
        {currentStep === STEP_SELECT_PLAN && plan && (
          <div className="mb-4 bg-white border rounded-lg p-4 text-sm text-gray-600 flex items-center justify-between">
            <span>
              Current plan: <strong>{plan.name}</strong>
              {" · "}
              {subscription?.professionalCount ?? plan.professional ?? 1} professional{(subscription?.professionalCount ?? plan.professional ?? 1) !== 1 ? "s" : ""}
              {" · "}
              {subscription?.activeLocationCount ?? plan.location ?? 1} location{(subscription?.activeLocationCount ?? plan.location ?? 1) !== 1 ? "s" : ""}
            </span>
            {expiryDate && <span className="text-gray-400">Expires {expiryDate.toLocaleDateString()}</span>}
          </div>
        )}

        {/* Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === STEP_SELECT_PLAN && (
              <PlanSelector
                currentPlanId={vendor?.plan?.id} // ← fixed: was vendor?.planId
                onSelectPlan={handlePlanSelect}
              />
            )}

            {currentStep === STEP_PAYMENT && paymentSession && (
              <div className="space-y-4">
                {/* Price breakdown */}
                <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
                  <h3 className="font-semibold text-sm text-gray-700">Price Breakdown</h3>
                  <div className="text-sm space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>
                        Base plan ({plan?.name}) — {subscription?.includedLocations ?? plan?.location ?? 1} location{(subscription?.includedLocations ?? 1) !== 1 ? "s" : ""}, {subscription?.includedProfessionals ?? plan?.professional ?? 1} professional{(subscription?.includedProfessionals ?? 1) !== 1 ? "s" : ""}
                      </span>
                      <span>${Number(subscription?.basePrice ?? plan?.price ?? 0).toFixed(2)}</span>
                    </div>

                    {(subscription?.extraLocations ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span>
                          +{subscription.extraLocations} extra location{subscription.extraLocations !== 1 ? "s" : ""} × ${Number(plan?.extraLocationPrice ?? 0).toFixed(2)}
                        </span>
                        <span>${Number(subscription?.extraLocationTotal ?? 0).toFixed(2)}</span>
                      </div>
                    )}

                    {(subscription?.extraProfessionals ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span>
                          +{subscription.extraProfessionals} extra professional{subscription.extraProfessionals !== 1 ? "s" : ""} × ${Number(plan?.extraProfessionalPrice ?? 0).toFixed(2)}
                        </span>
                        <span>${Number(subscription?.extraProfessionalTotal ?? 0).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-semibold border-t pt-2 text-gray-900">
                      <span>Total per {(subscription?.billingCycle ?? plan?.billing_cycle ?? "monthly") === "monthly" ? "month" : "year"}</span>
                      <span>${Number(subscription?.totalPrice ?? plan?.price ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <PaymentForm planId={selectedPlanId} amount={paymentSession.amount} clientSecret={paymentSession.clientSecret} publishableKey={paymentSession.publishableKey} onSuccess={handlePaymentSuccess} />

                <Button variant="outline" onClick={handleBackToPlan} className="w-full">
                  Back to Plan Selection
                </Button>
              </div>
            )}

            {currentStep === STEP_SUCCESS && (
              <div className="space-y-6 text-center">
                <div className="text-5xl">✓</div>
                <div>
                  <h2 className="text-2xl font-bold text-green-600">Upgrade Successful!</h2>
                  <p className="text-gray-600 mt-2">Your subscription has been upgraded successfully. You now have access to all features.</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left space-y-2">
                  <p className="text-sm">
                    <strong>Confirmation:</strong> Check your email for receipt and details.
                  </p>
                  <p className="text-sm">
                    <strong>Next Renewal:</strong> Your subscription will automatically renew on your renewal date.
                  </p>
                </div>

                <Button onClick={handleReturnToBilling} className="w-full">
                  Return to Billing & Usage
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
