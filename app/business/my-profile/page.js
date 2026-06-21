"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, CalendarClock, CheckCircle2, Clock3, MapPin, Plus, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import AddService from "@/components/modals/AddService";
import AddProfessional from "@/components/modals/AddProfessional";
import AddLocation from "@/components/modals/AddLocation";
import AddProfessionalAddon from "@/components/modals/AddProfessionalAddon";
import BusinessHours from "@/components/common/BusinessHour";
import { ActionTile, DashboardMetric, DetailCard, SetupCard, SummaryItem } from "@/components/components_vendor/VendorDashboardCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function BusinessProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vendorId, setVendorId] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [openAddService, setOpenAddService] = useState(false);
  const [openAddProfessional, setOpenAddProfessional] = useState(false);
  const [openAddLocation, setOpenAddLocation] = useState(false);
  const [openAddAddon, setOpenAddAddon] = useState(false);
  const [addonType, setAddonType] = useState("professional");
  const [openBusinessHours, setOpenBusinessHours] = useState(false);

  const locations = vendor?.locations || [];
  const activeLocationCount = locations.filter((location) => location.isActive !== false).length;
  const serviceCount = vendor?.services?.length || 0;
  const subscriptionLocationLimit = Number(vendor?.subscriptionLocationLimit ?? vendor?.billingSummary?.activeLocationCount ?? vendor?.plan?.location ?? 0);
  const subscriptionProfessionalLimit = Number(vendor?.subscriptionProfessionalLimit ?? vendor?.billingSummary?.professionalCount ?? vendor?.plan?.professional ?? 0);
  const professionalCount = Number(vendor?.billingSummary?.actualProfessionalCount ?? vendor?.professionals?.length ?? 0);
  const canAddProfessional = Boolean(vendorId) && professionalCount < subscriptionProfessionalLimit;
  const canAddLocation = Boolean(vendorId) && activeLocationCount < subscriptionLocationLimit;
  // const hasReachedProfessionalLimit = Boolean(vendorId) && subscriptionProfessionalLimit > 0 && !canAddProfessional;
  // const hasReachedLocationLimit = Boolean(vendorId) && subscriptionLocationLimit > 0 && !canAddLocation;
  const ownerName = [vendor?.user?.firstname, vendor?.user?.lastname].filter(Boolean).join(" ") || "Not assigned";
  // const selectedLocation = vendor?.selectedLocation || vendor?.location || locations[0];

  useEffect(() => {
    const setupStep = searchParams.get("setup");
    let isActive = true;

    const resolveCurrentVendor = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/businesses/current", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to resolve your business account.");
        }

        if (isActive) {
          setVendorId(data.vendorId);
          window.localStorage.removeItem("booksaa_vendorId");
        }
      } catch (err) {
        if (isActive) {
          setVendorId(null);
          setVendor(null);
          setError(err.message || "Unable to resolve your business account.");
          setLoading(false);
        }
      }
    };

    resolveCurrentVendor();

    setShowSetupModal(setupStep === "step4");

    return () => {
      isActive = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    const fetchVendor = async () => {
      setLoading(true);
      try {
        const locationId = searchParams.get("locationId");
        const url = locationId ? `/api/businesses/${encodeURIComponent(vendorId)}?locationId=${encodeURIComponent(locationId)}` : `/api/businesses/${encodeURIComponent(vendorId)}`;
        const res = await fetch(url, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to load vendor details.");
        }
        setVendor(data);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load vendor details.");
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId, searchParams]);

  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      try {
        const res = await fetch("/api/professional-roles", {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to load roles.");
        }
        setRoles(Array.isArray(data) ? data : []);
        setRolesError("");
      } catch (err) {
        setRolesError(err.message || "Unable to load roles.");
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSkipSetup = () => {
    setShowSetupModal(false);
    router.replace("/business");
  };

  const refreshVendor = async () => {
    if (!vendorId) return;
    try {
      const locationId = searchParams.get("locationId");
      const url = locationId ? `/api/businesses/${encodeURIComponent(vendorId)}?locationId=${encodeURIComponent(locationId)}` : `/api/businesses/${encodeURIComponent(vendorId)}`;
      const res = await fetch(url, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setVendor(data);
      }
    } catch {
      // Keep the current dashboard state if a background refresh fails.
    }
  };

  const openUsageBilling = () => {
    document.getElementById("usage-billing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openAddon = (type = "professional") => {
    setAddonType(type);
    setOpenAddAddon(true);
    openUsageBilling();
  };

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">Loading your business details...</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : vendor ? (
          <>
            <section className="grid gap-6 grid-cols-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <CardTitle className="card-title mb-2">Personal Info</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="card-items">
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Status</label>
                    <div className="card-item-value">
                      <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="mr-1 size-3.5" />
                        {vendor.status || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Owner Name</label>
                    <div className="card-item-value">
                      {ownerName}
                    </div>
                  </div>
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Category</label>
                    <div className="card-item-value">
                      {vendor.category?.name || "-"}
                    </div>
                  </div>
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Owner Email</label>
                    <div className="card-item-value">
                      {vendor.user?.email || "-"}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <CardTitle className="card-title mb-2">Business Info</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="card-items">
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Business Name</label>
                    <div className="card-item-value">
                      {vendor.name}
                    </div>
                  </div>
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Plan</label>
                    <div className="card-item-value">
                      {vendor.plan?.name || "-"}
                    </div>
                  </div>
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Locations</label>
                    <div className="card-item-value">
                      {`${activeLocationCount} active`}
                    </div>
                  </div>
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Services</label>
                    <div className="card-item-value">
                      {`${serviceCount} total`} 
                    </div>
                  </div>
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Professionals</label>
                    <div className="card-item-value">
                      {`${professionalCount} total`}
                    </div>
                  </div>
                  <div className="card-item">
                    <label htmlFor="" className="card-item-label">Joined</label>
                    <div className="card-item-value">
                      {vendor.joinedAt || "-"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        ) : (
          <div className="">No vendor data is available. Please sign in again or contact support.</div>
        )}
      </div>

      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Finish your setup</DialogTitle>
            <p className="mt-2 text-sm text-slate-600">Set up your first service, professional, and business hours now. You can skip this and continue later.</p>
          </DialogHeader>
          <div className="grid gap-4 py-6 md:grid-cols-3">
            <SetupCard
              icon={<Sparkles className="size-5 text-emerald-700" />}
              title="Add service"
              description="Create your first bookable offering."
              onClick={() => {
                setShowSetupModal(false);
                setOpenAddService(true);
              }}
            />
            <SetupCard
              icon={<Users className="size-5 text-slate-700" />}
              title="Add professional"
              description={canAddProfessional ? "Invite a team member to your business." : "All professional slots are used."}
              onClick={() => {
                setShowSetupModal(false);
                if (canAddProfessional) {
                  setOpenAddProfessional(true);
                } else {
                  openUsageBilling();
                }
              }}
            />
            <SetupCard
              icon={<Clock3 className="size-5 text-slate-700" />}
              title="Business hours"
              description="Define the hours your business is available."
              onClick={() => {
                setShowSetupModal(false);
                setOpenBusinessHours(true);
              }}
            />
          </div>
          <DialogFooter className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={handleSkipSetup}>
              Skip for now
            </Button>
            <Button onClick={handleSkipSetup}>Continue to dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddService
        open={openAddService}
        setAddServiceOpen={setOpenAddService}
        vendorId={vendorId}
        locations={locations}
        locationId={vendor?.selectedLocationId || locations[0]?.id}
        onAdded={() => {
          refreshVendor();
          toast.success("Service added successfully.");
        }}
      />

      <AddProfessional
        open={openAddProfessional}
        setAddProfessionalOpen={setOpenAddProfessional}
        vendorId={vendorId}
        locationId={vendor?.selectedLocationId || locations[0]?.id}
        vendor={vendor}
        roles={roles}
        loading={rolesLoading}
        error={rolesError}
        onAdded={() => {
          refreshVendor();
          toast.success("Professional added successfully.");
        }}
      />

      <AddLocation
        open={openAddLocation}
        setAddLocationOpen={setOpenAddLocation}
        vendorId={vendorId}
        vendor={vendor}
        onAdded={() => {
          refreshVendor();
          toast.success("Location added successfully.");
        }}
      />

      <AddProfessionalAddon open={openAddAddon} setAddProfessionalAddonOpen={setOpenAddAddon} type={addonType} />

      <Dialog open={openBusinessHours} onOpenChange={setOpenBusinessHours}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Business hours</DialogTitle>
          </DialogHeader>
          <BusinessHours
            vendorId={vendorId}
            locationId={vendor?.selectedLocationId || locations[0]?.id}
            initialHours={vendor?.businessHours || []}
            onSaved={() => {
              refreshVendor();
              toast.success("Business hours saved.");
            }}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenBusinessHours(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
