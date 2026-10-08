'use client';

import { useState, useEffect } from 'react';
import { SettingsLayout } from "../../layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { api } from '@/utils/api';

function PaymentSettingsContent() {
  const [secretKey, setSecretKey] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [liveMode, setLiveMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showSecretKey, setShowSecretKey] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/api/admin/stripe/status');
      if (data.configured) {
        setPublishableKey(data.publishableKey || '');
        setLiveMode(data.live || false);
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!secretKey || !publishableKey) {
      setError('Both secret key and publishable key are required');
      return;
    }

    try {
      setIsSaving(true);
      await api.post('/api/admin/stripe/setup', {
        secretKey,
        publishableKey,
        live: liveMode,
      });
      setSuccess('Stripe account configured successfully');
      await loadStatus();
      setSecretKey('');
    } catch (err) {
      setError(err.message || 'Failed to save Stripe configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {status?.configured && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Stripe Configured</AlertTitle>
          <AlertDescription>
            {liveMode ? 'Live mode enabled' : 'Test mode enabled'}. Last updated {new Date(status.updatedAt).toLocaleDateString()}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Stripe API Keys
          </CardTitle>
          <CardDescription>
            Enter your Stripe API keys to enable payment processing. Get your keys from{' '}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              stripe.com/apikeys
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Mode Selection */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <h3 className="font-semibold">Mode</h3>
                <p className="text-sm text-gray-600">
                  {liveMode ? 'Live Mode (Production)' : 'Test Mode (Development)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!liveMode}
                    onChange={() => setLiveMode(false)}
                    className="w-4 h-4"
                  />
                  <span>Test</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={liveMode}
                    onChange={() => setLiveMode(true)}
                    className="w-4 h-4"
                  />
                  <span>Live</span>
                </label>
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <Label htmlFor="secretKey">Secret Key</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="secretKey"
                  type={showSecretKey ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder={status?.configured ? '••••••••' : 'sk_test_... or sk_live_...'}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="px-3"
                >
                  {showSecretKey ? 'Hide' : 'Show'}
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Keep this key secret. It grants full access to your Stripe account.
              </p>
            </div>

            {/* Publishable Key */}
            <div>
              <Label htmlFor="publishableKey">Publishable Key</Label>
              <Input
                id="publishableKey"
                type="text"
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                placeholder="pk_test_... or pk_live_..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-600 mt-2">
                This key is public and can be shared safely.
              </p>
            </div>

            {/* Webhook Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Next Step: Configure Webhooks</h4>
              <p className="text-sm text-blue-800 mb-3">
                After saving, set up webhooks in your Stripe Dashboard:
              </p>
              <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                <li>Go to Stripe Dashboard → Webhooks</li>
                <li>Click "Add an endpoint"</li>
                <li>Set URL to: <code className="bg-blue-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/stripe</code></li>
                <li>Select events: payment_intent.*, charge.dispute.*</li>
                <li>Copy your signing secret and add to .env: <code className="bg-blue-100 px-2 py-1 rounded">STRIPE_WEBHOOK_SECRET</code></li>
              </ol>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={loadStatus}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Business Owner Upgrade</h4>
            <p className="text-sm text-gray-600">
              When a business owner upgrades their plan from the dashboard, they're securely charged through Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. Card Storage</h4>
            <p className="text-sm text-gray-600">
              Cards are securely stored in Stripe. We never store sensitive card data on our servers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">3. Auto-Renewal</h4>
            <p className="text-sm text-gray-600">
              Subscriptions automatically renew using the saved payment method. Business owners can disable auto-renewal anytime.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">4. Notifications</h4>
            <p className="text-sm text-gray-600">
              Business owners receive email notifications about renewals, failures, and upcoming expirations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <SettingsLayout>
      <h4 className="page-title">Payments</h4>
      <PaymentSettingsContent />
    </SettingsLayout>
  );
}
