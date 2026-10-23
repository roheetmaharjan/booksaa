"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {} from "lucide-react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Globe, Copy, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { slugifyText } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneNumberInput } from "@/components/common/PhoneNumber";

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
  { title: "Account", subtitle: "User credential" },
  { title: "Business", subtitle: "Business Name & Addesss" },
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/business-signup`);
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handlePhoneChange = (value) => {
    setForm((prev) => ({ ...prev, phone: value }));
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const checkEmailAvailability = useCallback(async () => {
    const email = form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

    try {
      setEmailChecking(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/business-signup?email=${encodeURIComponent(email)}`);
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
  const businessBaseUrl = typeof window !== "undefined" ? window.location.origin : "";

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/business-signup`, {
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
    }
  };

  return (
    <div className="w-full mx-auto max-w-[1100px] z-10 relative">
      <div className="mx-auto w-full flex flex-row rounded-2xl shadow-sm outline-offset-8 overflow-hidden outline-8 outline-slate-100/10">
        {/* ── Sidebar ── */}
        <aside className="flex flex-col bg-gray-50 min-w-[250px] p-4">
          {/* Step indicators */}
          <div className="px-3 py-5 sm:px-3">
            <div className="flex flex-col gap-6 flex-wrap items-start">
              {steps.map((item, index) => {
                const stepNumber = index + 1;
                const active = step === stepNumber;
                const complete = step > stepNumber;

                return (
                  <div key={item.title} className="flex min-w-[132px] flex-1 items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-md border ${complete ? "border-primary bg-primary text-slate-700" : active ? "border-primary bg-primary text-slate-800" : "border-slate-200 bg-white text-slate-800"}`}>{complete ? <Check className="h-4 w-4" /> : <span className="text-sm font-semibold">{stepNumber}</span>}</div>
                    <div>
                      <p className="text-xs uppercase font-semibold text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-700">{item.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
        {/* ── Main form ── */}
        <section className="min-h-[calc(100vh-200px)] w-full flex-1">
          <Card className="rounded-none h-full shadow-none">
            <CardContent className="p-0 h-full">
              <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-8 h-full">
                {loading ? (
                  <div className="flex h-80 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto w-full h-full">
                    <div className="py-3 flex flex-col w-full h-full">
                      {/* Step 1 */}
                      {step === 1 && (
                        <div className="space-y-3">
                          <div className="mb-8">
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
                            <Field label="Phone" id="phone" error={errors.email}>
                              <PhoneNumberInput id="phone" name="phone" autoComplete="tel" value={form.phone} onChange={handlePhoneChange} defaultCountry="NP" placeholder="Phone number" />

                              {/* <Input id="phone" name="phone" value={form.phone} onChange={handleChange} /> */}
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
                        <div className="space-y-3">
                          <div>
                            <h2 className="text-2xl font-bold">Business details</h2>
                            <p className="mt-1 text-sm text-slate-500">Match the admin business setup, with plan-based trial activation.</p>
                          </div>
                          <div className="grid gap-4">
                            <Field label="Business name" id="name" error={errors.name}>
                              <Input id="name" name="name" value={form.name} onChange={handleChange} />
                            </Field>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">Your business URL</label>

                              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                                <Globe className="h-4 w-4 shrink-0 text-slate-400" />

                                <>
                                  <p className="min-w-0 flex-1 break-all text-sm">
                                    <span className="text-slate-500">{businessBaseUrl}/</span>
                                    <span className="font-medium text-slate-900">{businessSlugPreview}</span>
                                  </p>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await navigator.clipboard.writeText(`${businessBaseUrl}/${businessSlugPreview}`);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                      } catch (error) {
                                        console.error("Failed to copy business URL:", error);
                                      }
                                    }}
                                    className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-slate-200"
                                    aria-label={copied ? "Copied business URL" : "Copy business URL"}
                                  >
                                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                  </button>
                                </>
                              </div>

                              <p className="text-xs text-slate-500">Customers can use this link to book your services.</p>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                        </div>
                      )}

                      {/* Step 3 */}
                      {step === 3 && (
                        <div className="space-y-3">
                          <div>
                            <h2 className="text-2xl font-bold">Primary location</h2>
                            <p className="mt-1 text-sm text-slate-500">Search your address and confirm where customers can book you.</p>
                          </div>
                          <BusinessLocation onDataChange={handleLocationChange} />
                          {(errors.location || errors.locationOption) && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.location || errors.locationOption}</div>}
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="mt-auto flex flex-row gap-3 w-full justify-between">
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
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

/* ─── Number Picker ──────────────────────────────────────────────────────────── */

// function NumberPicker({ label, value, onChange }) {
//   const decrement = () => onChange(Math.max(1, value - 1));
//   const increment = () => onChange(value + 1);

//   return (
//     <div className="flex items-center justify-between gap-4">
//       <p className="text-sm font-semibold text-slate-800 flex-1">{label}</p>
//       <div className="flex items-center gap-2">
//         <button
//           type="button"
//           onClick={decrement}
//           disabled={value <= 1}
//           className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-600 text-lg font-medium
//             hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
//         >
//           −
//         </button>
//         <div className="min-w-[3rem] h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white font-semibold text-sm text-slate-900 px-3">{value}</div>
//         <button
//           type="button"
//           onClick={increment}
//           className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-600 text-lg font-medium
//             hover:bg-slate-50 transition"
//         >
//           +
//         </button>
//       </div>
//     </div>
//   );
// }

/* ─── Field ──────────────────────────────────────────────────────────────────── */

function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">* {error}</p>}
    </div>
  );
}

/* ─── Plan Stat ──────────────────────────────────────────────────────────────── */

// function PlanStat({ label, value }) {
//   return (
//     <div>
//       <p className="text-xs uppercase text-slate-500">{label}</p>
//       <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
//     </div>
//   );
// }
