'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';

let stripePromise = null;

function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Stripe publishable key not configured');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

function PaymentFormContent({ planId, locationCount, professionalCount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [saveCard, setSaveCard] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/businesses/upgrade?success=true`,
        },
        redirect: 'if_required',
      });

      console.log('Stripe confirmPayment result:', result); // <-- ADD THIS

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent) {
        console.log('Sending to confirm-payment:', { // <-- ADD THIS
          paymentIntentId: result.paymentIntent.id,
          planId,
          locationCount,
          professionalCount,
        }); // <-- ADD THIS

        // Confirm payment on backend
        const confirmation = await api.post('/api/businesses/checkout/confirm-payment', {
          paymentIntentId: result.paymentIntent.id,
          planId,
          paymentMethodId: result.paymentIntent.payment_method,
          saveCard,
          locationCount,
          professionalCount,
        });

        if (confirmation.success) {
          onSuccess?.(confirmation);
        } else {
          setError(confirmation.error || 'Payment confirmation failed');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="saveCard"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="saveCard" className="text-sm text-gray-700">
          Save this card for future payments and automatic renewal
        </label>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Processing...' : 'Complete Payment'}
      </Button>
    </form>
  );
}

export default function PaymentForm({ planId, locationCount, professionalCount, amount, clientSecret, publishableKey, onSuccess }) {
  if (!clientSecret) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Unable to initialize payment. Please try again.
      </div>
    );
  }

  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <PaymentFormContent planId={planId} locationCount={locationCount} professionalCount={professionalCount} onSuccess={onSuccess}  />
    </Elements>
  );
}
