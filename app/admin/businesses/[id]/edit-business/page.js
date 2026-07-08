"use client";
import { UsersLayout } from "@/app/admin/layout";
import Loading from "@/components/common/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateForm } from "@/utils/formValidator";
import { slugify } from "@/utils/slugify";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Select, SelectTrigger, SelectValue, SelectGroup, SelectContent, SelectItem } from "@/components/ui/select";
import ServiceList from "@/components/common/ServiceList";
import ProfessionalList from "@/components/common/ProfessionalList";
import BusinessHours from "@/components/common/BusinessHour";
import UsageAndBilling from "@/components/common/UsageAndBilling";
import AddLocation from "@/components/modals/AddLocation";
import AddProfessional from "@/components/modals/AddProfessional";
import AddProfessionalAddon from "@/components/modals/AddProfessionalAddon";
import { CameraIcon, InfoIcon, PenIcon } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const emptyOwner = { firstname: "", lastname: "", email: "" };

const initialForm = {
  user: emptyOwner,
  name: "",
  phone: "",
  location: "",
  planId: "",
  categoryId: "",
  status: "",
  image: "",
  joinedAt: "",
  cancellation_policy: "",
  trialEndsAt: "",
  subscriptionLocationLimit: "",
  subscriptionProfessionalLimit: "",
};

function normalizeBusinessForm(data) {
  return {
    ...initialForm,
    ...data,
    user: {
      ...emptyOwner,
      ...(data?.user || {}),
    },
  };
}

export default function EditVendor() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "detail");
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [roles, setRoles] = useState([]); // ← added
  const [rolesLoading, setRolesLoading] = useState(false); // ← added
  const [openAddLocation, setAddLocationOpen] = useState(false);
  const [openAddProfessional, setAddProfessionalOpen] = useState(false);
  const [openAddProfessionalAddon, setAddProfessionalAddonOpen] = useState(false);
  const [addonType, setAddonType] = useState("professional");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const selectedPlan = plans.find((p) => p.id === form?.planId) || null;

  const slugPreview = useMemo(() => slugify(form?.name || ""), [form?.name]);
 
  // Derived limits — fall back to plan if subscription column is empty
  const locationLimit = Number(form?.subscriptionLocationLimit) || Number(selectedPlan?.location) || 1;
  const professionalLimit = Number(form?.subscriptionProfessionalLimit) || Number(selectedPlan?.professional) || 1;

  const displayLocations = (() => {
    if (!form?.locations) return [];
    if (locationLimit === 1) {
      const def = form.locations.find((l) => l.isDefault);
      return def ? [def] : [form.locations[0]];
    }
    return form.locations;
  })();

  const validationRules = {
    name: { required: true, message: "Business name is required" },
    categoryId: { required: true, message: "Category is required" },
    planId: { required: true, message: "Plan is required" },
  };

  // ── Sync active tab from URL ────────────────────────────────────────────────
  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "detail");
  }, [searchParams]);

  // ── Fetch categories, plans, roles ─────────────────────────────────────────
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
        console.error("Failed to fetch plans:", error);
        setPlans([]);
      }
    };

    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const res = await fetch("/api/professional-roles");
        if (!res.ok) throw new Error("Failed to fetch roles");
        const data = await res.json();
        setRoles(data.roles || data);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchCategories();
    fetchPlans();
    fetchRoles();
  }, []);

  // ── Fetch business ─────────────────────────────────────────────────────────
  useEffect(() => {
    const url = selectedLocationId ? `/api/businesses/${id}?locationId=${selectedLocationId}` : `/api/businesses/${id}`;

    setLoading(true);
    fetch(url)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch business");
        return data;
      })
      .then((data) => {
        setForm(normalizeBusinessForm(data));
        if (data?.selectedLocationId && !selectedLocationId) {
          setSelectedLocationId(data.selectedLocationId);
        }
        setLoading(false);
      })
      .catch((err) => {
        setForm(null);
        setLoading(false);
        toast.error(err.message);
      });
  }, [id, selectedLocationId]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const refreshBusiness = (locationId = selectedLocationId) => {
    fetch(`/api/businesses/${form.id}?locationId=${locationId}`)
      .then((res) => res.json())
      .then((data) => setForm(normalizeBusinessForm(data)));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["firstname", "lastname"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        user: { ...(prev.user || emptyOwner), [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResend = async (vendorId) => {
    try {
      const res = await fetch("/api/resend-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend activation link");
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleDetailSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm(form, validationRules);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const res = await fetch(`/api/businesses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Business updated successfully!");

      // Switch back to view mode
      setIsEditing(false);
    } else {
      toast.error("Failed to update business");
    }
  };

  const ownerEmail = form?.user?.email || "";

  return (
    <UsersLayout>
      <div className="flex flex-row justify-between w-full items-center mb-4">
        <h4 className="page-title">Edit Business</h4>
      </div>

      {loading ? (
        <Loading />
      ) : !form ? (
        <div>Business not found</div>
      ) : (
        <>
          {/* ── Header ── */}
          <div className="flex gap-5 items-center mb-7 justify-start">
            <div className="relative">
              {form.image ? (
                <figure className="w-32 h-32 object-cover rounded-md">
                  <img src={form.image} alt={`${form.name} Image`} className="h-10 w-10 object-cover rounded" />
                </figure>
              ) : (
                <span className="w-32 h-32 bg-primary/10 uppercase flex items-center justify-center rounded-md text-3xl font-bold border border-primary">{form.name?.charAt(0)}</span>
              )}
              <Button className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center shadow-none p-0 rounded-full border-2 border-white hover:shadow-lg">
                <CameraIcon />
              </Button>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-row flex-wrap">
                <div className="flex flex-col gap-1 flex-1">
                  <h4 className="text-2xl font-bold">{form.name}</h4>
                  <p className="text-base text-gray-500">{ownerEmail || "-"}</p>
                </div>
                <div>
                  <div className="ml-auto flex justify-end gap-2 flex-wrap">
                    {form.locations?.length > 0 && (
                      <div className="mb-5 max-w-lg">
                        <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {form.locations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name || location.address}
                                {location.isDefault ? " (Default)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button onClick={() => handleResend(form.id)}>Send Activation Link</Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6 lg:col-span-4 xl:col-span-2">
                  <p className="text-muted-foreground">Joined Date</p>
                  <p>{form.joinedAt || ""}</p>
                </div>
                <div className="col-span-6 lg:col-span-4 xl:col-span-2">
                  <p className="text-muted-foreground">Trial Ends On</p>
                  <p>{form.trialEndsAt || ""}</p>
                </div>
                <div className="col-span-6 lg:col-span-4 xl:col-span-2">
                  <p className="text-muted-foreground">Profile Completed</p>
                  <p>{form.isCompleted ? "Yes" : "No"}</p>
                </div>
                <div className="col-span-6 lg:col-span-4 xl:col-span-2">
                  <p className="text-muted-foreground">Status</p>
                  {form.status === "ACTIVE" && <Badge className="text-green-700 bg-green-200 hover:bg-green-200 uppercase text-[10px]">Active</Badge>}
                  {form.status === "TRIAL_ACTIVE" && <Badge className="text-blue-700 bg-blue-100 hover:bg-blue-200 uppercase text-[10px]">Trial Active</Badge>}
                  {form.status === "TRIAL_EXPIRING" && <Badge className="text-red-700 bg-red-200 hover:bg-red-200 uppercase text-[10px]">Trial Expiring</Badge>}
                  {form.status === "TRIAL_EXPIRED" && <Badge className="text-red-500 bg-red-200 hover:bg-red-300 uppercase text-[10px]">Trial Expired</Badge>}
                  {form.status === "INACTIVE" && <Badge className="text-white bg-gray-500 hover:bg-gray-700 uppercase text-[10px]">Inactive</Badge>}
                </div>
                <div className="col-span-6 lg:col-span-4 xl:col-span-2">
                  <p className="text-muted-foreground">User</p>
                  <p>
                    {form.user?.firstname || ""} {form.user?.lastname || ""}
                  </p>
                </div>
                <div className="col-span-6 lg:col-span-4 xl:col-span-2">
                  <p className="text-muted-foreground">Phone</p>
                  <p>{form.locations?.find((l) => l.id === selectedLocationId)?.phone || form.phone || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-2 items-start">
            <TabsList className="mb-5">
              <TabsTrigger value="detail">Business Profile</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="professionals">Professionals</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="businesshours">Business Hours</TabsTrigger>
              <TabsTrigger value="location">Business Location</TabsTrigger>
              <TabsTrigger value="usage">Usage & Add-ons</TabsTrigger>
            </TabsList>

            {/* Detail */}
            <TabsContent value="detail">
              {!isEditing ? (
                <Card className="card">
                  <CardHeader className="card-header">
                    <CardTitle className="card-title">Business Details</CardTitle>

                    {!isEditing && (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <PenIcon />
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="!card-body">
                    <div className="card-value">
                      <Label>Business Name</Label>
                      <p>{form.name || "-"}</p>
                    </div>
                    <div className="card-value">
                      <Label>Category</Label>
                      <p>{categories.find((c) => c.id === form.categoryId)?.name || "-"}</p>
                    </div>
                    <div className="card-value">
                      <Label>Plan</Label>
                      <p>{plans.find((p) => p.id === form.planId)?.name || "-"}</p>
                    </div>
                    <div className="card-value">
                      <Label>Description</Label>
                      <p className="whitespace-pre-wrap">{form.description || "-"}</p>
                    </div>
                    <div className="card-value">
                      <Label>Cancellation Policy</Label>
                      <p className="whitespace-pre-wrap">{form.cancellation_policy || "-"}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleDetailSubmit}>
                  <Card>
                    <CardHeader className="card-header">
                      <CardTitle className="card-title">Business Details</CardTitle>

                      {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <PenIcon />
                          Edit
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-5">
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
                        <Select value={form.categoryId} onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.length === 0 ? (
                              <SelectItem value="no-category">No categories found.</SelectItem>
                            ) : (
                              categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {formErrors.categoryId && <p className="text-sm text-red-500">{formErrors.categoryId}</p>}
                      </div>
                      <div className="card-value">
                        <Label>
                          Plan <span className="astrick">*</span>
                        </Label>
                        <Select value={form.planId} onValueChange={(value) => setForm((prev) => ({ ...prev, planId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {plans.length === 0 ? (
                              <SelectItem value="no-plans">No plans found.</SelectItem>
                            ) : (
                              plans.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {formErrors.planId && <p className="text-sm text-red-500">{formErrors.planId}</p>}
                      </div>
                      <div className="card-value">
                        <Label>Description</Label>
                        <Textarea name="description" value={form.description || ""} onChange={handleChange} className="h-56" />
                      </div>
                      <div className="card-value">
                        <Label>Cancellation Policy</Label>
                        <Textarea name="cancellation_policy" value={form.cancellation_policy || ""} onChange={handleChange} className="h-56" />
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button type="submit">Save</Button>

                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              )}
            </TabsContent>

            {/* Services */}
            <TabsContent value="services">
              <ServiceList vendorId={form.id} locationId={selectedLocationId} />
            </TabsContent>

            {/* Location */}
            <TabsContent value="location">
              <div className="flex flex-wrap flex-row gap-3 items-center mb-3">
                {displayLocations.length >= locationLimit ? (
                  <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900">
                    <InfoIcon className="text-amber-900 !top-[12px]" />
                    <AlertTitle className="mb-0">
                      Your current plan only allows {locationLimit} location{locationLimit > 1 ? "s" : ""}; all slots are used.
                    </AlertTitle>
                  </Alert>
                ) : (
                  <Button onClick={() => setAddLocationOpen(true)}>Add Business Location</Button>
                )}
              </div>
              <div className="space-y-4">
                {displayLocations.length > 0 ? (
                  <div className="grid grid-cols-12 gap-3">
                    {displayLocations.map((location) => (
                      <Card key={location.id} className="col-span-12 md:col-span-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {location.name || "Location"}
                            {location.isDefault && <Badge>Default</Badge>}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm text-muted-foreground">
                          <p className="text-foreground">{location.address}</p>
                          <p>Phone: {location.phone || "-"}</p>
                          <p>{location.isActive ? "Active" : "Inactive"}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2 flex-col border rounded py-6 justify-center items-center">
                    <h4 className="font-bold text-lg">No Business Location added</h4>
                    <p className="text-base">You haven't added a business location yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Business Hours */}
            <TabsContent value="businesshours">
              <BusinessHours vendorId={form.id} locationId={selectedLocationId} initialHours={form.businessHours || []} onSaved={() => refreshBusiness()} />
            </TabsContent>

            {/* Professionals */}
            <TabsContent value="professionals">
              <ProfessionalList vendorId={form.id} locationId={selectedLocationId} />
            </TabsContent>

            <TabsContent value="photos">Coming Soon</TabsContent>
            <TabsContent value="reviews">Reviews Coming Soon</TabsContent>

            {/* Usage & Add-ons */}
            <TabsContent value="usage">
              <UsageAndBilling
                business={{ ...form, locations: displayLocations }}
                plan={selectedPlan}
                onAddProfessionals={() => {
                  setAddonType("professional");
                  setAddProfessionalAddonOpen(true);
                }}
                onAddLocations={
                  displayLocations.length >= locationLimit
                    ? () => {
                        setAddonType("location");
                        setAddProfessionalAddonOpen(true);
                      }
                    : null
                }
              />
            </TabsContent>
          </Tabs>

          {/* ── Modals ── */}
          {openAddProfessionalAddon && <AddProfessionalAddon open={openAddProfessionalAddon} setAddProfessionalAddonOpen={setAddProfessionalAddonOpen} type={addonType} />}

          {openAddProfessional && <AddProfessional open={openAddProfessional} setAddProfessionalOpen={setAddProfessionalOpen} vendorId={form.id} locationId={selectedLocationId} vendor={form} roles={roles} rolesLoading={rolesLoading} onRoleAdded={(role) => setRoles((prev) => [...prev, role])} onAdded={() => refreshBusiness()} />}

          {openAddLocation && (
            <AddLocation
              open={openAddLocation}
              setAddLocationOpen={setAddLocationOpen}
              vendorId={form.id}
              vendor={form}
              onAdded={(created) => {
                const newLocationId = created?.id || selectedLocationId;
                setSelectedLocationId(newLocationId);
                refreshBusiness(newLocationId);
              }}
            />
          )}
        </>
      )}
    </UsersLayout>
  );
}
