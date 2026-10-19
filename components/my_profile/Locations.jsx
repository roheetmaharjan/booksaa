import { Plus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
export default function Locations() {
  const [plans, setPlans] = useState([]);
  const selectedPlan = plans.find((plan) => plan.id === form?.planId) || form.plan || null;
  const locationLimit = Number(form?.subscriptionLocationLimit) || Number(selectedPlan?.location) || 1;
  const activeLocationCount = form.locations?.filter((location) => location.isActive !== false).length || 0;
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationForm, setLocationForm] = useState({});

  const { mutate: updateLocation, loading: savingLocation } = useMutation(selectedLocationId ? `${process.env.NEXT_PUBLIC_API_URL}/api/locations/${selectedLocationId}` : "", { method: "PATCH" });
  const locations = form.locations || [];

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        // const [categoriesRes, plansRes] = await Promise.all([fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, { cache: "no-store" }), fetch("/api/plans", { cache: "no-store" })]);
        // const [categoriesData, plansData] = await Promise.all([categoriesRes.json(), plansRes.json()]);
        // setCategories(categoriesRes.ok ? categoriesData.categories || categoriesData : []);
        setPlans(plansRes.ok ? plansData.plans || plansData : []);
      } catch {
        // setCategories([]);
        setPlans([]);
      }
    };

    fetchLookups();
  }, []);
const handleLocationChange = (event) => {
    const { name, value } = event.target;
    setLocationForm((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    setLocationForm({
      name: selectedLocation?.name || "",
      phone: selectedLocation?.phone || "",
      address: selectedLocation?.address || "",
      offerAtBusiness: selectedLocation?.offerAtBusiness ?? true,
      offerAtClient: selectedLocation?.offerAtClient ?? false,
      travelFee: selectedLocation?.travelFee ?? 0,
      maxTravelDistance: selectedLocation?.maxTravelDistance ?? 5,
      isDefault: selectedLocation?.isDefault ?? false,
      isActive: selectedLocation?.isActive ?? true,
    });
    setIsEditingLocation(false);
  }, [selectedLocation?.id]);

  const handleLocationSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLocationId) {
      toast.error("Select a location before saving.");
      return;
    }

    try {
      await updateLocation(locationForm);
      await refreshBusiness(selectedLocationId);
      setIsEditingLocation(false);
      toast.success("Location updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update location.");
    }
  };
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {activeLocationCount >= locationLimit ? (
          <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900">
            <InfoIcon className="!top-[12px] text-amber-900" />
            <AlertTitle className="mb-0">
              Your current plan only allows {locationLimit} location{locationLimit > 1 ? "s" : ""}; all slots are used.
            </AlertTitle>
          </Alert>
        ) : (
          <Button onClick={() => setOpenAddLocation(true)}>
            <Plus className="size-4" />
            Add Business Location
          </Button>
        )}
      </div>

      <div className="space-y-5">
        {selectedLocation ? (
          <form onSubmit={handleLocationSubmit}>
            <Card className="card">
              <CardHeader className="card-header">
                <CardTitle className="card-title">
                  {getLocationLabel(selectedLocation)}
                  {selectedLocation.isDefault && <Badge className="ml-2">Default</Badge>}
                </CardTitle>
                {!isEditingLocation && (
                  <Button variant="outline" onClick={() => setIsEditingLocation(true)} type="button">
                    <PenIcon />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {!isEditingLocation ? (
                  <>
                    <DetailValue label="Branch Name" value={selectedLocation.name} />
                    <DetailValue label="Phone" value={selectedLocation.phone || form.phone} />
                    <DetailValue label="Address" value={selectedLocation.address} />
                    <DetailValue label="Service Options" value={[selectedLocation.offerAtBusiness ? "At business" : "", selectedLocation.offerAtClient ? "At client's place" : ""].filter(Boolean).join(", ")} />
                    <DetailValue label="Status" value={selectedLocation.isActive ? "Active" : "Inactive"} />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="location-name">Branch Name</Label>
                        <Input id="location-name" name="name" value={locationForm.name || ""} onChange={handleLocationChange} />
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="location-phone">Branch Phone</Label>
                        <Input id="location-phone" name="phone" value={locationForm.phone || ""} onChange={handleLocationChange} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location-address">Address</Label>
                      <Textarea id="location-address" name="address" value={locationForm.address || ""} onChange={handleLocationChange} className="h-28" />
                    </div>
                  </>
                )}
              </CardContent>
              {isEditingLocation && (
                <CardFooter className="gap-2">
                  <Button type="submit" disabled={savingLocation}>
                    {savingLocation ? "Saving..." : "Save Location"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditingLocation(false)}>
                    Cancel
                  </Button>
                </CardFooter>
              )}
            </Card>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded border py-6">
            <h4 className="text-lg font-bold">No Business Location added</h4>
            <p className="text-base">You haven't added a business location yet.</p>
          </div>
        )}

        {locations.length > 0 && (
          <div>
            <h5 className="mb-3 text-base font-semibold">All locations</h5>
            <div className="grid grid-cols-12 gap-3">
              {locations.map((location) => (
                <LocationSummaryCard key={location.id} location={location} fallbackPhone={form.phone} isSelected={location.id === selectedLocationId} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
