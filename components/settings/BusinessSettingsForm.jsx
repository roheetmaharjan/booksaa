"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2 } from "lucide-react";
import { applyCountrySuggestions } from "@/lib/regional-preferences";

const fallbackTimeZones = [
  "Asia/Kathmandu",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
];

const preferenceFields = [
  "businessEmail",
  "website",
  "countryCode",
  "currencyCode",
  "timeZone",
  "dateFormat",
  "timeFormat",
  "onlineBookingEnabled",
  "manualBookingApproval",
  "minAdvanceNoticeMinutes",
  "maxAdvanceBookingDays",
  "allowCustomerCancellations",
  "allowCustomerRescheduling",
  "cancellationDeadlineHours",
  "cashPaymentsEnabled",
  "onlinePaymentsEnabled",
  "payAtBusinessEnabled",
  "depositsEnabled",
  "defaultDepositPercentage",
  "paymentInstructions",
];

function getTimeZones() {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }
  return fallbackTimeZones;
}

export function SettingSwitch({ id, label, description, checked, onCheckedChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-1">
        <Label htmlFor={id} className="font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function BusinessSettingsForm({ slug }) {
  const [settings, setSettings] = useState(null);
  const [savedSettings, setSavedSettings] = useState(null);
  const [currencyWarningRequired, setCurrencyWarningRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manuallyChanged, setManuallyChanged] = useState({ currencyCode: false, timeZone: false });
  const timeZones = useMemo(getTimeZones, []);
  const dirty = Boolean(settings && savedSettings && JSON.stringify(settings) !== JSON.stringify(savedSettings));
  const settingsUrl = slug ? `/api/businesses/settings?slug=${encodeURIComponent(slug)}` : "/api/businesses/settings";

  useEffect(() => {
    let active = true;
    fetch(settingsUrl, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load business settings.");
        if (active) {
          setSettings(data.settings);
          setSavedSettings(data.settings);
          setCurrencyWarningRequired(data.currencyChangeWarningRequired);
        }
      })
      .catch((error) => {
        if (active) toast.error(error.message || "Unable to load business settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [settingsUrl]);

  useEffect(() => {
    if (!dirty) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const update = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  const handleCountryChange = (countryCode) => {
    setSettings((current) => applyCountrySuggestions(countryCode, current, manuallyChanged));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body = Object.fromEntries(preferenceFields.map((field) => [field, settings[field]]));
      const response = await fetch(settingsUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save business settings.");
      setSettings(data.settings);
      setSavedSettings(data.settings);
      toast.success("Business settings saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save business settings.");
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setSettings(savedSettings);
    setManuallyChanged({ currencyCode: false, timeZone: false });
  };

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center"><Loader2 className="size-6 animate-spin" aria-label="Loading settings" /></div>;
  }
  if (!settings) {
    return <Alert variant="destructive"><AlertTitle>Business settings could not be loaded.</AlertTitle><AlertDescription>Refresh this page and try again.</AlertDescription></Alert>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business contact</CardTitle>
          <CardDescription>Contact details shown to customers alongside your business profile.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business email</Label>
            <Input id="businessEmail" type="email" autoComplete="email" value={settings.businessEmail || ""} onChange={(event) => update("businessEmail", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" placeholder="https://example.com" value={settings.website || ""} onChange={(event) => update("website", event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional preferences</CardTitle>
          <CardDescription>Set how dates, times, and prices are presented. Currency changes do not convert existing prices or transactions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={settings.countryCode} onValueChange={handleCountryChange}>
              <SelectTrigger><SelectValue placeholder="Choose a country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NP">Nepal</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="US">United States</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default currency</Label>
            <Select value={settings.currencyCode} onValueChange={(value) => { setManuallyChanged((current) => ({ ...current, currencyCode: true })); update("currencyCode", value); }}>
              <SelectTrigger><SelectValue placeholder="Choose a currency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NPR">NPR — Nepalese Rupee</SelectItem>
                <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
                <SelectItem value="USD">USD — United States Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeZone">Timezone (IANA)</Label>
            <Input id="timeZone" list="business-time-zones" value={settings.timeZone} onChange={(event) => { setManuallyChanged((current) => ({ ...current, timeZone: true })); update("timeZone", event.target.value); }} placeholder="Search, e.g. Asia/Kathmandu" />
            <datalist id="business-time-zones">{timeZones.map((timeZone) => <option key={timeZone} value={timeZone} />)}</datalist>
          </div>
          <div className="space-y-2">
            <Label>Date format</Label>
            <Select value={settings.dateFormat} onValueChange={(value) => update("dateFormat", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time format</Label>
            <Select value={settings.timeFormat} onValueChange={(value) => update("timeFormat", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {currencyWarningRequired && settings.currencyCode !== savedSettings.currencyCode && (
            <Alert className="md:col-span-2">
              <AlertTriangle className="size-4" />
              <AlertTitle>Review existing prices and transactions</AlertTitle>
              <AlertDescription>Changing currency does not convert your existing service prices, bookings, or payments. Review them for consistency before saving.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking settings</CardTitle>
          <CardDescription>Control online booking availability and customer booking rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingSwitch id="onlineBookingEnabled" label="Online booking" description="Allow customers to book through your public booking page." checked={settings.onlineBookingEnabled} onCheckedChange={(value) => update("onlineBookingEnabled", value)} />
          <SettingSwitch id="manualBookingApproval" label="Require manual approval" description="New online bookings wait for a team member to confirm them." checked={settings.manualBookingApproval} onCheckedChange={(value) => update("manualBookingApproval", value)} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minAdvanceNoticeMinutes">Minimum advance notice (minutes)</Label>
              <Input id="minAdvanceNoticeMinutes" type="number" min="0" max="525600" value={settings.minAdvanceNoticeMinutes} onChange={(event) => update("minAdvanceNoticeMinutes", event.target.value === "" ? "" : Number(event.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAdvanceBookingDays">Maximum advance booking (days)</Label>
              <Input id="maxAdvanceBookingDays" type="number" min="1" max="730" value={settings.maxAdvanceBookingDays} onChange={(event) => update("maxAdvanceBookingDays", event.target.value === "" ? "" : Number(event.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancellationDeadlineHours">Cancellation deadline (hours)</Label>
              <Input id="cancellationDeadlineHours" type="number" min="0" max="8760" value={settings.cancellationDeadlineHours ?? ""} onChange={(event) => update("cancellationDeadlineHours", event.target.value === "" ? null : Number(event.target.value))} placeholder="No deadline" />
            </div>
          </div>
          <SettingSwitch id="allowCustomerCancellations" label="Allow customer cancellations" description="Preference saved; self-service cancellation is not currently available." checked={settings.allowCustomerCancellations} onCheckedChange={(value) => update("allowCustomerCancellations", value)} />
          <SettingSwitch id="allowCustomerRescheduling" label="Allow customer rescheduling" description="Preference saved; self-service rescheduling is not currently available." checked={settings.allowCustomerRescheduling} onCheckedChange={(value) => update("allowCustomerRescheduling", value)} />
          <p className="text-sm text-muted-foreground">Cancellation deadline applies once customer self-service cancellation is available.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment settings</CardTitle>
          <CardDescription>These preferences complement your existing Stripe connection and per-service payment configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingSwitch id="cashPaymentsEnabled" label="Cash payments" description="Accept cash payments for appointments." checked={settings.cashPaymentsEnabled} onCheckedChange={(value) => update("cashPaymentsEnabled", value)} />
          <SettingSwitch id="onlinePaymentsEnabled" label="Online payments" description="Allow card payments when Stripe is connected." checked={settings.onlinePaymentsEnabled} onCheckedChange={(value) => update("onlinePaymentsEnabled", value)} />
          <SettingSwitch id="payAtBusinessEnabled" label="Pay at business" description="Allow customers to pay in person at your location." checked={settings.payAtBusinessEnabled} onCheckedChange={(value) => update("payAtBusinessEnabled", value)} />
          <SettingSwitch id="depositsEnabled" label="Deposits" description="Allow deposits configured for individual services." checked={settings.depositsEnabled} onCheckedChange={(value) => update("depositsEnabled", value)} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultDepositPercentage">Default deposit percentage</Label>
              <Input id="defaultDepositPercentage" type="number" min="0" max="100" step="0.1" value={settings.defaultDepositPercentage ?? ""} onChange={(event) => update("defaultDepositPercentage", event.target.value === "" ? null : Number(event.target.value))} placeholder="Optional" />
              <p className="text-xs text-muted-foreground">Used as the starting value when creating a service deposit.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentInstructions">Payment instructions</Label>
              <Textarea id="paymentInstructions" maxLength={2000} value={settings.paymentInstructions || ""} onChange={(event) => update("paymentInstructions", event.target.value)} placeholder="Instructions shown to customers" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end gap-2 rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur">
        <Button type="button" variant="outline" onClick={discardChanges} disabled={!dirty || saving}>Discard</Button>
        <Button type="submit" disabled={!dirty || saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}{saving ? "Saving..." : "Save changes"}</Button>
      </div>
    </form>
  );
}
