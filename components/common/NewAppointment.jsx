"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ProfessionalAvatar from "@/components/common/ProfessionalAvatar";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Clock, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CustomerCreateDialog } from "@/components/customers/CustomerCreateDialog";
import { format, startOfDay, addMinutes, isAfter, isSameDay } from "date-fns";
import { toast } from "sonner";

// ─── constants ──────────────────────────────────────────────────────────────

const DEFAULT_DURATION = 30;

// ─── helpers (self-contained — no longer supplied by the parent page) ───────

function toDateString(date) {
  return format(date, "yyyy-MM-dd");
}

function toTimeString(date) {
  return format(date, "HH:mm");
}

function combineDateAndTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}`);
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

function getEmptyBooking(startDate, serviceDuration = DEFAULT_DURATION) {
  const start = getNextBookableDate(startDate || new Date());
  const end = addMinutes(start, serviceDuration);
  return {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerId: "",
    serviceId: "",
    professionalId: "",
    date: toDateString(start),
    startTime: toTimeString(start),
    endTime: toTimeString(end),
    notes: "",
  };
}

function paymentLabel(service) {
  if (!service || service.prepaymentType === "pay_later") return "Pay later";
  if (service.prepaymentType === "full") return "Full payment";
  const value = Number(service.depositValue || 0);
  return service.depositType === "fixed" ? `$${value.toFixed(2)} deposit` : `${value}% deposit`;
}

// ─── sub-components ───────────────────────────────────────────────────────────

// Date Picker Field
function DatePickerField({ value, onChange, minDate }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal text-sm h-9">
          {value ? format(new Date(value), "MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <ShadCalendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) {
              onChange(toDateString(day));
              setCalendarOpen(false);
            }
          }}
          disabled={(day) => (minDate ? startOfDay(day) < startOfDay(minDate) : false)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// Service Card
function ServiceCard({ service, selected, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(service.id)} className={cn("group relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150", selected ? "border-slate-200 bg-slate-200 text-white" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: service.color || "#2563eb" }} />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-medium", selected ? "text-slate-600" : "text-slate-600")}>{service.name}</span>
        <span className={cn("mt-0.5 flex items-center gap-1.5 text-xs", selected ? "text-slate-600" : "text-slate-600")}>
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

// ─── main component ───────────────────────────────────────────────────────────

/**
 * Fully self-contained "new appointment" dialog. The parent only needs to control
 * `open`/`onOpenChange`, tell it where a new booking should start (`initialStart`,
 * `initialProfessionalId`), and supply the lists of `professionals`/`services`.
 * Everything else — form state, validation, scheduling math, and the actual booking
 * submission — lives in here, so this component can be dropped into any page.
 */
export default function NewAppointment({ open, onOpenChange, onBookingSuccess, initialStart, initialProfessionalId, professionals = [], services = [], onNewCustomer, initialCustomer }) {
  const [bookingForm, setBookingForm] = useState(() => getEmptyBooking());

  const [customers, setCustomers] = useState([]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerError, setCustomerError] = useState("");

  // self-contained "add new customer" dialog state, mirroring the customer
  // list page's CustomerCreateDialog usage
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ fullName: "", phone: "", email: "" });
  const [customerErrors, setCustomerErrors] = useState({});
  const [duplicateState, setDuplicateState] = useState(null);
  const [savingCustomer, setSavingCustomer] = useState(false);

  // initialize/reset the booking form whenever the dialog is opened for a new slot
  useEffect(() => {
    if (!open) return;

    const duration = services[0]?.duration || DEFAULT_DURATION;
    const startDate = initialStart || getNextBookableDate();
    const endDate = addMinutes(startDate, duration);

    setBookingForm({
      ...getEmptyBooking(startDate, duration),

      customerId: initialCustomer?.id || "",
      customerName: initialCustomer?.fullName || "",
      customerPhone: initialCustomer?.phone || "",
      customerEmail: initialCustomer?.email || "",

      professionalId: initialProfessionalId || professionals[0]?.id || "",
      serviceId: services[0]?.id || "",
      date: toDateString(startDate),
      startTime: toTimeString(startDate),
      endTime: toTimeString(endDate),
    });

    setCustomerError("");
  }, [open, initialStart, initialProfessionalId, initialCustomer, professionals, services]);

  const selectedService = services.find((s) => s.id === bookingForm.serviceId) || null;

  const minStartTime = isSameDay(combineDateAndTime(bookingForm.date, "00:00"), new Date()) ? toTimeString(getNextBookableDate()) : undefined;

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const resetCreate = useCallback(() => {
    setCustomerForm({ fullName: "", phone: "", email: "" });
    setCustomerErrors({});
    setDuplicateState(null);
  }, []);

  const handleCustomerFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
    setCustomerErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleCustomerSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setSavingCustomer(true);
      setCustomerErrors({});
      setDuplicateState(null);
      try {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerForm),
        });
        const data = await res.json();

        if (!res.ok) {
          if (data.duplicate) {
            setDuplicateState(data.duplicate);
          } else {
            setCustomerErrors(data.errors || { fullName: data.message || "Failed to create customer" });
          }
          return;
        }

        const created = data.customer;
        await loadCustomers();

        // auto-select the newly created customer in the booking form
        setBookingForm((prev) => ({
          ...prev,
          customerId: created.id,
          customerName: created.fullName,
          customerPhone: created.phone,
          customerEmail: created.email,
        }));
        setCustomerError("");

        setNewCustomerOpen(false);
        resetCreate();
      } catch {
        setCustomerErrors({ fullName: "Something went wrong. Please try again." });
      } finally {
        setSavingCustomer(false);
      }
    },
    [customerForm, loadCustomers, resetCreate],
  );

  const handleNewCustomerClick = useCallback(() => {
    if (onNewCustomer) {
      onNewCustomer();
      return;
    }
    resetCreate();
    setNewCustomerOpen(true);
  }, [onNewCustomer, resetCreate]);

  // create booking
  const handleCreateBooking = useCallback(
    async (e) => {
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
        onBookingSuccess?.();
      } catch (err) {
        console.error(err);
        toast.error("Unable to book appointment");
      }
    },
    [bookingForm, onBookingSuccess],
  );

  // gate the real submit handler behind compulsory customer validation
  const handleSubmitWithValidation = useCallback(
    (e) => {
      if (!bookingForm.customerId) {
        e.preventDefault();
        setCustomerError("Please select a customer before confirming the booking.");
        return;
      }
      setCustomerError("");
      handleCreateBooking(e);
    },
    [bookingForm.customerId, handleCreateBooking],
  );

  // recalc end time when the selected service changes
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="p-0 sm:max-w-[900px] w-full" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="border-b border-slate-100 px-6 py-4">
          <DialogTitle className="font-semibold text-slate-900">New appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmitWithValidation}>
          <div className="no-scrollbar max-h-[80vh] overflow-y-auto px-3">
            <section>
              <div className="flex flex-row items-end gap-2.5">
                <div className="flex-1">
                  <Label className="text-xs text-slate-600">Customer</Label>

                  <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" role="combobox" aria-expanded={customerOpen} className="w-full justify-between font-normal">
                        {bookingForm.customerId ? customers.find((c) => c.id === bookingForm.customerId)?.fullName : "Select customer"}

                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0" align="start" sideOffset={4} style={{ width: "var(--radix-popover-trigger-width)" }} onOpenAutoFocus={(e) => e.preventDefault()}>
                      <Command>
                        <CommandInput placeholder="Search customer..." />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.fullName}
                                keywords={[customer.phone, customer.email, customer.fullName]}
                                onSelect={() => {
                                  setBookingForm((prev) => ({
                                    ...prev,
                                    customerId: customer.id,
                                    customerName: customer.fullName,
                                    customerPhone: customer.phone,
                                    customerEmail: customer.email,
                                  }));
                                  setCustomerError("");

                                  setCustomerOpen(false);
                                }}
                              >
                                <Check className={`mr-2 h-4 w-4 ${bookingForm.customerId === customer.id ? "opacity-100" : "opacity-0"}`} />

                                <div className="flex flex-col">
                                  <span>{customer.fullName}</span>
                                  <span className="text-xs text-slate-500">{customer.phone}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {customerError && <p className="mt-1 text-xs text-red-500">{customerError}</p>}
                </div>
                <Button type="button" onClick={handleNewCustomerClick}>
                  + New Customer
                </Button>
              </div>
            </section>
            <div className="grid grid-cols-2 divide-x divide-slate-100 border-t gap-4 pt-4 mt-4">
              {/* Left: customer + scheduling */}
              <div className="flex flex-col gap-5">
                <section>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Scheduling</p>
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
                        <Input type="time" value={bookingForm.endTime} min={bookingForm.startTime} onChange={(e) => setBookingForm((p) => ({ ...p, endTime: e.target.value }))} className="mt-1 h-9 text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Professional</Label>
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
                      <Textarea value={bookingForm.notes} onChange={(e) => setBookingForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Special requests or notes…" className="mt-1 min-h-[68px] resize-none text-sm" />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right: service picker */}
              <div className="flex flex-col pl-3">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Service</p>
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
          </div>
          <DialogFooter className="border-t border-slate-100 px-6 py-4">
            <span className="mr-auto text-xs text-slate-400">{selectedService ? `${selectedService.duration} min · ${paymentLabel(selectedService)}` : "Select a service"}</span>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 text-slate-600">
              Cancel
            </Button>
            <Button type="submit">Confirm booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {!onNewCustomer && (
        <CustomerCreateDialog
          open={newCustomerOpen}
          onOpenChange={(o) => {
            setNewCustomerOpen(o);
            if (!o) resetCreate();
          }}
          form={customerForm}
          onChange={handleCustomerFormChange}
          setForm={setCustomerForm}
          onSubmit={handleCustomerSubmit}
          onCancel={() => setNewCustomerOpen(false)}
          saving={savingCustomer}
          duplicateState={duplicateState}
          errors={customerErrors}
        />
      )}
    </Dialog>
  );
}
