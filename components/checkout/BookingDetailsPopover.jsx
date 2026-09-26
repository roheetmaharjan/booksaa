"use client";

import { format } from "date-fns";
import { CreditCard, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Avatar } from "../customers/Avatar";

export default function BookingDetailsPopover({ bookings, open, onOpenChange, onCheckout, trigger, anchorPosition }) {
  if (!bookings) return trigger || null;

  const services = Array.isArray(bookings.services)
    ? bookings.services
    : bookings.service
    ? [
        {
          ...bookings.service,
          bookingId: bookings.id,
          staff: bookings.professional?.name || "Unassigned",
          price: Number(bookings.service.price || bookings.paymentAmount || 0),
          duration: bookings.service.duration || 30,
          start: bookings.startTime || "",
          end: bookings.endTime || "",
        },
      ]
    : [];
  const customerName = bookings.customerName || bookings.client;
  const customerPhone = bookings.customerPhone || bookings.phone;
  const customerEmail = bookings.customerEmail || "";
  const paymentStatus = bookings.paymentStatus;
  const averageVisit = bookings.avgVisit;
  const showRate = bookings.showRate;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{trigger || <div className="fixed h-0 w-0" style={anchorPosition ? { left: anchorPosition.left, top: anchorPosition.top } : { left: "50%", top: "50%" }} aria-hidden="true" />}</PopoverAnchor>
      <PopoverContent align={anchorPosition ? "start" : "center"} side="bottom" sideOffset={0} className="w-[400px] rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg text-slate-700">{customerName || "No name"}</h3>
            <p className="text-xs text-slate-500">
              {customerPhone}
              {customerEmail && ` | ${customerEmail}`}
            </p>
          </div>

          <button type="button" onClick={() => onOpenChange(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap text-xs gap-2 mt-2 px-1">
          <span>
            <span className="text-muted-foreground">Show rate: </span>
            <b>{showRate}%</b>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            <span className="text-muted-foreground">Avg. visit: </span>
            <b>${averageVisit}</b>
          </span>
          <div className="ml-auto">{paymentStatus}</div>
        </div>
        <hr className="my-3 border-slate-100" />
        <div>
          <h5 className="uppercase text-slate-500 font-bold text-[10px] mb-2">Services</h5>
          <div className="rounded-lg border border-slate-200 divide-y divide-slate-200 max-h-[400px] overflow-y-auto">
            {services.map((service) => (
              <div key={service.id} className="py-2 px-3 flex justify-between items-center gap-3">
                <div className="flex-1">
                  <div>
                    <span className="text-sm font-medium">{service.name}</span>
                    <span className="text-xs text-slate-400"> - {service.duration} min</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {service.start} - {service.end}
                  </div>
                </div>
                <div className="text-sm font-bold">${service.price} </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mt-1" title={service.staff}>
                    <Avatar customer={{ fullName: service.staff }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {bookings.stage === "completed" ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700">
            Completed
          </div>
        ) : (
          <div className="mt-5 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>

            <Button className="flex-1" onClick={() => onCheckout(bookings)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Checkout
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
