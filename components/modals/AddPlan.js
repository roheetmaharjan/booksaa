"use client";

import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,DialogClose} from "@/components/ui/dialog";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { validateForm } from "@/utils/formValidator";

export default function AddPlans({ open, setAdd }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    trial_period: "",
    duration:"",
    billing_cycle: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const validationRules = {
    name: { required: true, message: "Plan Name is required" },
    price: { required: true, message: "Price is required" },
    duration: { required: true, message: "Duration is required" },
    trial_period: { required: true, message: "Trial period is required" },
    billing_cycle: { required: true, message: "Billing Cycle is required" },
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form, validationRules);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const res = await fetch("/api/plans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit plan");

      setAdd(false);
      setForm({
        name: "",
        price: "",
        duration:"",
        billing_cycle: "",
        trial_period: ""
      });
      setExpiryDate(new Date());
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <Dialog onOpenChange={setAdd} open={open}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader className="mb-2 pb-2">
          <DialogTitle>Add Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">
                Plan Name <span className="astrick">*</span>
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-3 gap-4">
            <div>
              <Label htmlFor="price">
                Billing Cycle <span className="astrick">*</span>
              </Label>
              <Select
                name="billing_cycle"
                value={form.billing_cycle}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, billing_cycle: value }))
                }
              >
                <SelectTrigger id="billing_cycle">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.billing_cycle && (
                <p className="text-sm text-red-500">
                  {formErrors.billing_cycle}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="price">
                Price <span className="astrick">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
              {formErrors && formErrors.price && (
                <p className="text-sm text-red-500">{formErrors.price}</p>
              )}
            </div>
            <div>
              <Label htmlFor="Duration">
                Duration <span className="astrick">*</span>
              </Label>
              <Input
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
              />
              {formErrors && formErrors.duration && (
                <p className="text-sm text-red-500">{formErrors.duration}</p>
              )}
            </div>
            <div>
              <Label htmlFor="Trial Period">
                Trial Period (Days)<span className="astrick">*</span>
              </Label>
              <Input
                id="Trial Period"
                name="trial_period"
                type="number"
                value={form.trial_period}
                onChange={handleChange}
                placeholder="14"
              />
              {formErrors && formErrors.trial_period && (
                <p className="text-sm text-red-500">
                  {formErrors.trial_period}
                </p>
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
