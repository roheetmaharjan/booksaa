"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, CalendarClock, Clock3, MapPin, Plus, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import AddService from "@/components/modals/AddService";
import AddProfessional from "@/components/modals/AddProfessional";
import AddLocation from "@/components/modals/AddLocation";
import AddProfessionalAddon from "@/components/modals/AddProfessionalAddon";
import BusinessHours from "@/components/common/BusinessHour";
import { ActionTile, DashboardMetric, SetupCard } from "@/components/components_vendor/VendorDashboardCards";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function VendorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState(null); // raw API response { vendorId, vendor }
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

  // ─── Fetch vendor data ────────────────────────────────────────────────────
  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/businesses/current", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to resolve your business account.");
      setData(json);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to resolve your business account.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
    setShowSetupModal(searchParams.get("setup") === "step4");
  }, [searchParams]);

  // ─── Fetch professional roles ─────────────────────────────────────────────
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      try {
        const res = await fetch("/api/professional-roles", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Unable to load roles.");
        setRoles(Array.isArray(json) ? json : []);
        setRolesError("");
      } catch (err) {
        setRolesError(err.message || "Unable to load roles.");
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // ─── Derive values from API response ─────────────────────────────────────
  const vendorId = data?.vendorId ?? null;
  const vendor = data?.vendor ?? null;
  const plan = vendor?.plan ?? null;
  const subscription = vendor?.subscription ?? null; // from calculateBusinessSubscription

  const locations = vendor?.locations ?? [];
  const activeLocationCount = subscription?.actualLocationCount ?? locations.filter((l) => l.isActive !== false).length;
  const serviceCount = vendor?.services?.length ?? 0;

  // Limits from calculateBusinessSubscription (plan base + addons)
  const locationLimit = subscription?.activeLocationCount ?? plan?.location ?? 0;
  const professionalLimit = subscription?.professionalCount ?? plan?.professional ?? 0;

  // Actual usage
  const actualProfessionals = subscription?.actualProfessionalCount ?? 0;

  // Can add more?
  const canAddProfessional = Boolean(vendorId) && actualProfessionals < professionalLimit;
  const canAddLocation = Boolean(vendorId) && activeLocationCount < locationLimit;
  const hasReachedProfessionalLimit = Boolean(vendorId) && professionalLimit > 0 && !canAddProfessional;
  const hasReachedLocationLimit = Boolean(vendorId) && locationLimit > 0 && !canAddLocation;

  // Expiry date from calculateBusinessSubscription
  const expiryDate = subscription?.expiryDate ?? vendor?.trialEndsAt;

  const formattedExpiryDate = expiryDate
    ? new Date(expiryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
  const selectedLocation = locations.find((l) => l.id === vendor?.defaultLocationId) ?? locations[0] ?? null;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const scrollToBilling = () => {
    document.getElementById("usage-billing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openAddon = (type = "professional") => {
    setAddonType(type);
    setOpenAddAddon(true);
    scrollToBilling();
  };

  const handleSkipSetup = () => {
    setShowSetupModal(false);
    router.replace("/business");
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-container">
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <header className="">
            <div className="flex items-start gap-2">
              <SidebarTrigger className="mt-1 md:hidden" />
              <div>
                <h1 className="page-title">Welcome back {vendor?.name ? `, ${vendor.name}` : ""}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage business details, services, professionals, and availability from one place.</p>
              </div>
            </div>
          </header>
        </div>
      </div>
      <div className="page-body pt-3">
        <div className="page-container">
          {/* ── Body ────────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">Loading your business details...</div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
          ) : vendor ? (
            <>
              {/* Limit warning */}
              {(hasReachedProfessionalLimit || hasReachedLocationLimit) && (
                <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                  <AlertTitle className="text-lg font-bold">Subscription limit reached</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {hasReachedProfessionalLimit && `You have used all ${professionalLimit} professional slot${professionalLimit !== 1 ? "s" : ""}. `}
                      {hasReachedLocationLimit && `You have used all ${locationLimit} location slot${locationLimit !== 1 ? "s" : ""}. `}
                      Add an add-on or review Usage & Billing to increase your limits.
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => openAddon(hasReachedLocationLimit ? "location" : "professional")}>
                        Add add-on
                      </Button>
                      <Button size="sm" variant="outline" onClick={scrollToBilling}>
                        Usage & Billing
                      </Button>
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Metrics */}
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardMetric icon={BriefcaseBusiness} label="Services" value={serviceCount} tone="blue" />
                <DashboardMetric icon={Users} label="Professionals" value={`${actualProfessionals}/${professionalLimit}`} tone="emerald" />
                <DashboardMetric icon={MapPin} label="Locations" value={`${activeLocationCount}/${locationLimit}`} tone="amber" />
                <DashboardMetric icon={CalendarClock} label={subscription?.subscriptionStatus === "TRIAL_ACTIVE" ? "Trial ends" : "Expires"} value={formattedExpiryDate} detail={vendor?.subscriptionStatus ?? subscription?.subscriptionStatus ?? "—"} />
              </section>
            </>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">No vendor data is available. Please sign in again or contact support.</div>
          )}
        </div>
      </div>

      {/* ── Setup modal ───────────────────────────────────────────────────── */}
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
                canAddProfessional ? setOpenAddProfessional(true) : scrollToBilling();
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

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AddService
        open={openAddService}
        setAddServiceOpen={setOpenAddService}
        vendorId={vendorId}
        locations={locations}
        locationId={vendor?.defaultLocationId ?? locations[0]?.id}
        onAdded={() => {
          fetchVendorData();
          toast.success("Service added successfully.");
        }}
      />

      <AddProfessional
        open={openAddProfessional}
        setAddProfessionalOpen={setOpenAddProfessional}
        vendorId={vendorId}
        locationId={vendor?.defaultLocationId ?? locations[0]?.id}
        vendor={vendor}
        roles={roles}
        loading={rolesLoading}
        error={rolesError}
        onAdded={() => {
          fetchVendorData();
          toast.success("Professional added successfully.");
        }}
      />

      <AddLocation
        open={openAddLocation}
        setAddLocationOpen={setOpenAddLocation}
        vendorId={vendorId}
        vendor={vendor}
        onAdded={() => {
          fetchVendorData();
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
            locationId={vendor?.defaultLocationId ?? locations[0]?.id}
            initialHours={vendor?.businessHours ?? []}
            onSaved={() => {
              fetchVendorData();
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
