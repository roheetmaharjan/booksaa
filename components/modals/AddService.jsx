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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateForm } from "@/utils/formValidator";
import { PriceField } from "@/components/common/PriceField";
import { useFormState } from "@/hooks/useFormState";
import { useEffect, useState } from "react";

const SERVICE_COLOR_OPTIONS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#f59e0b",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#4b5563",
];

export default function AddService({ open, setAddServiceOpen,vendorId, locations = [], locationId, onAdded }) {
  const [formErrors, setFormErrors] = useState({});
  const [services,setServices] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const {
    formState: serviceForm,
    setFormState: setServiceForm,
    handleChange: handleServiceChange,
    resetForm,
  } = useFormState({
    id: "",
    name: "",
    description: "",
    color: "#2563eb",
    price: "",
    duration: "",
    locationId: locationId || "",
    prepaymentType: "pay_later",
    depositType: "percent",
    depositValue: "",
  });

  useEffect(() => {
    if (locationId) {
      setServiceForm((prev) => ({ ...prev, locationId }));
    }
  }, [locationId, setServiceForm]);
  console.log("locations is:", locations)
  const validationRules = {
    name: { required: true, message: "Service name is required" },
    price: { required: true, message: "Price is required" },
    duration: { required: true, message: "Duration is required" },
    locationId: { required: true, message: "Location is required" },
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
        body: JSON.stringify({ ...serviceForm, locationId: serviceForm.locationId || locationId, vendorId }),
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
      if(onAdded) onAdded();
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
            <div className="mb-3">
              <Label htmlFor="color">Color</Label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {SERVICE_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select ${color}`}
                    onClick={() => setServiceForm((prev) => ({ ...prev, color }))}
                    className={`h-8 w-8 rounded-full border transition ${
                      serviceForm.color === color
                        ? "border-foreground ring-2 ring-ring ring-offset-2"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <Input
                  id="color"
                  name="color"
                  type="color"
                  onChange={handleServiceChange}
                  value={serviceForm.color}
                  className="h-8 w-12 cursor-pointer p-1"
                />
              </div>
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
            <div className="mt-3 grid gap-3 rounded-md border bg-slate-50 p-3">
              <div>
                <Label>Payment rule</Label>
                <Select
                  value={serviceForm.prepaymentType}
                  onValueChange={(value) => setServiceForm((prev) => ({ ...prev, prepaymentType: value }))}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue placeholder="Select payment rule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pay_later">Pay later</SelectItem>
                    <SelectItem value="full">Full prepayment</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {serviceForm.prepaymentType === "deposit" && (
                <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
                  <div>
                    <Label>Deposit type</Label>
                    <Select
                      value={serviceForm.depositType}
                      onValueChange={(value) => setServiceForm((prev) => ({ ...prev, depositType: value }))}
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percent</SelectItem>
                        <SelectItem value="fixed">Fixed amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="depositValue">Deposit value</Label>
                    <Input
                      id="depositValue"
                      name="depositValue"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceForm.depositValue}
                      onChange={handleServiceChange}
                      placeholder={serviceForm.depositType === "fixed" ? "25.00" : "25"}
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
              )}
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
