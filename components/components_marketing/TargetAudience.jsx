"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const industries = {
  startup: {
    title: "Helping startups turn bold ideas into impactful digital products.",
    description: "We help founders validate ideas, launch MVPs, and scale products with confidence.",
    image: "/feature-5.jpg",
    items: ["MVP & Prototype Design", "Product Discovery & UX Strategy", "Brand Identity", "Rapid Iteration & Validation", "Design Systems for Scaling Teams"],
  },
  saas: {
    title: "Designing intuitive and scalable SaaS experiences.",
    description: "Creating powerful software experiences that are easy to use and built to grow.",
    image: "/feature-1.jpg",
    items: ["User Onboarding", "Dashboard Design", "Role-Based Access", "Analytics & Reporting", "Subscription & Billing Flows"],
  },
  fintech: {
    title: "Building trust-driven financial experiences.",
    description: "Secure, compliant, and intuitive interfaces for financial products.",
    image: "/feature-3.jpg",
    items: ["Financial Workflows", "Mobile Banking UX", "Transaction Visualization", "Security-Focused Interfaces", "Compliance-Friendly Design"],
  },
  ecommerce: {
    title: "Designing conversion-focused shopping experiences.",
    description: "Helping brands increase conversions and improve customer journeys.",
    image: "/feature-4.jpg",
    items: ["Product Pages", "Checkout Optimization", "Shopping Cart Experience", "Mobile Commerce", "Brand Consistency"],
  },
  healthcare: {
    title: "Designing human-centered healthcare experiences.",
    description: "Improving patient and provider experiences through thoughtful design.",
    image: "/feature-2.jpg",
    items: ["Patient Portals", "Appointment Scheduling", "Healthcare Dashboards", "Accessibility", "Privacy & Security"],
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

          <p className="text-center max-w-3xl mx-auto mb-10 text-muted-foreground">We design digital products that are purposeful, scalable, and user-centric.</p>
        </div>

        <Tabs defaultValue="startup" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 justify-stretch h-auto rounded-xl bg-slate-50 border">
            <TabsTrigger value="beauty" className="py-3 rounded-xl font-semibold text-base">Beauty</TabsTrigger>
            <TabsTrigger value="wellness" className="py-3 rounded-xl font-semibold text-base">Wellness</TabsTrigger>
            <TabsTrigger value="fitness" className="py-3 rounded-xl font-semibold text-base">Fitness</TabsTrigger>
            <TabsTrigger value="ecommerce" className="py-3 rounded-xl font-semibold text-base">Health Care</TabsTrigger>
          </TabsList>

          {Object.entries(industries).map(([key, industry]) => (
            <TabsContent key={key} value={key}>
              <div className="rounded-2xl border bg-background overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-8 p-6">
                  <div>
                    <img src={industry.image} alt={industry.title} className="w-full h-[400px] object-cover rounded-xl" />
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
