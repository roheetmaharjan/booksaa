"use client";

import { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { Button } from "@/components/ui/button";

const stripePromises = new Map();

function getStripePromise(publishableKey) {
  if (!stripePromises.has(publishableKey)) {
    stripePromises.set(publishableKey, loadStripe(publishableKey));
  }
  return stripePromises.get(publishableKey);
}

function CardPaymentForm({ amount, onConfirm, onBeforePayment, loading, error }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    if (!stripe || !window.location.search.includes("payment_intent_client_secret=")) return;

    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent, error: retrieveError }) => {
      if (retrieveError) {
        setCardError(retrieveError.message || "Unable to verify the card payment.");
      } else if (paymentIntent?.status === "succeeded") {
        onConfirm(paymentIntent.id);
      } else if (paymentIntent) {
        setCardError("The card payment was not completed. Please try again.");
      }
    });
  }, [onConfirm, stripe]);

  const submit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || processing || loading) return;

    setProcessing(true);
    setCardError("");
    try {
      await onBeforePayment();
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });
      if (stripeError) {
        setCardError(stripeError.message || "Card payment failed.");
      } else if (paymentIntent?.status === "succeeded") {
        await onConfirm(paymentIntent.id);
      } else {
        setCardError("The card payment was not completed. Please try again.");
      }
    } catch (submitError) {
      setCardError(submitError.message || "Card payment failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <PaymentElement />
      {(cardError || error) && <p role="alert" className="text-sm text-red-600">{cardError || error}</p>}
      <Button type="submit" className="w-full sm:w-auto" disabled={!stripe || !elements || processing || loading}>
        {processing || loading ? "Processing..." : `Pay deposit ($${Number(amount).toFixed(2)})`}
      </Button>
    </form>
  );
}

export default function PaymentSelect({
  service,
  customerEmail,
  paymentSetup,
  loading,
  error,
  onConfirmBooking,
  onBeforePayment,
  onPaymentSuccess,
  onBack,
}) {
  const requiresDeposit = service?.prepaymentType === "full" || service?.prepaymentType === "deposit";

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Payment</h1>
        <p className="mt-1 text-sm text-slate-500">{customerEmail}</p>
      </div>

      {requiresDeposit ? (
        paymentSetup?.clientSecret && paymentSetup?.publishableKey ? (
          <Elements
            key={paymentSetup.clientSecret}
            stripe={getStripePromise(paymentSetup.publishableKey)}
            options={{ clientSecret: paymentSetup.clientSecret }}
          >
            <CardPaymentForm
              amount={paymentSetup.depositAmount}
              onConfirm={onPaymentSuccess}
              onBeforePayment={onBeforePayment}
              loading={loading}
              error={error}
            />
          </Elements>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {loading ? "Preparing secure card payment..." : error || "Card payment is unavailable."}
          </div>
        )
      ) : (
        <>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            No deposit is required. You can confirm now and pay for the service at the business.
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="button" disabled={loading} onClick={onConfirmBooking}>
            {loading ? "Confirming booking..." : "Confirm booking — pay later"}
          </Button>
        </>
      )}

      <div className="border-t border-slate-200 pt-5">
        <Button type="button" variant="outline" disabled={loading} onClick={onBack}>Back</Button>
      </div>
    </div>
  );
}
