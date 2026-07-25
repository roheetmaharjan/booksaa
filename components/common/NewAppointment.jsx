"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { calculateBookingTotals } from "@/lib/booking-deposit";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ProfessionalAvatar from "@/components/common/ProfessionalAvatar";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Clock, ChevronsUpDown, Check, CreditCard, Banknote, QrCode, Link2, ShieldCheck, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CustomerCreateDialog } from "@/components/customers/CustomerCreateDialog";
import { format, startOfDay, addMinutes, isAfter, isSameDay } from "date-fns";
import { toast } from "sonner";

// ─── constants ──────────────────────────────────────────────────────────────

const DEFAULT_DURATION = 30;
const DEFAULT_TAX_RATE = 0;

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
    serviceIds: [],
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

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
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
    <button type="button" onClick={() => onSelect(service.id)} className={cn("group relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150", selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: service.color || "#2563eb" }} />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-medium", selected ? "text-white" : "text-slate-700")}>{service.name}</span>
        <span className={cn("mt-0.5 flex items-center gap-1.5 text-xs", selected ? "text-slate-200" : "text-slate-500")}>
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
  const [depositReviewOpen, setDepositReviewOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [skipDepositConfirmOpen, setSkipDepositConfirmOpen] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

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
      serviceIds: services[0] ? [services[0].id] : [],
      date: toDateString(startDate),
      startTime: toTimeString(startDate),
      endTime: toTimeString(endDate),
    });

    setCustomerError("");
  }, [open, initialStart, initialProfessionalId, initialCustomer, professionals, services]);

  const selectedServices = services.filter((service) => (bookingForm.serviceIds || []).includes(service.id));
  const selectedService = selectedServices[0] || null;

  const minStartTime = isSameDay(combineDateAndTime(bookingForm.date, "00:00"), new Date()) ? toTimeString(getNextBookableDate()) : undefined;
  const bookingTotals = calculateBookingTotals(selectedServices, { taxRate: DEFAULT_TAX_RATE });

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
    async (paymentOption = "pay_later") => {
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
      if ((bookingForm.serviceIds || []).length === 0) {
        toast.error("Please select at least one service.");
        return;
      }

      setSubmittingBooking(true);
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookingForm,
            serviceId: bookingForm.serviceIds?.[0] || "",
            serviceIds: bookingForm.serviceIds || [],
            paymentOption,
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
        setDepositReviewOpen(false);
        onBookingSuccess?.();
      } catch (err) {
        console.error(err);
        toast.error("Unable to book appointment");
      } finally {
        setSubmittingBooking(false);
      }
    },
    [bookingForm, onBookingSuccess],
  );

  const getPaymentOptionForMethod = useCallback((method) => {
    if (method === "cash") return "collect_now_cash";
    if (method === "link") return "send_link";
    if (method === "skip") return "skip_deposit";
    return "collect_now_card";
  }, []);

  // gate the real submit handler behind compulsory customer validation
  const handleSubmitWithValidation = useCallback(
    (e) => {
      e.preventDefault();
      if (!bookingForm.customerId) {
        setCustomerError("Please select a customer before confirming the booking.");
        return;
      }
      if ((bookingForm.serviceIds || []).length === 0) {
        setCustomerError("Please select at least one service before confirming the booking.");
        return;
      }
      setCustomerError("");
      setDepositReviewOpen(true);
    },
    [bookingForm.customerId, bookingForm.serviceIds.length],
  );

  // recalc end time when the selected services change
  useEffect(() => {
    if (selectedServices.length === 0) return;
    const start = combineDateAndTime(bookingForm.date, bookingForm.startTime);
    const totalDuration = selectedServices.reduce((sum, service) => sum + (service.duration || DEFAULT_DURATION), 0);
    setBookingForm((p) => ({
      ...p,
      endTime: toTimeString(addMinutes(start, totalDuration)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingForm.serviceIds?.join(",") || ""]);

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
    <>
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
                      <ServiceCard
                        key={svc.id}
                        service={svc}
                        selected={(bookingForm.serviceIds || []).includes(svc.id)}
                        onSelect={(id) =>
                          setBookingForm((p) => ({
                            ...p,
                            serviceIds: (p.serviceIds || []).includes(id) ? (p.serviceIds || []).filter((serviceId) => serviceId !== id) : [...(p.serviceIds || []), id],
                          }))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-slate-100 px-6 py-4">
            <span className="mr-auto text-xs text-slate-400">{selectedServices.length > 0 ? `${selectedServices.reduce((sum, service) => sum + (service.duration || DEFAULT_DURATION), 0)} min · ${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} selected` : "Select a service"}</span>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 text-slate-600">
              Cancel
            </Button>
            <Button type="submit">Review booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

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

    <Dialog open={depositReviewOpen} onOpenChange={setDepositReviewOpen}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Deposit collection</DialogTitle>
          <DialogDescription>Review the appointment summary and choose how the deposit should be handled before confirming.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Appointment summary</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between"><span>Customer</span><span className="font-medium text-slate-900">{bookingForm.customerName || "Customer"}</span></div>
              <div className="flex items-center justify-between"><span>Staff</span><span className="font-medium text-slate-900">{professionals.find((professional) => professional.id === bookingForm.professionalId)?.name || "Unassigned"}</span></div>
              <div className="flex items-center justify-between"><span>Services</span><span className="font-medium text-slate-900">{selectedServices.map((service) => service.name).join(", ") || "No services selected"}</span></div>
              <div className="flex items-center justify-between"><span>Time</span><span className="font-medium text-slate-900">{format(new Date(`${bookingForm.date}T${bookingForm.startTime}`), "EEE, MMM d · h:mm a")}</span></div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between py-1"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(bookingTotals.subtotal)}</span></div>
              <div className="flex items-center justify-between py-1"><span className="text-slate-500">Taxes</span><span>{formatCurrency(bookingTotals.taxAmount)}</span></div>
              <div className="flex items-center justify-between py-1"><span className="text-slate-500">Total</span><span className="font-semibold text-slate-900">{formatCurrency(bookingTotals.total)}</span></div>
              <div className="flex items-center justify-between py-1"><span className="text-slate-500">Required deposit</span><span className="font-semibold text-slate-900">{formatCurrency(bookingTotals.requiredDeposit)}</span></div>
              <div className="flex items-center justify-between py-1"><span className="text-slate-500">Remaining balance</span><span className="font-semibold text-slate-900">{formatCurrency(bookingTotals.remainingBalance)}</span></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-2xl border border-slate-200 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Payment method</p>
              <div className="mt-3 space-y-2">
                {[
                  { id: "card", label: "Card", description: "Collect the deposit securely", icon: CreditCard },
                  { id: "cash", label: "Cash", description: "Record cash received at the desk", icon: Banknote },
                  { id: "qr", label: "QR payment", description: "Use a dynamic payment QR", icon: QrCode },
                  { id: "link", label: "Send payment link", description: "Send the deposit link by email or SMS", icon: Link2 },
                  { id: "skip", label: "Skip deposit", description: "Bypass deposit for approved staff", icon: ShieldCheck },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedPaymentMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (option.id === "skip") {
                          setSkipDepositConfirmOpen(true);
                          return;
                        }
                        setSelectedPaymentMethod(option.id);
                      }}
                      className={cn("flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all", isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}
                    >
                      <span className={cn("rounded-lg p-2", isSelected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700")}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className={cn("block text-sm font-medium", isSelected ? "text-white" : "text-slate-700")}>{option.label}</span>
                        <span className={cn("text-xs", isSelected ? "text-slate-200" : "text-slate-500")}>{option.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Deposit collection is handled as a separate payment state from the appointment lifecycle, keeping the booking confirmed while the payment remains pending or paid.</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <span className="text-sm text-slate-500">Primary action confirms the booking and updates the payment state.</span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setDepositReviewOpen(false)} className="h-9">Back</Button>
            <Button type="button" onClick={() => handleCreateBooking(getPaymentOptionForMethod(selectedPaymentMethod))} disabled={submittingBooking} className="h-9">
              {submittingBooking ? "Confirming…" : "Confirm booking"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={skipDepositConfirmOpen} onOpenChange={setSkipDepositConfirmOpen}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Bypass deposit?</DialogTitle>
          <DialogDescription>This appointment normally requires a deposit. Continue only if you have approval to waive it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-600">
          <p>Recording this as a waived deposit keeps the appointment confirmed while leaving the payment state as pending for audit and reporting.</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setSkipDepositConfirmOpen(false)}>Cancel</Button>
          <Button type="button" onClick={() => { setSelectedPaymentMethod("skip"); setSkipDepositConfirmOpen(false); }}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
