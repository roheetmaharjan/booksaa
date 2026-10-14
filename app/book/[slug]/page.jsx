"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ServiceSelect from "@/components/public_booking/ServiceSelect";
import DateTimeSelect from "@/components/public_booking/DateTimeSelect";
import PaymentSelect from "@/components/public_booking/PaymentSelect";
import BookingSteps from "@/components/public_booking/BookingSteps";
import { MapPin, ChevronDown, Check } from "lucide-react";

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
      <>
        <main className="flex items-stretch justify-center">
          <div className="flex w-full flex-col overflow-hidden rounded-lg border border-white bg-white lg:flex-row">
            <header className="sticky top-0 z-30 w-full border-b bg-white">
              <div className="mx-auto flex items-center justify-between py-3">
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
            <div className="flex w-full items-center justify-center rounded-md bg-white p-10 shadow-sm">
              <p className="text-sm text-slate-500">Loading services...</p>
            </div>
          </div>
          <div></div>
        </main>
      </>
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
    <>
      {/* Main */}
      <main className="flex items-stretch justify-center">
        <div className="flex w-full flex-col overflow-hidden rounded-lg border border-white bg-white lg:flex-row">
          {/* ================= LEFT PANEL ================= */}
          <section className="flex w-full min-h-screen flex-col justify-start flex-1 bg-white">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white shadow-sm py-2 px-5">
              <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between py-2">
                {/* Brand */}
                <div className="flex items-center gap-4">
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="text-md font-bold text-slate-600">{business.name || "No Business Name"}</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                    {/* Location Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-auto gap-2 rounded-xl border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />

                          {locations.find((location) => location.id === locationId)?.name || "Select location"}

                          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="start">
                        {locations.map((location) => (
                          <DropdownMenuItem
                            key={location.id}
                            onClick={() => {
                              const newLocationId = location.id;

                              setLocationId(newLocationId);

                              router.replace(`/book/${slug}?locationId=${newLocationId}`);
                            }}
                            className="cursor-pointer"
                          >
                            <MapPin className="mr-2 h-3.5 w-3.5 text-slate-400" />

                            {location.name}

                            {location.id === locationId && <Check className="ml-auto h-4 w-4" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Steps */}
                <BookingSteps currentStep={currentStep} />
              </div>
            </header>
            {/* Content Area */}
            <div className="p-5 sm:p-7 lg:p-8">
              {currentStep === 1 && <ServiceSelect services={services} selectedService={selectedService} onSelectService={setSelectedService} onContinue={goNext} />}

              {currentStep === 2 && (
                <DateTimeSelect
                  slug={slug}
                  locationId={locationId}
                  serviceId={selectedService?.id}
                  // onBack={handleBack}
                  onContinue={(appointment) => {
                    console.log("Selected appointment:", appointment);

                    setBookingDetails((previous) => ({
                      ...previous,
                      ...appointment,
                    }));

                    setCurrentStep("payment");
                  }}
                />
              )}

              {currentStep === 3 && <PaymentSelect selectedService={selectedService} selectedDate={selectedDate} selectedTime={selectedTime} onBack={goBack} />}
            </div>
          </section>
          {/* ================= RIGHT PANEL ================= */}
          <section className="flex h-screen w-full flex-col max-w-full lg:max-w-[35%] sticky top-0 justify-between overflow-hidden bg-slate-200">
            <img src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=85" alt={business?.name || "No Name"} className="absolute inset-0 h-full w-full object-cover" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-slate-900/40" />

            {/* Business Badge */}
            <div className="relative z-10 flex w-full items-center justify-between p-4">
              <div className="hidden items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-800 backdrop-blur-sm sm:inline-flex">
                <span className={`h-2 w-2 animate-pulse rounded-full ${location?.status?.isOpen ? "bg-emerald-500" : "bg-red-500"}`} />

                {location?.status?.label}
              </div>
            </div>

            {/* Bottom Information Card */}
            <div className="relative z-10 mt-auto backdrop-blur-sm">
              {/* Foooter */}
              <div className="mx-auto flex w-full flex-col items-center justify-between gap-3 text-center md:flex-col py-6 md:text-center">
                <div className="flex flex-wrap items-center justify-center gap-4 text-[14px] font-medium">
                  <a href="#" className="text-slate-500 transition hover:text-primary">
                    Cancellation Policy
                  </a>

                  <a href="#" className="text-slate-500 transition hover:text-primary">
                    Terms of Service
                  </a>

                  <a href="#" className="text-slate-500 transition hover:text-primary">
                    Privacy Notice
                  </a>

                  <a href="#" className="text-slate-500 transition hover:text-primary">
                    Contact Studio
                  </a>
                </div>
                <p className="text-sm text-slate-500">© 2026 {business?.name || "Beauty & Wellness"}. Powered by Booksaa.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
