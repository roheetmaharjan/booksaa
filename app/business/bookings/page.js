"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addDays, addMinutes, format, isAfter, isSameDay, parseISO, startOfDay } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ProfessionalAvatar from "@/components/common/ProfessionalAvatar";

// ─── constants ──────────────────────────────────────────────────────────────

const DEFAULT_DURATION = 30;

const VIEW_OPTIONS = [
  { label: "Day", value: "timeGridDay" },
  { label: "Week", value: "timeGridWeek" },
  { label: "Month", value: "dayGridMonth" },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function isPastDay(date) {
  return startOfDay(date) < startOfDay(new Date());
}

function isBookableSlot(date) {
  return isAfter(date, new Date());
}

function getNextBookableDate(base = new Date()) {
  const next = new Date(base);
  if (!isAfter(next, new Date())) {
    next.setTime(addMinutes(new Date(), 5).getTime());
  }
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

// ─── sub-components ──────────────────────────────────────────────────────────

function DatePickerField({ value, onChange, minDate }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal text-sm h-9">
          {value ? format(new Date(value), "MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) {
              onChange(toDateString(day));
              setOpen(false);
            }
          }}
          disabled={(day) => (minDate ? startOfDay(day) < startOfDay(minDate) : false)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function ServiceCard({ service, selected, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(service.id)} className={cn("group relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150", selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: service.color || "#2563eb" }} />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-medium", selected ? "text-white" : "text-slate-900")}>{service.name}</span>
        <span className={cn("mt-0.5 flex items-center gap-1.5 text-xs", selected ? "text-slate-300" : "text-slate-500")}>
          <Clock className="h-3 w-3" />
          {service.duration} min · {paymentLabel(service)}
        </span>
      </span>
      {selected && (
        <span className="absolute right-3 top-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-white">
          <span className="h-2 w-2 rounded-full bg-slate-900" />
        </span>
      )}
    </button>
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

  const [fcView, setFcView] = useState("timeGridWeek");
  const [calendarRef, setCalendarRef] = useState(null);
  const [calendarTitle, setCalendarTitle] = useState("");

  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState([]);
  const [proSearch, setProSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState(() => getEmptyBooking());

  // derived
  const locationId = searchParams.get("locationId");
  const locations = vendor?.locations || [];
  const effectiveLocationId = locationId || vendor?.selectedLocationId || vendor?.defaultLocationId || locations[0]?.id || "";
  const professionals = vendor?.professionals || [];
  const services = vendor?.services || [];
  const isDayView = fcView === "timeGridDay";

  const selectedProfessional = professionals.find((p) => p.id === selectedProfessionalId) || professionals[0] || null;

  const dayViewProfessionalIds = useMemo(() => (isDayView ? selectedProfessionalIds : selectedProfessionalId ? [selectedProfessionalId] : []), [selectedProfessionalId, selectedProfessionalIds, isDayView]);

  const selectedService = services.find((s) => s.id === bookingForm.serviceId) || null;

  const filteredProfessionals = professionals.filter((p) => p.name.toLowerCase().includes(proSearch.toLowerCase()));

  const minStartTime = isSameDay(combineDateAndTime(bookingForm.date, "00:00"), new Date()) ? toTimeString(getNextBookableDate()) : undefined;

  // load vendor
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
        const url = effectiveLocationId ? `/api/businesses/${currentData.vendor.id}?locationId=${effectiveLocationId}` : `/api/businesses/${currentData.vendor.id}`;
        const vendorRes = await fetch(url, { cache: "no-store" });
        const vendorData = await vendorRes.json();
        if (!vendorRes.ok) {
          toast.error("Failed to load booking calendar");
          return;
        }
        if (active) {
          setVendor(vendorData);
          const firstId = vendorData.professionals?.[0]?.id || "";
          setSelectedProfessionalId((c) => c || firstId);
          setSelectedProfessionalIds((c) => (c.length ? c : firstId ? [firstId] : []));
        }
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
  const loadBookings = useCallback(async () => {
    if (isDayView && !dayViewProfessionalIds.length) {
      setBookings([]);
      return;
    }
    if (!isDayView && !selectedProfessionalId) {
      setBookings([]);
      return;
    }
    const api = calendarRef?.getApi?.();
    const start = api ? api.view.currentStart : startOfDay(new Date());
    const end = api ? api.view.currentEnd : addDays(startOfDay(new Date()), 7);
    try {
      setBookingsLoading(true);
      const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      if (!isDayView) params.set("professionalId", selectedProfessionalId);
      if (effectiveLocationId) params.set("locationId", effectiveLocationId);
      const res = await fetch(`/api/bookings?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to load appointments");
        return;
      }
      const next = data.bookings || [];
      setBookings(isDayView ? next.filter((b) => dayViewProfessionalIds.includes(b.professionalId)) : next);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load appointments");
    } finally {
      setBookingsLoading(false);
    }
  }, [calendarRef, dayViewProfessionalIds, effectiveLocationId, isDayView, selectedProfessionalId]);

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
        professionalId: professionalId || (isDayView ? dayViewProfessionalIds[0] : selectedProfessionalId) || professionals[0]?.id || "",
        serviceId: services[0]?.id || "",
        date: toDateString(startDate),
        startTime: toTimeString(startDate),
        endTime: toTimeString(endDate),
      });
      setDialogOpen(true);
    },
    [dayViewProfessionalIds, isDayView, professionals, selectedProfessionalId, services],
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

  const toggleDayViewProfessional = (id, checked) => {
    setSelectedProfessionalIds((current) => {
      if (checked) {
        const next = current.includes(id) ? current : [...current, id];
        setSelectedProfessionalId(id);
        return next;
      }
      const next = current.filter((x) => x !== id);
      if (selectedProfessionalId === id) setSelectedProfessionalId(next[0] || "");
      return next;
    });
  };

  // fc events
  const fcEvents = useMemo(
    () =>
      bookings.map((b) => ({
        id: b.id,
        title: appointmentTitle(b),
        start: b.scheduledAt,
        end: b.scheduledEnd || addMinutes(parseISO(b.scheduledAt), b.service?.duration || DEFAULT_DURATION).toISOString(),
        backgroundColor: b.service?.color || "#2563eb",
        borderColor: "transparent",
        extendedProps: { booking: b },
      })),
    [bookings],
  );

  const handleFcViewChange = (viewName) => {
    setFcView(viewName);
    calendarRef?.getApi?.().changeView(viewName);
  };

  if (loading) return <Loading />;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top nav */}
      <header className="content-area-header">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Bookings</h1>
          {bookingsLoading && <span>Loading...</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => openBookingDialog(getNextBookableDate(), selectedProfessionalId || professionals[0]?.id)}>
            <Plus className="h-3.5 w-3.5" />
            New Appointment
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="content-area-body">
        {/* Sidebar */}
        <aside className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
          {/* Staff list */}
          <div className="flex-1 py-4 px-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Staff</p>
            {professionals.length > 5 && (
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input value={proSearch} onChange={(e) => setProSearch(e.target.value)} placeholder="Search…" className="h-8 pl-8 text-xs" />
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {filteredProfessionals.map((pro, idx) => {
                const isSelected = isDayView ? dayViewProfessionalIds.includes(pro.id) : pro.id === selectedProfessionalId;

                return isDayView ? (
                  <label key={pro.id} className={cn("flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors", isSelected ? "bg-slate-100" : "hover:bg-slate-200")}>
                    <ProfessionalAvatar name={pro.name} index={idx} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm font-medium", isSelected ? "text-slate-800" : "text-slate-800")}>{pro.name}</span>
                      {pro.role?.name && <span className={cn("block truncate text-xs", isSelected ? "text-slate-800" : "text-slate-800")}>{pro.role.name}</span>}
                    </span>
                    <Checkbox checked={isSelected} onCheckedChange={(c) => toggleDayViewProfessional(pro.id, Boolean(c))} className="border-slate-300 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-900" />
                  </label>
                ) : (
                  <button
                    key={pro.id}
                    type="button"
                    onClick={() => {
                      setSelectedProfessionalId(pro.id);
                      setSelectedProfessionalIds([pro.id]);
                    }}
                    className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors", isSelected ? "bg-slate-900" : "hover:bg-slate-50")}
                  >
                    <ProfessionalAvatar name={pro.name} index={idx} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm font-medium", isSelected ? "text-white" : "text-slate-800")}>{pro.name}</span>
                      {pro.role?.name && <span className={cn("block truncate text-xs", isSelected ? "text-slate-400" : "text-slate-400")}>{pro.role.name}</span>}
                    </span>
                  </button>
                );
              })}
              {filteredProfessionals.length === 0 && <p className="py-3 text-center text-xs text-slate-400">No staff found</p>}
            </div>
          </div>
        </aside>

        {/* Calendar */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Calendar toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => calendarRef?.getApi?.().prev()} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => calendarRef?.getApi?.().today()} className="h-7 rounded-md border border-slate-200 px-3 text-base font-medium text-slate-600 hover:bg-slate-50">
                Today
              </button>
              <button type="button" onClick={() => calendarRef?.getApi?.().next()} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
                <ChevronRight className="h-4 w-4" />
              </button>
              <h2 className="ml-1 text-sm font-semibold text-slate-800">{calendarTitle}</h2>
            </div>
            <div className="text-xs text-slate-400">{selectedProfessional ? (isDayView && dayViewProfessionalIds.length > 1 ? `${dayViewProfessionalIds.length} staff members` : selectedProfessional.name) : "Select a staff member"}</div>
            {/* View switcher */}
            <div className="border-b border-slate-100">
              <div className="flex flex-row gap-0.5">
                {VIEW_OPTIONS.map(({ label, value }) => (
                  <button key={value} type="button" onClick={() => handleFcViewChange(value)} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors", fcView === value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FullCalendar */}
          <div className="min-h-0 flex-1 overflow-auto fc-host">
            <FullCalendar
              ref={(ref) => setCalendarRef(ref)}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={fcView}
              headerToolbar={false}
              events={fcEvents}
              selectable
              selectMirror
              nowIndicator
              allDaySlot={false}
              slotMinTime="01:00:00"
              slotMaxTime="24:00:00"
              height="100%"
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
              expandRows
              stickyHeaderDates
              datesSet={(info) => {
                setCalendarTitle(info.view.title);
                loadBookings();
              }}
              select={(info) => {
                openBookingDialog(info.start, isDayView ? dayViewProfessionalIds[0] || selectedProfessionalId : selectedProfessionalId);
              }}
              dateClick={(info) => {
                openBookingDialog(info.date, isDayView ? dayViewProfessionalIds[0] || selectedProfessionalId : selectedProfessionalId);
              }}
              eventContent={(info) => {
                const b = info.event.extendedProps.booking;
                return (
                  <div className="fc-custom-event">
                    <span className="fc-ev-title">{info.event.title}</span>
                    {b?.service?.name && <span className="fc-ev-sub">{b.service.name}</span>}
                    <span className="fc-ev-time">{format(info.event.start, "h:mm a")}</span>
                  </div>
                );
              }}
              selectAllow={(info) => isBookableSlot(info.start)}
              dayCellClassNames={(arg) => (isPastDay(arg.date) ? ["fc-past"] : [])}
            />
          </div>
        </main>
      </div>

      {/* Booking dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[700px]">
          <DialogHeader className="border-b border-slate-100 px-6 py-4">
            <DialogTitle className="font-semibold text-slate-900">New appointment</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateBooking}>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              {/* Left: customer + scheduling */}
              <div className="flex flex-col gap-5 p-6">
                <section>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Customer</p>
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <Label className="text-xs text-slate-600">Name</Label>
                      <Input
                        value={bookingForm.customerName}
                        onChange={(e) =>
                          setBookingForm((p) => ({
                            ...p,
                            customerName: e.target.value,
                          }))
                        }
                        placeholder="Full name"
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-600">Phone</Label>
                        <Input
                          value={bookingForm.customerPhone}
                          onChange={(e) =>
                            setBookingForm((p) => ({
                              ...p,
                              customerPhone: e.target.value,
                            }))
                          }
                          placeholder="+1 555 000"
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Email</Label>
                        <Input
                          type="email"
                          value={bookingForm.customerEmail}
                          onChange={(e) =>
                            setBookingForm((p) => ({
                              ...p,
                              customerEmail: e.target.value,
                            }))
                          }
                          placeholder="email@…"
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Scheduling</p>
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <Label className="text-xs text-slate-600">Date</Label>
                      <div className="mt-1">
                        <DatePickerField value={bookingForm.date} minDate={new Date()} onChange={(d) => setBookingForm((p) => ({ ...p, date: d }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-600">Start</Label>
                        <Input type="time" value={bookingForm.startTime} min={minStartTime} onChange={(e) => handleStartTimeChange(e.target.value)} className="mt-1 h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">End</Label>
                        <Input
                          type="time"
                          value={bookingForm.endTime}
                          min={bookingForm.startTime}
                          onChange={(e) =>
                            setBookingForm((p) => ({
                              ...p,
                              endTime: e.target.value,
                            }))
                          }
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Assigned to</Label>
                      <Select value={bookingForm.professionalId} onValueChange={(v) => setBookingForm((p) => ({ ...p, professionalId: v }))}>
                        <SelectTrigger className="mt-1 h-9 text-sm">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.map((pro, idx) => (
                            <SelectItem key={pro.id} value={pro.id}>
                              <span className="flex items-center gap-2">
                                <ProfessionalAvatar name={pro.name} index={idx} size="sm" />
                                {pro.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Notes</Label>
                      <Textarea
                        value={bookingForm.notes}
                        onChange={(e) =>
                          setBookingForm((p) => ({
                            ...p,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Special requests or notes…"
                        className="mt-1 min-h-[68px] resize-none text-sm"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right: service picker */}
              <div className="flex flex-col p-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Service</p>
                {services.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-400">No services configured</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 overflow-y-auto">
                    {services.map((svc) => (
                      <ServiceCard key={svc.id} service={svc} selected={bookingForm.serviceId === svc.id} onSelect={(id) => setBookingForm((p) => ({ ...p, serviceId: id }))} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <span className="text-xs text-slate-400">{selectedService ? `${selectedService.duration} min · ${paymentLabel(selectedService)}` : "Select a service"}</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="h-8 text-slate-600">
                  Cancel
                </Button>
                <Button type="submit">Confirm booking</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* FC styles */}
      <style>{`
        .fc-host {
          --fc-border-color: #e2e8f0;
          --fc-today-bg-color: #f8fafc;
          --fc-now-indicator-color: #ef4444;
          --fc-highlight-color: rgba(37,99,235,0.07);
          --fc-page-bg-color: transparent;
        }
        .fc-host .fc-scroller { overflow: auto !important; }
        .fc-host .fc-col-header-cell {
          background: #f8fafc;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
          padding: 6px 0;
        }
        .fc-host .fc-timegrid-slot { height: 3rem; }
        .fc-host .fc-timegrid-slot-label {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 500;
          padding: 0 8px;
        }
        .fc-host .fc-past { background: #f8fafc; pointer-events: none; }
        .fc-host .fc-event {
          border-radius: 6px !important;
          border: none !important;
          padding: 0 !important;
          overflow: hidden;
          cursor: pointer;
          opacity: 0.93;
        }
        .fc-host .fc-event:hover { opacity: 1; }
        .fc-custom-event {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 4px 7px;
          height: 100%;
        }
        .fc-ev-title {
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .fc-ev-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.75);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .fc-ev-time {
          font-size: 10px;
          color: rgba(255,255,255,0.6);
        }
        .fc-host .fc-highlight {
          background: rgba(37,99,235,0.07);
          border-radius: 6px;
        }
        .fc-host .fc-daygrid-day-number {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 6px;
          color: #475569;
        }
        .fc-host a { color: inherit; }
        .fc-host .fc-daygrid-event {
          border-radius: 4px !important;
          font-size: 11px;
          font-weight: 500;
        }
        .fc .fc-timegrid-axis-cushion, .fc .fc-timegrid-slot-label-cushion {
            padding: 0px 4px;
            font-size: 12px;
        }
      `}</style>
    </div>
  );
}
