"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DateTimeSelect({ onContinue, onBack }) {
  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Select a Date & Time</h1>
        </div>
      </div>

      {/* Date and Time */}
      <div className="h-full space-y-2 overflow-y-auto">

      </div>

      {/* Bottom */}
      <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" onClick={onBack}>
          <ChevronLeft size={14} />
          Back
        </Button>

        <Button type="button" onClick={onContinue}>
          Continue
          <ChevronRight size={14} />
        </Button>
      </div>
    </>
  );
}
