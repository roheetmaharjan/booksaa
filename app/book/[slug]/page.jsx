"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MapPin, ChevronRight } from "lucide-react";

import Step from "@/components/public_booking/Step";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function BookingServiceSelection() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug;
  const initialLocationId = searchParams.get("locationId");
  const [business, setBusiness] = useState(null);
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [locationId, setLocationId] = useState(initialLocationId || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/public/bookings/${slug}?locationId=${locationId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch business");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error("Failed to load business data");
        }

        const businessData = result.data.business;
        const locationData = result.data.location;
        const servicesData = result.data.services || [];
        const locationsData = result.data.locations || [];

        setBusiness(businessData);
        setLocation(locationData);
        setServices(servicesData);
        setLocations(locationsData);

        if (servicesData.length > 0) {
          setSelectedService(servicesData[0]);
        }
      } catch (err) {
        console.error("Error fetching business:", err);
        setError("Unable to load services.");
      } finally {
        setLoading(false);
      }
    };

    if (slug && locationId) {
      fetchBusiness();
    }
  }, [slug, locationId]);

  const getServiceImage = (index) => {
    const images = ["https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80", "https://images.unsplash.com/photo-1560869713-da86a9ec0744?auto=format&fit=crop&w=300&q=80", "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80"];

    return images[index % images.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white shadow-sm py-2">
          <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <a href="#">{/* <Image src="/logo.png" alt="logo" width={100} height={20} className="header-logo w-full dark:hidden" /> */}</a>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              <Step active number="1" label="Service" />
              <Step number="2" label="Staff" />
              <Step number="3" label="Date & Time" />
              <Step number="4" label="Details" />
            </nav>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-40px)] items-center justify-center p-3 sm:p-5 lg:py-5">
          <div className="flex w-full max-w-[1180px] items-center justify-center rounded-md bg-white p-10 shadow-sm">
            <p className="text-sm text-slate-500">Loading services...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white shadow-sm py-2">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between py-2">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-md font-bold text-slate-600">{business.name || "No Business Name"}</span>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <MapPin size={16} />

              <select
                value={locationId}
                onChange={(e) => {
                  const newLocationId = e.target.value;

                  setLocationId(newLocationId);

                  router.replace(`/book/${slug}?locationId=${newLocationId}`);
                }}
                className="cursor-pointer border-0 bg-transparent py-1 pr-6 text-xs font-medium text-slate-600 outline-none focus:ring-0"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Steps */}
          <nav className="hidden items-center gap-6 md:flex">
            <Step active number="1" label="Service" />
            <Step number="2" label="Staff" />
            <Step number="3" label="Date & Time" />
            <Step number="4" label="Details" />
          </nav>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex min-h-[calc(100vh-40px)] items-center justify-center p-3 sm:p-5 lg:py-5">
        <div className="flex w-full max-w-[1230px] flex-col overflow-hidden rounded-lg border border-white bg-white shadow-[0_24px_64px_-12px_rgba(30,39,46,0.14)] lg:flex-row">
          {/* ================= LEFT PANEL ================= */}
          <section className="relative flex min-h-[360px] w-full flex-col justify-between overflow-hidden bg-slate-200 p-5 sm:p-6 lg:min-h-[640px] lg:w-1/2 lg:p-6">
            <img src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=85" alt={business?.name || "No Name"} className="absolute inset-0 h-full w-full object-cover" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-slate-900/40" />

            {/* Business Badge */}
            <div className="relative z-10 flex w-full items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
                <span className="text-sm text-pink-600">✦</span>

                <span className="text-[13px] font-semibold tracking-wide text-slate-900">{business.name}</span>
              </div>

              <div className="hidden items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-800 backdrop-blur-sm sm:inline-flex">
                <span className={`h-2 w-2 animate-pulse rounded-full ${location?.status?.isOpen ? "bg-emerald-500" : "bg-red-500"}`} />

                {location?.status?.label}
              </div>
            </div>

            {/* Bottom Information Card */}
            <div className="relative z-10 mt-auto rounded-xl border border-white/60 bg-white/95 p-4 shadow-lg backdrop-blur-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">{location?.description}</span>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{location?.address && <span className="ml-1">, {location.address}</span>}</p>
            </div>
          </section>

          {/* ================= RIGHT PANEL ================= */}
          <section className="flex w-full flex-col justify-start bg-white p-5 sm:p-7 lg:w-1/2 lg:p-8">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between gap-3">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Select a service</h1>

                <span className="shrink-0 text-[11px] font-medium text-slate-500">{services.length} available</span>
              </div>
            </div>

            {/* ================= SERVICES ================= */}
            <div className="max-h-[390px] space-y-2 overflow-y-auto pr-1">
              {services.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
                  <p className="text-sm text-slate-500">No services available at this location.</p>
                </div>
              ) : (
                services.map((service, index) => {
                  const selected = selectedService?.id === service.id;

                  return (
                    <label
                      key={service.id}
                      className={`
                        group relative flex cursor-pointer items-center justify-between gap-3 rounded-md p-3.5 transition-all
                        ${selected ? "border border-indigo-600 bg-indigo-50/70 shadow-sm" : "border border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50"}
                      `}
                    >
                      {/* Left */}
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Radio */}
                        <input type="radio" name="service" checked={selected} onChange={() => setSelectedService(service)} className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500" />

                        {/* Image */}
                        <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <img src={getServiceImage(index)} alt={service.name} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                        </div>

                        {/* Information */}
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

            {/* ================= ACTION ================= */}
            <div className="flex flex-col mt-auto gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Selected Package</span>

                <span className="truncate text-sm font-bold text-slate-900">{selectedService ? `${selectedService.name} ($${selectedService.price})` : "No service selected"}</span>
              </div>

              <div className="flex items-center gap-3">
                <Button type="primary">
                  Continue <ChevronRight size="14" />
                </Button>
                {/* <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-gray-700 shadow-md transition hover:bg-pink-700 active:scale-95">
                  <span></span>
                  <span>→</span>
                </button> */}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-3 px-4 py-5 text-center md:flex-row md:px-10 md:text-left">
          <p className="text-sm text-slate-500">© 2026 {business?.name || "Beauty & Wellness"}. Powered by Booksaa.</p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] font-medium">
            <a href="#" className="text-slate-500 transition hover:text-pink-600">
              Cancellation Policy
            </a>

            <a href="#" className="text-slate-500 transition hover:text-pink-600">
              Terms of Service
            </a>

            <a href="#" className="text-slate-500 transition hover:text-pink-600">
              Privacy Notice
            </a>

            <a href="#" className="text-slate-500 transition hover:text-pink-600">
              Contact Studio
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
