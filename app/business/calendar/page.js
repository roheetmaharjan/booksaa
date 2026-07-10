"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addDays, addMinutes, format, isAfter, isSameDay, parseISO, startOfDay } from "date-fns";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format as fnsFormat, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ResourceHeader from "@/components/common/ResourceHeader";
import { Check, ChevronsUpDown } from "lucide-react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import "react-big-calendar/lib/css/react-big-calendar.css";
import NewAppointment from "@/components/common/NewAppointment";

// ─── RBC localizer ────────────────────────────────────────────────────────────

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format: fnsFormat,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ─── constants ────────────────────────────────────────────────────────────────

const DEFAULT_DURATION = 30;

const VIEW_OPTIONS = [
  { label: "Day", value: Views.DAY },
  { label: "Week", value: Views.WEEK },
  { label: "Month", value: Views.MONTH },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function isPastDay(date) {
  return startOfDay(date) < startOfDay(new Date());
}

function isBookableSlot(date) {
  return isAfter(date, new Date());
}

function getNextBookableDate(base = new Date()) {
  const next = new Date(base);
  if (!isAfter(next, new Date())) next.setTime(addMinutes(new Date(), 5).getTime());
  const rounded = Math.ceil(next.getMinutes() / 15) * 15;
  next.setMinutes(rounded, 0, 0);
  return next;
}

function toDateString(date) {
  return format(date, "yyyy-MM-dd");
}

function toTimeString(date) {
  return format(date, "HH:mm");
}

function combineDateAndTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}`);
}

function paymentLabel(service) {
  if (!service || service.prepaymentType === "pay_later") return "Pay later";
  if (service.prepaymentType === "full") return "Full payment";
  const value = Number(service.depositValue || 0);
  return service.depositType === "fixed" ? `$${value.toFixed(2)} deposit` : `${value}% deposit`;
}

function appointmentTitle(booking) {
  return booking.customerName || [booking.user?.firstname, booking.user?.lastname].filter(Boolean).join(" ") || "Appointment";
}

function getEmptyBooking(startDate, serviceDuration = DEFAULT_DURATION) {
  const start = getNextBookableDate(startDate || new Date());
  const end = addMinutes(start, serviceDuration);
  return {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceId: "",
    professionalId: "",
    date: toDateString(start),
    startTime: toTimeString(start),
    endTime: toTimeString(end),
    notes: "",
  };
}

// ─── custom event component ───────────────────────────────────────────────────

function EventComponent({ event }) {
  const b = event.resource;
  return (
    <div className="rbc-custom-event h-full flex flex-col gap-px px-1.5 py-1 overflow-hidden">
      <span className="rbc-ev-title">{event.title}</span>
      {b?.service?.name && <span className="rbc-ev-sub">{b.service.name}</span>}
      <span className="rbc-ev-time">{format(event.start, "h:mm a")}</span>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [vendor, setVendor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [currentView, setCurrentView] = useState(Views.DAY);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarTitle, setCalendarTitle] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState(() => getEmptyBooking());

  // derived
  const locationId = searchParams.get("locationId");
  const locations = vendor?.locations || [];
  const effectiveLocationId = locationId || vendor?.selectedLocationId || vendor?.defaultLocationId || locations[0]?.id || "";
  const professionals = vendor?.professionals || [];
  const services = vendor?.services || [];

  const selectedService = services.find((s) => s.id === bookingForm.serviceId) || null;

  const minStartTime = isSameDay(combineDateAndTime(bookingForm.date, "00:00"), new Date()) ? toTimeString(getNextBookableDate()) : undefined;

  const [openProfessional, setOpenProfessional] = useState(false);
  // RBC resources — one per professional
  const resources = useMemo(
    () =>
      professionals.map((p) => ({
        id: p.id,
        title: p.name,
        roleName: p.role?.name || "",
      })),
    [professionals],
  );

  // load vendor
  useEffect(() => {
    let active = true;
    async function loadVendor() {
      try {
        setLoading(true);
        const currentRes = await fetch("/api/businesses/current", { cache: "no-store" });
        const currentData = await currentRes.json();
        if (!currentRes.ok || !currentData.vendor) {
          toast.error("Failed to load business");
          return;
        }
        const url = effectiveLocationId ? `/api/businesses/${currentData.vendor.id}?locationId=${effectiveLocationId}` : `/api/businesses/${currentData.vendor.id}`;
        const vendorRes = await fetch(url, { cache: "no-store" });
        const vendorData = await vendorRes.json();
        if (!vendorRes.ok) {
          toast.error("Failed to load booking calendar");
          return;
        }
        if (active) setVendor(vendorData);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load booking calendar");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadVendor();
    return () => {
      active = false;
    };
  }, [effectiveLocationId]);

  // load bookings
  const loadBookings = useCallback(
    async (rangeStart, rangeEnd) => {
      const start = rangeStart || startOfDay(currentDate);
      const end = rangeEnd || addDays(startOfDay(currentDate), currentView === Views.DAY ? 1 : 7);
      try {
        setBookingsLoading(true);
        const params = new URLSearchParams({
          start: start.toISOString(),
          end: end.toISOString(),
        });
        if (effectiveLocationId) params.set("locationId", effectiveLocationId);
        const res = await fetch(`/api/bookings?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to load appointments");
          return;
        }
        setBookings(data.bookings || []);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load appointments");
      } finally {
        setBookingsLoading(false);
      }
    },
    [currentDate, currentView, effectiveLocationId],
  );

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // open dialog
  const openBookingDialog = useCallback(
    (startDate, professionalId = null) => {
      if (!isBookableSlot(startDate)) {
        toast.error("Please choose a future date and time.");
        return;
      }
      const duration = services[0]?.duration || DEFAULT_DURATION;
      const endDate = addMinutes(startDate, duration);
      setBookingForm({
        ...getEmptyBooking(startDate, duration),
        professionalId: professionalId || professionals[0]?.id || "",
        serviceId: services[0]?.id || "",
        date: toDateString(startDate),
        startTime: toTimeString(startDate),
        endTime: toTimeString(endDate),
      });
      setDialogOpen(true);
    },
    [professionals, services],
  );

  // recalc end when service changes
  useEffect(() => {
    if (!selectedService) return;
    const start = combineDateAndTime(bookingForm.date, bookingForm.startTime);
    setBookingForm((p) => ({
      ...p,
      endTime: toTimeString(addMinutes(start, selectedService.duration || DEFAULT_DURATION)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingForm.serviceId]);

  const handleStartTimeChange = (newTime) => {
    const duration = selectedService?.duration || DEFAULT_DURATION;
    const start = combineDateAndTime(bookingForm.date, newTime);
    setBookingForm((p) => ({
      ...p,
      startTime: newTime,
      endTime: toTimeString(addMinutes(start, duration)),
    }));
  };

  // submit
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const scheduledAt = combineDateAndTime(bookingForm.date, bookingForm.startTime);
    const scheduledEnd = combineDateAndTime(bookingForm.date, bookingForm.endTime);
    if (!isAfter(scheduledAt, new Date())) {
      toast.error("Appointments can only be booked for a future date and time.");
      return;
    }
    if (!isAfter(scheduledEnd, scheduledAt)) {
      toast.error("End time must be after start time.");
      return;
    }
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingForm,
          scheduledAt: scheduledAt.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Unable to book appointment");
        return;
      }
      toast.success("Appointment booked");
      setDialogOpen(false);
      loadBookings();
    } catch (err) {
      console.error(err);
      toast.error("Unable to book appointment");
    }
  };

  const handleLocationChange = (nextLocationId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("locationId", nextLocationId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // RBC events
  const rbcEvents = useMemo(
    () =>
      bookings.map((b) => ({
        id: b.id,
        title: appointmentTitle(b),
        start: new Date(b.scheduledAt),
        end: b.scheduledEnd ? new Date(b.scheduledEnd) : addMinutes(parseISO(b.scheduledAt), b.service?.duration || DEFAULT_DURATION),
        resourceId: b.professionalId,
        resource: b,
        color: b.service?.color || "#2563eb",
      })),
    [bookings],
  );

  // calendar title
  useEffect(() => {
    const opts = { month: "long", year: "numeric" };
    if (currentView === Views.DAY) {
      setCalendarTitle(currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
    } else if (currentView === Views.WEEK) {
      const weekEnd = addDays(currentDate, 6);
      setCalendarTitle(`${format(currentDate, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`);
    } else {
      setCalendarTitle(currentDate.toLocaleDateString("en-US", opts));
    }
  }, [currentDate, currentView]);

  const navigate = (direction) => {
    const delta = direction === "prev" ? -1 : 1;
    setCurrentDate((d) => {
      const next = new Date(d);
      if (currentView === Views.DAY) next.setDate(next.getDate() + delta);
      else if (currentView === Views.WEEK) next.setDate(next.getDate() + delta * 7);
      else next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      border: "none",
      borderRadius: "6px",
      color: "#fff",
      padding: 0,
    },
  });

  const slotPropGetter = (date) => {
    if (isPastDay(date)) return { className: "rbc-past-slot" };
    return {};
  };

  // show resources only in day/week view
  const showResources = currentView === Views.DAY || currentView === Views.WEEK;
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);
  const filteredEvents = selectedProfessionals.length === 0 ? rbcEvents : rbcEvents.filter((event) => selectedProfessionals.includes(String(event.resourceId)));

  const filteredResources = selectedProfessionals.length === 0 ? resources : resources.filter((resource) => selectedProfessionals.includes(String(resource.id)));
  if (loading) return <Loading />;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top nav */}
      <header className="content-area-header">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Calendar</h1>
          {bookingsLoading && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => openBookingDialog(getNextBookableDate(), professionals[0]?.id)}>
            <Plus className="h-3.5 w-3.5" />
            New Appointment
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="content-area-body flex flex-col overflow-hidden">
        {/* Calendar toolbar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate("prev")} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setCurrentDate(new Date())} className="h-7 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
              Today
            </button>
            <button type="button" onClick={() => navigate("next")} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
            <h2 className="ml-1 text-sm font-semibold text-slate-800">{calendarTitle}</h2>
          </div>

          {/* View switcher */}
          <div className="flex flex-row border p-1 rounded-lg">
            {VIEW_OPTIONS.map(({ label, value }) => (
              <button key={value} type="button" onClick={() => setCurrentView(value)} className={cn("flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium transition-colors", currentView === value ? "text-slate-600 bg-slate-200" : "text-slate-600 hover:bg-slate-100")}>
                {label}
              </button>
            ))}
          </div>
          <Popover open={openProfessional} onOpenChange={setOpenProfessional}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-[250px] justify-between">
                {selectedProfessionals.length === 0 ? "All Staff" : `${selectedProfessionals.length} selected`}

                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search staff..." />

                <CommandList>
                  <CommandEmpty>No staff found.</CommandEmpty>

                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSelectedProfessionals([]);
                        setOpenProfessional(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedProfessionals.length === 0 ? "opacity-100" : "opacity-0")} />
                      All Staff
                    </CommandItem>

                    {professionals.map((professional) => (
                      <CommandItem
                        key={professional.id}
                        value={professional.name}
                        onSelect={() => {
                          const id = String(professional.id);

                          setSelectedProfessionals((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedProfessionals.includes(String(professional.id)) ? "opacity-100" : "opacity-0")} />

                        {professional.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* React Big Calendar */}
        <div className="min-h-0 flex-1 overflow-auto rbc-host">
          <Calendar
            localizer={localizer}
            // events={rbcEvents}
            view={currentView}
            date={currentDate}
            onView={setCurrentView}
            onNavigate={setCurrentDate}
            // resources={showResources ? resources : undefined}
            resourceIdAccessor="id"
            resourceTitleAccessor="title"
            components={{
              event: EventComponent,
              resourceHeader: ({ resource }) => <ResourceHeader resource={resource} professionals={professionals} />,
            }}
            eventPropGetter={eventStyleGetter}
            slotPropGetter={slotPropGetter}
            events={filteredEvents}
            resources={showResources ? filteredResources : undefined}
            selectable
            onSelectSlot={(slotInfo) => {
              if (!isBookableSlot(slotInfo.start)) {
                toast.error("Please choose a future date and time.");
                return;
              }
              openBookingDialog(slotInfo.start, slotInfo.resourceId || professionals[0]?.id);
            }}
            onRangeChange={(range) => {
              const start = Array.isArray(range) ? range[0] : range.start;
              const end = Array.isArray(range) ? range[range.length - 1] : range.end;
              loadBookings(start, end);
            }}
            toolbar={false}
            step={15}
            timeslots={4}
            min={new Date(0, 0, 0, 1, 0)}
            max={new Date(0, 0, 0, 23, 59)}
            style={{ height: "100%" }}
            formats={{
              timeGutterFormat: (date, culture, loc) => loc.format(date, "h a", culture),
              dayHeaderFormat: (date, culture, loc) => loc.format(date, "EEE, MMM d", culture),
            }}
          />
        </div>
      </div>

      {/* Booking dialog */}
      <NewAppointment
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        handleCreateBooking={handleCreateBooking}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        minStartTime={minStartTime}
        handleStartTimeChange={handleStartTimeChange}
        professionals={professionals}
        services={services}
        selectedService={selectedService}
        paymentLabel={paymentLabel}
      />

      {/* RBC styles */}
      <style>{`
        /* Base overrides */
        .rbc-host .rbc-calendar { font-family: inherit; }
        .rbc-host .rbc-toolbar { display: none; }

        /* Header */
        .rbc-host .rbc-time-header {
          border-bottom: 1px solid #e2e8f0;
        }
        .rbc-host .rbc-header {
          background: #f8fafc;
          border-color: #e2e8f0;
          padding: 0;
        }
        .rbc-host .rbc-header + .rbc-header {
          border-left: 1px solid #e2e8f0;
        }

        /* Resource header cells */
        .rbc-host .rbc-resource-header {
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
        }

        /* Time gutter */
        .rbc-host .rbc-time-gutter .rbc-timeslot-group {
          border-color: #e2e8f0;
        }
        .rbc-host .rbc-time-slot {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 500;
        }
        .rbc-host .rbc-label {
          padding: 0 8px;
          font-size: 10px;
          color: #94a3b8;
        }

        /* Slot rows */
        .rbc-host .rbc-timeslot-group {
          border-color: #e2e8f0;
          min-height: 48px;
        }
        .rbc-host .rbc-time-content {
          border-top: 1px solid #e2e8f0;
        }
        .rbc-host .rbc-day-slot .rbc-time-slot {
          border-color: #f1f5f9;
        }
        .rbc-host .rbc-time-column {
          border-color: #e2e8f0;
        }

        /* Past slots */
        .rbc-host .rbc-past-slot {
          background: #f8fafc;
        }

        /* Current time indicator */
        .rbc-host .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }
        .rbc-host .rbc-current-time-indicator::before {
          background-color: #ef4444;
        }

        /* Selection highlight */
        .rbc-host .rbc-slot-selection {
          background: rgba(37,99,235,0.07);
          border: 1px solid rgba(37,99,235,0.2);
          border-radius: 6px;
          color: #2563eb;
          font-size: 11px;
        }

        /* Events */
        .rbc-host .rbc-event {
          border-radius: 6px !important;
          border: none !important;
          padding: 0 !important;
          opacity: 0.93;
        }
        .rbc-host .rbc-event:hover { opacity: 1; }
        .rbc-host .rbc-event:focus { outline: 2px solid #2563eb; outline-offset: 1px; }
        .rbc-host .rbc-event.rbc-selected { opacity: 1; box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(37,99,235,0.4); }

        .rbc-custom-event { height: 100%; }
        .rbc-ev-title {
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .rbc-ev-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.75);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .rbc-ev-time {
          font-size: 10px;
          color: rgba(255,255,255,0.6);
        }

        /* Month view */
        .rbc-host .rbc-month-view {
          border-color: #e2e8f0;
        }
        .rbc-host .rbc-month-row {
          border-color: #e2e8f0;
        }
        .rbc-host .rbc-day-bg + .rbc-day-bg {
          border-color: #e2e8f0;
        }
        .rbc-host .rbc-off-range-bg {
          background: #f8fafc;
        }
        .rbc-host .rbc-today {
          background: #f0f9ff;
        }
        .rbc-host .rbc-date-cell {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          padding: 4px 6px;
          text-align: right;
        }
        .rbc-host .rbc-date-cell a {
          color: inherit;
        }

        /* Agenda view */
        .rbc-host .rbc-agenda-view table {
          border-color: #e2e8f0;
          font-size: 13px;
        }
        .rbc-host .rbc-agenda-date-cell,
        .rbc-host .rbc-agenda-time-cell {
          font-size: 12px;
          color: #64748b;
        }
        .rbc-row-content{
          display: none;
        }
      `}</style>
    </div>
  );
}
