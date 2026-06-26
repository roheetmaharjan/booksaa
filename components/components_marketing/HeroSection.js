import StartFreeTrialButton from "@/components/common/StartFreeTrialButton";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#062B3D] overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[linear-gradient(to_right_rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom_rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:120px_120px]" />
      </div>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-36 pb-16">
        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-white text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight">
            Run your entire business from <br /> <span className="text-primary">one platform</span>
          </h1>

          <p className="mt-8 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Scheduling, payments, team management, customer communication,
            and business insights—all connected in one powerful system
            designed to help you grow faster.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <StartFreeTrialButton>Start Free Trial →</StartFreeTrialButton>

            <button className="bg-white/10 backdrop-blur text-white px-7 py-4 rounded-xl border border-white/10 hover:bg-white/15 transition">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-slate-300">
            <span>⭐ 4.9/5 customer rating</span>
            <span className="opacity-50">|</span>
            <span>Available in 30+ countries</span>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid lg:grid-cols-[2.3fr_1fr] gap-6 mt-20">
          {/* Large Image Card */}
          <div className="relative overflow-hidden rounded-3xl bg-[#5C87B0] min-h-[420px]">
            <img
              src="./hero_banner.jpg"
              alt="Business Management"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

            <div className="absolute top-8 left-8 max-w-sm">
              <h3 className="text-white text-3xl font-semibold mb-4">
                Everything connected in one place.
              </h3>

              <p className="text-white/90 leading-relaxed">
                Manage bookings, staff schedules, payments, customer
                communication, marketing, and reporting from a single
                platform built for service businesses.
              </p>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="rounded-3xl bg-[#6E8DA9] p-8 flex flex-col justify-between min-h-[420px]">
            <div className="text-[#B5E86A] text-7xl leading-none">"</div>

            <div className="h-full flex flex-col">
              <p className="text-white text-lg">
                Booksaa replaced multiple tools and helped us streamline
                bookings, staff management, and customer communication from
                day one.
              </p>

              <div className="mt-auto">
                <h4 className="text-white font-semibold">
                  Sarah Thompson
                </h4>

                <p className="text-white/60 text-sm">
                  Owner, Elite Wellness Studio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Strip */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-12 text-white/30 text-xl font-semibold">
          <span>SalonPro</span>
          <span>WellnessHub</span>
          <span>BeautyFlow</span>
          <span>FitStudio</span>
          <span>SpaWorks</span>
          <span>ClinicPro</span>
          <span>ServiceOne</span>
        </div>
      </div>
    </section>
  );
}