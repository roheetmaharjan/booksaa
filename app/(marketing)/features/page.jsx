import * as Icons from "lucide-react";
import featureContent from "@/data/features.json";

const ArrowRight = Icons.ArrowRight;

function FeatureCard({ feature, featured = false }) {
  const Icon = Icons[feature.icon] || Icons.BadgeCheck;

  return (
    <article className={`feature-card group flex flex-col justify-between rounded-2xl p-6 shadow-sm bg-white transition-all duration-300 hover:shadow-xl ${featured ? "lg:col-span-2 lg:p-8" : ""}`}>
      <div>
        <div className="mb-4 flex items-start justify-between gap-4">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-black`}>
            <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
          </span>
          {feature.badge && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] uppercase text-black">{feature.badge}</span>}
        </div>
        <h3 className={`${featured ? "text-2xl" : "text-lg"} mb-2 text-slate-900 font-medium`}>{feature.title}</h3>
        <p className={`${featured ? "text-base" : "text-sm"} mb-5 leading-relaxed text-slate-600`}>{feature.description}</p>
      </div>
      {/* {feature.label && (
        <div className="flex items-center gap-1 text-xs text-teal-800">
          {feature.label}
          {feature.label.toLowerCase().startsWith("learn") || feature.label.toLowerCase().startsWith("explore") ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </div>
      )} */}
    </article>
  );
}

function FeatureSection({ section }) {
  const Icon = Icons[section.icon] || Icons.Layers;

  return (
    <section className="feature-category flex flex-col gap-6" data-category={section.category} id={section.id}>
      <header className="flex flex-col justify-between gap-4 pb-2 md:flex-row md:items-end">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl tracking-tight text-slate-900">{section.title}</h2>
          </div>
        </div>
        <p className="max-w-md text-sm text-slate-600">{section.description}</p>
      </header>
      <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${section.category === "platforms" ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {section.cards.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} featured={index === 0 && (section.category === "booking" || section.category === "payments")} />
        ))}
      </div>
    </section>
  );
}

export default function Features() {
  return (
    <main className="flex w-full flex-col bg-slate-50">
      <section className="relative w-full overflow-hidden py-16 pb-12 z-10">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[340px] w-[840px] -translate-x-1/2 bg-gradient-to-b from-teal-100/70 via-cyan-100/50 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -top-12 right-12 -z-10 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center lg:px-12">
          <h1 className="mb-6 max-w-4xl text-4xl leading-none tracking-tight text-slate-900 md:text-5xl">{featureContent.hero.title}</h1>
          <p className="mx-auto mb-2 max-w-2xl text-lg leading-relaxed text-slate-600">{featureContent.hero.description}</p>
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-12 pb-24 lg:px-12">
        {featureContent.sections.map((section) => (
          <FeatureSection key={section.id} section={section} />
        ))}
      </div>
    </main>
  );
}
