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
import { PriceField } from "@/components/common/PriceField";
import { useFormState } from "@/hooks/useFormState";
import { useState, useEffect } from "react";
import { validateForm } from "@/utils/formValidator";

export default function EditService({
  openEdit,
  setEditServiceOpen,
  service,
  onEdited
}) {
  const [formErrors, setFormErrors] = useState({});

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
    locationId: "",
  });

  useEffect(() => {
    if (service) {
      resetForm({
        id: service.id || "",
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
        duration: service.duration || "",
        locationId: service.locationId || "",
      });
    }
  }, [service]);

  const validationRules = {
    name: { required: true, message: "Service name is required" },
    price: { required: true, message: "Price is required" },
    duration: { required: true, message: "Duration is required" },
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    // Validate form
    const errors = validateForm(serviceForm, validationRules);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Service updated successfully");
        setEditServiceOpen(false);
        if(onEdited)onEdited();
      } else {
        toast.error(data.error || "failed to update service");
      }
    } catch (error) {
      console.error("Update error", error);
      toast.error("An error occurred");
    }
  };
  return (
    <Dialog open={openEdit} onOpenChange={setEditServiceOpen}>
      <form onSubmit={handleUpdate}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <div className="mb-3">
            <Label htmlFor="name">
              Service Name <span className="astrick">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              onChange={handleServiceChange}
              value={serviceForm.name}
            />
            {formErrors && formErrors.name && (
              <p className="text-sm text-red-500">{formErrors.name}</p>
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
              <Label htmlFor="price">
                Duration <span className="astrick">*</span>
              </Label>
              <div className="flex items-center">
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  placeholder="Enter duration"
                  onChange={handleServiceChange}
                  className="rounded-r-none"
                  value={serviceForm.duration}
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
            <Button type="submit" onClick={handleUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
