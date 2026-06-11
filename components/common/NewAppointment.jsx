"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ProfessionalAvatar from "@/components/common/ProfessionalAvatar";
import { format, startOfDay } from "date-fns";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function toDateString(date) {
  return format(date, "yyyy-MM-dd");
}

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

// Service Card
function ServiceCard({ service, selected, onSelect, paymentLabel }) {
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

export default function NewAppointment({ open, onOpenChange, handleCreateBooking, bookingForm, setBookingForm, minStartTime, handleStartTimeChange, professionals, services, selectedService, paymentLabel }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[700px]">
        <DialogHeader className="border-b border-slate-100 px-6 py-4">
          <DialogTitle className="font-semibold text-slate-900">New appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateBooking}>
          <div className="no-scrollbar max-h-[50vh] overflow-y-auto px-2">
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              {/* Left: customer + scheduling */}
              <div className="flex flex-col gap-5 p-6">
                <section>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Customer</p>
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <Label className="text-xs text-slate-600">Name</Label>
                      <Input value={bookingForm.customerName} onChange={(e) => setBookingForm((p) => ({ ...p, customerName: e.target.value }))} placeholder="Full name" className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Phone</Label>
                      <Input value={bookingForm.customerPhone} onChange={(e) => setBookingForm((p) => ({ ...p, customerPhone: e.target.value }))} placeholder="+1 555 000" className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Email</Label>
                      <Input type="email" value={bookingForm.customerEmail} onChange={(e) => setBookingForm((p) => ({ ...p, customerEmail: e.target.value }))} placeholder="yourname@email.com" className="mt-1 h-9 text-sm" />
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
              <div className="flex flex-col p-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Service</p>
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
                        selected={bookingForm.serviceId === svc.id}
                        paymentLabel={paymentLabel}
                        onSelect={(id) =>
                          setBookingForm((p) => ({
                            ...p,
                            serviceId: id,
                          }))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <span className="text-xs text-slate-400">{selectedService ? `${selectedService.duration} min · ${paymentLabel(selectedService)}` : "Select a service"}</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 text-slate-600">
                  Cancel
                </Button>
                <Button type="submit">Confirm booking</Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
