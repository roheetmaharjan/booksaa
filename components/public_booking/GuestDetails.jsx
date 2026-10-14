"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneNumberInput } from "@/components/common/PhoneNumber";

export default function GuestDetails({ value, onChange, onBack, onSubmit, loading, error }) {
  const update = (field) => (eventOrValue) => {
    const nextValue = field === "phone" ? eventOrValue || "" : eventOrValue.target.value;
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <form
      className="mx-auto w-full max-w-xl space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Your details</h1>
        <p className="mt-1 text-sm text-slate-500">We’ll use your email to verify and confirm this booking.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest-full-name">Full name <span aria-hidden="true">*</span></Label>
        <Input
          id="guest-full-name"
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          value={value.fullName}
          onChange={update("fullName")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest-phone">Phone number <span className="font-normal text-slate-500">(optional)</span></Label>
        <PhoneNumberInput
          id="guest-phone"
          name="phone"
          autoComplete="tel"
          value={value.phone || undefined}
          onChange={update("phone")}
          defaultCountry="NP"
          placeholder="Phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest-email">Email address <span aria-hidden="true">*</span></Label>
        <Input
          id="guest-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={value.email}
          onChange={update("email")}
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit" disabled={loading}>{loading ? "Sending code..." : "Verify email"}</Button>
      </div>
    </form>
  );
}
