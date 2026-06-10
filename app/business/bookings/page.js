"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  parseISO,
  setHours,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, UserRound } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const HOURS = Array.from({ length: 11 }, (_, index) => index + 8);
const VIEW_OPTIONS = ["day", "week", "month"];

function getScheduledDate(date, time) {
  return new Date(`${date}T${time}`);
}

function isPastDay(date) {
  return startOfDay(date) < startOfDay(new Date());
}

function isBookableSlot(date, hour) {
  const slot = new Date(date);
  slot.setHours(hour, 0, 0, 0);
  return isAfter(slot, new Date());
}

function getNextBookableSlot(date = new Date(), preferredHour = 9) {
  const requested = new Date(date);
  requested.setHours(preferredHour, 0, 0, 0);

  if (isAfter(requested, new Date())) {
    return { date: requested, hour: preferredHour };
  }

  const baseDate = isPastDay(date) ? new Date() : date;
  for (const hour of HOURS) {
    const slot = new Date(baseDate);
    slot.setHours(hour, 0, 0, 0);
    if (isAfter(slot, new Date())) {
      return { date: slot, hour };
    }
  }

  const tomorrow = addDays(new Date(), 1);
  tomorrow.setHours(HOURS[0], 0, 0, 0);
  return { date: tomorrow, hour: HOURS[0] };
}

function getMinTimeForDate(dateValue) {
  if (!dateValue || !isSameDay(getScheduledDate(dateValue, "00:00"), new Date())) {
    return undefined;
  }

  const nextSlot = getNextBookableSlot();
  return isSameDay(nextSlot.date, new Date()) ? `${String(nextSlot.hour).padStart(2, "0")}:00` : undefined;
}

function getEmptyBooking() {
  const nextSlot = getNextBookableSlot();

  return {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceId: "",
    professionalId: "",
    date: format(nextSlot.date, "yyyy-MM-dd"),
    time: `${String(nextSlot.hour).padStart(2, "0")}:00`,
    notes: "",
  };
}

function getRange(view, anchorDate) {
  if (view === "day") {
    return { start: startOfDay(anchorDate), end: addDays(startOfDay(anchorDate), 1) };
  }
  if (view === "month") {
    return {
      start: startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(anchorDate), { weekStartsOn: 0 }),
    };
  }
  return {
    start: startOfWeek(anchorDate, { weekStartsOn: 0 }),
    end: endOfWeek(anchorDate, { weekStartsOn: 0 }),
  };
}

function paymentLabel(service) {
  if (!service || service.prepaymentType === "pay_later") return "Pay later";
  if (service.prepaymentType === "full") return "Full payment required";
  const value = Number(service.depositValue || 0);
  return service.depositType === "fixed" ? `$${value.toFixed(2)} deposit` : `${value}% deposit`;
}

function appointmentTitle(booking) {
  return booking.customerName || [booking.user?.firstname, booking.user?.lastname].filter(Boolean).join(" ") || "Appointment";
}

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [vendor, setVendor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [view, setView] = useState("week");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState(getEmptyBooking);

  const locationId = searchParams.get("locationId");
  const locations = vendor?.locations || [];
  const effectiveLocationId = locationId || vendor?.selectedLocationId || vendor?.defaultLocationId || locations[0]?.id || "";
  const professionals = vendor?.professionals || [];
  const services = vendor?.services || [];
  const selectedProfessional = professionals.find((professional) => professional.id === selectedProfessionalId) || professionals[0] || null;
  const dayViewProfessionalIds = useMemo(
    () => (view === "day" ? selectedProfessionalIds : selectedProfessionalId ? [selectedProfessionalId] : []),
    [selectedProfessionalId, selectedProfessionalIds, view]
  );
  const primaryProfessional = view === "day"
    ? professionals.find((professional) => professional.id === dayViewProfessionalIds[0]) || selectedProfessional
    : selectedProfessional;
  const selectedService = services.find((service) => service.id === bookingForm.serviceId) || null;
  const titleProfessionalText = view === "day" && dayViewProfessionalIds.length > 1
    ? `${dayViewProfessionalIds.length} professionals' appointments`
    : selectedProfessional
      ? `${selectedProfessional.name}'s appointments`
      : "Select a professional to view appointments";

  const range = useMemo(() => getRange(view, anchorDate), [view, anchorDate]);
  const days = useMemo(() => eachDayOfInterval({ start: range.start, end: view === "day" ? range.start : range.end }), [range, view]);
  const monthDays = useMemo(() => eachDayOfInterval(getRange("month", anchorDate)), [anchorDate]);

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

        if (active) {
          setVendor(vendorData);
          const firstProfessional = vendorData.professionals?.[0]?.id || "";
          setSelectedProfessionalId((current) => current || firstProfessional);
          setSelectedProfessionalIds((current) => current.length ? current : firstProfessional ? [firstProfessional] : []);
        }
      } catch (error) {
        console.error("Calendar load error:", error);
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

  const loadBookings = useCallback(async () => {
    if (view === "day" && !dayViewProfessionalIds.length) {
      setBookings([]);
      return;
    }

    if (view !== "day" && !selectedProfessionalId) {
      setBookings([]);
      return;
    }

    try {
      setBookingsLoading(true);
      const params = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      });
      if (view !== "day") params.set("professionalId", selectedProfessionalId);
      if (effectiveLocationId) params.set("locationId", effectiveLocationId);
      const res = await fetch(`/api/bookings?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load appointments");
        return;
      }

      const nextBookings = data.bookings || [];
      setBookings(
        view === "day"
          ? nextBookings.filter((booking) => dayViewProfessionalIds.includes(booking.professionalId))
          : nextBookings
      );
    } catch (error) {
      console.error("Booking fetch error:", error);
      toast.error("Unable to load appointments");
    } finally {
      setBookingsLoading(false);
    }
  }, [dayViewProfessionalIds, effectiveLocationId, range.end, range.start, selectedProfessionalId, view]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const openBookingDialog = (date, hour = 9, professionalId = null) => {
    if (!isBookableSlot(date, hour)) {
      toast.error("Please choose a future date and time.");
      return;
    }

    setBookingForm({
      ...getEmptyBooking(),
      professionalId: professionalId || primaryProfessional?.id || "",
      serviceId: services[0]?.id || "",
      date: format(date, "yyyy-MM-dd"),
      time: `${String(hour).padStart(2, "0")}:00`,
    });
    setDialogOpen(true);
  };

  const moveCalendar = (direction) => {
    if (view === "month") setAnchorDate((date) => (direction > 0 ? addMonths(date, 1) : subMonths(date, 1)));
    if (view === "week") setAnchorDate((date) => (direction > 0 ? addWeeks(date, 1) : subWeeks(date, 1)));
    if (view === "day") setAnchorDate((date) => addDays(date, direction));
  };

  const handleLocationChange = (nextLocationId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("locationId", nextLocationId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleDayViewProfessional = (professionalId, checked) => {
    setSelectedProfessionalIds((current) => {
      if (checked) {
        const next = current.includes(professionalId) ? current : [...current, professionalId];
        setSelectedProfessionalId(professionalId);
        return next;
      }

      const next = current.filter((id) => id !== professionalId);
      if (selectedProfessionalId === professionalId) {
        setSelectedProfessionalId(next[0] || "");
      }
      return next;
    });
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    const scheduledAt = getScheduledDate(bookingForm.date, bookingForm.time);

    if (!isAfter(scheduledAt, new Date())) {
      toast.error("Appointments can only be booked for a future date and time.");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingForm,
          scheduledAt: scheduledAt.toISOString(),
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
    } catch (error) {
      console.error("Booking submit error:", error);
      toast.error("Unable to book appointment");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-content">
      <div className="page-header border-b bg-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="page-title">Bookings</h1>
            <p className="mt-1 text-sm text-slate-500">{titleProfessionalText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {locations.length > 1 && (
              <Select value={effectiveLocationId} onValueChange={handleLocationChange}>
                <SelectTrigger className="w-56 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name || location.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              onClick={() => {
                const nextSlot = getNextBookableSlot(anchorDate, 9);
                openBookingDialog(nextSlot.date, nextSlot.hour);
              }}
              className="gap-2"
            >
              <Plus className="size-4" />
              Book
            </Button>
          </div>
        </div>
      </div>

      <div className="page-body gap-4 flex flex-col">
        <aside className="space-y-4">
          <div className="rounded-md border bg-white p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <UserRound className="size-4 text-slate-500" />
              Professionals
            </div>
            <div className="space-y-1 flex flex-row flex-wrap">
              {professionals.length ? (
                professionals.map((professional) => (
                  view === "day" ? (
                    <label
                      key={professional.id}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                        dayViewProfessionalIds.includes(professional.id) ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Checkbox
                        checked={dayViewProfessionalIds.includes(professional.id)}
                        onCheckedChange={(checked) => toggleDayViewProfessional(professional.id, Boolean(checked))}
                        className="border-current data-[state=checked]:bg-white data-[state=checked]:text-slate-900"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{professional.name}</span>
                        <span className="block truncate text-xs opacity-70">{professional.role?.name}</span>
                      </span>
                    </label>
                  ) : (
                    <button
                      key={professional.id}
                      type="button"
                      onClick={() => {
                        setSelectedProfessionalId(professional.id);
                        setSelectedProfessionalIds([professional.id]);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${professional.id === selectedProfessionalId ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      <span className="truncate">{professional.name}</span>
                      <span className="text-xs opacity-70">{professional.role?.name}</span>
                    </button>
                  )
                ))
              ) : (
                <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">No professionals found.</p>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 rounded-md border bg-white">
          <div className="flex flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => moveCalendar(-1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button type="button" variant="outline" onClick={() => setAnchorDate(new Date())}>
                Today
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => moveCalendar(1)}>
                <ChevronRight className="size-4" />
              </Button>
              <div className="ml-2 text-sm font-semibold text-slate-800">
                {view === "day" ? format(anchorDate, "EEEE, MMM d, yyyy") : `${format(range.start, "MMM d")} - ${format(range.end, "MMM d, yyyy")}`}
              </div>
            </div>
            <div className="flex rounded-md border bg-slate-50 p-1">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  className={`h-8 rounded px-3 text-sm font-medium capitalize ${view === option ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {bookingsLoading && <div className="border-b bg-slate-50 px-4 py-2 text-sm text-slate-500">Loading appointments...</div>}

          {view === "month" ? (
            <MonthCalendar days={monthDays} anchorDate={anchorDate} bookings={bookings} onSlotClick={openBookingDialog} />
          ) : (
            <TimeGrid
              view={view}
              days={view === "day" ? [anchorDate] : days}
              bookings={bookings}
              onSlotClick={openBookingDialog}
              professionals={professionals}
              dayViewProfessionalIds={dayViewProfessionalIds}
              selectedProfessionalId={selectedProfessionalId}
            />
          )}
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <form onSubmit={handleCreateBooking}>
            <DialogHeader>
              <DialogTitle>Book appointment</DialogTitle>
            </DialogHeader>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="customerName">Customer name</Label>
                  <Input id="customerName" value={bookingForm.customerName} onChange={(event) => setBookingForm((prev) => ({ ...prev, customerName: event.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input id="customerPhone" value={bookingForm.customerPhone} onChange={(event) => setBookingForm((prev) => ({ ...prev, customerPhone: event.target.value }))} />
                </div>
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input id="customerEmail" type="email" value={bookingForm.customerEmail} onChange={(event) => setBookingForm((prev) => ({ ...prev, customerEmail: event.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Professional</Label>
                  <Select value={bookingForm.professionalId} onValueChange={(value) => setBookingForm((prev) => ({ ...prev, professionalId: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select professional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          {professional.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Service</Label>
                  <Select value={bookingForm.serviceId} onValueChange={(value) => setBookingForm((prev) => ({ ...prev, serviceId: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bookingDate">Date</Label>
                  <Input
                    id="bookingDate"
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    value={bookingForm.date}
                    onChange={(event) => {
                      const nextDate = event.target.value;
                      setBookingForm((prev) => {
                        const currentTime = prev.time || "00:00";
                        const nextSlot = getNextBookableSlot(getScheduledDate(nextDate, currentTime), Number(currentTime.slice(0, 2)));
                        return {
                          ...prev,
                          date: nextDate,
                          time: isAfter(getScheduledDate(nextDate, currentTime), new Date()) ? currentTime : `${String(nextSlot.hour).padStart(2, "0")}:00`,
                        };
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="bookingTime">Time</Label>
                  <Input
                    id="bookingTime"
                    type="time"
                    min={getMinTimeForDate(bookingForm.date)}
                    value={bookingForm.time}
                    onChange={(event) => setBookingForm((prev) => ({ ...prev, time: event.target.value }))}
                  />
                </div>
              </div>
              <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="size-4" />
                  {selectedService ? `${selectedService.duration} min · ${paymentLabel(selectedService)}` : "Select a service"}
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={bookingForm.notes} onChange={(event) => setBookingForm((prev) => ({ ...prev, notes: event.target.value }))} />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Book</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimeGrid({
  view,
  days,
  bookings,
  onSlotClick,
  professionals,
  dayViewProfessionalIds,
  selectedProfessionalId,
}) {
  const isDayView = view === "day";
  const columnsCount = isDayView ? dayViewProfessionalIds.length : days.length;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[780px]">
        <div
          className="grid border-b bg-slate-50"
          style={{ gridTemplateColumns: `72px repeat(${columnsCount}, minmax(160px, 1fr))` }}
        >
          <div className="p-3 text-xs font-medium text-slate-400">
            <CalendarDays className="size-4" />
          </div>
          {isDayView ? (
            dayViewProfessionalIds.map((profId) => {
              const professional = professionals.find((p) => p.id === profId);
              return (
                <div key={profId} className="border-l p-3 text-center">
                  <div className="text-xs uppercase text-slate-400">Professional</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {professional ? professional.name : "Unknown"}
                  </div>
                  {professional?.role?.name && (
                    <div className="text-[10px] text-slate-500 truncate">{professional.role.name}</div>
                  )}
                </div>
              );
            })
          ) : (
            days.map((day) => (
              <div key={day.toISOString()} className="border-l p-3 text-center">
                <div className="text-xs uppercase text-slate-400">{format(day, "EEE")}</div>
                <div className="text-sm font-semibold text-slate-900">{format(day, "MMM d")}</div>
              </div>
            ))
          )}
        </div>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid min-h-24 border-b"
            style={{ gridTemplateColumns: `72px repeat(${columnsCount}, minmax(160px, 1fr))` }}
          >
            <div className="border-r px-3 py-2 text-xs font-medium text-slate-400">
              {format(setHours(new Date(), hour), "ha")}
            </div>
            {isDayView ? (
              dayViewProfessionalIds.map((profId) => {
                const day = days[0];
                const isDisabled = !isBookableSlot(day, hour);
                const slotBookings = bookings.filter((booking) => {
                  const scheduledAt = parseISO(booking.scheduledAt);
                  return (
                    isSameDay(scheduledAt, day) &&
                    scheduledAt.getHours() === hour &&
                    booking.professionalId === profId
                  );
                });

                return (
                  <button
                    key={`${profId}-${hour}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onSlotClick(day, hour, profId)}
                    className={`min-h-24 border-l p-1 text-left ${
                      isDisabled ? "cursor-not-allowed bg-slate-100 text-slate-400" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1">
                      {slotBookings.map((booking) => (
                        <AppointmentCard
                          key={booking.id}
                          booking={booking}
                          compact
                          showProfessional={false}
                        />
                      ))}
                    </div>
                  </button>
                );
              })
            ) : (
              days.map((day) => {
                const isDisabled = !isBookableSlot(day, hour);
                const slotBookings = bookings.filter((booking) => {
                  const scheduledAt = parseISO(booking.scheduledAt);
                  return isSameDay(scheduledAt, day) && scheduledAt.getHours() === hour;
                });

                return (
                  <button
                    key={`${day.toISOString()}-${hour}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onSlotClick(day, hour, selectedProfessionalId)}
                    className={`min-h-24 border-l p-1 text-left ${
                      isDisabled ? "cursor-not-allowed bg-slate-100 text-slate-400" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1">
                      {slotBookings.map((booking) => (
                        <AppointmentCard
                          key={booking.id}
                          booking={booking}
                          compact={days.length > 3}
                          showProfessional={false}
                        />
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthCalendar({ days, anchorDate, bookings, onSlotClick }) {
  return (
    <div className="grid grid-cols-7">
      {days.map((day) => {
        const nextSlot = getNextBookableSlot(day, 9);
        const isDisabled = isPastDay(day) || !isSameDay(nextSlot.date, day);
        const dayBookings = bookings.filter((booking) => isSameDay(parseISO(booking.scheduledAt), day));
        return (
          <button
            key={day.toISOString()}
            type="button"
            disabled={isDisabled}
            onClick={() => onSlotClick(nextSlot.date, nextSlot.hour)}
            className={`min-h-32 border-b border-r p-2 text-left ${
              isDisabled
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : isSameMonth(day, anchorDate)
                  ? "bg-white hover:bg-slate-50"
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            <div className="mb-2 text-xs font-semibold">{format(day, "d")}</div>
            <div className="space-y-1">
              {dayBookings.slice(0, 3).map((booking) => (
                <AppointmentCard key={booking.id} booking={booking} compact />
              ))}
              {dayBookings.length > 3 && <div className="text-xs text-slate-500">+{dayBookings.length - 3} more</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AppointmentCard({ booking, compact = false, showProfessional = false }) {
  return (
    <div className="rounded border-l-4 bg-slate-100 p-2 text-xs text-slate-800 shadow-sm" style={{ borderLeftColor: booking.service?.color || "#2563eb" }}>
      <div className="truncate font-semibold">{appointmentTitle(booking)}</div>
      {showProfessional && <div className="truncate text-slate-600">{booking.professional?.name}</div>}
      <div className="truncate text-slate-600">{booking.service?.name}</div>
      {!compact && <div className="mt-1 text-slate-500">{format(parseISO(booking.scheduledAt), "h:mm a")}</div>}
    </div>
  );
}
