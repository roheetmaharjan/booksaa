"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Loader2, LockKeyhole, MapPin, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { slugifyText } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BusinessLocation = dynamic(() => import("@/components/common/BusinessLocation"), { ssr: false });

const initialForm = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  name: "",
  categoryId: "",
  planId: "",
};

const steps = [
  { title: "Owner", icon: UserRound },
  { title: "Business", icon: Building2 },
  { title: "Location", icon: MapPin },
];

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const initialSetup = {
  service: { name: "", description: "", price: "", duration: "" },
  professional: { name: "", email: "", phone: "", roleId: "", status: "ACTIVE" },
  businessHours: daysOfWeek.map((day) => ({
    day,
    isOpen: false,
    openTime: "09:00",
    closeTime: "17:00",
  })),
};

function money(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function BusinessSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [subscriptionCounts, setSubscriptionCounts] = useState({
    professionals: 1,
    locations: 1,
  });
  const [locationData, setLocationData] = useState({});
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [setup, setSetup] = useState(initialSetup);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch("/api/auth/business-signup");
        if (!res.ok) throw new Error("Unable to load signup options.");

        const options = await res.json();
        const nextPlans = options.plans || [];
        const requestedPlan = searchParams.get("planId");
        const requestedProfessionals = Math.max(1, Number(searchParams.get("professionals")) || 1);
        const requestedLocations = Math.max(1, Number(searchParams.get("locations")) || 1);

        setCategories(options.categories || []);
        setPlans(nextPlans);
        setSubscriptionCounts({
          professionals: requestedProfessionals,
          locations: requestedLocations,
        });
        setForm((prev) => ({
          ...prev,
          planId: requestedPlan && nextPlans.some((p) => p.id === requestedPlan) ? requestedPlan : nextPlans[0]?.id || "",
        }));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, [searchParams]);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === form.planId), [plans, form.planId]);
  const businessSlugPreview = form.name ? slugifyText(form.name) : "";

  // const subscriptionEstimate = useMemo(() => {
  //   if (!selectedPlan) return null;

  //   const basePrice = Number(selectedPlan.price || 0);
  //   const includedProfessionals = Number(selectedPlan.professional || 1);
  //   const includedLocations = Number(selectedPlan.location || 1);
  //   const extraProfessionalPrice = Number(selectedPlan.extraProfessionalPrice || 0);
  //   const extraLocationPrice = Number(selectedPlan.extraLocationPrice || 0);
  //   const extraProfessionals = Math.max(subscriptionCounts.professionals - includedProfessionals, 0);
  //   const extraLocations = Math.max(subscriptionCounts.locations - includedLocations, 0);
  //   const total =
  //     basePrice +
  //     extraProfessionals * extraProfessionalPrice +
  //     extraLocations * extraLocationPrice;

  //   return { basePrice, extraProfessionals, extraLocations, extraProfessionalPrice, extraLocationPrice, total };
  // }, [selectedPlan, subscriptionCounts]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const checkEmailAvailability = useCallback(async () => {
    const email = form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

    try {
      setEmailChecking(true);
      const res = await fetch(`/api/auth/business-signup?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unable to validate email.");

      if (data.exists) {
        setErrors((prev) => ({ ...prev, email: "Email already exists." }));
        return false;
      }

      setErrors((prev) => ({
        ...prev,
        email: prev.email === "Email already exists." ? "" : prev.email,
      }));
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setEmailChecking(false);
    }
  }, [form.email]);

  const handleLocationChange = useCallback((data) => {
    setLocationData(data);
    setErrors((prev) => ({ ...prev, location: "" }));
  }, []);

  const validateStep = (targetStep = step) => {
    const nextErrors = {};

    if (targetStep === 1) {
      if (!form.firstname.trim()) nextErrors.firstname = "First name is required.";
      if (!form.lastname.trim()) nextErrors.lastname = "Last name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
      if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
      if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (targetStep === 2) {
      if (!form.name.trim()) nextErrors.name = "Business name is required.";
      if (!form.categoryId) nextErrors.categoryId = "Choose a category.";
      if (!form.planId) nextErrors.planId = "Choose a plan.";
    }

    if (targetStep === 3) {
      const lf = locationData?.locationForm || {};
      if (!lf.address || !lf.city || !lf.postal_code || !lf.country || !lf.state) nextErrors.location = "Search and confirm your full business location.";
      if (!lf.offerAtBusiness && !lf.offerAtClient) nextErrors.locationOption = "Select where you offer services.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = async () => {
    if (!validateStep(step)) return;
    if (step === 1 && !(await checkEmailAvailability())) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const previousStep = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;
    if (!(await checkEmailAvailability())) {
      setStep(1);
      return;
    }

    const lf = locationData.locationForm;
    const serviceEntered = setup.service.name || setup.service.price || setup.service.duration;
    const professionalEntered = setup.professional.name || setup.professional.email || setup.professional.phone || setup.professional.roleId;

    const payload = {
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      name: form.name.trim(),
      categoryId: form.categoryId,
      planId: form.planId,
      address: lf.address,
      city: lf.city,
      postal_code: lf.postal_code,
      country: lf.country,
      state: lf.state,
      latitude: lf.latitude || null,
      longitude: lf.longitude || null,
      offerAtBusiness: !!lf.offerAtBusiness,
      offerAtClient: !!lf.offerAtClient,
      travelFee: locationData.travelFee || 0,
      maxTravelDistance: locationData.maxDistance || 5,
      subscriptionProfessionalLimit: subscriptionCounts.professionals,
      subscriptionLocationLimit: subscriptionCounts.locations,
      setup: {
        services: serviceEntered ? [setup.service] : [],
        professionals: professionalEntered ? [setup.professional] : [],
        businessHours: setup.businessHours.filter((h) => h.isOpen),
      },
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/business-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create business account.");

      toast.success("Your trial is active. Welcome to Booksaa.");
      const vendorSlug = data.vendor?.slug;
      const redirectUrl = vendorSlug ? `/${vendorSlug}?setup=step4` : "/auth/login";

      await router.push(redirectUrl);
      if (typeof window !== "undefined") window.location.href = redirectUrl;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]">
        {/* ── Sidebar ── */}
        <aside className="hidden border-r bg-white px-10 py-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Button variant="ghost" size="sm" className="h-4 inline-flex items-center gap-2 p-0 text-sm text-slate-600" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <br />
            <Link href="/" className="mt-5 inline-flex">
              <Image src="/logo.png" alt="Booksaa" width={120} height={32} priority />
            </Link>
          </div>

          <div className="space-y-4 rounded-lg border bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                <Sparkles className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-semibold">Trial activates instantly</p>
                <p className="text-sm text-slate-500">{selectedPlan?.trial_period ? `${selectedPlan.trial_period} days on ${selectedPlan.name}` : "Based on your selected plan"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                <LockKeyhole className="h-5 w-5 text-slate-700" />
              </div>
              <p className="text-sm text-slate-600">Your owner login is created during signup, so there is no invite step.</p>
            </div>
          </div>
        </aside>

        {/* ── Main form ── */}
        <section className="px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div>
              <Link href="/business-pro" className="inline-flex items-center gap-2 text-sm text-slate-600">
                <ArrowLeft className="h-4 w-4" />
                Business Pro
              </Link>
              <Link href="/" className="mt-3 inline-flex">
                <Image src="/logo.png" alt="Booksaa" width={112} height={30} priority />
              </Link>
            </div>
            <Badge variant="secondary">Free trial</Badge>
          </div>

          <Card className="mx-auto max-w-3xl rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-0">
              {/* Step indicators */}
              <div className="border-b px-5 py-5 sm:px-8">
                <div className="flex flex-wrap items-center gap-3">
                  {steps.map((item, index) => {
                    const StepIcon = item.icon;
                    const stepNumber = index + 1;
                    const active = step === stepNumber;
                    const complete = step > stepNumber;
                    return (
                      <div key={item.title} className="flex min-w-[132px] flex-1 items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-md border ${complete ? "border-emerald-600 bg-emerald-600 text-white" : active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-500"}`}>{complete ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}</div>
                        <div>
                          <p className="text-xs uppercase text-slate-500">Step {stepNumber}</p>
                          <p className="text-sm font-semibold">{item.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-8">
                {loading ? (
                  <div className="flex h-80 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                  </div>
                ) : (
                  <>
                    {/* Step 1 */}
                    {step === 1 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-2xl font-bold">Create an account</h2>
                          <p className="mt-1 text-sm text-slate-500">A quick setup for a smoother booking experience</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 mt-3">
                          <Field label="First name" id="firstname" error={errors.firstname}>
                            <Input id="firstname" name="firstname" value={form.firstname} onChange={handleChange} />
                          </Field>
                          <Field label="Last name" id="lastname" error={errors.lastname}>
                            <Input id="lastname" name="lastname" value={form.lastname} onChange={handleChange} />
                          </Field>
                          <Field label="Email" id="email" error={errors.email}>
                            <Input id="email" name="email" type="email" value={form.email} onBlur={checkEmailAvailability} onChange={handleChange} />
                            {emailChecking && <p className="text-sm text-slate-500">Checking email...</p>}
                          </Field>
                          <Field label="Phone" id="phone">
                            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                          </Field>
                          <Field label="Password" id="password" error={errors.password}>
                            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
                          </Field>
                          <Field label="Confirm password" id="confirmPassword" error={errors.confirmPassword}>
                            <Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
                          </Field>
                        </div>
                      </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-2xl font-bold">Business details</h2>
                          <p className="mt-1 text-sm text-slate-500">Match the admin business setup, with plan-based trial activation.</p>
                        </div>
                        <div className="grid gap-4">
                          <Field label="Business name" id="name" error={errors.name}>
                            <Input id="name" name="name" value={form.name} onChange={handleChange} />
                            {businessSlugPreview ? (
                              <p className="text-sm text-slate-500">Slug preview: {businessSlugPreview}</p>
                            ) : (
                              <p className="text-sm text-slate-400">Slug will be generated automatically.</p>
                            )}
                          </Field>
                          <Field label="Category" id="categoryId" error={errors.categoryId}>
                            <Select value={form.categoryId} onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}>
                              <SelectTrigger id="categoryId">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Plan" id="planId" error={errors.planId}>
                            <Select value={form.planId} onValueChange={(value) => setForm((prev) => ({ ...prev, planId: value }))}>
                              <SelectTrigger id="planId">
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map((plan) => (
                                  <SelectItem key={plan.id} value={plan.id}>
                                    {plan.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                      </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-2xl font-bold">Primary location</h2>
                          <p className="mt-1 text-sm text-slate-500">Search your address and confirm where customers can book you.</p>
                        </div>
                        <BusinessLocation onDataChange={handleLocationChange} />
                        {(errors.location || errors.locationOption) && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.location || errors.locationOption}</div>}
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
                      <Button type="button" variant="outline" onClick={previousStep} disabled={step === 1 || submitting}>
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      {step < 3 ? (
                        <Button type="button" onClick={nextStep}>
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button type="submit" disabled={submitting}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          Start free trial
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

/* ─── Number Picker ──────────────────────────────────────────────────────────── */

function NumberPicker({ label, value, onChange }) {
  const decrement = () => onChange(Math.max(1, value - 1));
  const increment = () => onChange(value + 1);

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-semibold text-slate-800 flex-1">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= 1}
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-600 text-lg font-medium
            hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          −
        </button>
        <div className="min-w-[3rem] h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white font-semibold text-sm text-slate-900 px-3">{value}</div>
        <button
          type="button"
          onClick={increment}
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-600 text-lg font-medium
            hover:bg-slate-50 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ─── Field ──────────────────────────────────────────────────────────────────── */

function Field({ label, id, error, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

/* ─── Plan Stat ──────────────────────────────────────────────────────────────── */

function PlanStat({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
