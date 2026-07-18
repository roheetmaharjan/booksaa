"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { validateForm } from "@/utils/formValidator";
import { toast } from "sonner";
import BusinessLocation from "@/components/common/BusinessLocation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddBusinessWizard({ open, setAddOpen }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    planId: "",
    categoryId: "",
    status: "",
    image: "",
    maxTravelDistance: "",
  });
  const [locationData, setLocationData] = useState({});
  const [maxDistance, setMaxDistance] = useState("");

  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [addloading, setAddLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const validationRules = {
    firstname: { required: true, message: "First name is required" },
    lastname: { required: true, message: "Last name is required" },
    email: {
      required: true,
      pattern: EMAIL_PATTERN,
      message: "Valid email is required",
    },
    name: { required: true, message: "Business name is required" },
    categoryId: { required: true, message: "Category is required" },
    planId: { required: true, message: "Plan is required" },
  };

  function validateStep() {
    const errors = {};

    const stepFields = {
      1: ["firstname", "lastname", "email"],
      2: ["name", "categoryId", "planId"],
      3: ["location"], // add other step 3 fields if needed
    };

    const fieldsToValidate = stepFields[step];

    fieldsToValidate.forEach(function (field) {
      const rule = validationRules[field];
      const value = form[field];

      if (rule) {
        if (rule.required && !value) {
          errors[field] = rule.message;
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
          errors[field] = rule.message;
        }
      }
    });

    setFormErrors(errors); // keep your state update for errors

    return Object.keys(errors).length === 0;
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.categories || data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data.plans || data);
      } catch (error) {
        console.error("failed to fetch plans: ", error);
        setPlans([]);
      }
    };
    fetchPlans();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const checkEmailAvailability = useCallback(async () => {
    const email = form.email.trim();

    if (!email || !EMAIL_PATTERN.test(email)) {
      return false;
    }

    try {
      setEmailChecking(true);
      const res = await fetch(
        `/api/auth/business-signup?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to validate email.");
      }

      if (data.exists) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Email already exists.",
        }));
        return false;
      }

      setFormErrors((prev) => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    const requiredFields = [
      "firstname",
      "lastname",
      "email",
      "name",
      "categoryId",
      "planId",
    ];
    requiredFields.forEach((field) => {
      const rule = validationRules[field];
      const value = form[field];
      if (rule && rule.required && !value) {
        errors[field] = rule.message;
      } else if (rule && rule.pattern && value && !rule.pattern.test(value)) {
        errors[field] = rule.message;
      }
    });

    if (!locationData?.locationForm?.address) {
      errors.location = "Location (address) is required";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!(await checkEmailAvailability())) return;

    try {
      setAddLoading(true);
      const payload = {
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        name: form.name,
        categoryId: form.categoryId,
        planId: form.planId,
        address: locationData?.locationForm?.address || "",
        city: locationData?.locationForm?.city || "",
        postal_code: locationData?.locationForm?.postal_code || "",
        country: locationData?.locationForm?.country || "",
        state: locationData?.locationForm?.state || "",
        latitude: locationData?.locationForm?.latitude ?? null,
        longitude: locationData?.locationForm?.longitude ?? null,
        offerAtBusiness: !!locationData?.locationForm?.offerAtBusiness,
        offerAtClient: !!locationData?.locationForm?.offerAtClient,
        travelFee: locationData?.travelFee || 0,
        maxTravelDistance: locationData?.maxDistance || null,
      };
      const res = await fetch("/api/businesses/createwizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      let data;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          `Server returned non-JSON (${res.status}): ${text.slice(0, 200)}`
        );
      }
      if (!res.ok) {
        const errorMsg =
          data?.message || data?.error || `Request failed (${res.status})`;
        throw new Error(errorMsg);
      }

      setAddOpen(false);
      toast.success("Business created sucessfully");
      setForm({
        firstname: "",
        lastname: "",
        name: "",
        email: "",
        phone: "",
        location: "",
        planId: "",
        categoryId: "",
        address: "",
        city: "",
        postal_code: "",
        state: "",
        latitude: "",
        longitude: "",
        offerAtBusiness: "",
        offerAtClient: "",
        travelFee: "",
        maxTravelDistance: "",
      });
      setLocationData({ maxTravelDistance: "" });
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.message);
    } finally {
      setAddLoading(false);
    }
  };
  const handleDataChange = useCallback((data) => {
    setLocationData(data);
  }, []);

  const nextStep = async () => {
    if (!validateStep()) return;
    if (step === 1 && !(await checkEmailAvailability())) return;
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!form) return null;

  return (
    <Dialog onOpenChange={setAddOpen} open={open} className="p-0">
      <DialogContent
        className="sm:max-w-5xl p-0"
        aria-label="Add Business Wizard"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-start flex-col">
            <div className="flex h-[calc(100vh-200px)] w-full gap-x-2">
              <div className="rounded-lg bg-gradient-to-b from-[#FFF0F5] via-[#FDE2E4] to-[#E9D5FF] flex w-[344px] shrink-0 flex-col items-start gap-y-8 px-8 py-6 lg:flex">
                <div>
                  <DialogTitle className="text-xl leading-7 font-bold">
                    Business Setup
                  </DialogTitle>
                  <p className="text-default-500 mt-1 text-base leading-6 font-medium">
                    Set up your business in just a few simple steps.
                  </p>
                </div>
                <nav
                  aria-label="Progress"
                  className="max-w-fit flex items-start"
                >
                  <ol className="flex flex-col items-start justify-center gap-y-3">
                    {["User Info", "Business Info", "Location"].map(
                      (title, idx) => (
                        <li key={idx} className="relative">
                          <div className="flex w-full max-w-full items-center">
                            <button
                              type="button"
                              title="button"
                              aria-current="step"
                              className={`group rounded-large flex w-full cursor-pointer items-center justify-center gap-4 px-3 py-2.5 ${
                                step === idx + 1 ? "active" : ""
                              }`}
                              onClick={() => setStep(idx + 1)}
                            >
                              <div className="flex h-full items-center">
                                <div className="relative">
                                  <div
                                    className={`border-2 text-lg border-primary ${
                                      step === idx + 1
                                        ? "bg-primary text-white"
                                        : "text-primary"
                                    } relative flex h-[34px] w-[34px] items-center justify-center rounded-full font-semibold`}
                                  >
                                    {idx + 1}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 text-left">
                                <div>
                                  <div className="text-base font-bold text-default-foreground transition-[color,opacity] duration-300 group-active:opacity-70">
                                    {title}
                                  </div>
                                  <div className="text-sm text-black lg:text-sm transition-[color,opacity] duration-300 group-active:opacity-70 line-clamp-2">
                                    {idx === 0 && "Enter user details"}
                                    {idx === 1 &&
                                      "Enter your business name, category, and plan"}
                                    {idx === 2 &&
                                      "Add your primary business location"}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                          {idx !==
                            ["User Info", "Business Info", "Location"].length -
                              1 && (
                            <div className="pointer-events-none absolute top-[calc(64px*var(--idx)+1)] left-3 flex h-1/2 -translate-y-1/3 items-center px-4">
                              <div className="relative h-full w-0.5 bg-primary transition-colors duration-300 after:absolute after:block after:h-0 after:w-full after:bg-(--active-border-color) after:transition-[height] after:duration-300 after:content-['']"></div>
                            </div>
                          )}
                        </li>
                      )
                    )}
                  </ol>
                </nav>
              </div>
              <div className="flex h-full w-full flex-col items-center gap-4 md:p-4 ">
                <div className="h-full w-full p-4 sm:max-w-md md:max-w-lg overflow-y-auto">
                  <div className="relative flex h-fit w-full flex-col pt-6 lg:h-full lg:justify-center lg:pt-0">
                    {/* User Details */}
                    {step === 1 && (
                      <div className="col-span-12 over">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstname">
                              First Name <span className="astrick">*</span>
                            </Label>
                            <Input
                              id="firstname"
                              name="firstname"
                              value={form.firstname}
                              onChange={handleChange}
                            />
                            {formErrors && formErrors.firstname && (
                              <p className="text-sm text-red-500">
                                {formErrors.firstname}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="lastname">
                              Last Name <span className="astrick">*</span>
                            </Label>
                            <Input
                              id="lastname"
                              name="lastname"
                              value={form.lastname}
                              onChange={handleChange}
                            />
                            {formErrors && formErrors.lastname && (
                              <p className="text-sm text-red-500">
                                {formErrors.lastname}
                              </p>
                            )}
                          </div>

                          <div className="col-span-2">
                            <Label htmlFor="email">
                              Email <span className="astrick">*</span>
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              value={form.email}
                              onBlur={checkEmailAvailability}
                              onChange={handleChange}
                            />
                            {emailChecking && (
                              <p className="text-sm text-gray-500">
                                Checking email...
                              </p>
                            )}
                            {formErrors && formErrors.email && (
                              <p className="text-sm text-red-500">
                                {formErrors.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Business Details */}
                    {step === 2 && (
                      <div className="col-span-12">
                        <div className="grid gap-4">
                          <div>
                            <Label htmlFor="name">
                              Business Name <span className="astrick">*</span>
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                            />
                            {formErrors && formErrors.name && (
                              <p className="text-sm text-red-500">
                                {formErrors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="categoryId">
                              Category <span className="astrick">*</span>
                            </Label>
                            <Select
                              id="categoryId"
                              name="categoryId"
                              value={form.categoryId}
                              onValueChange={(value) =>
                                setForm((prev) => ({
                                  ...prev,
                                  categoryId: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.length === 0 ? (
                                  <SelectItem
                                    key="No-category"
                                    value="No-Category"
                                  >
                                    No categories found. Please add one to get
                                    started.
                                  </SelectItem>
                                ) : (
                                  categories.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {formErrors && formErrors.categoryId && (
                              <p className="text-sm text-red-500">
                                {formErrors.categoryId}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="planId">
                              Plan <span className="astrick">*</span>
                            </Label>
                            <Select
                              id="planId"
                              name="planId"
                              value={form.planId}
                              onValueChange={(value) =>
                                setForm((prev) => ({ ...prev, planId: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Plans"></SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {plans.length === 0 ? (
                                  <SelectItem key="no-plans" value="no-plans">
                                    No plans found. Please add one to get
                                    started.
                                  </SelectItem>
                                ) : (
                                  plans.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                      {plan.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {formErrors && formErrors.planId && (
                              <p className="text-sm text-red-500">
                                {formErrors.planId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Location */}
                    {step === 3 && (
                      <div className="col-span-12">
                        <BusinessLocation
                          maxDistance={maxDistance}
                          onDataChange={handleDataChange}
                        />
                        {/* <pre>{JSON.stringify(locationData, null, 2)}</pre> */}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end w-full mt-4 gap-2">
                  {step > 1 && (
                    <Button variant="outline" type="button" onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                  {step < totalSteps && (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={emailChecking}
                    >
                      Next
                    </Button>
                  )}
                  {step === totalSteps && (
                    <Button type="submit" onClick={handleSubmit}>
                      {addloading ? "Loading..." : "Add Business"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
