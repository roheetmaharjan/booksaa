"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import PlanSelector from "@/components/business/PlanSelector";
import PaymentForm from "@/components/business/PaymentForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getSafeReturnPath(returnTo, businessSlug) {
  if (returnTo && businessSlug) {
    const destination = new URL(returnTo, "https://booksaa.invalid");
    const expectedBusinessPath = `/${businessSlug}`;
    if (
      destination.origin === "https://booksaa.invalid" &&
      (destination.pathname === expectedBusinessPath || destination.pathname.startsWith(`${expectedBusinessPath}/`))
    ) {
      return `${destination.pathname}${destination.search}${destination.hash}`;
    }
  }
  return businessSlug ? `/${businessSlug}/billing-usage` : "/";
}

const STEP_SELECT_PLAN = "select-plan";
const STEP_PAYMENT = "payment";
const STEP_SUCCESS = "success";
const paymentConfirmations = new Map();

function confirmUpgradePayment(payload) {
  if (!paymentConfirmations.has(payload.paymentIntentId)) {
    paymentConfirmations.set(
      payload.paymentIntentId,
      api.post("/api/businesses/checkout/confirm-payment", payload).catch((error) => {
        paymentConfirmations.delete(payload.paymentIntentId);
        throw error;
      }),
    );
  }
  return paymentConfirmations.get(payload.paymentIntentId);
}

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(STEP_SELECT_PLAN);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedCounts, setSelectedCounts] = useState(null); // selection + price breakdown from PlanSelector
  const [data, setData] = useState(null);
  const [paymentSession, setPaymentSession] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUpgradeContext() {
      try {
        const response = await api.get("/api/businesses/current");
        const requestedBusinessSlug = searchParams.get("businessSlug");
        if (requestedBusinessSlug && response.vendor?.slug !== requestedBusinessSlug) {
          setAccessDenied(true);
          throw new Error("You do not have permission to upgrade this business.");
        }
        if (cancelled) return;
        setData(response);

        const paymentIntentId = searchParams.get("payment_intent");
        const planId = searchParams.get("planId");
        if (paymentIntentId && planId) {
          setCurrentStep(STEP_PAYMENT);
          await confirmUpgradePayment({
            paymentIntentId,
            planId,
            locationCount: Number(searchParams.get("locationCount")) || undefined,
            professionalCount: Number(searchParams.get("professionalCount")) || undefined,
            saveCard: searchParams.get("saveCard") === "true",
          });
          if (!cancelled) setCurrentStep(STEP_SUCCESS);
          return;
        }

        if (searchParams.get("redirect_status") && searchParams.get("redirect_status") !== "succeeded") {
          throw new Error("Payment was canceled or did not complete. Your subscription has not been changed.");
        }
      } catch (err) {
        if (!cancelled) {
          if (searchParams.get("payment_intent")) setCurrentStep(STEP_SELECT_PLAN);
          setError(err.message || "Failed to load business information");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUpgradeContext();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handlePlanSelect = async (planId, selection) => {
    setSelectedPlanId(planId);
    setSelectedCounts(selection); // store the breakdown computed in PlanSelector
    setError(null);

    try {
      const session = await api.post("/api/businesses/checkout/create-session", {
        planId,
        locationCount: selection.locationCount,
        professionalCount: selection.professionalCount,
      });

      setPaymentSession(session);
      setCurrentStep(STEP_PAYMENT);
    } catch (err) {
      setError(err.message || "Failed to create checkout session");
    }
  };

  const handlePaymentSuccess = () => {
    setError(null);
    setCurrentStep(STEP_SUCCESS);
  };

  const handleBackToPlan = () => {
    setCurrentStep(STEP_SELECT_PLAN);
    setSelectedPlanId(null);
    setSelectedCounts(null);
    setPaymentSession(null);
  };

  const handleReturnToBilling = () => {
    router.push(getSafeReturnPath(searchParams.get("returnTo"), vendor?.slug));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const vendor = data?.vendor;
  const plan = vendor?.plan;
  const subscription = vendor?.subscription;

  // Use the new selection's billing cycle if available, otherwise fall back to current subscription
  const cycleLabel = (selectedCounts?.billingCycle ?? subscription?.billingCycle ?? plan?.billing_cycle ?? "monthly") === "monthly" ? "month" : "year";

  return (
    <div className="page-content">
        <div className="page-header">
          <div className="page-container">
            {/* Header */}
            <div>
              <h1 className="page-title">Upgrade Your Plan</h1>
              <p className="text-gray-600 mt-2">
                {currentStep === STEP_SELECT_PLAN && "Select a new plan to unlock more features"}
                {currentStep === STEP_PAYMENT && "Complete your payment"}
                {currentStep === STEP_SUCCESS && "Your subscription has been upgraded"}
              </p>
            </div>
          </div>
        </div>
        <div className="page-body pt-8">
          <div className="page-container max-w-3xl">
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

            {/* Content */}
            <Card>
              <CardContent className="pt-6">
                {currentStep === STEP_SELECT_PLAN && !accessDenied && <PlanSelector currentPlanId={vendor?.plan?.id} onSelectPlan={handlePlanSelect} />}

                {currentStep === STEP_PAYMENT && paymentSession && selectedCounts && (
                  <div className="space-y-4">
                    {/* Price breakdown — based on the NEW selection, not old subscription */}
                    <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
                      <h3 className="font-semibold text-sm text-gray-700">Price Breakdown</h3>
                      <div className="text-sm space-y-1 text-gray-600">
                        <div className="flex justify-between">
                          <span>
                            Base plan ({plan?.name}) — {selectedCounts.includedLocations} location{selectedCounts.includedLocations !== 1 ? "s" : ""}, {selectedCounts.includedProfessionals} professional{selectedCounts.includedProfessionals !== 1 ? "s" : ""}
                          </span>
                          <span>${selectedCounts.basePrice.toFixed(2)}</span>
                        </div>

                        {selectedCounts.extraLocations > 0 && (
                          <div className="flex justify-between">
                            <span>
                              +{selectedCounts.extraLocations} extra location{selectedCounts.extraLocations !== 1 ? "s" : ""} × ${selectedCounts.extraLocationPrice.toFixed(2)}
                            </span>
                            <span>${selectedCounts.extraLocationTotal.toFixed(2)}</span>
                          </div>
                        )}

                        {selectedCounts.extraProfessionals > 0 && (
                          <div className="flex justify-between">
                            <span>
                              +{selectedCounts.extraProfessionals} extra professional{selectedCounts.extraProfessionals !== 1 ? "s" : ""} × ${selectedCounts.extraProfessionalPrice.toFixed(2)}
                            </span>
                            <span>${selectedCounts.extraProfessionalTotal.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between font-semibold border-t pt-2 text-gray-900">
                          <span>Total per {cycleLabel}</span>
                          <span>${selectedCounts.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <PaymentForm
                      planId={selectedPlanId}
                      locationCount={selectedCounts.locationCount}
                      professionalCount={selectedCounts.professionalCount}
                      amount={paymentSession.amount}
                      clientSecret={paymentSession.clientSecret}
                      publishableKey={paymentSession.publishableKey}
                      returnUrl={`/upgrade?${new URLSearchParams({
                        businessSlug: vendor?.slug || "",
                        returnTo: getSafeReturnPath(searchParams.get("returnTo"), vendor?.slug),
                        planId: selectedPlanId,
                        locationCount: String(selectedCounts.locationCount),
                        professionalCount: String(selectedCounts.professionalCount),
                      }).toString()}`}
                      onSuccess={handlePaymentSuccess}
                    />

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
    </div>
  );
}
