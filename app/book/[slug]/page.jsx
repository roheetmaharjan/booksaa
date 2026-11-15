"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BookingSteps from "@/components/public_booking/BookingSteps";
import DateTimeSelect from "@/components/public_booking/DateTimeSelect";
import EmailVerification from "@/components/public_booking/EmailVerification";
import GuestDetails from "@/components/public_booking/GuestDetails";
import PaymentSelect from "@/components/public_booking/PaymentSelect";
import ServiceSelect from "@/components/public_booking/ServiceSelect";

const flowStorageKey = "booksaa-guest-booking-flow";
const bookingStateKey = "booksaa-booking-state";

async function requestJson(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "The request could not be completed.");
  }
  return result;
}

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
  const [pageError, setPageError] = useState("");

  const [currentStep, setCurrentStep] = useState(1);
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [contact, setContact] = useState({ fullName: "", phone: "", email: "" });
  const [challengeToken, setChallengeToken] = useState("");
  const [verifiedEmailToken, setVerifiedEmailToken] = useState("");
  const [verificationMode, setVerificationMode] = useState("");
  const [mockCode, setMockCode] = useState("");
  const [paymentSetup, setPaymentSetup] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [flowError, setFlowError] = useState("");

  const clearVerification = () => {
    setChallengeToken("");
    setVerifiedEmailToken("");
    setVerificationMode("");
    setMockCode("");
    setPaymentSetup(null);
    setConfirmation(null);
    setFlowError("");
    sessionStorage.removeItem(flowStorageKey);
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchBusiness() {
      if (!slug) {
        setLoading(false);
        setPageError("Unable to load this booking page.");
        return;
      }

      try {
        setLoading(true);
        setPageError("");
        const locationQuery = locationId ? `?locationId=${encodeURIComponent(locationId)}` : "";
        const result = await requestJson(`/api/public/bookings/${slug}${locationQuery}`);
        if (cancelled) return;

        const data = result.data;
        setBusiness(data.business);
        setLocation(data.location);
        setLocations(data.locations || []);
        setServices(data.services || []);

        const savedState = sessionStorage.getItem(bookingStateKey);
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            if (state.slug === slug && state.locationId === locationId) {
              const savedService = (data.services || []).find((service) => service.id === state.serviceId);
              setSelectedService(savedService || data.services?.[0] || null);
              setAppointment(state.appointment || null);
              setContact(state.contact || { fullName: "", phone: "", email: "" });
              setChallengeToken(state.challengeToken || "");
              setVerifiedEmailToken(state.verifiedEmailToken || "");
              setVerificationMode(state.verificationMode || "");
              setMockCode(state.mockCode || "");
              setPaymentSetup(state.paymentSetup || null);
              setConfirmation(state.confirmation || null);
              const restoredStep = Number(state.currentStep || 1);
              setCurrentStep(restoredStep);
              setDateTimeOpen(restoredStep === 2);
              return;
            }
          } catch {
            sessionStorage.removeItem(bookingStateKey);
          }
        }

        const saved = sessionStorage.getItem(flowStorageKey);
        if (saved) {
          try {
            const flow = JSON.parse(saved);
            const savedService = (data.services || []).find((service) => service.id === flow.serviceId);
            if (flow.slug === slug && flow.locationId === locationId && savedService && flow.verifiedEmailToken) {
              setSelectedService(savedService);
              setAppointment(flow.appointment);
              setContact(flow.contact);
              setVerifiedEmailToken(flow.verifiedEmailToken);
              setPaymentSetup(flow.paymentSetup);
              setCurrentStep(5);
              return;
            }
          } catch {
            sessionStorage.removeItem(flowStorageKey);
          }
        }

        setSelectedService((current) => (data.services || []).find((service) => service.id === current?.id) || data.services?.[0] || null);
      } catch (error) {
        if (!cancelled) setPageError(error.message || "Unable to load services.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBusiness();
    return () => {
      cancelled = true;
    };
  }, [slug, locationId]);

  const persistBookingState = (overrides = {}) => {
    sessionStorage.setItem(bookingStateKey, JSON.stringify({
      slug,
      locationId,
      currentStep,
      serviceId: selectedService?.id || null,
      appointment,
      contact,
      challengeToken,
      verifiedEmailToken,
      verificationMode,
      mockCode,
      paymentSetup,
      confirmation,
      ...overrides,
    }));
  };

  const goToStep = (step, overrides = {}) => {
    persistBookingState({ currentStep: step, ...overrides });
    setCurrentStep(step);
    if (step >= 3 && step <= 6) {
      router.push(`/book/${slug}/checkout/${step}?locationId=${encodeURIComponent(locationId)}`);
    } else {
      router.push(`/book/${slug}?locationId=${encodeURIComponent(locationId)}`);
    }
  };

  const requestOtp = useCallback(async () => {
    if (!contact.fullName.trim()) throw new Error("Enter your full name.");
    const result = await requestJson(`/api/public/bookings/${slug}/otp`, {
      method: "POST",
      body: JSON.stringify({ email: contact.email }),
    });
    setChallengeToken(result.challengeToken);
    setVerificationMode(result.mode);
    setMockCode(result.mockCode || "");
    setVerifiedEmailToken("");
    setFlowError("");
    return result;
  }, [contact.email, contact.fullName, slug]);

  const startEmailVerification = async () => {
    setActionLoading(true);
    setFlowError("");
    try {
      const challenge = await requestOtp();
      goToStep(4, {
        challengeToken: challenge.challengeToken,
        verificationMode: challenge.mode,
        mockCode: challenge.mockCode || "",
        verifiedEmailToken: "",
      });
    } catch (error) {
      setFlowError(error.message || "Unable to send the verification code.");
    } finally {
      setActionLoading(false);
    }
  };

  const resendOtp = async () => {
    setFlowError("");
    try {
      await requestOtp();
    } catch (error) {
      setFlowError(error.message || "Unable to resend the verification code.");
      throw error;
    }
  };

  const createPaymentSetup = useCallback(async (emailToken) => {
    if (!appointment || !selectedService) throw new Error("Select a service and appointment time first.");
    const result = await requestJson(`/api/public/bookings/${slug}/payment-intent`, {
      method: "POST",
      body: JSON.stringify({
        ...appointment,
        serviceId: selectedService.id,
        verifiedEmailToken: emailToken,
      }),
    });
    return result;
  }, [appointment, selectedService, slug]);

  const verifyEmail = async (code) => {
    setActionLoading(true);
    setFlowError("");
    try {
      const result = await requestJson(`/api/public/bookings/${slug}/otp`, {
        method: "PUT",
        body: JSON.stringify({ challengeToken, code }),
      });
      setVerifiedEmailToken(result.verifiedEmailToken);

      if (selectedService?.prepaymentType === "full" || selectedService?.prepaymentType === "deposit") {
        setPaymentSetup(null);
        try {
          const setup = await createPaymentSetup(result.verifiedEmailToken);
          setPaymentSetup(setup);
          goToStep(5, { verifiedEmailToken: result.verifiedEmailToken, paymentSetup: setup });
        } catch (error) {
          setFlowError(error.message || "Unable to prepare the deposit payment.");
          goToStep(5, { verifiedEmailToken: result.verifiedEmailToken, paymentSetup: null });
        }
      } else {
        goToStep(5, { verifiedEmailToken: result.verifiedEmailToken });
      }
    } catch (error) {
      setFlowError(error.message || "The verification code could not be verified.");
    } finally {
      setActionLoading(false);
    }
  };

  const saveFlowForPayment = useCallback(async () => {
    const state = {
      slug,
      locationId,
      serviceId: selectedService?.id,
      appointment,
      contact,
      verifiedEmailToken,
      paymentSetup,
    };
    sessionStorage.setItem(flowStorageKey, JSON.stringify(state));
    sessionStorage.setItem(bookingStateKey, JSON.stringify({
      ...state,
      challengeToken,
      verificationMode,
      mockCode,
      confirmation,
    }));
  }, [appointment, challengeToken, confirmation, contact, locationId, mockCode, paymentSetup, selectedService?.id, slug, verificationMode, verifiedEmailToken]);

  const confirmBooking = useCallback(async (paymentIntentId) => {
    setActionLoading(true);
    setFlowError("");
    try {
      const result = await requestJson(`/api/public/bookings/${slug}/confirm`, {
        method: "POST",
        body: JSON.stringify({
          ...appointment,
          serviceId: selectedService.id,
          fullName: contact.fullName,
          phone: contact.phone,
          verifiedEmailToken,
          ...(paymentIntentId ? { paymentIntentId } : {}),
        }),
      });
      setConfirmation(result);
      goToStep(6, { confirmation: result });
      sessionStorage.removeItem(flowStorageKey);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("payment_intent");
      nextUrl.searchParams.delete("payment_intent_client_secret");
      nextUrl.searchParams.delete("redirect_status");
      window.history.replaceState({}, "", nextUrl);
    } catch (error) {
      setFlowError(error.message || "Unable to confirm the booking.");
    } finally {
      setActionLoading(false);
    }
  }, [appointment, contact.fullName, contact.phone, goToStep, selectedService, slug, verifiedEmailToken]);

  const chooseLocation = (nextLocationId) => {
    if (nextLocationId === locationId) return;
    setLocationId(nextLocationId);
    setSelectedService(null);
    setAppointment(null);
    setCurrentStep(1);
    sessionStorage.removeItem(bookingStateKey);
    clearVerification();
    router.replace(`/book/${slug}?locationId=${nextLocationId}`);
  };

  const showLoading = loading || !business;

  if (showLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <p className="text-sm text-slate-500">Loading booking options...</p>
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <p role="alert" className="text-sm text-red-600">{pageError}</p>
      </main>
    );
  }

  if (currentStep <= 2) {
    return (
      <main className="min-h-screen bg-slate-50/60 py-8 text-slate-800 lg:py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
          <section className="space-y-7 lg:col-span-8">
            <header className="space-y-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  {business.imageUrl ? (
                    <img src={business.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-xl font-bold text-white shadow-md">{business.name?.charAt(0)}</div>
                  )}
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{business.name}</h1>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500"><MapPin className="h-4 w-4 shrink-0 text-slate-400" />{location?.address || location?.name}</p>
                  </div>
                </div>
                {location?.status?.label && <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${location.status.isOpen ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-slate-200 bg-white text-slate-500"}`}>{location.status.label} today</span>}
              </div>
            </header>

            <section aria-label="Business gallery" className="grid h-[300px] grid-cols-1 gap-3.5 sm:h-[390px] md:grid-cols-12">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-800 to-teal-900 shadow-sm md:col-span-8">
                {business.gallery?.[0]?.url && <img alt={`${business.name} main gallery photo`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={business.gallery[0].url} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">{business.name}</span>
              </div>
              <div className="hidden h-full grid-rows-2 gap-3.5 md:col-span-4 md:grid">
                {[1, 2].map((photoIndex) => (
                  <div key={photoIndex} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200">
                    {business.gallery?.[photoIndex]?.url ? <img alt={`${business.name} gallery photo ${photoIndex + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={business.gallery[photoIndex].url} /> : <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300" />}
                    {photoIndex === 2 && business.gallery?.length > 3 && <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/50 text-white"><span className="text-lg font-bold">+{business.gallery.length - 2} photos</span><span className="mt-0.5 text-xs">Business gallery</span></div>}
                  </div>
                ))}
              </div>
            </section>

            <nav aria-label="Business information" className="flex gap-6 overflow-x-auto border-b border-slate-200 text-sm font-semibold text-slate-500">
              <a href="#about-business" className="whitespace-nowrap border-b-2 border-slate-900 px-1 pb-3 text-slate-900">About</a>
              <a href="#available-services" className="whitespace-nowrap px-1 pb-3 hover:text-slate-900">Services</a>
              <a href="#business-hours" className="whitespace-nowrap px-1 pb-3 hover:text-slate-900">Business hours</a>
            </nav>

            <section id="about-business" className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">About {business.name}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">{business.description || `Book an appointment at ${business.name}. Choose a service and an available time to continue.`}</p>
            </section>

            <section id="available-services" className="space-y-4">
              <div className="flex items-end justify-between gap-4"><h2 className="text-xl font-bold text-slate-900">Services</h2><span className="text-xs font-medium text-slate-500">{services.length} available</span></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <article key={service.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-slate-900">{service.name}</h3><span className="shrink-0 font-bold text-slate-900">${service.price}</span></div>
                    <p className="mt-2 text-xs text-slate-500">{service.duration} min · {service.prepaymentType === "deposit" ? "Deposit required" : service.prepaymentType === "full" ? "Full payment required" : "Pay at business"}</p>
                    {service.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>}
                  </article>
                ))}
                {!services.length && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">No services available at this location.</p>}
              </div>
            </section>

            <section id="business-hours" className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Business hours</h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {(location?.businessHours || []).map((hours) => (
                  <div key={hours.day} className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
                    <span className="text-slate-600">{hours.day}</span>
                    <span className={hours.isOpen ? "font-medium text-slate-900" : "text-slate-400"}>{hours.isOpen ? `${hours.openTime} – ${hours.closeTime}` : "Closed"}</span>
                  </div>
                ))}
                {!location?.businessHours?.length && <p className="text-sm text-slate-500">Business hours aren’t listed for this location.</p>}
              </div>
            </section>
          </section>

          <aside className="lg:sticky lg:top-6 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-4px_rgba(16,24,40,0.08),0_4px_12px_-2px_rgba(16,24,40,0.03)] sm:p-6">
              <div className="mb-5 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Book Your Service</h2>
                <p className="mt-1 text-xs text-slate-500">Select a location, service, and ideal time</p>
              </div>
              <div className="mb-5 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700">Location</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button type="button" variant="outline" className="h-auto w-full justify-between rounded-xl border-slate-200 px-3 py-3 text-left text-sm"><span className="flex min-w-0 items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{location?.name || "Select location"}</span></span><ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[min(22rem,calc(100vw-2rem))]">{locations.map((item) => <DropdownMenuItem key={item.id} onSelect={() => chooseLocation(item.id)}>{item.name}{item.id === locationId && <Check className="ml-auto h-4 w-4" />}</DropdownMenuItem>)}</DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ServiceSelect
                services={services}
                selectedService={selectedService}
                onSelectService={(service) => {
                  if (selectedService?.id !== service.id) {
                    setAppointment(null);
                    clearVerification();
                  }
                  setSelectedService(service);
                }}
                onContinue={() => {
                  setCurrentStep(2);
                  setDateTimeOpen(true);
                  persistBookingState({ currentStep: 2 });
                }}
              />
            </div>
          </aside>
        </div>

        <Dialog open={dateTimeOpen} onOpenChange={setDateTimeOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader><DialogTitle>Choose your appointment time</DialogTitle></DialogHeader>
            <DateTimeSelect
              slug={slug}
              locationId={locationId}
              serviceId={selectedService?.id}
              initialAppointment={appointment}
              onBack={() => {
                setDateTimeOpen(false);
                setCurrentStep(1);
                persistBookingState({ currentStep: 1 });
              }}
              onContinue={(nextAppointment) => {
                setAppointment(nextAppointment);
                setFlowError("");
                setDateTimeOpen(false);
                goToStep(3, { appointment: nextAppointment });
              }}
            />
          </DialogContent>
        </Dialog>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-white p-5 shadow-sm sm:p-8">
        <header className="space-y-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-semibold text-slate-500">{business.name}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {currentStep === 3 && "Your details"}
              {currentStep === 4 && "Verify your email"}
              {currentStep === 5 && "Payment"}
              {currentStep === 6 && "Booking confirmation"}
            </h1>
          </div>
          <BookingSteps currentStep={currentStep} />
        </header>

        {currentStep === 3 && (
          <GuestDetails
            value={contact}
            onChange={setContact}
            onBack={() => goToStep(2)}
            onSubmit={startEmailVerification}
            loading={actionLoading}
            error={flowError}
          />
        )}

        {currentStep === 4 && (
          <EmailVerification
            email={contact.email}
            mode={verificationMode}
            mockCode={mockCode}
            onBack={() => {
              setFlowError("");
              goToStep(3);
            }}
            onVerify={verifyEmail}
            onResend={resendOtp}
            loading={actionLoading}
            error={flowError}
          />
        )}

        {currentStep === 5 && (
          <PaymentSelect
            service={selectedService}
            customerEmail={contact.email}
            paymentSetup={paymentSetup}
            loading={actionLoading}
            error={flowError}
            onBack={() => {
              setFlowError("");
              goToStep(4);
            }}
            onBeforePayment={saveFlowForPayment}
            onConfirmBooking={() => confirmBooking()}
            onPaymentSuccess={confirmBooking}
          />
        )}

        {currentStep === 6 && confirmation && (
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-emerald-800">Appointment confirmed</h2>
              <p className="mt-1 text-sm text-slate-600">
                {confirmation.emailSent
                  ? `A confirmation email has been sent to ${contact.email}.`
                  : confirmation.emailError || "Your appointment is confirmed, but the email could not be sent."}
              </p>
            </div>
            <dl className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Service</dt><dd className="text-right font-medium">{selectedService?.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Date</dt><dd className="text-right font-medium">{appointment?.date}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Time</dt><dd className="text-right font-medium">{appointment?.time}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Professional</dt><dd className="text-right font-medium">{appointment?.professionalName || "To be assigned"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Location</dt><dd className="text-right font-medium">{location?.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Booking reference</dt><dd className="text-right font-mono font-medium">{confirmation.booking?.id}</dd></div>
            </dl>
            {!confirmation.emailSent && <p role="alert" className="text-sm text-amber-800">Please contact the business if you need the confirmation email resent.</p>}
          </section>
        )}
      </div>
    </main>
  );
}
