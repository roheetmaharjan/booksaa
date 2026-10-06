"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      {/* Services */}
      <div className="h-full space-y-1 overflow-y-auto pr-1">
        {services.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
            <p className="text-sm text-slate-500">No services available at this location.</p>
          </div>
        ) : (
          services.map((service) => {
            const selected = selectedService?.id === service.id;

            return (
              <label
                key={service.id}
                className={`
                  group relative flex cursor-pointer
                  items-center justify-between gap-3
                  rounded-md p-3.5 transition-all
                  ${selected ? "border border-indigo-600 bg-indigo-50/70 shadow-sm" : "border border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50"}
                `}
              >
                {/* Left */}
                <div className="flex min-w-0 items-center gap-3">
                  <input type="radio" name="service" checked={selected} onChange={() => onSelectService(service)} className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500" />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{service.name}</span>

                      <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{service.duration} MIN</span>
                    </div>

                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{service.depositValue ? `Deposit required: ${service.depositType === "fixed" ? `$${service.depositValue}` : `${service.depositValue}%`}` : "No Deposit Required"}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="shrink-0 pl-2 text-right">
                  <span className="text-base font-bold text-slate-900">${service.price}</span>
                </div>
              </label>
            );
          })
        )}
      </div>

      {/* Bottom */}
      <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Selected Package</span>

          <span className="truncate text-sm font-bold text-slate-900">{selectedService ? `${selectedService.name} ($${selectedService.price})` : "No service selected"}</span>
        </div>

        <Button type="button" disabled={!selectedService} onClick={onContinue}>
          Continue
          <ChevronRight size={14} />
        </Button>
      </div>
    </>
  );
}
