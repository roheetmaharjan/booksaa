"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROFESSIONAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const LOCATION_OPTIONS = [1, 2, 3, 4, 5];

function currency(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calculateTotal(plan, professionals, locations) {
  const basePrice = Number(plan?.price || 0);
  const includedProfessionals = Number(plan?.professional || 1);
  const includedLocations = Number(plan?.location || 1);
  const extraProfessionalPrice = Number(plan?.extraProfessionalPrice || 0);
  const extraLocationPrice = Number(plan?.extraLocationPrice || 0);

  const extraProfessionals = Math.max(professionals - includedProfessionals, 0);
  const extraLocations = Math.max(locations - includedLocations, 0);

  return {
    basePrice,
    extraProfessionals,
    extraLocations,
    extraProfessionalPrice,
    extraLocationPrice,
    extraProfessionalCost: extraProfessionals * extraProfessionalPrice,
    extraLocationCost: extraLocations * extraLocationPrice,
    total:
      basePrice +
      extraProfessionals * extraProfessionalPrice +
      extraLocations * extraLocationPrice,
  };
}

export default function BusinessPricingCalculator() {
  const [plan, setPlan] = useState(null);
  const [professionals, setProfessionals] = useState(1);
  const [locations, setLocations] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/business-signup")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const plans = data?.plans || [];
        setPlan(plans[0] || null);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setPlan(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const pricing = useMemo(
    () => calculateTotal(plan, professionals, locations),
    [plan, professionals, locations]
  );

  const billingCycle = plan?.billing_cycle || "month";
  const trialDays = Number(plan?.trial_period || 0);
  const includedProfessionals = Number(plan?.professional || 1);
  const includedLocations = Number(plan?.location || 1);

  const signupHref = `/business-signup?${new URLSearchParams({
    ...(plan?.id ? { planId: plan.id } : {}),
    professionals: String(professionals),
    locations: String(locations),
  }).toString()}`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 max-w-md w-full mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="font-semibold text-slate-500 text-sm tracking-wide uppercase mb-4">
          Here&apos;s what you&apos;ll pay
        </p>

        {loading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="h-2 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            {/* <p className="text-slate-400 text-sm mb-1">
              Base subscription ${currency(plan?.price)}
            </p> */}

            {/* Big price display */}
            <div className="flex items-end justify-center gap-1 my-3">
              <span className="text-2xl font-semibold text-slate-500 mb-3">$</span>
              <span className="text-6xl font-bold text-slate-900 leading-none">
                {currency(pricing.total).split(".")[0]}
              </span>
              <div className="mb-2 text-left">
                <span className="text-xl font-semibold text-slate-700">
                  .{currency(pricing.total).split(".")[1]}
                </span>
                <p className="text-slate-400 text-sm">/ {billingCycle}</p>
              </div>
            </div>
            {/* Included summary */}
            {/* <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {professionals} bookable calendar{professionals !== 1 ? "s" : ""}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {locations} business location{locations !== 1 ? "s" : ""}
              </span>
            </div> */}
          </>
        )}
      </div>

      <div className="h-px bg-slate-100 mb-6" />

      {/* Pickers */}
      <div className="space-y-5">
        <NumberPicker
          icon={CalendarDays}
          label="Professionals"
          value={professionals}
          onChange={setProfessionals}
          included={includedProfessionals}
        />
        <NumberPicker
          icon={MapPin}
          label="Locations"
          value={locations}
          onChange={setLocations}
          included={includedLocations}
        />
      </div>

      {/* Trial badge */}
      {trialDays > 0 && (
        <p className="mt-5 text-center text-sm text-slate-500">
          🎉{" "}
          <span className="font-medium text-slate-700">
            {trialDays}-day free trial
          </span>{" "}
          included — no credit card required
        </p>
      )}

      {/* CTA */}
      <div className="mt-5">
        <Button asChild size="lg" className="w-full gap-2 text-base font-semibold h-12">
          <Link href={signupHref}>
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/* ─── Number Picker ─────────────────────────────────────────────────────────── */

function NumberPicker({ icon: Icon, label, value, onChange, included }) {
  const isExtra = value > included;

  const decrement = () => onChange(Math.max(1, value - 1));
  const increment = () => onChange(value + 1);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decrement}
            disabled={value <= 1}
            className="h-10 w-10 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-600 text-xl font-medium
              hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            −
          </button>

          <div className="flex-1 min-w-20 h-10 flex items-center justify-center rounded-lg border font-semibold text-base transition">
            {value}
          </div>

          <button
            type="button"
            onClick={increment}
            className="h-10 w-10 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-600 text-xl font-medium
              hover:bg-slate-50 transition"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add-on Row ─────────────────────────────────────────────────────────────── */

function AddOnRow({ label, count, unitPrice, total }) {
  const hasExtra = count > 0;

  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="text-right">
        <span className={`text-sm ${hasExtra ? "text-orange-600 font-medium" : "text-slate-400"}`}>
          {count} × ${currency(unitPrice)}
        </span>
        {hasExtra && (
          <span className="ml-2 text-sm font-semibold text-orange-600">
            = ${currency(total)}
          </span>
        )}
      </div>
    </div>
  );
}