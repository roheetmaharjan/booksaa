"use client";

import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,DialogClose} from "@/components/ui/dialog";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { validateForm } from "@/utils/formValidator";
import { toast } from "sonner"

export default function AddVendor({ open, setAddOpen }) {
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
  });

  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const validationRules = {
    firstname: { required: true, message: "First name is required" },
    lastname: { required: true, message: "Last name is required" },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Valid email is required",
    },
    name: { required: true, message: "Business name is required" },
    categoryId: { required: true, message: "Category is required" },
    planId: { required: true, message: "Plan is required" },
  };

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
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form, validationRules);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const res = await fetch("/api/vendors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.message || data?.error || "Failed to submit vendor";
        throw new Error(errorMsg);
      }

      setAddOpen(false);
      toast.success("Vendor created sucessful")
      setForm({
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
      });
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.message);
    }
  };
  if (!form) return null;

  return (
    <Dialog onOpenChange={setAddOpen} open={open}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader className="mb-2 pb-2">
          <DialogTitle>Add Vendors</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <h5 className="mb-4 text-gray-500 uppercase text-xs">Users Detail</h5>
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
                <p className="text-sm text-red-500">{formErrors.firstname}</p>
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
                <p className="text-sm text-red-500">{formErrors.lastname}</p>
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
                onChange={handleChange}
              />
              {formErrors && formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
          </div>

          {/* Vendor Details */}
          <h5 className="my-4 uppercase text-gray-500 text-xs">
            Vendor Detail
          </h5>
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
                <p className="text-sm text-red-500">{formErrors.name}</p>
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
                  setForm((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem key="No-category" value="No-Category">No categories found. Please add one to get started.</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors && formErrors.categoryId && (
                <p className="text-sm text-red-500">{formErrors.categoryId}</p>
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
                    <SelectItem key="no-plans" value="no-plans">No plans found. Please add one to get started.</SelectItem>
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
                <p className="text-sm text-red-500">{formErrors.planId}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
