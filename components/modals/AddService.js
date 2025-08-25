"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateForm } from "@/utils/formValidator";
import { PriceField } from "@/components/common/PriceField";
import { useFormState } from "@/hooks/useFormState";
import { useState } from "react";

export default function AddService({ open, setAddServiceOpen,vendorId }) {
  const [formErrors, setFormErrors] = useState({});
  const [services,setServices] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const {
    formState: serviceForm,
    handleChange: handleServiceChange,
    resetForm,
  } = useFormState({
    id: "",
    name: "",
    description: "",
    price: "",
    duration: "",
  });
  const validationRules = {
    serviceName: { required: true, message: "Service name is require" },
    price: { required: true, message: "Price is required" },
    duration: { required: true, message: "Duration is required" },
  };
  const handleAddService = async (e) => {
    e.preventDefault();
    const errors = validateForm(serviceForm, validationRules);
    setFormErrors(errors);
    console.log(errors);
    setLoading(true);

    try {
      const res = await fetch("/api/services/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...serviceForm, vendorId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Service creation failed");
        setLoading(false);
        return;
      }

      resetForm();
      setAddServiceOpen(false);
      toast.success("Service has been created.");

      // Refresh list
      const updated = await fetch(`"/api/vendors/${id}"`).then((res) => res.json());
      setServices(updated);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setAddServiceOpen}>
        <form onSubmit={handleAddService}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Add Service</DialogTitle>
            </DialogHeader>
            <div className="mb-3">
              <Label htmlFor="name">Service Name <span className="astrick">*</span></Label>
              <Input
                id="name"
                name="name"
                onChange={handleServiceChange}
                value={serviceForm.name}
              />
              {formErrors && formErrors.serviceName && (
                <p className="text-sm text-red-500">{formErrors.serviceName}</p>
              )}
            </div>
            <div className="mb-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                onChange={handleServiceChange}
                value={serviceForm.description}
              />
            </div>
            <div className="grid gap-2 grid-cols-12">
              <div className="col-span-6">
                <PriceField
                  onChange={handleServiceChange}
                  value={serviceForm.price}
                />
                {formErrors && formErrors.price && (
                  <p className="text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>
              <div className="col-span-6">
                <Label htmlFor="price">Duration <span className="astrick">*</span></Label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    id="duration"
                    name="duration"
                    value={serviceForm.duration}
                    placeholder="Enter duration"
                    onChange={handleServiceChange}
                    className="rounded-r-none"
                  />
                  <span className="px-3 py-[7px] bg-muted text-muted-foreground rounded-r-md border border-l-0">
                    min
                  </span>
                </div>
                {formErrors && formErrors.duration && (
                  <p className="text-sm text-red-500">{formErrors.duration}</p>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="secondary">Cancel</Button>
              <Button type="submit" onClick={handleAddService}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
}
