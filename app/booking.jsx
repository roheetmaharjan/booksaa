import React, { useState } from "react";

const services = [
  {
    id: 1,
    name: "Haircut & Styling",
    duration: "45 MIN",
    price: 25,
    category: "Hair Styling",
    description:
      "Includes personal consultation, wash, precision haircut, and blow-dry finish.",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Hair Coloring & Highlights",
    duration: "90 MIN",
    price: 60,
    category: "Coloring & Treatment",
    description:
      "Full balayage, tone correction, and organic nourishment.",
    image:
      "https://images.unsplash.com/photo-1560869713-da86a9ec0744?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Luxury Manicure & Spa",
    duration: "60 MIN",
    price: 30,
    category: "Nails & Beauty",
    description:
      "Complete cuticle care, exfoliating hand massage, and premium polish.",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 4,
    name: "Keratin Revitalize Treatment",
    duration: "75 MIN",
    price: 75,
    category: "Coloring & Treatment",
    description:
      "Deep frizz-free smoothing and thermal seal.",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
  },
];

const categories = [
  "All Services",
  "Hair Styling",
  "Coloring & Treatment",
  "Nails & Beauty",
];

export default function BookingServiceSelection() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [activeCategory, setActiveCategory] = useState("All Services");

  const filteredServices =
    activeCategory === "All Services"
      ? services
      : services.filter(
          (service) => service.category === activeCategory
        );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white shadow-sm">

        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-2 sm:px-6 lg:px-10">

          {/* Brand */}
          <div className="flex items-center gap-4">

            <a
              href="#"
              className="text-xl font-bold tracking-tight text-indigo-600 transition-transform active:scale-95"
            >
              Booksaa
            </a>

            <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 sm:flex">

              <span className="h-2 w-2 rounded-full bg-pink-600" />

              <span className="text-xs font-medium text-slate-600">
                ABC Beauty & Wellness
              </span>

            </div>

          </div>


          {/* Steps */}
          <nav className="hidden items-center gap-6 md:flex">

            <Step
              active
              number="1"
              label="Service"
            />

            <Step
              number="2"
              label="Staff"
            />

            <Step
              number="3"
              label="Date & Time"
            />

            <Step
              number="4"
              label="Details"
            />

          </nav>


          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">

            <button
              type="button"
              aria-label="Help"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
            >
              ?
            </button>

            <button
              type="button"
              aria-label="Share"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
            >
              ↗
            </button>

            <button
              type="button"
              className="ml-1 hidden rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 sm:inline-flex"
            >
              Confirm Booking
            </button>

          </div>

        </div>

      </header>


      {/* ================= MAIN ================= */}
      <main className="flex min-h-[calc(100vh-57px)] items-center justify-center p-3 sm:p-5 lg:py-8">

        <div className="flex w-full max-w-[1180px] flex-col overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_24px_64px_-12px_rgba(30,39,46,0.14)] lg:flex-row">

          {/* ================= LEFT PANEL ================= */}
          <section className="relative flex min-h-[360px] w-full flex-col justify-between overflow-hidden bg-slate-200 p-5 sm:p-6 lg:min-h-[640px] lg:w-1/2 lg:p-6">

            <img
              src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=85"
              alt="ABC Beauty & Wellness"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-slate-900/40" />


            {/* Business Badge */}
            <div className="relative z-10 flex w-full items-center justify-between">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">

                <span className="text-sm text-pink-600">
                  ✦
                </span>

                <span className="text-[11px] font-semibold tracking-wide text-slate-900">
                  ABC Beauty & Wellness, Kathmandu, Nepal
                  <span className="ml-1 text-amber-500">
                    ★ 4.9
                  </span>
                  <span className="ml-1 text-slate-500">
                    (128)
                  </span>
                </span>

              </div>


              <div className="hidden items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-800 backdrop-blur-sm sm:inline-flex">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                Open Today

              </div>

            </div>


            {/* Bottom Information Card */}
            <div className="relative z-10 mt-auto rounded-xl border border-white/60 bg-white/95 p-4 shadow-lg backdrop-blur-md">

              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
                Step 1 of 4
              </span>

              <h2 className="mt-0.5 text-base font-semibold text-slate-900">
                Craft Your Personalized Ritual
              </h2>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                Select your desired aesthetic or care session. All treatments
                include tailored consultations by certified senior artists.
              </p>


              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs">

                <div className="flex items-center gap-2 text-slate-600">
                  <span>✓</span>
                  <span>100% Organic Products</span>
                </div>

                <div className="hidden items-center gap-1 text-indigo-600 sm:flex">
                  <span>◷</span>
                  <span>Instant Confirmation</span>
                </div>

              </div>

            </div>

          </section>


          {/* ================= RIGHT PANEL ================= */}
          <section className="flex w-full flex-col justify-between bg-white p-5 sm:p-7 lg:w-1/2 lg:p-8">

            {/* Header */}
            <div>

              <button
                type="button"
                className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-900"
              >
                <span>←</span>
                Back to Overview
              </button>


              <div className="flex items-baseline justify-between gap-3">

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Select a service
                </h1>

                <span className="shrink-0 text-[11px] font-medium text-slate-500">
                  {services.length} available
                </span>

              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Choose from our range of hair and wellness treatments.
              </p>


              {/* Categories */}
              <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1">

                {categories.map((category) => {

                  const active = activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`
                        whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition
                        ${
                          active
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }
                      `}
                    >
                      {category}
                    </button>
                  );

                })}

              </div>

            </div>


            {/* ================= SERVICES ================= */}
            <div className="my-5 max-h-[390px] space-y-3 overflow-y-auto pr-1">

              {filteredServices.map((service) => {

                const selected = selectedService.id === service.id;

                return (
                  <label
                    key={service.id}
                    className={`
                      group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl p-3.5 transition-all
                      ${
                        selected
                          ? "border-2 border-indigo-600 bg-indigo-50/70 shadow-sm"
                          : "border border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50"
                      }
                    `}
                  >

                    {/* Left */}
                    <div className="flex min-w-0 items-center gap-3">

                      {/* Radio */}
                      <input
                        type="radio"
                        name="service"
                        checked={selected}
                        onChange={() => setSelectedService(service)}
                        className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />


                      {/* Image */}
                      <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">

                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />

                      </div>


                      {/* Information */}
                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-sm font-semibold text-slate-900">
                            {service.name}
                          </span>

                          <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {service.duration}
                          </span>

                        </div>

                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {service.description}
                        </p>

                      </div>

                    </div>


                    {/* Price */}
                    <div className="shrink-0 pl-2 text-right">

                      <span className="text-base font-bold text-slate-900">
                        ${service.price}
                      </span>

                    </div>

                  </label>
                );

              })}

            </div>


            {/* ================= ACTION ================= */}
            <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 flex-col">

                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Selected Package
                </span>

                <span className="truncate text-sm font-bold text-slate-900">
                  {selectedService.name} (${selectedService.price})
                </span>

              </div>


              <div className="flex items-center gap-3">

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-pink-700 active:scale-95"
                >
                  <span>
                    Continue to Staff Selection
                  </span>

                  <span>
                    →
                  </span>

                </button>


                <button
                  type="button"
                  aria-label="Add quick custom request"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-700 text-lg text-white shadow-md transition hover:scale-105 active:scale-95"
                >
                  +
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-3 px-4 py-5 text-center md:flex-row md:px-10 md:text-left">

          <p className="text-xs text-slate-500">
            © 2026 ABC Beauty & Wellness Kathmandu. Powered by Booksaa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium">

            <a
              href="#"
              className="text-slate-500 transition hover:text-pink-600"
            >
              Cancellation Policy
            </a>

            <a
              href="#"
              className="text-slate-500 transition hover:text-pink-600"
            >
              Terms of Service
            </a>

            <a
              href="#"
              className="text-slate-500 transition hover:text-pink-600"
            >
              Privacy Notice
            </a>

            <a
              href="#"
              className="text-slate-500 transition hover:text-pink-600"
            >
              Contact Studio
            </a>

          </div>

        </div>

      </footer>

    </div>
  );
}


/* ================= STEP COMPONENT ================= */

function Step({ number, label, active = false }) {
  return (
    <div
      className={`
        border-b-2 pb-1 text-xs font-semibold transition
        ${
          active
            ? "border-pink-600 text-pink-600"
            : "border-transparent text-slate-500 hover:text-indigo-600"
        }
      `}
    >
      {number} {label}
    </div>
  );
}