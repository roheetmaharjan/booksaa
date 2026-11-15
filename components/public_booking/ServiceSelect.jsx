"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ServiceSelect({ services, selectedService, onSelectService, onContinue }) {
  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Select a service</h1>

          <span className="shrink-0 text-[11px] font-medium text-slate-500">{services.length} available</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="h-auto w-full justify-between rounded-xl border-slate-200 px-4 py-4 text-left" disabled={!services.length}>
            <span className="min-w-0">
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Choose a service</span>
              <span className="mt-1 block truncate text-sm font-semibold text-slate-900">{selectedService?.name || (services.length ? "Select a service" : "No services available at this location")}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 rotate-90" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-80 w-[min(34rem,calc(100vw-2rem))] overflow-y-auto">
          {services.map((service) => (
            <DropdownMenuItem key={service.id} onSelect={() => onSelectService(service)} className="flex cursor-pointer items-center justify-between gap-4 py-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{service.name}</span>
                <span className="text-xs text-slate-500">{service.duration} min · {service.prepaymentType === "full" ? "Full payment required" : service.prepaymentType === "deposit" ? `Deposit required (${service.depositType === "fixed" ? `$${service.depositValue}` : `${service.depositValue}%`})` : "Pay at business"}</span>
              </span>
              <span className="shrink-0 text-sm font-bold">${service.price}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bottom */}
      <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Selected Package</span>

          <span className="truncate text-sm font-bold text-slate-900">{selectedService ? `${selectedService.name} ($${selectedService.price})` : "No service selected"}</span>
        </div>

        <Button type="button" disabled={!selectedService} onClick={onContinue}>
          Book Now
          <ChevronRight size={14} />
        </Button>
      </div>
    </>
  );
}
