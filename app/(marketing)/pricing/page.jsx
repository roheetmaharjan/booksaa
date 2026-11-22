"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import BusinessPricingCalculator from "@/components/components_marketing/BusinessPricingCalculator";
import featureContent from "@/data/features.json";

const includedFeatureImages = {
  "booking-section": "/booking-scheduling.jpg",
  "crm-section": "/crm.jpg",
  "payments-section": "/payments.jpg",
  "marketing-section": "/marketing.jpg",
  "operations-section": "/management-dashboard.jpg",
};

export default function MarketingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeIncludedFeature, setActiveIncludedFeature] = useState(0);

  const faqData = [
    {
      q: "How does pricing work?",
      a: "Our pricing consists of a flat base plan fee which includes a set number of business locations and professionals. If you need more, you can easily add additional locations or staff members for a small monthly rate. All changes update instantly.",
    },
    {
      q: "Can I add more locations later?",
      a: "Absolutely! You can expand your business presence anytime from your account dashboard. Each additional location is billed at the plan's add-on rate ($12/month on Growth) and updates your subscription details transparently.",
    },
    {
      q: "Can I add professionals anytime?",
      a: "Yes, you can invite new employees, contractors, or part-time staff members whenever your team grows. You're only billed for active professional seats, making it easy to scale up during peak seasons and scale down when needed.",
    },
    {
      q: "Do I need a credit card to sign up?",
      a: "No! You can start our 15-day free trial without entering any credit card details. You will have unrestricted access to all our core features so you can thoroughly test if Booksaa is the right fit for your operations.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, Booksaa is a pay-as-you-go service. There are no long-term contracts, lock-ins, or cancellation fees. You can cancel your subscription with a single click inside your billing settings at any point.",
    },
    {
      q: "What happens after the 15-day free trial?",
      a: "Towards the end of your trial, we'll send you friendly reminders to add a billing method if you want to keep accepting bookings. If you choose not to subscribe, your account will pause, and we will safely archive your setups.",
    },
    {
      q: "Does every location get its own calendar?",
      a: "Yes! Each business location gets a dedicated booking dashboard, unique opening hours, specialized service menus, and localized timezone scheduling. Your staff can be assigned to single or multiple locations seamlessly.",
    },
    {
      q: "Is priority customer support included?",
      a: "All Growth and Enterprise accounts include priority live chat and email support. Enterprise clients additionally receive a dedicated success manager and 24/7 emergency phone assistance.",
    },
  ];

  const comparisonCategories = [
    {
      category: "Core Features",
      items: [
        { name: "Online Booking Page", starter: true, growth: true, enterprise: true },
        { name: "Calendar & Scheduling", starter: true, growth: true, enterprise: true },
        { name: "Mobile App Access", starter: true, growth: true, enterprise: true },
        { name: "Customer CRM", starter: true, growth: true, enterprise: true },
        { name: "Email Notifications", starter: true, growth: true, enterprise: true },
        { name: "SMS Reminders", starter: false, growth: true, enterprise: true },
      ],
    },
    {
      category: "Multi-Location & Scale",
      items: [
        { name: "Multi-Location Support", starter: "1 Location only", growth: "Included (up to 2)", enterprise: "Included (up to 5)" },
        { name: "Staff Account Seats", starter: "Up to 2", growth: "Up to 5", enterprise: "Up to 15" },
        { name: "Add-on Locations", starter: "$12/mo each", growth: "$12/mo each", enterprise: "$15/mo each" },
        { name: "Add-on Professionals", starter: "$5/mo each", growth: "$5/mo each", enterprise: "$8/mo each" },
      ],
    },
    {
      category: "Management & Integrations",
      items: [
        { name: "Payments & Invoicing", starter: "Basic", growth: "Advanced", enterprise: "Custom Routing" },
        { name: "Custom Roles & Permissions", starter: false, growth: true, enterprise: true },
        { name: "Reports & Analytics", starter: "Basic", growth: "Comprehensive", enterprise: "Advanced Custom BI" },
        { name: "API & Webhooks", starter: false, growth: false, enterprise: true },
        { name: "Dedicated Support", starter: false, growth: "Priority Mail", enterprise: "24/7 Dedicated Manager" },
      ],
    },
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen text-slate-900 selection:bg-lime-200 relative">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[340px] w-[840px] -translate-x-1/2 bg-gradient-to-b from-teal-100/70 via-cyan-100/50 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -top-12 right-12 -z-10 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
      {/* SECTION 1 — HERO */}
      <section id="pricing-calculator" className="py-12 max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col justify-center mb-10">
          {/* Heading */}
          <div className="space-y-4 text-center max-w-[900px] mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Simple pricing that grows with your business.</h2>
            <p className="text-lg text-slate-600 max-w-[500px] leading-relaxed mx-auto">Only pay for the locations and professionals you need. Scale your business without paying for unnecessary features.</p>
          </div>
          <div className="flex flex-wrap flex-row gap-10 mt-5 mb-10 mx-auto">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-semibold text-slate-800">15-day free trial</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-semibold text-slate-800">No credit card required</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-semibold text-slate-800">Cancel anytime</span>
            </div>
          </div>
          {/*  pricing calculator */}
          <BusinessPricingCalculator />
        </div>
      </section>

      {/* SECTION 2 — Whats Included */}
      <section id="why-booksaa" className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">What’s included</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Everything you get with booksaa.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="flex flex-col">
              {featureContent.sections.map((section, index) => {
                const isOpen = activeIncludedFeature === index;

                return (
                  <div key={section.id} className={`overflow-hidden rounded-3xl border transition-colors ${isOpen ? "border-cyan-100 bg-[#d5ebed]" : "border-slate-200 bg-white"}`}>
                    <button type="button" id={`included-trigger-${section.id}`} aria-expanded={isOpen} aria-controls={`included-content-${section.id}`} onClick={() => setActiveIncludedFeature(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left sm:px-8">
                      <span className="flex items-center gap-5">
                        <span className="text-lg font-medium text-slate-700">{String(index + 1).padStart(2, "0")}</span>
                        <span className="text-lg font-semibold text-slate-950 sm:text-xl">{section.title}</span>
                      </span>
                      {isOpen ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
                    </button>
                    {isOpen && (
                      <ul id={`included-content-${section.id}`} aria-labelledby={`included-trigger-${section.id}`} className="space-y-3 px-8 pb-7 pl-[4.25rem] text-slate-700 sm:pl-[5.25rem]">
                        {section.cards.map((feature) => (
                          <li key={feature.title} className="list-disc pl-1 text-base leading-relaxed">
                            {feature.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-slate-100 lg:min-h-full">
              {featureContent.sections.map((section, index) => (
                <div key={section.id} className={`absolute inset-0 transition-opacity duration-300 ${activeIncludedFeature === index ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                  <Image src={includedFeatureImages[section.id] || "/feature-1.jpg"} alt={`${section.title} feature preview`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority={index === 0} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — FAQ */}
      <section id="faq-section" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">HAVE Any QUESTIONS?</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-200">
                  <button onClick={() => toggleFaq(index)} className="w-full py-5 px-6 flex items-center justify-between text-left font-bold text-slate-900 hover:text-slate-950 transition-colors focus:outline-none cursor-pointer">
                    <span className="text-md pr-4">{item.q}</span>
                    <span className="shrink-0 p-1.5 bg-slate-50 rounded-lg text-slate-500">{isOpen ? <ChevronUp className="w-4 h-4 text-lime-600" /> : <ChevronDown className="w-4 h-4" />}</span>
                  </button>

                  {isOpen && <div className="px-6 pb-6 pt-1 text-sm text-slate-500 leading-relaxed border-t border-slate-100 bg-slate-50/30">{item.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — TESTIMONIALS */}
      {/* <section id="testimonials" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">Trusted by growing businesses.</h2>
            <p className="text-base text-slate-500 font-semibold italic">"Thousands of businesses use Booksaa every day."</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">"Transitioning our spa to Booksaa was an absolute breeze. Setting up multiple locations, sync'ing our estheticians' rotas, and handling pre-paid deposits online took us just one afternoon. Our no-show index plummeted instantly."</p>
              </div>
              <div className="flex items-center gap-3.5 mt-6 pt-6 border-t border-slate-200/50">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80" alt="Helena Vance" className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Helena Vance</h4>
                  <p className="text-xs text-slate-500">Owner, Vance Medical Spa & Wellness</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">"The dynamic pricing breakdown is incredibly transparent. I manage a barbershop team across 3 bustling neighborhoods and the capability to adjust seats dynamically or modify locations without getting locked into hefty plans is brilliant."</p>
              </div>
              <div className="flex items-center gap-3.5 mt-6 pt-6 border-t border-slate-200/50">
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&h=80&q=80" alt="Jackson Sterling" className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Jackson Sterling</h4>
                  <p className="text-xs text-slate-500">Director, Union Barber Guild</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">"My staff absolutely loves using the interface. They can sync appointments directly with their phones, configure personal working schedules, and see dynamic commission analytics on their dashboards. Highly recommended SaaS!"</p>
              </div>
              <div className="flex items-center gap-3.5 mt-6 pt-6 border-t border-slate-200/50">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80" alt="Amina Al-Mansoor" className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Amina Al-Mansoor</h4>
                  <p className="text-xs text-slate-500">Founder, Soul Garden Yoga Collective</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
