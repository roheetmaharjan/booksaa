"use client";

import { cn } from "@/lib/utils";

export function DashboardMetric({ icon: Icon, label, value, detail, tone = "slate" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <span className={cn("flex size-10 items-center justify-center rounded-md ring-1", toneClasses[tone])}>
            <Icon className="size-5" />
          </span>
        ) : null}
      </div>
      {detail ? <p className="mt-3 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function SummaryItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function DetailCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-2 break-words text-sm text-slate-600">{value}</p>
    </div>
  );
}

export function ActionTile({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-slate-100"
    >
      <div className="flex size-11 items-center justify-center rounded-md bg-white shadow-sm">
        {icon}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </button>
  );
}

export function SetupCard({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300"
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-base font-semibold text-slate-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </button>
  );
}
