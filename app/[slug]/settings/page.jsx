"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, CheckCircle2, AlertTriangle, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Settings() {
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch current settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/stripe-setup`);
        const data = await res.json();
        if (res.ok) {
          setPublishableKey(data.stripePublishableKey || "");
          setIsConnected(data.hasSecretKey);
          if (data.hasSecretKey) {
            setSecretKey("••••••••••••••••••••••••••••••••");
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!publishableKey.trim() || !secretKey.trim()) {
      toast.error("Both Publishable Key and Secret Key are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/stripe-setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripePublishableKey: publishableKey,
          stripeSecretKey: secretKey === "••••••••••••••••••••••••••••••••" ? undefined : secretKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to connect Stripe credentials");
      } else {
        toast.success("Stripe account successfully connected!");
        setIsConnected(true);
        setSecretKey("••••••••••••••••••••••••••••••••");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-container">
          <header className="flex items-start gap-2">
            <SidebarTrigger className="mt-1 md:hidden" />
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Configure your business-specific integrations and checkout rules.
              </p>
            </div>
          </header>
        </div>
      </div>

      <div className="page-body pt-6">
        <div className="page-container max-w-3xl">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#062B3D] text-white">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Stripe Integration</CardTitle>
                  <CardDescription>
                    Connect your own Stripe account to accept credit/debit card payments online.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-6 pt-6">
                {isConnected ? (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertTitle className="font-bold">Stripe Connected</AlertTitle>
                    <AlertDescription className="text-emerald-800">
                      Your business is currently ready to process card checkouts and send payment links to customers.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="font-bold">Not Connected</AlertTitle>
                    <AlertDescription className="text-amber-800">
                      You must connect your Stripe Publishable and Secret keys to collect upfront payments for services.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="publishableKey">Stripe Publishable Key</Label>
                  <Input
                    id="publishableKey"
                    value={publishableKey}
                    onChange={(e) => setPublishableKey(e.target.value)}
                    placeholder="pk_test_..."
                    className="border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Stripe Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="secretKey"
                      type={showSecret ? "text" : "password"}
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      onClick={() => {
                        if (secretKey === "••••••••••••••••••••••••••••••••") {
                          setSecretKey("");
                        }
                      }}
                      placeholder="sk_test_..."
                      className="border-slate-200 bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end">
                <Button type="submit" disabled={saving} className="bg-[#062B3D] text-white hover:bg-[#0b3c54]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving credentials...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configurations
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
