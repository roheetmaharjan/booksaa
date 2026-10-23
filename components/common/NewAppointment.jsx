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
import { PAYMENT_METHODS, PAYMENT_OPTIONS, getPaymentOptionForMethod } from "@/constants/payment";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { ArrowLeft, Clock, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CustomerCreateFormContent } from "@/components/customers/CustomerCreateDialog";
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
    <button type="button" onClick={() => onSelect(service.id)} className={cn("group relative flex w-full items-start gap-2 p-3 text-left transition-all duration-150", selected ? "bg-gray-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
      <span className="h-full w-1 shrink-0 absolute left-0 top-0" style={{ backgroundColor: service.color || "#2563eb" }} />
      <div className="min-w-0 flex-1 flex items-start justify-start gap-2 pr-1">
        {selected ? (
          <span className="flex h-4 w-4 items-center justify-center border border-gray-200 bg-white">
            <Check className="h-5 w-5 text-slate-900" strokeWidth={3} />
          </span>
        ) : (
          <span className="h-4 w-4 border border-gray-200 bg-white" />
        )}
        <div>
          <p className={cn("truncate text-sm font-medium flex items-center gap-2", selected ? "" : "text-slate-700")}>{service.name}</p>
          <p className="text-gray-600 font-normal text-xs">{paymentLabel(service)}</p>
        </div>
        <span className={cn("mt-0.5 flex items-center gap-1.5 text-xs", selected ? "text-slate-600" : "text-slate-600")}>
          <Clock className="h-3 w-3" /> {service.duration} min
        </span>
      </div>
    </button>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function NewAppointment({ open, onOpenChange, onBookingSuccess, initialStart, initialProfessionalId, professionals = [], services = [], initialCustomer }) {
  const [bookingForm, setBookingForm] = useState(() => getEmptyBooking());
  const [depositReviewOpen, setDepositReviewOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerError, setCustomerError] = useState("");

  // New customer is a second view of this same dialog, never a nested popup.
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ fullName: "", phone: "", email: "" });
  const [customerErrors, setCustomerErrors] = useState({});
  const [duplicateState, setDuplicateState] = useState(null);
  const [savingCustomer, setSavingCustomer] = useState(false);
  // const paymentOption = getPaymentOptionForMethod(method);

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

  const requiresDeposit = selectedServices.some((service) => service.prepaymentType !== "pay_later");

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`);
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
    async (ignoreDuplicate = false) => {
      setSavingCustomer(true);
      setCustomerErrors({});
      setDuplicateState(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...customerForm, ignoreDuplicate }),
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
    resetCreate();
    setNewCustomerOpen(true);
  }, [resetCreate]);

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
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
        // Give the parent the newly created booking(s) so pages that display
        // appointments can refresh and focus the new appointment immediately.
        await onBookingSuccess?.(data);
        onOpenChange?.(false);
      } catch (err) {
        console.error(err);
        toast.error("Unable to book appointment");
      } finally {
        setSubmittingBooking(false);
      }
    },
    [bookingForm, onBookingSuccess],
  );

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

      // Pay-later services can be booked immediately.
      if (!requiresDeposit) {
        handleCreateBooking("pay_later");
        return;
      }

      // At least one selected service requires payment/deposit.
      setSelectedPaymentMethod(null);
      setDepositReviewOpen(true);
    },
    [bookingForm.customerId, bookingForm.serviceIds, requiresDeposit, handleCreateBooking],
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
        <DialogContent className="p-0 sm:max-w-[700px] w-full" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              {newCustomerOpen && <Button type="button" variant="ghost" size="icon" className="-ml-2 size-8" onClick={() => setNewCustomerOpen(false)} aria-label="Back to appointment"><ArrowLeft className="size-4" /></Button>}
              <div>
                <DialogTitle className="font-semibold text-slate-900">{newCustomerOpen ? "Add customer" : "New appointment"}</DialogTitle>
                {newCustomerOpen && <DialogDescription className="mt-1">Create a customer, then continue booking this appointment.</DialogDescription>}
              </div>
            </div>
          </DialogHeader>

          {newCustomerOpen ? (
            <div className="max-h-[calc(90vh-100px)] overflow-y-auto px-6 py-5">
              <CustomerCreateFormContent
                form={customerForm}
                onChange={handleCustomerFormChange}
                setForm={setCustomerForm}
                onSubmit={handleCustomerSubmit}
                onCancel={() => setNewCustomerOpen(false)}
                cancelLabel="Back"
                saving={savingCustomer}
                duplicateState={duplicateState}
                errors={customerErrors}
              />
            </div>
          ) : (
          <form onSubmit={handleSubmitWithValidation}>
            <div className="no-scrollbar overflow-y-auto px-3 pb-3">
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
                          <CommandInput className="border-none pl-2" placeholder="Search customer..." />
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
              <div className="grid grid-cols-2 items-stretch divide-slate-100 border-t gap-4 pt-4 mt-4 h-full">
                {/* Left: customer + scheduling */}
                <div className="flex flex-col gap-5 h-full">
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
                <div className="flex flex-col h-full border rounded-lg">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 ml-3 mt-3">Service</p>
                  {services.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-sm text-slate-400">No any services added.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col rounded-md max-h-[400px] overflow-auto">
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
            <DialogFooter className="border-t border-slate-100 px-6 py-4 justify-between">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 text-slate-600">
                Cancel
              </Button>
              <Button type="submit" disabled={submittingBooking}>
                {submittingBooking ? "Booking…" : requiresDeposit ? "Continue to payment" : "Confirm booking"}
              </Button>
            </DialogFooter>
          </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={depositReviewOpen} onOpenChange={setDepositReviewOpen}>
        <DialogContent className="sm:max-w-[920px]">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr] max-h-[500px] overflow-y-auto">
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[12px] font-semibold uppercase text-slate-900">Appointment summary</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Customer</span>
                  <span className="font-medium text-slate-900">{bookingForm.customerName || "Customer"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Staff</span>
                  <span className="font-medium text-slate-900">{professionals.find((professional) => professional.id === bookingForm.professionalId)?.name || "Unassigned"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Services</span>
                  <span className="font-medium text-slate-900">{selectedServices.map((service) => service.name).join(", ") || "No services selected"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time</span>
                  <span className="font-medium text-slate-900">{format(new Date(`${bookingForm.date}T${bookingForm.startTime}`), "EEE, MMM d · h:mm a")}</span>
                </div>
              </div>
              <div className="mt-4 text-sm pt-4 border-t">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{formatCurrency(bookingTotals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Taxes</span>
                  <span>{formatCurrency(bookingTotals.taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Total</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(bookingTotals.total)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Required deposit</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(bookingTotals.requiredDeposit)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Remaining balance</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(bookingTotals.remainingBalance)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-[11px] font-semibold uppercase text-slate-900">Payment method</p>
                <p className="mt-1 text-xs text-slate-500">Select one payment method to collect the required deposit.</p>

                <div className="mt-3 space-y-2">
                  {PAYMENT_METHODS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedPaymentMethod === option.id;

                    return (
                      <button key={option.id} type="button" onClick={() => setSelectedPaymentMethod(option.id)} className={cn("flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all", isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
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
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="ghost" onClick={() => setDepositReviewOpen(false)} className="h-9">
                Back
              </Button>
              <Button type="button" onClick={() => handleCreateBooking(getPaymentOptionForMethod(selectedPaymentMethod))} disabled={submittingBooking || !selectedPaymentMethod} className="h-9">
                {submittingBooking ? "Processing…" : `Book Now`}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
