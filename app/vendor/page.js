"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, MapPin, Plus, ShieldCheck, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import AddService from "@/components/modals/AddService";
import AddProfessional from "@/components/modals/AddProfessional";
import BusinessHours from "@/components/common/BusinessHour";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [openBusinessHours, setOpenBusinessHours] = useState(false);

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
      // ignore
    }
  };

  const serviceCount = vendor?.services?.length || 0;
  const professionalCount = vendor?.subscriptionProfessionalCount || 0;
  const locationCount = vendor?.locations?.length || 0;
  const openHourCount = vendor?.businessHours?.filter((hour) => hour.isOpen).length || 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="bg-emerald-100 text-emerald-800">Vendor Dashboard</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Welcome back to your business dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Manage your business details, services, professionals, and availability from one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setOpenAddService(true)} disabled={!vendorId || locationCount === 0}>
              <Plus className="mr-2 h-4 w-4" /> Add service
            </Button>
            <Button variant="secondary" onClick={() => setOpenAddProfessional(true)} disabled={!vendorId || locationCount === 0}>
              <Users className="mr-2 h-4 w-4" /> Add professional
            </Button>
            <Button variant="outline" onClick={() => setOpenBusinessHours(true)} disabled={!vendorId || locationCount === 0}>
              <Clock3 className="mr-2 h-4 w-4" /> Business hours
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            Loading your business details...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : vendor ? (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-6 p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Business overview</p>
                  <h2 className="text-2xl font-semibold text-slate-950">{vendor.name}</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SummaryItem label="Owner" value={`${vendor.user.firstname} ${vendor.user.lastname}`} />
                  <SummaryItem label="Email" value={vendor.user.email} />
                  <SummaryItem label="Category" value={vendor.category?.name || "—"} />
                  <SummaryItem label="Plan" value={vendor.plan?.name || "—"} />
                  <SummaryItem label="Status" value={vendor.status || "—"} />
                  <SummaryItem label="Trial ends" value={vendor.trialEndsAt || "—"} />
                  <SummaryItem label="Locations" value={`${locationCount}`} />
                  <SummaryItem label="Services" value={`${serviceCount}`} />
                  <SummaryItem label="Professionals" value={`${professionalCount}`} />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Business details</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <DetailCard label="Joined" value={vendor.joinedAt || "—"} />
                    <DetailCard label="Default location" value={vendor.selectedLocation?.address || "Not assigned"} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-6 p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Quick setup</p>
                  <h2 className="text-2xl font-semibold text-slate-950">Finish your first setup</h2>
                  <p className="text-sm leading-6 text-slate-600">
                    You can complete these steps now or skip and return later from the dashboard.
                  </p>
                </div>

                <div className="grid gap-4">
                  <ActionTile
                    icon={<MapPin className="h-5 w-5 text-emerald-700" />}
                    title="Add service"
                    description="Create your first bookable offering."
                    onClick={() => setOpenAddService(true)}
                  />
                  <ActionTile
                    icon={<Users className="h-5 w-5 text-slate-700" />}
                    title="Add professional"
                    description="Add a team member to your business."
                    onClick={() => setOpenAddProfessional(true)}
                  />
                  <ActionTile
                    icon={<Clock3 className="h-5 w-5 text-slate-700" />}
                    title="Set business hours"
                    description="Define when customers can schedule with you."
                    onClick={() => setOpenBusinessHours(true)}
                  />
                </div>

                <Button variant="outline" onClick={() => setShowSetupModal(true)}>
                  Show setup prompt again
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
            No vendor data is available. Please sign in again or contact support.
          </div>
        )}
      </div>

      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Finish your setup</DialogTitle>
            <p className="mt-2 text-sm text-slate-600">
              Set up your first service, professional, and business hours now. You can skip this and continue later.
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-6 md:grid-cols-3">
            <SetupCard
              icon={<Sparkles className="h-5 w-5 text-emerald-700" />}
              title="Add service"
              description="Create your first bookable offering."
              onClick={() => {
                setShowSetupModal(false);
                setOpenAddService(true);
              }}
            />
            <SetupCard
              icon={<Users className="h-5 w-5 text-slate-700" />}
              title="Add professional"
              description="Invite a team member to your business."
              onClick={() => {
                setShowSetupModal(false);
                setOpenAddProfessional(true);
              }}
            />
            <SetupCard
              icon={<Clock3 className="h-5 w-5 text-slate-700" />}
              title="Business hours"
              description="Define the hours your business is available."
              onClick={() => {
                setShowSetupModal(false);
                setOpenBusinessHours(true);
              }}
            />
          </div>
          <DialogFooter className="flex flex-wrap items-center gap-3 justify-between">
            <Button variant="secondary" onClick={handleSkipSetup}>
              Skip for now
            </Button>
            <Button onClick={handleSkipSetup}>
              Continue to dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddService
        open={openAddService}
        setAddServiceOpen={setOpenAddService}
        vendorId={vendorId}
        locations={vendor?.locations || []}
        locationId={vendor?.selectedLocationId || vendor?.locations?.[0]?.id}
        onAdded={() => {
          refreshVendor();
          toast.success("Service added successfully.");
        }}
      />

      <AddProfessional
        open={openAddProfessional}
        setAddProfessionalOpen={setOpenAddProfessional}
        vendorId={vendorId}
        locationId={vendor?.selectedLocationId || vendor?.locations?.[0]?.id}
        vendor={vendor}
        roles={roles}
        loading={rolesLoading}
        error={rolesError}
        onAdded={() => {
          refreshVendor();
          toast.success("Professional added successfully.");
        }}
      />

      <Dialog open={openBusinessHours} onOpenChange={setOpenBusinessHours}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Business hours</DialogTitle>
          </DialogHeader>
          <BusinessHours
            vendorId={vendorId}
            locationId={vendor?.selectedLocationId || vendor?.locations?.[0]?.id}
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
    </main>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-2 text-sm text-slate-600">{value}</p>
    </div>
  );
}

function ActionTile({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-slate-100"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
        {icon}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
    </button>
  );
}

function SetupCard({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-base font-semibold text-slate-950">{title}</p>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
    </button>
  );
}
