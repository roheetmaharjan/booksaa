"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { validateForm } from "@/utils/formValidator";
import { useMutation } from "@/hooks/useMutation";
import { useFormState } from "@/hooks/useFormState";

export default function AddLocation({ open, setAddLocationOpen, vendorId }) {
  const [formErrors, setFormErrors] = useState({});
  const [offerAtClient, setOfferAtClient] = useState(false);
  const [offerAtBusiness, setOfferAtBusiness] = useState(false);

  const {
    formState: locationForm,
    handleChange: handleLocationChange,
    resetForm,
  } = useFormState({
    id: "",
    address: "",
    city: "",
    postal_code: "",
    latitude: "",
    longitude: "",
    offerAtBusiness: offerAtBusiness,
    offerAtClient: offerAtClient,
    serviceAreas: "",
  });

  const validationRules = {
    address: { required: true, message: "Address is required" },
    serviceAreas: { required: true, message: "Service area is required" },
    postal_code: { required: true, message: "Postal Code is required" },
    city: { required: true, message: "City is required" },
  };

  const {
    mutate: addLocation,
    loading: addLoading,
    error: addError,
  } = useMutation(`/api/locations/create`, { method: "POST" });

  const handleAddLocation = async (e) => {
    e.preventDefault();
    const errors = validateForm(locationForm, validationRules);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      await addLocation({ ...locationForm, vendorId });
      resetForm();
    } catch (err) {
      console.error("Add location error: ", err);
      toast.error(err.message);
    }
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setAddLocationOpen}>
        <form onSubmit={handleAddLocation}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Add Location</DialogTitle>
            </DialogHeader>

            {addError && (
              <Alert variant="destructive" className="flex items-center">
                <WarningDiamondIcon size={20} className="!top-[10px]" />
                <AlertTitle>{addError.message}</AlertTitle>
              </Alert>
            )}

            <div className="space-y-6">
              {/* --- Service Options --- */}
              <div className="flex flex-col space-y-3">
                <Label>Where does this business offer services?</Label>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="clientsPlace"
                    checked={offerAtClient}
                    onCheckedChange={(val) => {
                      setOfferAtClient(!!val);
                      handleLocationChange({
                        target: { name: "offerAtClient", value: !!val },
                      });
                    }}
                  />
                  <Label htmlFor="clientsPlace" className="cursor-pointer">
                    <span className="text-base font-bold mb-2 block">
                      At Client’s Place
                    </span>
                    <p className="text-xs text-muted-foreground">
                      We travel to your clients’ locations
                    </p>
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="businessPlace"
                    checked={offerAtBusiness}
                    onCheckedChange={(val) => {
                      setOfferAtBusiness(!!val);
                      handleLocationChange({
                        target: { name: "offerAtBusiness", value: !!val },
                      });
                    }}
                  />
                  <Label htmlFor="businessPlace" className="cursor-pointer">
                    <span className="text-base font-bold mb-2 block">
                      At Business Location
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Clients visit your store or office
                    </p>
                  </Label>
                </div>
              </div>

              {/* --- Client Service Areas --- */}
              {offerAtClient && (
                <div className="border p-4 rounded-lg space-y-3">
                  <Label htmlFor="serviceAreas">
                    Service Areas (comma separated or select from list)
                  </Label>
                  <Textarea
                    id="serviceAreas"
                    name="serviceAreas"
                    placeholder="e.g. Kathmandu, Lalitpur, Bhaktapur"
                    onChange={handleLocationChange}
                    value={locationForm.serviceAreas}
                  />
                  {formErrors?.serviceAreas && (
                    <p className="text-sm text-red-500">
                      {formErrors.serviceAreas}
                    </p>
                  )}
                </div>
              )}

              {/* --- Business Location Details --- */}
              {offerAtBusiness && (
                <div className="border p-4 rounded-lg space-y-3">
                  <div className="mb-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main St"
                      onChange={handleLocationChange}
                      value={locationForm.address}
                    />
                    {formErrors?.address && (
                      <p className="text-sm text-red-500">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div className="mb-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+977-9800000000"
                      onChange={handleLocationChange}
                      value={locationForm.phone}
                    />
                    {formErrors?.phone && (
                      <p className="text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="mb-2">
                    <Label htmlFor="openHours">Open Hours</Label>
                    <Input
                      id="openHours"
                      name="openHours"
                      placeholder="Mon–Fri 9AM–6PM"
                      onChange={handleLocationChange}
                      value={locationForm.openHours}
                    />
                    {formErrors?.openHours && (
                      <p className="text-sm text-red-500">
                        {formErrors.openHours}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* --- Coordinates --- */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    placeholder="27.7172"
                    onChange={handleLocationChange}
                    value={locationForm.latitude}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    placeholder="85.3240"
                    onChange={handleLocationChange}
                    value={locationForm.longitude}
                  />
                </div>
              </div>

              {/* --- Active Toggle --- */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="isActive"
                  checked={locationForm.isActive}
                  onCheckedChange={(val) =>
                    handleLocationChange({
                      target: { name: "isActive", value: !!val },
                    })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAddLocationOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {addLoading ? "Saving..." : "Save Location"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
}
