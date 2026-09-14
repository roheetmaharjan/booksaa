"use client";

import { format } from "date-fns";
import { CreditCard, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Avatar } from "../customers/Avatar";

export default function BookingDetailsPopover({ bookings, open, onOpenChange, onCheckout }) {
  if (!bookings) return null;
  console.log(bookings)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div className="fixed left-1/2 top-1/2 h-0 w-0" aria-hidden="true" />
      </PopoverAnchor>

      <PopoverContent align="center" side="bottom" className="w-[400px] rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg text-slate-700">{bookings.customerName || "No name"}</h3>
            <p className="text-sm text-slate-700">{bookings.customerPhone}|{bookings.customerEmail}</p>
          </div>

          <button type="button" onClick={() => onOpenChange(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="font-medium text-slate-800">{bookings.service?.name || "Service"}</p>

            <div className="flex flex-wrap gap-2 items-center mt-1">
              
              <Avatar customer={{fullName: bookings.professional?.name}}/>  
              {bookings.professional?.name}
            </div>

            <p className="mt-1 text-xs text-slate-500">{bookings.scheduledAt ? format(new Date(bookings.scheduledAt), "EEE, MMM d • h:mm a") : ""}</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <span>Payment status</span>

            <span className="font-medium text-slate-800">{bookings.paymentStatus || "UNPAID"}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          <Button className="flex-1" onClick={() => onCheckout(booking)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Checkout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
