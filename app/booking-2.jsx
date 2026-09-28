import React, { useState } from "react";
import {
  Check,
  Verified,
  MapPin,
  CheckCircle2,
  Clock3,
  Pencil,
  Lock,
  ArrowLeft,
  Users,
  Star,
  Shuffle,
  Zap,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  ShieldCheck,
} from "lucide-react";

const staffMembers = [
  {
    id: "emma",
    name: "Emma Johnson",
    role: "Senior Stylist",
    rating: "5.0",
    reviews: "94 reviews",
    next: "Today, 2:15 PM",
    availability: "available",
    description:
      "Specialist in precision bob cuts, layered styling, and blowout textures.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfMvBf-s6q5zlR26vcrhYM1LvnUqB4UxVuxe1fMtoQQ_oAQk4tgIK4ISVmC5vAyNi8UMiRzJaaruzNksZCC5i5Noa6hM_mx87dOfj3pW0VN52oxpU7t7PeCgTyuW5Lk-Zfbmds1PbWyOk4wJBnapw3Nmwd0EUYZubOweXUPmyQVCKVpd6EUDNzf6wv7ljgTvnQMaJdJnhW54BDqs9pK6HJhT2a5yXLMpgwOIpYGoe5JulwUM_Vy7e-vg",
  },
  {
    id: "olivia",
    name: "Olivia Smith",
    role: "Master Colorist & Stylist",
    rating: "4.9",
    reviews: "76 reviews",
    next: "Today, 3:30 PM",
    availability: "available",
    description:
      "Expert in balayage, dimensional tones, and modern textured bobs.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDawk_RGhxOCzEES9RtBZvnQtyChEsrw25KEMVecc_-jira49SnoXyT90XOiBSEzkmB4QS_H5tW5jg6HFr9sg9Xh8I5PSX-Acsd5Oy6evohMB4LfUUuz6kbE5J3h31uotHT-iKIVIu6ua80H0BXSflIkby0vMHGqLYmTRcQ99NHtfTC_BNr4TgbfRowobdjWqI_wX5Oj6_qCO_SYom8mGXuzIAlwibVAZwhVt0TLF4Mf4vCYrRZDYLywg",
  },
  {
    id: "dawson",
    name: "Dawson Tarman",
    role: "Barber & Wellness Specialist",
    rating: "4.8",
    reviews: "52 reviews",
    next: "Tomorrow, 10:00 AM",
    availability: "limited",
    description:
      "Focus on beard sculpting, classic shears, and scalp massages.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6ASncnUUwkuGa_hRqwNh9ssZmvvljwi4vaqbnkl7qNcoUyXUCDOUyYC0HmcByOM12LzCJeiD2KxafiLrwJsfzetDARhMzsUTyAOOi5de7B7T4GYC1f4cpxY6v98Q0Xe61vxpb7F9FCcmG-j8dDjvL0Y3PoBUxjKBQbp30YpzahWacRhSgiSnbTZQAg5GGzhhTvbGVsBa6CmU5v0E8-F04SqfbAFRCTKqJWWKUwco-TMWaU5deHF65uA",
  },
];

export default function ChooseSpecialist() {
  const [selectedStaff, setSelectedStaff] = useState("emma");

  const selectedMember =
    staffMembers.find((staff) => staff.id === selectedStaff) || null;

  const handleContinue = () => {
    console.log("Selected staff:", selectedMember);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6faff] text-[#141d23] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-[#e0e9f3] bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3742fa] text-white shadow-sm">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                Booksaa
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#757588]">
                Appointment Suite
              </span>
            </div>
          </div>

          {/* Stepper */}
          <nav className="hidden items-center gap-2 md:flex lg:gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#111ae4]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e0e0ff] text-[#111ae4]">
                <Check size={15} strokeWidth={2.5} />
              </span>
              <span>1. Service</span>
            </div>

            <span className="h-[1.5px] w-6 bg-[#111ae4]" />

            <div className="flex items-center gap-2 rounded-full border border-[#111ae4]/20 bg-[#e0e0ff]/40 px-3 py-1.5 text-sm font-bold text-[#111ae4]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3742fa] text-xs font-bold text-white">
                2
              </span>
              <span>Staff (Active)</span>
            </div>

            <span className="h-[1.5px] w-6 bg-[#e0e9f3]" />

            <div className="flex items-center gap-2 text-sm font-medium text-[#757588]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6eff9] text-xs font-medium text-[#454556]">
                3
              </span>
              <span>Date &amp; Time</span>
            </div>

            <span className="h-[1.5px] w-6 bg-[#e0e9f3]" />

            <div className="flex items-center gap-2 text-sm font-medium text-[#757588]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6eff9] text-xs font-medium text-[#454556]">
                4
              </span>
              <span>Details</span>
            </div>
          </nav>

          {/* Business */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#e0e9f3] bg-[#ebf5fe] px-3.5 py-1.5 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold">
                ABC Beauty &amp; Wellness
              </span>
            </div>

            <div className="h-10 w-10 overflow-hidden rounded-full border border-[#e0e9f3] ring-2 ring-[#111ae4]/10">
              <img
                className="h-full w-full object-cover"
                alt="Client"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaDpanTjtAJ6-kAY90vZYhBrcviaXwE9Oq59_1JYtu0P-S1GstH6ISXV6RZFm9WnCy9Z8r5aVCRQgDFZ6aO3Q22qY7O708n7rR_5h0lRpViw7fd7D3z3fG8zv6VoWwU6OjW2GcsTJHMRR68g5tbNG6YOdVKC71OsrGVzEEvhvDnnSXGV0JO6q-nRoFJhHILRR_sPnMDRZHEo1TLIXzCqB833B7mluvueQ_INHGEFfCy-_IifkXFuIJsw"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="grid min-h-[720px] grid-cols-1 overflow-hidden rounded-2xl border border-[#e0e9f3] bg-white shadow-sm lg:grid-cols-12">
          {/* LEFT COLUMN */}
          <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden border-b border-[#e0e9f3] bg-white p-6 sm:p-8 lg:col-span-5 lg:min-h-full lg:border-b-0 lg:border-r">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDutQi8dsFMWIZi8exRjHiSY9G6I1s31Opj-Y4BqE9vPBXcQXYyLc24Y_YRsUBfJ27bBHUtFKn0TsywN6qsXzTNZe6TAAOHLghSiunUrjvYPdhVgUeUzW5GZgPrrHo4biMg4mf09yFvF4Aj7OZBlON569VQbZ_dBDX_LEz6C8aLxp57sexHXxNTRrPLt3OCJ2ulCEQV40vPlqcobM2rSwMV2QlQamVbDCpoXbxgfW1B-CyDO0AHalh_3g')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-900/40" />
            </div>

            {/* Provider Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-white shadow-lg backdrop-blur-md">
                <Verified size={18} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Verified Provider
                </span>
              </div>

              <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
                4.9 ★ (420+ Reviews)
              </span>
            </div>

            {/* Studio */}
            <div className="relative z-10 my-auto py-8">
              <h1 className="text-2xl font-bold leading-snug tracking-tight text-white drop-shadow-md sm:text-3xl">
                ABC Beauty &amp; Wellness Studio
              </h1>

              <p className="mt-2 flex items-center gap-1.5 text-sm font-light text-white/80">
                <MapPin size={16} />
                142 Belmont Boulevard, Suites 4A-B
              </p>
            </div>

            {/* Selected Service */}
            <div className="relative z-10 rounded-xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#111ae4]">
                    <CheckCircle2 size={14} />
                    Current Selection
                  </span>

                  <h3 className="text-base font-bold tracking-tight">
                    Haircut &amp; Styling
                  </h3>

                  <p className="flex items-center gap-2 text-xs font-medium text-[#454556]">
                    <span className="font-semibold text-[#141d23]">
                      $25.00
                    </span>

                    <span className="text-[#c5c5d9]">•</span>

                    <span className="flex items-center gap-1">
                      <Clock3 size={14} />
                      45 min
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e9f3] bg-[#e6eff9] px-3 py-1.5 text-xs font-semibold text-[#111ae4] transition hover:bg-[#dae4ed] active:scale-95"
                >
                  <Pencil size={16} />
                  Change
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#e0e9f3]/60 pt-3 text-[11px] text-[#757588]">
                <span className="flex items-center gap-1">
                  <Lock size={13} className="text-emerald-600" />
                  Price guaranteed at counter
                </span>

                <span>Free cancellation up to 2h</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col justify-between bg-white p-6 sm:p-8 lg:col-span-7">
            <div>
              {/* Heading */}
              <div className="flex flex-col justify-between gap-4 border-b border-[#e0e9f3] pb-6 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Go back to services"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e0e9f3] text-[#141d23] transition hover:border-[#c5c5d9] hover:bg-[#e6eff9] active:scale-90"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                      Choose a Specialist
                    </h2>
                  </div>

                  <p className="pl-10 text-xs font-normal text-[#454556] sm:text-sm">
                    Step 2 of 4: Select your preferred stylist for{" "}
                    <span className="font-semibold text-[#141d23]">
                      Haircut &amp; Styling
                    </span>
                  </p>
                </div>

                <div className="hidden items-center gap-1.5 self-start rounded-lg border border-[#e6eff9] bg-[#ebf5fe] px-3 py-1.5 text-xs text-[#757588] sm:flex sm:self-center">
                  <Users size={16} className="text-[#111ae4]" />
                  <span>3 available today</span>
                </div>
              </div>

              {/* Staff */}
              <div className="mt-6 space-y-3.5">
                {staffMembers.map((staff) => {
                  const isSelected = selectedStaff === staff.id;

                  return (
                    <label
                      key={staff.id}
                      className={`group relative flex cursor-pointer items-start justify-between gap-4 rounded-xl p-4 transition-all duration-200 sm:items-center ${
                        isSelected
                          ? "border-2 border-[#111ae4] bg-[#e0e0ff]/20 shadow-sm ring-4 ring-[#111ae4]/5"
                          : "border border-[#e0e9f3] bg-white hover:border-[#c5c5d9] hover:bg-[#ebf5fe]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="staff_selection"
                        value={staff.id}
                        checked={isSelected}
                        onChange={() => setSelectedStaff(staff.id)}
                        className="sr-only"
                      />

                      <div className="flex items-start gap-3.5 sm:items-center">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div
                            className={`h-14 w-14 overflow-hidden rounded-full shadow-sm ${
                              isSelected
                                ? "border-2 border-[#111ae4]"
                                : "border border-[#e0e9f3] group-hover:border-[#111ae4]/40"
                            }`}
                          >
                            <img
                              src={staff.image}
                              alt={staff.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <span
                            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              staff.availability === "available"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            title={
                              staff.availability === "available"
                                ? "Available today"
                                : "Limited slots"
                            }
                          />
                        </div>

                        {/* Info */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#141d23] sm:text-base group-hover:text-[#111ae4]">
                              {staff.name}
                            </span>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] ${
                                isSelected
                                  ? "bg-[#3742fa] font-semibold text-white"
                                  : "bg-[#e6eff9] font-medium text-[#454556]"
                              }`}
                            >
                              {staff.role}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#454556]">
                            <div className="flex items-center font-bold text-amber-600">
                              <Star
                                size={16}
                                fill="currentColor"
                                className="mr-0.5 text-amber-500"
                              />
                              <span>{staff.rating}</span>
                            </div>

                            <span className="text-[#c5c5d9]">•</span>

                            <span className="text-[#757588]">
                              {staff.reviews}
                            </span>

                            <span className="text-[#c5c5d9]">•</span>

                            <span
                              className={`text-[11px] ${
                                staff.id === "emma"
                                  ? "font-semibold text-emerald-700"
                                  : "text-[#454556]"
                              }`}
                            >
                              Next: {staff.next}
                            </span>
                          </div>

                          <p className="line-clamp-2 pt-0.5 text-xs leading-relaxed text-[#454556]">
                            {staff.description}
                          </p>
                        </div>
                      </div>

                      {/* Radio */}
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          isSelected
                            ? "bg-[#111ae4] text-white shadow-sm"
                            : "border-2 border-[#757588]/50 group-hover:border-[#111ae4]"
                        }`}
                      >
                        {isSelected && <Check size={16} strokeWidth={2.5} />}
                      </div>
                    </label>
                  );
                })}

                {/* No Preference */}
                <label
                  className={`group relative flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-dashed p-4 transition-all duration-200 sm:items-center ${
                    selectedStaff === "any"
                      ? "border-2 border-[#111ae4] bg-[#e0e0ff]/20 ring-4 ring-[#111ae4]/5"
                      : "border-[#c5c5d9] bg-[#ebf5fe]/60 hover:border-[#111ae4] hover:bg-[#ebf5fe]"
                  }`}
                >
                  <input
                    type="radio"
                    name="staff_selection"
                    value="any"
                    checked={selectedStaff === "any"}
                    onChange={() => setSelectedStaff("any")}
                    className="sr-only"
                  />

                  <div className="flex items-start gap-3.5 sm:items-center">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                        selectedStaff === "any"
                          ? "bg-[#e0e0ff] text-[#111ae4]"
                          : "bg-[#dae4ed] text-[#454556] group-hover:bg-[#e0e0ff] group-hover:text-[#111ae4]"
                      }`}
                    >
                      <Shuffle size={24} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#141d23] sm:text-base">
                          No Preference / Anyone Available
                        </span>

                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          <Zap size={12} fill="currentColor" />
                          Fastest Booking
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-[#454556]">
                        First available stylist for faster appointment
                        booking. Great if you have a flexible schedule.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      selectedStaff === "any"
                        ? "bg-[#111ae4] text-white shadow-sm"
                        : "border-2 border-[#757588]/50 group-hover:border-[#111ae4]"
                    }`}
                  >
                    {selectedStaff === "any" && <Check size={16} />}
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 border-t border-[#e0e9f3] pt-8 sm:flex-row">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#e0e9f3] px-5 py-2.5 text-sm font-semibold text-[#141d23] transition hover:bg-[#e6eff9] active:scale-95 sm:w-auto"
              >
                <ArrowLeftIcon size={18} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3742fa] px-7 py-3 text-sm font-bold tracking-wide text-white shadow-md shadow-[#111ae4]/20 transition-all hover:bg-[#111ae4] hover:shadow-lg hover:shadow-[#111ae4]/30 active:scale-95 sm:w-auto"
              >
                <span>Continue to Date &amp; Time</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 px-2 text-xs text-[#757588] sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>© 2025 Booksaa Inc.</span>

            <a href="#" className="underline hover:text-[#141d23]">
              Cancellation Policy
            </a>

            <a href="#" className="underline hover:text-[#141d23]">
              Privacy
            </a>

            <a href="#" className="underline hover:text-[#141d23]">
              Terms of Service
            </a>
          </div>

          <div className="flex items-center gap-1.5 text-[#454556]">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Secure 256-bit encrypted checkout</span>
          </div>
        </div>
      </main>
    </div>
  );
}