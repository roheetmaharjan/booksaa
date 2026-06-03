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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function VendorPage() {
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
  const hasReachedProfessionalLimit = Boolean(vendorId) && subscriptionProfessionalLimit > 0 && !canAddProfessional;
  const hasReachedLocationLimit = Boolean(vendorId) && subscriptionLocationLimit > 0 && !canAddLocation;
  const ownerName = [vendor?.user?.firstname, vendor?.user?.lastname].filter(Boolean).join(" ") || "Not assigned";
  const selectedLocation = vendor?.selectedLocation || vendor?.location || locations[0];

  useEffect(() => {
    const queryVendorId = searchParams.get("vendorId");
    const setupStep = searchParams.get("setup");

    if (queryVendorId) {
      setVendorId(queryVendorId);
      window.localStorage.setItem("booksaa_vendorId", queryVendorId);
    } else {
      const storedVendorId = window.localStorage.getItem("booksaa_vendorId");
      if (storedVendorId) {
        setVendorId(storedVendorId);
      }
    }

    setShowSetupModal(setupStep === "step4");
  }, [searchParams]);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    const fetchVendor = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/businesses/${encodeURIComponent(vendorId)}`, {
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
  }, [vendorId]);

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
    router.replace("/vendor");
  };

  const refreshVendor = async () => {
    if (!vendorId) return;
    try {
      const res = await fetch(`/api/businesses/${encodeURIComponent(vendorId)}`, {
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
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <SidebarTrigger className="mt-1 md:hidden" />
            <div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Welcome back{vendor?.name ? `, ${vendor.name}` : ""}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage business details, services, professionals, and availability from one place.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setOpenAddService(true)} disabled={!vendorId}>
              <Plus className="mr-2 size-4" /> Add service
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!canAddProfessional) {
                  toast.error("Professional limit reached. Add an add-on from Usage & Billing to add more.");
                  openUsageBilling();
                  return;
                }
                setOpenAddProfessional(true);
              }}
              disabled={!vendorId || subscriptionProfessionalLimit === 0}
            >
              <Users className="mr-2 size-4" /> Add professional
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!canAddLocation) {
                  toast.error("Location limit reached. Add an add-on from Usage & Billing to add more.");
                  openUsageBilling();
                  return;
                }
                setOpenAddLocation(true);
              }}
              disabled={!vendorId || subscriptionLocationLimit === 0}
            >
              <MapPin className="mr-2 size-4" /> Add location
            </Button>
            <Button variant="outline" onClick={() => setOpenBusinessHours(true)} disabled={!vendorId}>
              <Clock3 className="mr-2 size-4" /> Business hours
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">Loading your business details...</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : vendor ? (
          <>
            {(hasReachedProfessionalLimit || hasReachedLocationLimit) && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertTitle>Subscription limit reached</AlertTitle>
                <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {hasReachedProfessionalLimit && `You have used all ${subscriptionProfessionalLimit} professional slot${subscriptionProfessionalLimit !== 1 ? "s" : ""}. `}
                    {hasReachedLocationLimit && `You have used all ${subscriptionLocationLimit} location slot${subscriptionLocationLimit !== 1 ? "s" : ""}. `}
                    Add an add-on or review Usage & Billing to increase your limits.
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => openAddon(hasReachedLocationLimit ? "location" : "professional")}>
                      Add add-on
                    </Button>
                    <Button size="sm" variant="outline" onClick={openUsageBilling}>
                      Usage & Billing
                    </Button>
                  </span>
                </AlertDescription>
              </Alert>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DashboardMetric icon={BriefcaseBusiness} label="Services" value={serviceCount} detail="Bookable offerings in the selected location" tone="blue" />
              <DashboardMetric icon={Users} label="Professionals" value={`${professionalCount}/${subscriptionProfessionalLimit || 0}`} detail="Team usage against your plan" tone="emerald" />
              <DashboardMetric icon={MapPin} label="Locations" value={`${activeLocationCount}/${subscriptionLocationLimit || 0}`} detail={selectedLocation?.name || selectedLocation?.address || "No location selected"} tone="amber" />
              <DashboardMetric icon={CalendarClock} label="Trial ends" value={vendor.trialEndsAt || "-"} detail={vendor.status || "Status unavailable"} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-6 p-6 sm:p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Business overview</p>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-950">{vendor.name}</h2>
                    </div>
                    <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="mr-1 size-3.5" />
                      {vendor.status || "Unknown"}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SummaryItem label="Owner" value={ownerName} />
                    <SummaryItem label="Email" value={vendor.user?.email || "-"} />
                    <SummaryItem label="Category" value={vendor.category?.name || "-"} />
                    <SummaryItem label="Plan" value={vendor.plan?.name || "-"} />
                    <SummaryItem label="Locations" value={`${activeLocationCount} active`} />
                    <SummaryItem label="Services" value={`${serviceCount} total`} />
                    <SummaryItem label="Professionals" value={`${professionalCount} total`} />
                    <SummaryItem label="Joined" value={vendor.joinedAt || "-"} />
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Business details</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <DetailCard label="Default location" value={selectedLocation?.address || "Not assigned"} />
                      <DetailCard label="Billing cycle" value={vendor.billingSummary?.billingCycle || "Not available"} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-6 p-6 sm:p-8">
                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Quick setup</p>
                    <h2 className="text-2xl font-semibold text-slate-950">Finish your first setup</h2>
                    <p className="text-sm leading-6 text-slate-600">Complete the essentials customers need before they book with your business.</p>
                  </div>

                  <div className="grid gap-4">
                    <ActionTile icon={<BriefcaseBusiness className="size-5 text-blue-700" />} title="Add service" description="Create your first bookable offering." onClick={() => setOpenAddService(true)} />
                    <ActionTile
                      icon={<Users className="size-5 text-emerald-700" />}
                      title="Add professional"
                      description={canAddProfessional ? "Add a team member to your business." : `All ${subscriptionProfessionalLimit} professional slots are used.`}
                      onClick={() => {
                        if (!canAddProfessional) {
                          openUsageBilling();
                          return;
                        }
                        setOpenAddProfessional(true);
                      }}
                    />
                    <ActionTile
                      icon={<MapPin className="size-5 text-blue-700" />}
                      title="Add location"
                      description={canAddLocation ? "Create another business location." : `All ${subscriptionLocationLimit} location slots are used.`}
                      onClick={() => {
                        if (!canAddLocation) {
                          openUsageBilling();
                          return;
                        }
                        setOpenAddLocation(true);
                      }}
                    />
                    <ActionTile icon={<Clock3 className="size-5 text-amber-700" />} title="Set business hours" description="Define when customers can schedule with you." onClick={() => setOpenBusinessHours(true)} />
                  </div>

                  <Button variant="outline" onClick={() => setShowSetupModal(true)}>
                    Show setup prompt again
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section id="usage-billing" className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Usage & Billing</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Subscription usage</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Professionals and active locations can be added until your subscription slots are used.</p>
                </div>
                <Button variant="outline" onClick={openUsageBilling}>
                  Usage & Billing
                </Button>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <DetailCard label="Professional slots" value={`${professionalCount}/${subscriptionProfessionalLimit || 0} used`} />
                <DetailCard label="Location slots" value={`${activeLocationCount}/${subscriptionLocationLimit || 0} used`} />
              </div>
              {(hasReachedProfessionalLimit || hasReachedLocationLimit) && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-amber-700">Once your subscription limit increases, the add buttons will be available again.</p>
                  {hasReachedProfessionalLimit && (
                    <Button size="sm" onClick={() => openAddon("professional")}>
                      Add professional add-on
                    </Button>
                  )}
                  {hasReachedLocationLimit && (
                    <Button size="sm" variant="outline" onClick={() => openAddon("location")}>
                      Add location add-on
                    </Button>
                  )}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">No vendor data is available. Please sign in again or contact support.</div>
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
