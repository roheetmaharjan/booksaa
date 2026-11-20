import featureContent from "@/data/features.json";
import FeatureStackCard, {
  FeatureListItem,
} from "@/components/components_marketing/FeatureStackCard";

export default function Features() {
  return (
    <section className="py-[50px] md:py-[80px] lg:py-[100px]">
      <div className="container">
        <div className="space-y-[35px] md:space-y-[70px]">
          <div className="space-y-3 max-w-3xl mx-auto text-center">
            <p className="text-center uppercase font-semibold mb-3 text-sm text-slate-500 tracking-[0.18em]">Features</p>
            <h2 className="section-heading">
              Replace Multiple Tools with <br /> One Powerful Platform
            </h2>
            <p className="text-center max-w-xl mx-auto mb-10 text-muted-foreground">Booksaa helps businesses streamline operations, automate scheduling, improve customer experiences, and gain visibility into performance—all from a single platform.</p>
          </div>

          <div className="flex flex-col gap-6">
            {featureContent.sections.slice(0, 3).map((section, index) => (
              <FeatureStackCard key={section.id} id={section.id} category={section.category} title={section.title} description={section.description} icon={section.icon} index={index}>
                <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                  {section.cards.map((feature) => (
                    <FeatureListItem key={feature.title} feature={feature} />
                  ))}
                </div>
              </FeatureStackCard>
            ))}
          </div>

          <div className="text-center w-full">
            <a href="/features" className="btn-primary">
              <span>View all Features</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
