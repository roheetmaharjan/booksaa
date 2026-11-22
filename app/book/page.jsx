"use client";

import { MapPin, Bookmark, Share2, Star, Wifi, Sparkles, FlaskConical, Coffee, ShieldCheck, ParkingCircle, ExternalLink, Search, CalendarDays, Clock, ChevronDown, ChevronUp, Navigation } from "lucide-react";

const amenities = [
  {
    category: "Connectivity",
    name: "High-Speed Wi-Fi",
    icon: Wifi,
    color: "bg-blue-50 text-blue-600",
  },
  {
    category: "Privacy",
    name: "VIP Private Rooms",
    icon: Sparkles,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    category: "Head Spa",
    name: "Organic Hair Basin",
    icon: FlaskConical,
    color: "bg-teal-50 text-teal-600",
  },
  {
    category: "Complimentary",
    name: "Artisan Coffee & Tea",
    icon: Coffee,
    color: "bg-amber-50 text-amber-600",
  },
  {
    category: "Hygiene First",
    name: "UV-Sanitized Tools",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    category: "Parking",
    name: "Free Valet Parking",
    icon: ParkingCircle,
    color: "bg-violet-50 text-violet-600",
  },
];

const reviews = [
  {
    name: "Nishma",
    initials: "N",
    description: "Regular Client • 3 years visiting",
    date: "1 week ago",
    comment: "Had my first balayage treatment with John and team! The color transition is seamless and my hair still feels silky and strong. Such a cozy, clean studio.",
    avatar: "bg-rose-100 text-rose-700",
  },
  {
    name: "Suyog",
    initials: "S",
    description: "Verified Guest • Scalp Therapy",
    date: "October 2024",
    comment: "The head spa and scalp detox wash was heavenly. Private rooms, soothing ambiance, and complimentary espresso made this a 10/10 pampering experience.",
    avatar: "bg-blue-100 text-blue-700",
  },
  {
    name: "Shubham",
    initials: "SH",
    description: "Executive Styling Client",
    date: "September 2024",
    comment: "Consistent, hygienic, and precise. It's walking distance from Brawijaya University and the stylists understand contemporary men's texturing and fades better than any salon in town.",
    avatar: "bg-emerald-100 text-emerald-700",
    fullWidth: true,
  },
];

const businessHours = [
  { day: "Sunday", time: "10:00 AM - 03:30 PM" },
  { day: "Monday", time: "09:00 AM - 07:00 PM", today: true },
  { day: "Tuesday", time: "09:00 AM - 07:00 PM" },
  { day: "Wednesday", time: "09:00 AM - 07:00 PM" },
  { day: "Thursday", time: "09:00 AM - 07:00 PM" },
  { day: "Friday", time: "09:00 AM - 07:00 PM" },
  { day: "Saturday", time: "09:00 AM - 05:00 PM" },
];

const services = [
  {
    name: "Hair Color & Balayage",
    description: "75 Min · Master Colorist",
    price: 180,
  },
  {
    name: "Keratin Smoothing Treatment",
    description: "60 Min · Deep Restorative",
    price: 91,
  },
  {
    name: "Scalp Detox & Signature Blowout",
    description: "30 Min · Organic Botanicals",
    price: 30,
  },
];

const totalServices = services.reduce((total, service) => total + service.price, 0);

function SectionTitle({ children }) {
  return <h2 className="text-xl font-bold text-slate-900">{children}</h2>;
}

function SalonHeader() {
  return (
    <header className="space-y-4" data-purpose="salon-header">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xl shadow-md border border-slate-700/10">JB</div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">John Beauty Parlour</h1>

            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              Jln. Diponegoro V No. 12, Kec. Lowokwaru, Kota Malang
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button aria-label="Save to favorites" type="button" className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-slate-300 transition-all shadow-sm">
            <Bookmark size={20} />
          </button>

          <button aria-label="Share studio" type="button" className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-slate-300 transition-all shadow-sm">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">5.0 Perfect</span>

        <div className="flex items-center text-amber-400 gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} fill="currentColor" />
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500">(128 verified reviews)</span>

        <span className="text-xs text-slate-300">•</span>

        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Open Today until 7:00 PM
        </span>
      </div>
    </header>
  );
}

function PhotoGallery() {
  return (
    <section aria-label="Salon Gallery" className="grid grid-cols-1 md:grid-cols-12 gap-3.5 h-[340px] sm:h-[420px]">
      <div className="md:col-span-8 h-full rounded-2xl overflow-hidden group relative cursor-pointer shadow-sm border border-slate-200/80 bg-slate-100">
        <img alt="Modern hair styling studio" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyE8QUTEOLBFClWugOGJSP_luCoABAmoQybP8y5rOeob09IUKVgyMLhvy8Tvx2WnCvpV1rSDeNKmGiJVyctXXjmB3GRgywGAGeOFSnvkvCzWOx94OZMzGdoYxYIpVRQxyHodEIxLZATqSvwHqlWw7vSjxxahvqmK_DGhh1bMkPm1TppnXaqiZlxv5HbnDPINcL9bp8WUdV0qHaujazL-KMBhd8JFj6d1ZEB2reSSc" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg">Main Hair Studio & Styling Stations</span>
      </div>

      <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-3.5 h-full">
        <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm border border-slate-200/80 bg-slate-100">
          <img alt="Hair treatment shampoo area" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDt8q7m8qNeoBKdb9vUCiWeZ4u0EAoY6vHnY5-6Wn5-662XPvx_r7kQ10bmk6ImDqJ8dVa9A_6a8PY0A38HhOfoaQ74BxBQZwZr3M-aiP15SmvudS6Y1627oYvBj_NYuzxXyXvihRMBMZAwGAn1EXyuUmFvL3bmjZI3nUmGZBJAfWI_FKcD7Pwbdmb5N5to0c589YLCiIJI-Qrk9mMBL9s16QKR8HpgfanTwb45hc" />
        </div>

        <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm border border-slate-200/80 bg-slate-100">
          <img alt="Private hair treatment suite" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-rH1OGIMFbkWMEK3n_LcL2DHb7mr49i51FQ1MVo3bp3aVLZqH42N7QUdBDR6HaA4IT_4S0R-yTEu6xn-rOuhSIaRp_nNLCBu2mAb_yO1bQzAo7_u31l8SLiWqGeoLvIbF7QRY2hVa0-r_WqegMqUZmtfH5T8_PvcsubPAsQKjTEkL9aaOJNvSLo0iUdTNHASMpvBqE44M_OJrSjtTIrjy2C6eUnxM1ezEUiMBylY" />

          <div className="absolute inset-0 bg-slate-950/45 group-hover:bg-slate-950/55 transition-colors flex flex-col items-center justify-center text-white p-4">
            <span className="text-lg font-bold tracking-wide">+12 Photos</span>
            <span className="text-xs text-white/80 font-medium mt-0.5">View Studio Gallery</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionNavigation() {
  const links = [
    ["About Studio", "#about"],
    ["Amenities", "#amenities"],
    ["Location", "#location"],
    ["Reviews", "#reviews"],
    ["Business Hours", "#hours"],
    ["Cancellation Policy", "#cancellation"],
  ];

  return (
    <nav className="border-b border-slate-200 flex items-center gap-2 sm:gap-6 overflow-x-auto text-sm font-semibold whitespace-nowrap pt-2 scrollbar-none">
      {links.map(([label, href], index) => (
        <a key={href} href={href} className={`pb-3 border-b-2 tracking-tight transition-colors ${index === 0 ? "text-blue-600 border-blue-600" : "text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-300"}`}>
          {label}
        </a>
      ))}
    </nav>
  );
}

function AboutSection() {
  return (
    <section className="space-y-3" id="about">
      <SectionTitle>About John Beauty Parlour</SectionTitle>

      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        Located in the heart of Lowokwaru, Kota Malang, <strong className="text-slate-900 font-semibold">John Beauty Parlour</strong> is an upscale hair styling boutique and wellness sanctuary. We specialize in bespoke hair color transformations, multidimensional balayage, Japanese hair repair, scalp revitalization, and precision cutting tailored to your lifestyle.
      </p>

      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">Our certified master colorists utilize exclusively cruelty-free, organic botanical formulations that maintain hair integrity while achieving luminous tones. Guests enjoy individual consultation mirrors, ergonomic reclining shampoo basins with chromotherapy, and a relaxing, unhurried salon atmosphere.</p>
    </section>
  );
}

function AmenitiesSection() {
  return (
    <section className="space-y-4 pt-2" id="amenities">
      <SectionTitle>Studio Amenities & Features</SectionTitle>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {amenities.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.name} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors">
              <div className={`p-2 rounded-lg shrink-0 ${item.color}`}>
                <Icon size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">{item.category}</p>
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LocationSection() {
  return (
    <section className="space-y-4 pt-4" id="location">
      <div className="flex items-center justify-between">
        <SectionTitle>Location & Surroundings</SectionTitle>

        <a className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1" href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
          Open in Google Maps
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-[#e8ece9]">
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="60" id="grid" patternUnits="userSpaceOnUse" width="60">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              </pattern>
            </defs>

            <rect fill="url(#grid)" height="100%" width="100%" />

            <path d="M-50,150 Q180,90 350,140 T700,100" fill="none" stroke="white" strokeWidth="14" />
            <path d="M250,-50 Q300,160 380,360" fill="none" stroke="white" strokeWidth="12" />
            <path d="M0,240 Q400,280 850,220" fill="none" stroke="#fed7aa" strokeWidth="10" />
          </svg>
        </div>

        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 px-3 py-2 flex items-center gap-2">
          <Search size={16} className="text-slate-400" />

          <input className="w-full text-xs bg-transparent border-0 focus:ring-0 p-0 text-slate-700 placeholder-slate-400" readOnly value="Lowokwaru, Kota Malang (Near Univ Brawijaya)" />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-400 opacity-30" />

            <div className="relative bg-slate-900 text-white p-3 rounded-full shadow-2xl border-2 border-white">
              <MapPin size={20} className="text-amber-400" />
            </div>
          </div>

          <div className="mt-1.5 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-900">John Beauty Parlour</p>
            <p className="text-[10px] text-slate-500">Kota Malang, East Java</p>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <button type="button" aria-label="Zoom in" className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold border-b border-slate-100">
            +
          </button>
          <button type="button" aria-label="Zoom out" className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold">
            -
          </button>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section className="space-y-4 pt-4" id="reviews">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={20} className="text-amber-400" fill="currentColor" />
          <SectionTitle>5.0 · 3 Featured Customer Reviews</SectionTitle>
        </div>

        <button type="button" className="text-xs font-semibold text-blue-600 hover:underline">
          View all 128
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <div key={review.name} className={`p-4 rounded-xl border border-slate-200/90 bg-white space-y-2.5 shadow-sm ${review.fullWidth ? "sm:col-span-2" : ""}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm ${review.avatar}`}>{review.initials}</div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{review.name}</h3>
                <p className="text-xs text-slate-400">{review.description}</p>
              </div>
            </div>

            <div className="flex items-center text-amber-400 text-xs gap-1">
              <span>★★★★★</span>
              <span className="text-slate-400 text-[11px] ml-1">{review.date}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-normal">"{review.comment}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BusinessHoursSection() {
  return (
    <section className="space-y-4 pt-4" id="hours">
      <SectionTitle>Business Hours</SectionTitle>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
        {businessHours.map((item) => (
          <div key={item.day} className={`flex items-center justify-between px-5 py-3 text-sm ${item.today ? "bg-blue-50/50" : ""}`}>
            <span className={`font-medium ${item.today ? "font-semibold text-blue-700" : "text-slate-600"}`}>
              {item.day}
              {item.today && <span className="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Open</span>}
            </span>

            <span className={`font-semibold ${item.today ? "text-blue-700" : "text-slate-900"}`}>{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CancellationPolicy() {
  return (
    <section className="space-y-3 pt-4" id="cancellation">
      <SectionTitle>Cancellation & Rescheduling Policy</SectionTitle>

      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-sm text-slate-600">
        <p>
          • <strong className="text-slate-800">Free Cancellation:</strong> Appointments can be rescheduled or cancelled with full refund up to 24 hours prior to your scheduled time.
        </p>

        <p>
          • <strong className="text-slate-800">Late Arrivals:</strong> Please notify us if running late. After a 15-minute grace period, service adjustments may be necessary to respect upcoming appointments.
        </p>

        <p>
          • <strong className="text-slate-800">No Prepayment Penalty:</strong> Your card is held on file to secure the master stylist station; no immediate charges will occur before your service.
        </p>
      </div>
    </section>
  );
}

function BookingSidebar() {
  const serviceCharge = totalServices * 0.1;
  const tax = 15;
  const grandTotal = totalServices + serviceCharge + tax;

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-6 bg-white rounded-2xl border border-slate-200/90 shadow-[0_12px_30px_-4px_rgba(16,24,40,0.08),0_4px_12px_-2px_rgba(16,24,40,0.03)] p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Book Your Service</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select location, treatments, and your ideal time</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* STEP 1: Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">1. Location Select</label>

            <button type="button" className="w-full text-left bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex items-center justify-between transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                  <MapPin size={16} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">John Beauty Parlour — Studio</p>
                  <p className="text-[11px] text-slate-500">Lowokwaru, Kota Malang, East Java</p>
                </div>
              </div>

              <ChevronDown size={16} className="text-slate-400" />
            </button>
          </div>

          {/* STEP 2: Services */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">2. Service Select</label>

            <div className="border border-blue-500/80 bg-blue-50/20 rounded-xl p-3 flex items-center justify-between text-sm shadow-sm cursor-pointer hover:border-blue-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="font-bold text-slate-900 text-xs sm:text-sm">3 Services Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-700 text-sm">{formatPrice(totalServices)}</span>
                <ChevronUp size={16} className="text-blue-600" />
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
              {services.map((service, index) => (
                <div key={service.name} className={`flex items-center justify-between text-slate-700 py-1 ${index !== services.length - 1 ? "border-b border-slate-200/50" : ""}`}>
                  <div>
                    <p className="font-semibold text-slate-900">{service.name}</p>
                    <p className="text-[11px] text-slate-400">{service.description}</p>
                  </div>

                  <span className="font-semibold text-slate-800">{formatPrice(service.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Date and Time */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">3. Date and Time Select</label>

            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" className="text-left bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl p-2.5 transition-colors focus:ring-2 focus:ring-blue-500">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <CalendarDays size={14} />
                  Dates
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1">Oct 8, 2024</p>
              </button>

              <button type="button" className="text-left bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl p-2.5 transition-colors focus:ring-2 focus:ring-blue-500">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Clock size={14} />
                  Time
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1">02:00 PM</p>
              </button>
            </div>
          </div>

          {/* BILL SUMMARY */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Total 3 Services</span>
              <span className="font-medium text-slate-900">{formatPrice(totalServices)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Service Charge (10%)</span>
              <span className="font-medium text-slate-900">{formatPrice(serviceCharge)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Taxes & Fees (VAT 5%)</span>
              <span className="font-medium text-slate-900">{formatPrice(tax)}</span>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-3 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900">Total Amount</span>
                <p className="text-[11px] text-slate-400">Includes all taxes & service charges</p>
              </div>

              <span className="text-2xl font-black text-slate-900">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* BOOK NOW */}
          <div className="pt-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all duration-200 text-sm tracking-wide text-center" type="submit">
              Book Now
            </button>

            <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">You will not get charged yet • Secure checkout</p>
          </div>
        </form>
      </div>
    </aside>
  );
}

export default function SalonDetailsPage() {
  return (
    <main className="min-h-screen bg-slate-50/60 text-slate-800 antialiased py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            <SalonHeader />

            <PhotoGallery />

            <SectionNavigation />

            <AboutSection />

            <AmenitiesSection />

            <LocationSection />

            <ReviewsSection />

            <BusinessHoursSection />

            <CancellationPolicy />
          </div>

          {/* RIGHT COLUMN */}
          <BookingSidebar />
        </div>
      </div>
    </main>
  );
}
