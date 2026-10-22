import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { vision, mission } from "../data/products";

function useScrollReveal(content) {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-up");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [content]);
}

function SectionHeader({ kicker, title, description = "", align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h2 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl lg:text-[3.4rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-cocoa/[0.68] sm:text-lg">{description}</p>
      )}
    </div>
  );
}

function Hero({ homepage }) {
  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden bg-cocoa text-cream lg:min-h-[min(960px,100svh)]">
      <img
        src={homepage.heroImage?.url || "/hero-living-room.jpg"}
        alt={homepage.heroImage?.altText || "Warm modern living room with Luvin Home furniture"}
        width="1694"
        height="928"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="hero-media absolute inset-0 h-full w-full object-cover object-[58%_center] sm:object-center"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,23,18,0.9)_0%,rgba(47,33,27,0.64)_42%,rgba(62,44,35,0.12)_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-cocoa/90 via-cocoa/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,transparent_0%,rgba(28,18,14,0.14)_76%)]" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-end px-5 pb-14 pt-32 sm:px-8 sm:pb-20 lg:min-h-[min(960px,100svh)] lg:pb-24">
        <div className="max-w-3xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cocoa/10 px-4 py-2 text-xs font-semibold tracking-[0.04em] backdrop-blur-md sm:text-sm">
            <Sparkles size={16} />
            {homepage.heroEyebrow}
          </p>
          <h1 className="max-w-2xl font-display text-[2.8rem] leading-[0.98] tracking-[-0.035em] text-cream min-[390px]:text-5xl sm:text-6xl lg:text-[5.25rem]">
            {homepage.heroTitle}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-cream/[0.82] sm:text-lg sm:leading-8">
            {homepage.heroDescription}
          </p>
          <div className="mt-9">
            <a
              href={homepage.heroPrimaryCtaTarget || "/products"}
              className="premium-button inline-flex items-center justify-center gap-2 bg-cream px-7 py-4 text-sm font-bold text-cocoa hover:bg-linen"
            >
              {homepage.heroPrimaryCtaLabel}
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section id="values" className="section-shell bg-linen">
      <div className="mx-auto max-w-7xl">
        <SectionHeader kicker="Who We Are" title="What we stand for." />

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="fade-up">
            <p className="section-kicker">Our Vision</p>
            <p className="mt-4 font-display text-2xl leading-snug tracking-[-0.01em] text-cocoa sm:text-[1.75rem]">
              {vision}
            </p>
          </div>
          <div className="fade-up fade-up-delay">
            <p className="section-kicker">Our Mission</p>
            <ul className="mt-4 space-y-4">
              {mission.map((item) => (
                <li key={item} className="flex gap-3 leading-7 text-cocoa/[0.72]">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const content = /** @type {any} */ (useOutletContext());
  const { homepage } = content;

  useScrollReveal(content);

  return (
    <>
      <Hero homepage={homepage} />
      <ValuesSection />
    </>
  );
}
