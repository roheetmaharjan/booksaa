import Image from "next/image";
export default function Cta() {
  return (
    <section class="relative z-20 -mb-8 md:-mb-10">
      <div class="main-container">
        <div
          data-ns-animate=""
          data-delay="0.1"
          class="bg-secondary dark:bg-background-8 py-[76px] rounded-4xl space-y-6 relative overflow-hidden"
        >
          <figure class="absolute max-[376px]:-top-[80%] -top-[88%] md:-top-[78%] lg:-top-[71%] xl:-top-[84%] -left-[65%] md:-left-[35%] lg:-left-[28%] xl:-left-[27%] 2xl:-left-[26%] opacity-80 select-none xl:size-[700px] size-[500px] pointer-events-none">
            <Image
              src
              class="w-full h-full object-cover"
              loading="lazy"
              height="20"
              width="20"
              alt="Booksaa"
            />
          </figure>

          <div class="text-center mx-2 sm:mx-0">
            <span
              data-ns-animate=""
              data-delay="0.2"
              class="badge badge-blur mb-5"
              id="cta-badge"
            >
              Get started
            </span>
            <h2
              data-ns-animate=""
              data-delay="0.3"
              id="cta-heading"
              class="mx-auto text-white mb-3 section-header"
            >
              Ready to transform your workflow?
            </h2>
            <p
              data-ns-animate=""
              data-delay="0.4"
              class="text-accent/60"
            >
              Download NextSaaS and start making smarter decisions today.
            </p>
          </div>

          <div
            data-ns-animate=""
            data-delay="0.5"
            class="text-center"
          >
            <a
              href="#"
              class="btn btn-primary btn-md hover:btn-white w-[85%] md:w-auto border-0 dark:hover:btn-accent"
              aria-label="Get started with NextSaaS"
            >
              <span>Get started now</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
