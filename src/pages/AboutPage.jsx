import { useOutletContext } from "react-router-dom";
import { HeartHandshake } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

export default function AboutPage() {
  const { homepage, philosophy } = /** @type {any} */ (useOutletContext());

  return (
    <>
      <section className="section-shell bg-linen pt-32">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Tentang Kami" }]} />
          <div className="mt-8 grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24 lg:items-start">
            <div>
              <p className="section-kicker">{homepage.brandStoryEyebrow}</p>
              <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl lg:text-[3.4rem]">
                {homepage.brandStoryTitle}
              </h1>
            </div>
            <div className="max-w-2xl space-y-7 text-[1.05rem] leading-8 text-cocoa/72 sm:text-lg sm:leading-9">
              {homepage.brandStoryParagraphs?.map((paragraph, index) => (
                <p
                  key={`${index}-${paragraph}`}
                  className={
                    index === homepage.brandStoryParagraphs.length - 1
                      ? "border-l-2 border-clay/60 pl-6 font-display text-3xl leading-tight tracking-[-0.02em] text-cocoa sm:text-[2rem]"
                      : undefined
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-cream">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="section-kicker">{homepage.philosophyEyebrow}</p>
            <h2 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl lg:text-[3.4rem]">
              {homepage.philosophyTitle}
            </h2>
            {homepage.philosophyDescription && (
              <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-cocoa/68 sm:text-lg">
                {homepage.philosophyDescription}
              </p>
            )}
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3 lg:mt-16">
            {philosophy.map((item) => (
              <article key={item.title} className="premium-card p-7 sm:p-8">
                <span className="inline-grid h-11 w-11 place-items-center rounded-full bg-clay/10 text-clay">
                  <HeartHandshake size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-8 font-display text-[1.65rem] tracking-[-0.02em] text-cocoa">{item.title}</h3>
                <p className="mt-4 leading-7 text-cocoa/68">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
