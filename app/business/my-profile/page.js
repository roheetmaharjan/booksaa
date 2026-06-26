"use client";

import Loading from "@/components/common/Loading";
import BusinessHours from "@/components/common/BusinessHour";
import AddLocation from "@/components/modals/AddLocation";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@/hooks/useMutation";
import { validateForm } from "@/utils/formValidator";
import { CameraIcon, InfoIcon, PenIcon } from "@phosphor-icons/react";
import { MapPin, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const emptyOwner = { firstname: "", lastname: "", email: "" };

const initialForm = {
  user: emptyOwner,
  name: "",
  phone: "",
  planId: "",
  categoryId: "",
  status: "",
  image: "",
  joinedAt: "",
  cancellation_policy: "",
  description: "",
  trialEndsAt: "",
  subscriptionLocationLimit: "",
  subscriptionProfessionalLimit: "",
  locations: [],
  businessHours: [],
};

function normalizeBusinessForm(data) {
  return {
    ...initialForm,
    ...data,
    user: {
      ...emptyOwner,
      ...(data?.user || {}),
    },
    locations: Array.isArray(data?.locations) ? data.locations : [],
    businessHours: Array.isArray(data?.businessHours) ? data.businessHours : [],
  };
}

function getLocationLabel(location) {
  return location?.name || location?.address || "Location";
}

export default function BusinessProfilePage() {
  const searchParams = useSearchParams();
  const selectedLocationFromSidebar = searchParams.get("locationId") || "";

  const [vendorId, setVendorId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "detail");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [locationForm, setLocationForm] = useState({});
  const [openAddLocation, setOpenAddLocation] = useState(false);

  const selectedLocationId = selectedLocationFromSidebar || form.selectedLocationId || form.defaultLocationId || form.locations?.[0]?.id || "";
  const selectedLocation = useMemo(
    () => form.locations?.find((location) => location.id === selectedLocationId) || form.location || form.locations?.[0] || null,
    [form.location, form.locations, selectedLocationId]
  );
  const selectedPlan = plans.find((plan) => plan.id === form?.planId) || form.plan || null;
  const locationLimit = Number(form?.subscriptionLocationLimit) || Number(selectedPlan?.location) || 1;
  const activeLocationCount = form.locations?.filter((location) => location.isActive !== false).length || 0;
  const ownerEmail = form?.user?.email || "";
  const ownerName = [form?.user?.firstname, form?.user?.lastname].filter(Boolean).join(" ") || "Not assigned";
  const selectedLocationPhone = selectedLocation?.phone || form.phone || "-";

  const { mutate: updateBusiness, loading: savingBusiness } = useMutation(vendorId ? `/api/businesses/${vendorId}` : "", { method: "PUT" });
  const { mutate: updateLocation, loading: savingLocation } = useMutation(selectedLocationId ? `/api/locations/${selectedLocationId}` : "", { method: "PATCH" });
  const locations = form.locations || [];

  const validationRules = {
    name: { required: true, message: "Business name is required" },
    categoryId: { required: true, message: "Category is required" },
  };

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "detail");
  }, [searchParams]);

  useEffect(() => {
    let isActive = true;

    const resolveCurrentVendor = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/businesses/current", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to resolve your business account.");
        if (isActive) setVendorId(data.vendorId);
      } catch (err) {
        if (isActive) {
          setVendorId(null);
          setForm(initialForm);
          setError(err.message || "Unable to resolve your business account.");
          setLoading(false);
        }
      }
    };

    resolveCurrentVendor();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [categoriesRes, plansRes] = await Promise.all([fetch("/api/categories", { cache: "no-store" }), fetch("/api/plans", { cache: "no-store" })]);
        const [categoriesData, plansData] = await Promise.all([categoriesRes.json(), plansRes.json()]);
        setCategories(categoriesRes.ok ? categoriesData.categories || categoriesData : []);
        setPlans(plansRes.ok ? plansData.plans || plansData : []);
      } catch {
        setCategories([]);
        setPlans([]);
      }
    };

    fetchLookups();
  }, []);

  const refreshBusiness = async (locationId = selectedLocationFromSidebar) => {
    if (!vendorId) return;
    const locationQuery = locationId ? `?locationId=${encodeURIComponent(locationId)}` : "";
    const res = await fetch(`/api/businesses/${encodeURIComponent(vendorId)}${locationQuery}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load business profile.");
    setForm(normalizeBusinessForm(data));
    setError("");
  };

  useEffect(() => {
    if (!vendorId) return;

    setLoading(true);
    refreshBusiness()
      .catch((err) => {
        setError(err.message || "Unable to load business profile.");
        setForm(initialForm);
      })
      .finally(() => setLoading(false));
  }, [vendorId, selectedLocationFromSidebar]);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (["firstname", "lastname"].includes(name)) {
      setForm((prev) => ({ ...prev, user: { ...(prev.user || emptyOwner), [name]: value } }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (event) => {
    const { name, value } = event.target;
    setLocationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm(form, validationRules);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await updateBusiness({
        name: form.name,
        categoryId: form.categoryId,
        description: form.description,
        cancellation_policy: form.cancellation_policy,
        user: form.user,
      });
      await refreshBusiness(selectedLocationId);
      setIsEditingDetails(false);
      toast.success("Business profile updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update business profile.");
    }
  };

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
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-row items-center justify-between gap-4">
          <h4 className="page-title">My Profile</h4>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : (
          <>
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="relative w-fit">
                {form.image ? (
                  <figure className="h-32 w-32 overflow-hidden rounded-md">
                    <img src={form.image} alt={`${form.name} image`} className="h-full w-full object-cover" />
                  </figure>
                ) : (
                  <span className="flex h-32 w-32 items-center justify-center rounded-md border border-primary bg-primary/10 text-3xl font-bold uppercase">
                    {form.name?.charAt(0) || "B"}
                  </span>
                )}
                <Button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-white p-0 shadow-none">
                  <CameraIcon />
                </Button>
              </div>

              <div className="flex-1">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-2xl font-bold">{form.name}</h4>
                    <p className="text-base text-gray-500">{ownerEmail || "-"}</p>
                  </div>
                  {selectedLocation && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="size-3.5" />
                      {getLocationLabel(selectedLocation)}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <HeaderValue label="Joined Date" value={form.joinedAt || "-"} />
                  <HeaderValue label="Trial Ends On" value={form.trialEndsAt || "-"} />
                  <HeaderValue label="Profile Completed" value={form.isComplete || form.isCompleted ? "Yes" : "No"} />
                  <HeaderValue label="Status" value={form.status || "-"} />
                  <HeaderValue label="User" value={ownerName} />
                  <HeaderValue label="Phone" value={selectedLocationPhone} />
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-2 items-start">
              <TabsList className="mb-5 flex h-auto flex-wrap">
                <TabsTrigger value="detail">Business Profile</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="businesshours">Business Hours</TabsTrigger>
                <TabsTrigger value="location">Business Location</TabsTrigger>
              </TabsList>

              <TabsContent value="detail">
                {!isEditingDetails ? (
                  <Card className="card">
                    <CardHeader className="card-header">
                      <CardTitle className="card-title">Business Details</CardTitle>
                      <Button variant="outline" onClick={() => setIsEditingDetails(true)}>
                        <PenIcon />
                        Edit
                      </Button>
                    </CardHeader>
                    <CardContent className="!card-body">
                      <DetailValue label="Business Name" value={form.name} />
                      <DetailValue label="Category" value={categories.find((category) => category.id === form.categoryId)?.name || form.category?.name} />
                      <DetailValue label="Plan" value={selectedPlan?.name} />
                      <DetailValue label="Description" value={form.description} multiline />
                      <DetailValue label="Cancellation Policy" value={form.cancellation_policy} multiline />
                    </CardContent>
                  </Card>
                ) : (
                  <form onSubmit={handleDetailSubmit}>
                    <Card>
                      <CardHeader className="card-header">
                        <CardTitle className="card-title">Business Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-5">
                        <div className="card-value">
                          <Label>
                            Business Name <span className="astrick">*</span>
                          </Label>
                          <Input name="name" value={form.name || ""} onChange={handleChange} placeholder="Business Name" />
                          {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                        </div>
                        <div className="card-value">
                          <Label>
                            Category <span className="astrick">*</span>
                          </Label>
                          <Select value={form.categoryId || ""} onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.categoryId && <p className="text-sm text-red-500">{formErrors.categoryId}</p>}
                        </div>
                        <div className="card-value">
                          <Label>Plan</Label>
                          <Input value={selectedPlan?.name || "-"} disabled />
                        </div>
                        <div className="card-value">
                          <Label>Description</Label>
                          <Textarea name="description" value={form.description || ""} onChange={handleChange} className="h-40" />
                        </div>
                        <div className="card-value">
                          <Label>Cancellation Policy</Label>
                          <Textarea name="cancellation_policy" value={form.cancellation_policy || ""} onChange={handleChange} className="h-40" />
                        </div>
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button type="submit" disabled={savingBusiness}>{savingBusiness ? "Saving..." : "Save"}</Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditingDetails(false)}>Cancel</Button>
                      </CardFooter>
                    </Card>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="photos">Coming Soon</TabsContent>
              <TabsContent value="reviews">Reviews Coming Soon</TabsContent>

              <TabsContent value="businesshours">
                <BusinessHours vendorId={form.id} locationId={selectedLocationId} initialHours={form.businessHours || []} onSaved={() => refreshBusiness(selectedLocationId)} />
              </TabsContent>

              <TabsContent value="location">
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
                            <Button type="submit" disabled={savingLocation}>{savingLocation ? "Saving..." : "Save Location"}</Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditingLocation(false)}>Cancel</Button>
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
              </TabsContent>
            </Tabs>

            <AddLocation
              open={openAddLocation}
              setAddLocationOpen={setOpenAddLocation}
              vendorId={form.id}
              vendor={form}
              onAdded={(created) => refreshBusiness(created?.id || selectedLocationId)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function HeaderValue({ label, value }) {
  return (
    <div className="col-span-6 lg:col-span-4 xl:col-span-2">
      <p className="text-muted-foreground">{label}</p>
      <p>{value || "-"}</p>
    </div>
  );
}

function DetailValue({ label, value, multiline = false }) {
  return (
    <div className="card-value">
      <Label>{label}</Label>
      <p className={multiline ? "whitespace-pre-wrap" : ""}>{value || "-"}</p>
    </div>
  );
}

function LocationSummaryCard({ location, fallbackPhone, isSelected }) {
  const serviceOptions = [location.offerAtBusiness ? "At business" : "", location.offerAtClient ? "At client's place" : ""].filter(Boolean).join(", ");

  return (
    <Card className={`col-span-12 md:col-span-6 ${isSelected ? "border-primary" : ""}`}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {getLocationLabel(location)}
          {location.isDefault && <Badge>Default</Badge>}
          {isSelected && <Badge variant="outline">Selected</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p className="text-foreground">{location.address || "-"}</p>
        <p>Phone: {location.phone || fallbackPhone || "-"}</p>
        <p>Service Options: {serviceOptions || "-"}</p>
        <p>{location.isActive ? "Active" : "Inactive"}</p>
      </CardContent>
    </Card>
  );
}
