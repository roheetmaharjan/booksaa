"use client";

import Loading from "@/components/common/Loading";
import BusinessHours from "@/components/common/BusinessHour";
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
import { CameraIcon } from "@phosphor-icons/react";
import { Loader2, MapPin, PenIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import PhotoUpload from "@/components/photos/PhotoUpload";
import GalleryGrid from "@/components/photos/GalleryGrid";
import { ASSET_TYPES } from "@/constants/storage";
import Payment from "@/components/settings/Payment";
import BillingUsage from "@/components/settings/BillingUsage";
import Locations, { getLocationLabel } from "@/components/settings/Locations";
import Notifications from "@/components/settings/Notifications";

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

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const selectedLocationFromSidebar = searchParams.get("locationId") || "";

  const [vendorId, setVendorId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "business-profile");
  const [formErrors, setFormErrors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const profileImageInputRef = useRef(null);

  const selectedLocationId = selectedLocationFromSidebar || form.selectedLocationId || form.defaultLocationId || form.locations?.[0]?.id || "";
  const selectedLocation = useMemo(() => form.locations?.find((location) => location.id === selectedLocationId) || form.location || form.locations?.[0] || null, [form.location, form.locations, selectedLocationId]);
  const ownerEmail = form?.user?.email || "";
  const ownerName = [form?.user?.firstname, form?.user?.lastname].filter(Boolean).join(" ") || "Not assigned";
  const selectedLocationPhone = selectedLocation?.phone || form.phone || "-";

  const { mutate: updateBusiness, loading: savingBusiness } = useMutation(vendorId ? `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${vendorId}` : "", { method: "PUT" });

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/current`, { cache: "no-store" });
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
        const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, { cache: "no-store" });
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesRes.ok ? categoriesData.categories || categoriesData : []);
      } catch {
        setCategories([]);
      }
    };

    fetchLookups();
  }, []);

  const refreshBusiness = async (locationId = selectedLocationFromSidebar) => {
    if (!vendorId) return;
    const locationQuery = locationId ? `?locationId=${encodeURIComponent(locationId)}` : "";
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${encodeURIComponent(vendorId)}${locationQuery}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load business profile.");
    setForm(normalizeBusinessForm(data));
    await resolveProfileImageUrl(data.image);
    setError("");
  };

  const resolveProfileImageUrl = async (imageKey) => {
    if (!imageKey) {
      setProfileImageUrl("");
      return;
    }

    if (!imageKey.startsWith("vendors/")) {
      setProfileImageUrl(imageKey);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ keys: [imageKey] }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load profile image.");
      }

      setProfileImageUrl(data.images?.find((image) => image.key === imageKey)?.url || "");
    } catch (err) {
      console.error("Failed to load profile image:", err);
      setProfileImageUrl("");
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingProfileImage(true);

    try {
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          type: ASSET_TYPES.BRANDING,
        }),
      });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Failed to prepare profile image upload.");
      }

      const storageResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!storageResponse.ok) {
        throw new Error("Failed to upload profile image.");
      }

      const completeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key: uploadData.key, type: ASSET_TYPES.BRANDING }),
      });
      const completeData = await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(completeData.error || "Failed to save profile image.");
      }

      setForm((current) => ({ ...current, image: uploadData.key }));
      await resolveProfileImageUrl(uploadData.key);
      window.dispatchEvent(new Event("vendor-profile-image-updated"));
      toast.success("Profile image updated.");
    } catch (err) {
      console.error("Profile image upload error:", err);
      toast.error(err.message || "Failed to update profile image.");
    } finally {
      setUploadingProfileImage(false);
    }
  };
  const refreshPhotos = async () => {
    if (!vendorId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/list?vendorId=${encodeURIComponent(vendorId)}`, { cache: "no-store" });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load photos.");
      }

      const files = data.files || [];

      if (!files.length) {
        setPhotos([]);
        return;
      }

      const viewRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ keys: files.map((file) => file.key) }),
      });
      const viewData = await viewRes.json();

      if (!viewRes.ok) {
        throw new Error(viewData.error || "Failed to load photo URLs.");
      }

      const urlsByKey = new Map((viewData.images || []).map((image) => [image.key, image.url]));
      setPhotos(files.map((file) => ({ ...file, url: urlsByKey.get(file.key) })).filter((file) => file.url));
    } catch (err) {
      console.error("Failed to load photos:", err);
    }
  };

  useEffect(() => {
    if (!vendorId) return;

    setLoading(true);
    refreshPhotos();
    refreshBusiness()
      .catch((err) => {
        setError(err.message || "Unable to load business profile.");
        setForm(initialForm);
      })
      .finally(() => setLoading(false));
  }, [vendorId, selectedLocationFromSidebar]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (["firstname", "lastname"].includes(name)) {
      setForm((prev) => ({ ...prev, user: { ...(prev.user || emptyOwner), [name]: value } }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
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

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col items-start justify-start gap-2">
          <h4 className="page-title">Settings</h4>
          <p className="text-gray-400">Manage your account settings & preferences.</p>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-2 items-start">
              <TabsList className="mb-5 flex h-auto flex-wrap items-start">
                <TabsTrigger value="business-profile">Business Profile</TabsTrigger>
                <TabsTrigger value="profile">My Profile</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="businesshours">Business Hours</TabsTrigger>
                <TabsTrigger value="locations">Business Locations</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="billing">Billing & Usage</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="business-profile">
                <form onSubmit={handleDetailSubmit}>
                  <div className="card-value">
                    <Label>
                      Business Logo <span className="astrick">*</span>
                    </Label>
                    <div className="relative w-fit">
                      {profileImageUrl ? (
                        <figure className="h-20 w-20 overflow-hidden rounded-md">
                          <img src={profileImageUrl} alt={`${form.name} image`} className="h-full w-full object-cover" />
                        </figure>
                      ) : (
                        <span className="flex h-20 w-20 items-center justify-center rounded-md border border-primary bg-primary/10 text-3xl font-bold uppercase">{form.name?.charAt(0) || "B"}</span>
                      )}
                      <Button type="button" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-white p-0 shadow-none" onClick={() => profileImageInputRef.current?.click()} disabled={uploadingProfileImage} aria-label="Change profile image" title="Change profile image">
                        {uploadingProfileImage ? <Loader2 className="size-4 animate-spin" /> : <CameraIcon />}
                      </Button>
                      <input ref={profileImageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleProfileImageChange} />
                    </div>
                  </div>
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
                    <Label>Description</Label>
                    <Textarea name="description" value={form.description || ""} onChange={handleChange} className="h-40" />
                  </div>
                  <div className="card-value">
                    <Label>Cancellation Policy</Label>
                    <Textarea name="cancellation_policy" value={form.cancellation_policy || ""} onChange={handleChange} className="h-40" />
                  </div>
                  <div className="flex flex-row gap-2">
                    <Button type="submit" disabled={savingBusiness}>
                      {savingBusiness ? "Saving..." : "Save"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditingDetails(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="profile">
                <div className="flex-1">
                  <div className="grid grid-cols-12 gap-3">
                    <HeaderValue label="Email" value={ownerEmail || "-"} />
                    <HeaderValue label="Joined Date" value={form.joinedAt || "-"} />
                    <HeaderValue label="Trial Ends On" value={form.trialEndsAt || "-"} />
                    <HeaderValue label="Profile Completed" value={form.isComplete || form.isCompleted ? "Yes" : "No"} />
                    <HeaderValue label="Status" value={form.status || "-"} />
                    <HeaderValue label="Name" value={ownerName} />
                    <HeaderValue label="Phone" value={selectedLocationPhone} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="photos">
                <div className="flex gap-2 flex-wrap justify-between mb-4">
                  <PhotoUpload onUploadComplete={refreshPhotos} />
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All photos</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <GalleryGrid photos={photos} dateFilter={dateFilter} />
              </TabsContent>

              <TabsContent value="businesshours">
                <BusinessHours vendorId={form.id} locationId={selectedLocationId} initialHours={form.businessHours || []} onSaved={() => refreshBusiness(selectedLocationId)} />
              </TabsContent>

              <TabsContent value="locations">
                <Locations form={form} selectedLocationId={selectedLocationId} refreshBusiness={refreshBusiness} />
              </TabsContent>
              <TabsContent value="payments">
                <Payment />
              </TabsContent>
              <TabsContent value="billing">
                <BillingUsage />
              </TabsContent>
              <TabsContent value="notifications">
                <Notifications />
              </TabsContent>
            </Tabs>
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
