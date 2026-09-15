"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { addMinutes, isAfter, format } from "date-fns";
import { Button } from "@/components/ui/button";
import NewAppointment from "@/components/common/NewAppointment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getNextBookableDate(base = new Date()) {
  const next = new Date(base);

  if (!isAfter(next, new Date())) {
    next.setTime(addMinutes(new Date(), 5).getTime());
  }

  const rounded = Math.ceil(next.getMinutes() / 15) * 15;
  next.setMinutes(rounded, 0, 0);

  return next;
}

function isBookableSlot(date) {
  return isAfter(date, new Date());
}

export function BoardTopBar({ query, onQuery, staff, onStaff, waitlist, staffOptions, onBookingSuccess }) {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingStart, setBookingStart] = useState(null);
  const [bookingProfessionalId, setBookingProfessionalId] = useState("");

  const professionals = vendor?.professionals || [];
  const services = vendor?.services || [];

  const locationId = searchParams.get("locationId");

  const openBookingDialog = useCallback(
    (startDate, professionalId = null) => {
      if (!isBookableSlot(startDate)) {
        toast.error("Please choose a future date and time.");
        return;
      }

      setBookingStart(startDate);

      setBookingProfessionalId(professionalId || professionals[0]?.id || "");

      setDialogOpen(true);
    },
    [professionals],
  );

  // Load Professionals
  useEffect(() => {
    async function loadProfessionals() {
      try {
        const response = await fetch(`/api/professionals?locationId=${locationId}`);
        const result = await response.json();
        console.log(result);
      } catch {}
    }
    if (locationId) {
      loadProfessionals();
    }
  }, [locationId]);

  // Load vendor
  useEffect(() => {
    let active = true;

    async function loadVendor() {
      try {
        setLoading(true);

        const currentRes = await fetch("/api/businesses/current", {
          cache: "no-store",
        });

        const currentData = await currentRes.json();

        if (!currentRes.ok || !currentData.vendor) {
          toast.error("Failed to load business");
          return;
        }

        const url = locationId ? `/api/businesses/${currentData.vendor.id}?locationId=${locationId}` : `/api/businesses/${currentData.vendor.id}`;

        const vendorRes = await fetch(url, {
          cache: "no-store",
        });

        const vendorData = await vendorRes.json();

        if (!vendorRes.ok) {
          toast.error("Failed to load booking calendar");
          return;
        }

        if (active) {
          setVendor(vendorData);
        }
      } catch (err) {
        console.error(err);
        toast.error("Unable to load booking calendar");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadVendor();

    return () => {
      active = false;
    };
  }, [locationId]);

  const handleBookingSuccess = async (bookingResult) => {
    await onBookingSuccess?.(bookingResult);
    setDialogOpen(false);
  };

  return (
    <header className="sticky bg-white top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-surface-raised px-4 py-2.5">
      {/* Today's Date */}
      <div className="flex items-center gap-1.5">
        <div className="leading-tight">
          <p className="text-[10px] text-muted-foreground">Today's Date</p>

          <p className="text-sm font-semibold">{format(new Date(), "EEE. MMM d")}</p>
        </div>

        <ChevronDown className="size-4 text-muted-foreground" />
      </div>

      {/* Search */}
      <label className="relative min-w-[200px] flex-1 md:max-w-sm">
        <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search customers" className="w-full pl-8 border-b border-border bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" />
      </label>

      {/* Actions */}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {/* Staff */}
        <label className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Professional:</span>

        <Select value={staff} onValueChange={onStaff}>
          <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0">
            <SelectValue placeholder="All Professionals" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Professionals
            </SelectItem>

            {professionals.map((professional) => (
              <SelectItem
                key={professional.id}
                value={professional.id}
              >
                {professional.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

        {/* Today */}
        <Button variant="secondary" size="sm">
          Today
        </Button>

        {/* Previous */}
        <Button variant="outline" size="icon" className="size-8">
          <ChevronLeft className="size-4" />
        </Button>

        {/* Next */}
        <Button variant="outline" size="icon" className="size-8">
          <ChevronRight className="size-4" />
        </Button>

        {/* New Appointment */}
        <Button onClick={() => openBookingDialog(getNextBookableDate(), professionals[0]?.id)}>
          <Plus className="h-3.5 w-3.5" />
          New Appointment
        </Button>

        {/* New Appointment Dialog */}
        <NewAppointment open={dialogOpen} onOpenChange={setDialogOpen} onBookingSuccess={handleBookingSuccess} initialStart={bookingStart} initialProfessionalId={bookingProfessionalId} professionals={professionals} services={services} />
      </div>
    </header>
  );
}
