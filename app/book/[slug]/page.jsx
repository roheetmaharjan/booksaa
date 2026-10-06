"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ServiceSelect from "@/components/public_booking/ServiceSelect";
import DateTimeSelect from "@/components/public_booking/DateTimeSelect";
import PaymentSelect from "@/components/public_booking/PaymentSelect";
import BookingSteps from "@/components/public_booking/BookingSteps";
import { MapPin } from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const goNext = () => {
    setCurrentStep((step) => step + 1);
  };

  const goBack = () => {
    setCurrentStep((step) => step - 1);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-30 w-full border-b bg-white">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="bg-gray-100 w-32 h-3 rounded-md"></span>
              </div>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                {/* <MapPin size={16} /> */}
                <span className="w-3 h-3 bg-gray-100 rounded-full"></span>

                <span className="bg-gray-100 w-32 h-3"></span>
              </div>
            </div>

            <BookingSteps currentStep={currentStep} />
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
      {/* Header */}
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
          <BookingSteps currentStep={currentStep} />
        </div>
      </header>

      {/* Main */}
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
            {currentStep === 1 && <ServiceSelect services={services} selectedService={selectedService} onSelectService={setSelectedService} onContinue={goNext} />}

            {currentStep === 2 && <DateTimeSelect selectedService={selectedService} selectedDate={selectedDate} selectedTime={selectedTime} onSelectDate={setSelectedDate} onSelectTime={setSelectedTime} onBack={goBack} onContinue={goNext} />}

            {currentStep === 3 && <PaymentSelect selectedService={selectedService} selectedDate={selectedDate} selectedTime={selectedTime} onBack={goBack} />}
          </section>
        </div>
      </main>
      {/* Foooter */}
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
