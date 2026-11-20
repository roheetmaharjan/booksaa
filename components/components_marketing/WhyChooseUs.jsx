import Image from "next/image";
import { Box, DollarSign, Handshake } from "lucide-react";

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Box,
      title: "All-in-One Business Management",
      description: "Manage bookings, customers, staff, services, and payments from one platform.",
    },
    {
      icon: DollarSign,
      title: "Effortless Online Booking",
      description: "Let customers book appointments anytime without calling or messaging.",
    },
    {
      icon: Handshake,
      title: "More Control Over Your Business",
      description: "Manage your business operations, availability, and team in one place.",
    },
    {
      icon: Handshake,
      title: "Grow Without Complexity",
      description: "Spend less time on administrative work and more time growing your business.",
    },
  ];

  return (
    <section className="py-10 lg:py-24 js-stagger">
      <div className="container">
        {/* Section Heading */}
        <div className="max-w-5xl text-center mb-10 mx-auto">
          <p className="text-center uppercase font-semibold mb-3 text-sm text-slate-500 tracking-[0.18em]">What Makes Booksaa Different?</p>

          <h2 className="section-heading">A Better Way to Run Your Business.</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 items-start">
          {/* Feature Image */}
          <div className="relative h-[250px] lg:h-[400px] w-full overflow-hidden rounded-2xl">
            <Image src="/what-makes-different.jpg" alt="Our team working together" fill sizes="(max-width: 1024px) 100vw, 1200px" className="object-cover" />
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div key={index} className="border p-5 md:p-7 rounded-2xl flex flex-col gap-6">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold mb-4 text-lg leading-normal">{benefit.title}</h3>

                    <p className="text-gray-700 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
