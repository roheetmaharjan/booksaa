import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, CalendarCheck2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BusinessProPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_0.9fr] lg:px-10">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-normal text-emerald-700">
            Booksaa Business Pro
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
            Run bookings, locations, teams, and services from one business dashboard.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Start a free trial and create your business owner account in a few minutes. Your trial length is pulled from the plan you choose during signup.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/business-signup">
                Start a free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">Back to website</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="relative min-h-[360px] overflow-hidden rounded-lg">
            <Image
              src="/business.jpg"
              alt="Business owner managing bookings"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="grid gap-4">
            <Feature
              icon={CalendarCheck2}
              title="Online booking"
              description="Let customers book services with your live availability."
            />
            <Feature
              icon={BarChart3}
              title="Business setup"
              description="Add your category, plan, primary location, and service options."
            />
            <Feature
              icon={ShieldCheck}
              title="Trial included"
              description="The selected plan starts with its configured trial period automatically."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-4 rounded-md border bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
