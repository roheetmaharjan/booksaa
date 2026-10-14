"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BookingSteps from "@/components/public_booking/BookingSteps";
import DateTimeSelect from "@/components/public_booking/DateTimeSelect";
import EmailVerification from "@/components/public_booking/EmailVerification";
import GuestDetails from "@/components/public_booking/GuestDetails";
import PaymentSelect from "@/components/public_booking/PaymentSelect";
import ServiceSelect from "@/components/public_booking/ServiceSelect";

const flowStorageKey = "booksaa-guest-booking-flow";

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
      if (!slug || !locationId) {
        setLoading(false);
        setPageError("Choose a location to view available services.");
        return;
      }

      try {
        setLoading(true);
        setPageError("");
        const result = await requestJson(`/api/public/bookings/${slug}?locationId=${encodeURIComponent(locationId)}`);
        if (cancelled) return;

        const data = result.data;
        setBusiness(data.business);
        setLocation(data.location);
        setLocations(data.locations || []);
        setServices(data.services || []);

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
  }, [contact.email, contact.fullName, slug]);

  const startEmailVerification = async () => {
    setActionLoading(true);
    setFlowError("");
    try {
      await requestOtp();
      setCurrentStep(4);
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
        setCurrentStep(5);
        try {
          const setup = await createPaymentSetup(result.verifiedEmailToken);
          setPaymentSetup(setup);
        } catch (error) {
          setFlowError(error.message || "Unable to prepare the deposit payment.");
        }
      } else {
        setCurrentStep(5);
      }
    } catch (error) {
      setFlowError(error.message || "The verification code could not be verified.");
    } finally {
      setActionLoading(false);
    }
  };

  const saveFlowForPayment = useCallback(async () => {
    sessionStorage.setItem(flowStorageKey, JSON.stringify({
      slug,
      locationId,
      serviceId: selectedService?.id,
      appointment,
      contact,
      verifiedEmailToken,
      paymentSetup,
    }));
  }, [appointment, contact, locationId, paymentSetup, selectedService?.id, slug, verifiedEmailToken]);

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
      setCurrentStep(6);
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
  }, [appointment, contact.fullName, contact.phone, selectedService, slug, verifiedEmailToken]);

  const chooseLocation = (nextLocationId) => {
    if (nextLocationId === locationId) return;
    setLocationId(nextLocationId);
    setSelectedService(null);
    setAppointment(null);
    setCurrentStep(1);
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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col overflow-hidden bg-white shadow-sm lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-bold text-slate-700">{business.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-auto max-w-52 gap-2 rounded-xl px-3 py-1.5 text-xs">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{locations.find((item) => item.id === locationId)?.name || "Select location"}</span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {locations.map((item) => (
                      <DropdownMenuItem key={item.id} onSelect={() => chooseLocation(item.id)}>
                        <MapPin className="mr-2 h-3.5 w-3.5 text-slate-400" />
                        {item.name}
                        {item.id === locationId && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <BookingSteps currentStep={currentStep} />
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-7 lg:p-8">
            {currentStep === 1 && (
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
                onContinue={() => setCurrentStep(2)}
              />
            )}

            <div className={currentStep === 2 ? "" : "hidden"}>
              <DateTimeSelect
                slug={slug}
                locationId={locationId}
                serviceId={selectedService?.id}
                initialAppointment={appointment}
                onBack={() => setCurrentStep(1)}
                onContinue={(nextAppointment) => {
                  setAppointment(nextAppointment);
                  setFlowError("");
                  setCurrentStep(3);
                }}
              />
            </div>

            {currentStep === 3 && (
              <GuestDetails
                value={contact}
                onChange={setContact}
                onBack={() => setCurrentStep(2)}
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
                  setCurrentStep(3);
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
                  setCurrentStep(4);
                }}
                onBeforePayment={saveFlowForPayment}
                onConfirmBooking={() => confirmBooking()}
                onPaymentSuccess={confirmBooking}
              />
            )}

            {currentStep === 6 && confirmation && (
              <section className="mx-auto w-full max-w-xl space-y-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-emerald-800">Appointment confirmed</h1>
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
        </section>

        <aside className="relative hidden min-h-[320px] w-full overflow-hidden bg-slate-900 lg:block lg:min-h-screen lg:w-[34%]">
          <img
            src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=85"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-slate-900/30" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white">
            <p className="text-lg font-semibold">{business.name}</p>
            {location?.address && <p className="mt-1 text-sm text-white/80">{location.address}</p>}
            <p className="mt-5 text-xs text-white/70">Powered by Booksaa</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
