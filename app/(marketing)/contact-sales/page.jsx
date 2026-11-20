"use client";

import { useState } from "react";
import { ArrowRight, Check, Facebook, Instagram, Linkedin, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const industries = ["Beauty salon", "Barbershop", "Med spa", "Nail salon", "Massage & wellness", "Hair removal", "Tattoo & piercing", "Other"];

const locations = ["1 Location (Single)", "2–5 Locations", "6–10 Locations", "11+ Locations"];
const staffOptions = ["Just me (Solo operator)", "2–5 providers", "6–10 providers", "11+ providers"];

const expectations = [
  {
    title: "Personal outreach within minutes:",
    description: "Someone from our dedicated product specialist team will reach out after you submit so we can understand your business needs.",
  },
  {
    title: "1-on-1 Tailored Walkthrough:",
    description: "Get a personalized platform walkthrough tailored to your trade, staff size, and scheduling workflow.",
  },
  {
    title: "Dedicated Q&A Session:",
    description: "Dedicated time with a Booksaa specialist to discuss custom setups, payments, free client data migration, and hardware.",
  },
  {
    title: "Zero pressure commitment:",
    description: "Receive customized pricing and a complimentary 14-day full-access sandbox environment to test with your team.",
  },
];

const socialLinks = [
  { label: "TikTok", Icon: Music2 },
  { label: "Instagram", Icon: Instagram },
  { label: "Facebook", Icon: Facebook },
  { label: "LinkedIn", Icon: Linkedin },
];

function SelectField({ id, label, value, onValueChange, options, required = false }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} aria-required={required} className="h-10 bg-white text-slate-800">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function ContactSalesPage() {
  const [industry, setIndustry] = useState("");
  const [locationCount, setLocationCount] = useState(locations[0]);
  const [staffCount, setStaffCount] = useState(staffOptions[0]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      businessEmail: formData.get("businessEmail"),
      phone: formData.get("phone"),
      businessName: formData.get("businessName"),
      industry,
      locations: locationCount,
      software: formData.get("software"),
      staffCount,
      notes: formData.get("notes"),
      consent,
    };

    try {
      const response = await fetch("/api/public/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your request.");

      form.reset();
      setIndustry("");
      setLocationCount(locations[0]);
      setStaffCount(staffOptions[0]);
      setConsent(false);
      setFeedback({ type: "success", message: "Thanks! Your demo request is in. Our team will be in touch soon." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to submit your request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[340px] w-[840px] -translate-x-1/2 bg-gradient-to-b from-teal-100/70 via-cyan-100/50 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -top-12 right-12 -z-10 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Let’s make your day easier</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Request more info or book a <span className="text-primary italic">personalized demo</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Experience how Booksaa simplifies online scheduling, automated client reminders, point of sale, and team management in one seamless system.</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <aside className="pt-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">What to expect</h2>
            <p className="mt-1 text-sm text-slate-500">Here is how our seamless demonstration process works:</p>

            <ul className="mt-6 space-y-5">
              {expectations.map((item) => (
                <li key={item.title} className="flex gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/60 text-[#638b2e]">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <p>
                    <strong className="font-semibold text-slate-800">{item.title}</strong> {item.description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-slate-200 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Follow Booksaa</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {socialLinks.map(({ label, Icon }) => (
                  <div key={label} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="p-5">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Book your demo</h2>
              <p className="mt-1 text-sm text-slate-500">Fill in the details below and an industry specialist will tailor the demo to your unique business model.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    First name <span className="text-red-500">*</span>
                  </Label>
                  <Input className="bg-white" id="firstName" name="firstName" required maxLength={80} autoComplete="given-name" placeholder="e.g. Sarah" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Last name <span className="text-red-500">*</span>
                  </Label>
                  <Input className="bg-white" id="lastName" name="lastName" required maxLength={80} autoComplete="family-name" placeholder="e.g. Jenkins" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="businessEmail" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Business email <span className="text-red-500">*</span>
                  </Label>
                  <Input className="bg-white" id="businessEmail" name="businessEmail" type="email" required maxLength={254} autoComplete="email" placeholder="name@business.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Phone number <span className="text-red-500">*</span>
                  </Label>
                  <Input className="bg-white" id="phone" name="phone" type="tel" required maxLength={32} autoComplete="tel" placeholder="(555) 000-1234" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="businessName" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Business name <span className="text-red-500">*</span>
                </Label>
                <Input className="bg-white" id="businessName" name="businessName" required maxLength={120} autoComplete="organization" placeholder="e.g. Glow Aesthetics & Spa" />
              </div>

              <SelectField id="industry" label="Primary industry" required value={industry} onValueChange={setIndustry} options={industries} />

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField id="locations" label="Number of locations" value={locationCount} onValueChange={setLocationCount} options={locations} />
                <div className="space-y-1.5">
                  <Label htmlFor="software" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Current software / system
                  </Label>
                  <Input id="software" name="software" maxLength={120} placeholder="e.g. Vagaro, Mindbody, Fresha, Paper" />
                </div>
              </div>

              <SelectField id="staffCount" label="Staff / service providers" value={staffCount} onValueChange={setStaffCount} options={staffOptions} />

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Share any initial thoughts, goals, or questions
                </Label>
                <Textarea id="notes" name="notes" maxLength={2000} rows={3} className="resize-y bg-white" placeholder="Tell us what you’d like to improve (e.g. reducing no-shows, multi-location payroll, migrating client forms)..." />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} required />
                <Label htmlFor="consent" className="text-xs leading-5 text-slate-500">
                  I agree to Booksaa’s{" "}
                  <a href="/privacy-policy" className="font-medium text-slate-700 underline underline-offset-2">
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a href="/terms" className="font-medium text-slate-700 underline underline-offset-2">
                    Terms of Service
                  </a>
                  . We respect your time and inbox—no spam, ever.
                </Label>
              </div>

              {feedback && (
                <p role="status" className={`rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
                  {feedback.message}
                </p>
              )}

              <Button type="submit" disabled={submitting || !consent || !industry} className="h-11 w-full bg-primary text-slate-900 hover:bg-primary/90">
                {submitting ? (
                  "Sending request..."
                ) : (
                  <>
                    Book a Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
