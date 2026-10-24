"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

const industries = {
  hair: {
    title: "Hair Salons & Barbershops",
    description: "Make appointment scheduling and salon management effortless.",
    image: "/hair.jpg",
    items: ["Online appointment booking", "Stylist and barber scheduling", "Service menus and pricing", "Client profiles and visit history", "Automated appointment reminders"],
  },
  beauty: {
    title: "Beauty & Aesthetic Clinics",
    description: "Deliver a seamless client experience while keeping your business organized.",
    image: "/beauty.jpg",
    items: ["Treatment and service booking", "Staff and room scheduling", "Client records and preferences", "Flexible service durations", "Business performance insights"],
  },
  spas: {
    title: "Spas & Wellness Centers",
    description: "Create a relaxing experience from the moment clients book.",
    image: "/spas.jpg",
    items: ["Massage and wellness bookings", "Therapist availability management", "Multiple treatment scheduling", "Client appointment history", "Centralized booking management"],
  },
  nails: {
    title: "Nail Salons & Lash Studios",
    description: "Keep your bookings flowing and your team organized.",
    image: "/nails.jpg",
    items: ["Nail, lash, and beauty service menus", "Staff-specific appointment booking", "Appointment calendar management", "Client preferences and history", "Convenient online booking"],
  },
  fitness: {
    title: "Fitness & Personal Training",
    description: "Spend less time coordinating sessions and more time helping clients reach their goals.",
    image: "/fitness.jpg",
    items: ["Personal training appointments", "Trainer availability and schedules", "Session booking and management", "Client profiles", "Recurring session coordination"],
  },
  indepentent: {
    title: "Independent Professionals",
    description: "Give your independent service business the tools to run professionally.",
    image: "/professional.jpg",
    items: ["Personal booking page", "Service and availability management", "Client management", "Appointment notifications", "Business overview and reporting"],
  },
};

export default function TargetAudience() {
  return (
    <section className="py-10 xl:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-center uppercase text-primary font-semibold mb-3">Industries We Work With</p>

          <h2 className="section-heading">
            Complete <span className="text-primary">Business Management</span> Platform for Service Providers
          </h2>

          <p className="text-center max-w-3xl mx-auto mb-10 text-muted-foreground">We helps service-based businesses manage appointments, staff, clients, and day-to-day operations</p>
        </div>

        <Tabs defaultValue="hair" className="w-full">
          <TabsList className="grid w-full lg:grid-cols-3 xl:grid-cols-6 mb-8 justify-stretch h-auto rounded-xl bg-slate-50 border">
            <TabsTrigger value="hair" className="py-3 rounded-xl font-semibold text-base">
              Hair Salons & Barbershops{" "}
            </TabsTrigger>
            <TabsTrigger value="beauty" className="py-3 rounded-xl font-semibold text-base">
              Beauty & Aesthetic Clinics
            </TabsTrigger>
            <TabsTrigger value="spas" className="py-3 rounded-xl font-semibold text-base">
              Spas & Wellness Centers
            </TabsTrigger>
            <TabsTrigger value="nails" className="py-3 rounded-xl font-semibold text-base">
              Nail Salons & Lash Studios
            </TabsTrigger>
            <TabsTrigger value="fitness" className="py-3 rounded-xl font-semibold text-base">
              Fitness & Personal Training
            </TabsTrigger>
            <TabsTrigger value="indepentent" className="py-3 rounded-xl font-semibold text-base">
              Independent Professionals
            </TabsTrigger>
          </TabsList>

          {Object.entries(industries).map(([key, industry]) => (
            <TabsContent key={key} value={key}>
              <div className="rounded-2xl border bg-background overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-8 p-6">
                  <div>
                    <Image src={industry.image} alt={industry.title} width={400} height={400} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" className="h-[400px] w-full rounded-xl object-cover" />
                  </div>

                  <div className="flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">{industry.title}</h3>

                    <p className="text-muted-foreground mb-6">{industry.description}</p>

                    <ul className="space-y-4">
                      {industry.items.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/50 flex items-center justify-center text-black">✓</div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
