"use client";

import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,DialogClose} from "@/components/ui/dialog";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { validateForm } from "@/utils/formValidator";

export default function AddPlans({ open, setAddOpen }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    expiry_date: "",
    trial_period: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const validationRules = {
    name: { required: true, message: "Plan Name is required" },
    price: { required: true, message: "Price is required" },
    expiry_date: { required: true, message: "Expiry date is required" },
    trial_period: { required: true, message: "Trial period is required" }
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
      if (!res.ok) throw new Error("Failed to submit vendor");

      setAddOpen(false);
      setForm({
        name: "",
        price: "",
        expiry_date: "",
        trial_period: ""
      });
    } catch (err) {
      console.error("Submission error:", err);
    }
  };
  if (!form) return null;

  return (
    <Dialog onOpenChange={setAddOpen} open={open}>
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

            <div>
              <Label htmlFor="Expiry date">
                Price <span className="astrick">*</span>
              </Label>
              {formErrors && formErrors.price && (
                <p className="text-sm text-red-500">{formErrors.price}</p>
              )}
            </div>
            <div>
              <Label htmlFor="Expiry date">
                Expiry date <span className="astrick">*</span>
              </Label>
              {formErrors && formErrors.expiry_date && (
                <p className="text-sm text-red-500">{formErrors.expiry_date}</p>
              )}
            </div>
            <div>
              <Label htmlFor="Expiry date">
                Trial Period <span className="astrick">*</span>
              </Label>
              {formErrors && formErrors.trial_period && (
                <p className="text-sm text-red-500">{formErrors.trial_period}</p>
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
