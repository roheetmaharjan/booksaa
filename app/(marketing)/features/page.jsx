import * as Icons from "lucide-react";
import featureContent from "@/data/features.json";
import FeatureStackCard, {
  FeatureListItem,
} from "@/components/components_marketing/FeatureStackCard";

export default function Features() {
  return (
    <main className="flex w-full flex-col bg-white">
      <section className="relative z-10 w-full overflow-hidden py-16 pb-12">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[340px] w-[840px] -translate-x-1/2 bg-gradient-to-b from-teal-100/70 via-cyan-100/50 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -top-12 right-12 -z-10 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center lg:px-12">
          <h1 className="mb-6 max-w-4xl text-4xl leading-none tracking-tight text-slate-900 md:text-5xl">
            {featureContent.hero.title}
          </h1>
          <p className="mx-auto mb-2 max-w-2xl text-lg leading-relaxed text-slate-600">
            {featureContent.hero.description}
          </p>
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-24 lg:px-12">
        {featureContent.sections.map((section, index) => (
          <FeatureStackCard
            key={section.id}
            id={section.id}
            category={section.category}
            title={section.title}
            description={section.description}
            icon={section.icon}
            index={index}
          >
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {section.cards.map((feature) => (
                <FeatureListItem key={feature.title} feature={feature} />
              ))}
            </div>
          </FeatureStackCard>
        ))}
      </div>
    </main>
  );
}
