"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { SettingSwitch } from "@/components/settings/BusinessSettingsForm";

const notificationFields = [
  "notifyNewBooking",
  "notifyBookingConfirmation",
  "notifyBookingCancellation",
  "notifyBookingReminder",
  "notifyPaymentConfirmation",
];

export default function Notifications({ slug }) {
  const [values, setValues] = useState(null);
  const [savedValues, setSavedValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dirty = values && savedValues && notificationFields.some((field) => values[field] !== savedValues[field]);
  const settingsUrl = slug ? `/api/businesses/settings?slug=${encodeURIComponent(slug)}` : "/api/businesses/settings";

  useEffect(() => {
    let active = true;
    fetch(settingsUrl, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load notification settings.");
        if (active) {
          setValues(data.settings);
          setSavedValues(data.settings);
        }
      })
      .catch((error) => {
        if (active) toast.error(error.message || "Unable to load notification settings.");
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

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body = Object.fromEntries(notificationFields.map((field) => [field, values[field]]));
      const response = await fetch(settingsUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save notification settings.");
      setValues(data.settings);
      setSavedValues(data.settings);
      toast.success("Notification settings saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save notification settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="size-6 animate-spin" aria-label="Loading notifications" /></div>;
  if (!values) return <Alert variant="destructive"><AlertTitle>Notification settings could not be loaded.</AlertTitle><AlertDescription>Refresh this page and try again.</AlertDescription></Alert>;

  return (
    <form onSubmit={handleSave}>
      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>Control supported email notifications. Reminder, cancellation, and payment confirmation delivery are not currently implemented.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingSwitch id="notifyNewBooking" label="New booking notifications" description="Preference saved; business-side new booking alerts are not currently available." checked={values.notifyNewBooking} onCheckedChange={(value) => setValues((current) => ({ ...current, notifyNewBooking: value }))} />
          <SettingSwitch id="notifyBookingConfirmation" label="Booking confirmation" description="Send customers an email for confirmed bookings." checked={values.notifyBookingConfirmation} onCheckedChange={(value) => setValues((current) => ({ ...current, notifyBookingConfirmation: value }))} />
          <SettingSwitch id="notifyBookingCancellation" label="Booking cancellation" description="Preference saved; cancellation email delivery is not currently available." checked={values.notifyBookingCancellation} onCheckedChange={(value) => setValues((current) => ({ ...current, notifyBookingCancellation: value }))} />
          <SettingSwitch id="notifyBookingReminder" label="Booking reminders" description="Preference saved; reminder delivery is not currently available." checked={values.notifyBookingReminder} onCheckedChange={(value) => setValues((current) => ({ ...current, notifyBookingReminder: value }))} />
          <SettingSwitch id="notifyPaymentConfirmation" label="Payment confirmation" description="Preference saved; payment confirmation email delivery is not currently available." checked={values.notifyPaymentConfirmation} onCheckedChange={(value) => setValues((current) => ({ ...current, notifyPaymentConfirmation: value }))} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={!dirty || saving} onClick={() => setValues(savedValues)}>Discard</Button>
            <Button type="submit" disabled={!dirty || saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}{saving ? "Saving..." : "Save changes"}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
