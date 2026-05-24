"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BusinessLocation = dynamic(
  () => import("@/components/common/BusinessLocation"),
  { ssr: false },
);

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

export default function BusinessSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [locationData, setLocationData] = useState({});
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    async function loadOptions() {
      try {
        const optionsRes = await fetch("/api/auth/business-signup");

        if (!optionsRes.ok) {
          throw new Error("Unable to load signup options.");
        }

        const options = await optionsRes.json();

        const nextCategories = options.categories || [];
        const nextPlans = options.plans || [];
        const requestedPlan = new URLSearchParams(window.location.search).get(
          "planId",
        );

        setCategories(nextCategories);
        setPlans(nextPlans);
        setForm((prev) => ({
          ...prev,
          planId:
            requestedPlan && nextPlans.some((plan) => plan.id === requestedPlan)
              ? requestedPlan
              : nextPlans[0]?.id || "",
        }));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === form.planId),
    [plans, form.planId],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const checkEmailAvailability = useCallback(async () => {
    const email = form.email.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return false;
    }

    try {
      setEmailChecking(true);
      const res = await fetch(
        `/api/auth/business-signup?email=${encodeURIComponent(email)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to validate email.");
      }

      if (data.exists) {
        setErrors((prev) => ({
          ...prev,
          email: "Email already exists.",
        }));
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        nextErrors.email = "Enter a valid email address.";
      }
      if (form.password.length < 8) {
        nextErrors.password = "Use at least 8 characters.";
      }
      if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    if (targetStep === 2) {
      if (!form.name.trim()) nextErrors.name = "Business name is required.";
      if (!form.categoryId) nextErrors.categoryId = "Choose a category.";
      if (!form.planId) nextErrors.planId = "Choose a plan.";
    }

    if (targetStep === 3) {
      const locationForm = locationData?.locationForm || {};
      if (
        !locationForm.address ||
        !locationForm.city ||
        !locationForm.postal_code ||
        !locationForm.country ||
        !locationForm.state
      ) {
        nextErrors.location = "Search and confirm your full business location.";
      }
      if (!locationForm.offerAtBusiness && !locationForm.offerAtClient) {
        nextErrors.locationOption = "Select where you offer services.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = async () => {
    if (!validateStep(step)) return;
    if (step === 1 && !(await checkEmailAvailability())) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const previousStep = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;
    if (!(await checkEmailAvailability())) {
      setStep(1);
      return;
    }

    const locationForm = locationData.locationForm;
    const payload = {
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      name: form.name.trim(),
      categoryId: form.categoryId,
      planId: form.planId,
      address: locationForm.address,
      city: locationForm.city,
      postal_code: locationForm.postal_code,
      country: locationForm.country,
      state: locationForm.state,
      latitude: locationForm.latitude || null,
      longitude: locationForm.longitude || null,
      offerAtBusiness: !!locationForm.offerAtBusiness,
      offerAtClient: !!locationForm.offerAtClient,
      travelFee: locationData.travelFee || 0,
      maxTravelDistance: locationData.maxDistance || 5,
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/business-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to create business account.");
      }

      toast.success("Your trial is active. Welcome to Booksaa.");
      router.push("/vendor");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="hidden border-r bg-white px-10 py-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/business-pro" className="inline-flex items-center gap-2 text-sm text-slate-600">
              <ArrowLeft className="h-4 w-4" />
              Business Pro
            </Link>
            <div className="mt-16 max-w-md">
              <Badge className="mb-5 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                Free trial signup
              </Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-normal">
                Start accepting bookings with your own business account.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Create your owner profile, choose the plan that fits your team, and activate the trial period configured in Booksaa.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                <Sparkles className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-semibold">Trial activates instantly</p>
                <p className="text-sm text-slate-500">
                  {selectedPlan?.trial_period
                    ? `${selectedPlan.trial_period} days on ${selectedPlan.name}`
                    : "Based on your selected plan"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                <LockKeyhole className="h-5 w-5 text-slate-700" />
              </div>
              <p className="text-sm text-slate-600">
                Your owner login is created during signup, so there is no invite step.
              </p>
            </div>
          </div>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/business-pro" className="inline-flex items-center gap-2 text-sm text-slate-600">
              <ArrowLeft className="h-4 w-4" />
              Business Pro
            </Link>
            <Badge variant="secondary">Free trial</Badge>
          </div>

          <Card className="mx-auto max-w-3xl rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <div className="border-b px-5 py-5 sm:px-8">
                <div className="flex flex-wrap items-center gap-3">
                  {steps.map((item, index) => {
                    const StepIcon = item.icon;
                    const stepNumber = index + 1;
                    const active = step === stepNumber;
                    const complete = step > stepNumber;

                    return (
                      <div
                        key={item.title}
                        className="flex min-w-[132px] flex-1 items-center gap-3"
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-md border ${
                            complete
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : active
                                ? "border-slate-950 bg-slate-950 text-white"
                                : "border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          {complete ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                        </div>
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
                    {step === 1 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-2xl font-bold">Owner account</h2>
                          <p className="mt-1 text-sm text-slate-500">
                            These details become your business owner login.
                          </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="First name" id="firstname" error={errors.firstname}>
                            <Input id="firstname" name="firstname" value={form.firstname} onChange={handleChange} />
                          </Field>
                          <Field label="Last name" id="lastname" error={errors.lastname}>
                            <Input id="lastname" name="lastname" value={form.lastname} onChange={handleChange} />
                          </Field>
                          <Field label="Email" id="email" error={errors.email}>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={form.email}
                              onBlur={checkEmailAvailability}
                              onChange={handleChange}
                            />
                            {emailChecking && (
                              <p className="text-sm text-slate-500">
                                Checking email...
                              </p>
                            )}
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

                    {step === 2 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-2xl font-bold">Business details</h2>
                          <p className="mt-1 text-sm text-slate-500">
                            Match the admin business setup, with plan-based trial activation.
                          </p>
                        </div>
                        <div className="grid gap-4">
                          <Field label="Business name" id="name" error={errors.name}>
                            <Input id="name" name="name" value={form.name} onChange={handleChange} />
                          </Field>
                          <Field label="Category" id="categoryId" error={errors.categoryId}>
                            <Select
                              value={form.categoryId}
                              onValueChange={(value) =>
                                setForm((prev) => ({ ...prev, categoryId: value }))
                              }
                            >
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
                            <Select
                              value={form.planId}
                              onValueChange={(value) =>
                                setForm((prev) => ({ ...prev, planId: value }))
                              }
                            >
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

                        {selectedPlan && (
                          <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 sm:grid-cols-3">
                            <PlanStat label="Price" value={`$${selectedPlan.price}`} />
                            <PlanStat label="Trial" value={`${selectedPlan.trial_period || 0} days`} />
                            <PlanStat label="Team" value={`${selectedPlan.professional || 1} professional`} />
                          </div>
                        )}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-2xl font-bold">Primary location</h2>
                          <p className="mt-1 text-sm text-slate-500">
                            Search your address and confirm where customers can book you.
                          </p>
                        </div>
                        <BusinessLocation onDataChange={handleLocationChange} />
                        {(errors.location || errors.locationOption) && (
                          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errors.location || errors.locationOption}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        disabled={step === 1 || submitting}
                      >
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
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
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

function Field({ label, id, error, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function PlanStat({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
