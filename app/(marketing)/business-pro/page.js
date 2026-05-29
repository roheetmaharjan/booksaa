import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BusinessPricingCalculator from "@/components/components_marketing/BusinessPricingCalculator";

export default function BusinessProPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="container">
        <section className="grid min-h-screen w-full grid-cols-2 items-center gap-10">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-normal text-emerald-700">Booksaa Business Pro</p>
            <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl">Run bookings, locations, teams, and services from one business dashboard.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">Start a free trial and create your business owner account in a few minutes. Your trial length is pulled from the plan you choose during signup.</p>
          </div>
          <div className="max-w-lg space-y-5">
            <BusinessPricingCalculator />
          </div>
        </section>
      </div>
    </main>
  );
}
