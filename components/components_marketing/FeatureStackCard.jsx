import * as Icons from "lucide-react";

export function FeatureListItem({ feature }) {
  const Icon = Icons[feature.icon] || Icons.BadgeCheck;

  return (
    <article className="flex gap-4 border-t border-slate-200/80 py-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-slate-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-medium text-slate-900">{feature.title}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">{feature.description}</p>
      </div>
    </article>
  );
}

export default function FeatureStackCard({ title, description, icon, index, id, category, children, headingLevel = 2 }) {
  const Icon = Icons[icon] || Icons.Layers;
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const stackOffset = index * 12;

  return (
    <section
      className="feature-category rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8 lg:p-10 md:sticky"
      style={{
        top: `calc(5rem + ${stackOffset}px)`,
        zIndex: index + 1,
      }}
      data-category={category}
      id={id}
    >
      <header className="mb-8 flex flex-col gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <Heading className="text-2xl tracking-tight text-slate-900 sm:text-3xl">{title}</Heading>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
