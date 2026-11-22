"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatVendorCurrency } from "@/lib/vendor-currency";

export default function ServiceSelect({ services, selectedService, onSelectService, currencyCode = "USD" }) {
  return (
    <>
      {/* Header */}
      <label htmlFor="booking-professional" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">Service</label>
      <DropdownMenu className="mt-2">
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="h-auto w-full justify-between rounded-xl border-slate-200 px-4 py-2.5 text-left" disabled={!services.length}>
            <span className="min-w-0">
              <span className="mt-1 block truncate text-sm  text-slate-900">{selectedService?.name || (services.length ? "Select a service" : "No services available at this location")}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 rotate-90" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-80 w-[min(34rem,calc(100vw-2rem))] overflow-y-auto">
          {services.map((service) => (
            <DropdownMenuItem key={service.id} onSelect={() => onSelectService(service)} className="flex cursor-pointer items-center justify-between gap-4 py-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{service.name}</span>
                <span className="text-xs text-slate-500">{service.duration} min · {service.prepaymentType === "full" ? "Full payment required" : service.prepaymentType === "deposit" ? `Deposit required (${service.depositType === "fixed" ? formatVendorCurrency(service.depositValue, currencyCode) : `${service.depositValue}%`})` : "Pay at business"}</span>
              </span>
              <span className="shrink-0 text-sm font-bold">{formatVendorCurrency(service.price, currencyCode)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
