"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Star, Calendar, Users, MapPin, CreditCard, Layers, ShieldAlert, Bell, Lock, BarChart3, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import BusinessPricingCalculator from "@/components/components_marketing/BusinessPricingCalculator";

export default function MarketingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-lime-200">
      {/* SECTION 1 — HERO */}
      <section id="pricing-calculator" className="py-12 lg:py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-8 lg:sticky lg:top-28">
            <div className="space-y-4">
              <span className="text-center uppercase text-primary font-semibold mb-3">PRICING</span>
              <h1 className="text-slate-950 text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight">Simple pricing that grows with your business.</h1>
              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">Only pay for the locations and professionals you need. Scale your business without paying for unnecessary features.</p>
            </div>

            <div className="space-y-3.5">
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
          </div>

          {/* Right Column — pricing calculator goes here */}
          <div className="lg:col-span-6">
            <BusinessPricingCalculator/>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHY BUSINESSES LOVE BOOKSAA */}
      <section id="why-booksaa" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Everything you need to run your business.</h2>
            <p className="text-lg text-slate-600">One platform to manage bookings, staff, customers, payments, reports, and multiple locations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Online Booking</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Beautiful self-service client booking engine with localized scheduling, real-time availability, and secure payment checkout.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Calendar & Scheduling</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Super-fast multi-staff drag-and-drop agenda with color coding, blockouts, recurring bookings, and waitlist management.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Team Management</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Track employee rotas, breaks, vacations, and commissions. Empower staff with their own logins and tailored schedules.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Location Management</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Manage multiple physical business hubs or virtual offices. Configure centralized settings or custom setups per workspace.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Services & Add-ons</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Create structured catalogs, resource availability limits, tiered service prices, and bundle multiple packages cleanly.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Payments & Invoices</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Accept deposits, full card checkouts, digital wallets, or physical terminal swipes with native secure integrations.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Customer CRM</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Rich customer history cards with intake forms, past booking trends, customizable staff tags, and notes.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Reports & Analytics</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Full insight charts representing occupancy indices, staff performance metrics, total cash flow, and booking habits.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Roles & Permissions</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Lock down critical business dashboards. Grant specific client lists, schedule blocks, or financial records access safely.</p>
            </div>

            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-lime-500 flex items-center justify-center text-lime-700 group-hover:text-slate-950 transition-all mb-5">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Smart Reminders</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Slash client no-shows by up to 85% with responsive email and SMS appointment alerts, updates, and feedback collection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — FAQ */}
      <section id="faq-section" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold tracking-wider text-lime-600 bg-lime-100 px-3.5 py-1.5 rounded-full uppercase inline-block">HAVE QUESTIONS?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-200">
                  <button onClick={() => toggleFaq(index)} className="w-full py-5 px-6 flex items-center justify-between text-left font-bold text-slate-900 hover:text-slate-950 transition-colors focus:outline-none cursor-pointer">
                    <span className="text-base pr-4">{item.q}</span>
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
      <section id="testimonials" className="py-20 bg-white border-y border-slate-200">
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
      </section>
    </div>
  );
}
