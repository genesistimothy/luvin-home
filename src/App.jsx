import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  HeartHandshake,
  Instagram,
  Menu,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { materialDescriptions } from "./data/products";
import { createWhatsAppLink } from "./config/contact";
import { useCmsContent, useHomepageSeo } from "./hooks/useCmsContent";
const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

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
    // Re-run whenever CMS content swaps in: list items keyed by CMS _id (e.g.
    // products) remount as new DOM nodes and would otherwise never get observed.
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
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-cocoa/68 sm:text-lg">{description}</p>
      )}
    </div>
  );
}

function Navbar({ siteSettings, whatsAppLink }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    const updateScrollState = () => setIsScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-500 ${isScrolled ? "border-cocoa/10 bg-cream/[0.94] shadow-[0_12px_40px_rgba(62,44,35,0.07)]" : "border-white/35 bg-cream/[0.88]"}`}>
      <nav className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 sm:px-8 ${isScrolled ? "py-3" : "py-4"}`}>
        <a href="#home" className="flex min-w-0 items-center gap-3" aria-label="Luvin Home — back to top" onClick={closeMenu}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cocoa text-sm font-semibold text-cream">
            LH
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl text-cocoa">{siteSettings.brandName}</span>
            <span className="hidden text-xs uppercase tracking-[0.24em] text-umber/70 sm:block">
              {siteSettings.brandPromise}
            </span>
          </span>
        </a>
        <div className="hidden items-center gap-8 text-[0.82rem] font-semibold tracking-[0.02em] text-cocoa/70 lg:flex">
          <a className="transition hover:text-clay" href="#about">
            Our Story
          </a>
          <a className="transition hover:text-clay" href="#collections">
            Collections
          </a>
          <a className="transition hover:text-clay" href="#products">
            Products
          </a>
          <a className="transition hover:text-clay" href="#contact">
            Visit Us
          </a>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsAppLink}
            {...externalLinkProps}
            className="premium-button hidden items-center gap-2 bg-cocoa px-5 py-3 text-sm text-cream shadow-soft hover:bg-umber sm:inline-flex"
          >
            <MessageCircle size={17} aria-hidden="true" />
            WhatsApp
          </a>
          <button
            type="button"
            className="inline-grid h-11 w-11 place-items-center rounded-full border border-cocoa/20 text-cocoa transition duration-300 hover:border-cocoa/35 hover:bg-cocoa/5 lg:hidden"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>
      <div
        id="mobile-navigation"
        className={`${isMenuOpen ? "grid" : "hidden"} border-t border-cocoa/10 bg-cream/[0.98] px-5 pb-6 pt-3 shadow-soft lg:hidden`}
      >
        {[
          ["Our Story", "#about"],
          ["Collections", "#collections"],
          ["Products", "#products"],
          ["Visit Us", "#contact"],
        ].map(([label, href]) => (
          <a key={href} href={href} onClick={closeMenu} className="rounded-xl px-3 py-3.5 text-base font-medium text-cocoa/80 transition duration-300 hover:bg-linen hover:text-clay">
            {label}
          </a>
        ))}
        <a href={whatsAppLink} {...externalLinkProps} onClick={closeMenu} className="premium-button mt-3 inline-flex items-center justify-center gap-2 bg-cocoa px-5 py-3.5 text-sm font-semibold text-cream sm:hidden">
          <MessageCircle size={17} aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </header>
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
        <div className="fade-up max-w-3xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cocoa/10 px-4 py-2 text-xs font-semibold tracking-[0.04em] backdrop-blur-md sm:text-sm">
            <Sparkles size={16} />
            {homepage.heroEyebrow}
          </p>
          <h1 className="max-w-2xl font-display text-[2.8rem] leading-[0.98] tracking-[-0.035em] text-cream min-[390px]:text-5xl sm:text-6xl lg:text-[5.25rem]">
            {homepage.heroTitle}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-cream/82 sm:text-lg sm:leading-8">
            {homepage.heroDescription}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={homepage.heroPrimaryCtaTarget || "#collections"}
              className="premium-button inline-flex items-center justify-center gap-2 bg-cream px-7 py-4 text-sm font-bold text-cocoa hover:bg-linen"
            >
              {homepage.heroPrimaryCtaLabel}
              <ArrowRight size={17} />
            </a>
            <a
              href={homepage.heroSecondaryCtaTarget || "#about"}
              className="premium-button inline-flex items-center justify-center border border-cream/40 bg-cream/[0.04] px-7 py-4 text-sm font-bold text-cream backdrop-blur-sm hover:border-cream/65 hover:bg-cream/10"
            >
              {homepage.heroSecondaryCtaLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function About({ homepage }) {
  return (
    <section id="about" className="section-shell bg-linen">
      <div className="fade-up mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24 lg:items-start">
        <div>
          <p className="section-kicker">{homepage.brandStoryEyebrow}</p>
          <h2 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl lg:text-[3.4rem]">
            {homepage.brandStoryTitle}
          </h2>
        </div>
        <div className="max-w-2xl space-y-7 text-[1.05rem] leading-8 text-cocoa/72 sm:text-lg sm:leading-9">
          {homepage.brandStoryParagraphs?.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph}`}
              className={index === homepage.brandStoryParagraphs.length - 1 ? "border-l-2 border-clay/60 pl-6 font-display text-3xl leading-tight tracking-[-0.02em] text-cocoa sm:text-[2rem]" : undefined}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhilosophySection({ homepage, philosophy }) {
  return (
    <section className="section-shell bg-cream">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker={homepage.philosophyEyebrow}
          title={homepage.philosophyTitle}
          description={homepage.philosophyDescription}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3 lg:mt-16">
          {philosophy.map((item) => (
            <article
              key={item.title}
              className="premium-card fade-up p-7 sm:p-8"
            >
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
  );
}

function CollectionSection({ collections }) {
  return (
    <section id="collections" className="section-shell bg-linen">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker="Collections"
          title="For every rhythm of home."
          description="From a quiet corner to the table everyone gathers around, each collection is designed for the way a space feels—and the life it welcomes."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3 lg:mt-16">
          {collections.map((collection) => (
            <article
              key={collection.name}
              className="group fade-up rounded-[1.5rem] border border-oat/55 bg-white/60 p-7 shadow-[0_20px_60px_rgba(62,44,35,0.06)] transition duration-500 hover:-translate-y-1 hover:border-clay/40 hover:bg-white/85 hover:shadow-[0_28px_70px_rgba(62,44,35,0.1)] sm:p-8"
            >
              <div className="mb-9 h-px w-16 bg-clay transition-all duration-500 group-hover:w-24" />
              <h3 className="font-display text-[1.65rem] leading-tight tracking-[-0.02em] text-cocoa">{collection.name}</h3>
              <p className="mt-4 leading-7 text-cocoa/68">{collection.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function materialKey(material) {
  const normalized = material.toLowerCase();
  return Object.keys(materialDescriptions).find((key) =>
    normalized.includes(key.toLowerCase().replace("premium ", ""))
  );
}

function ProductVisual({ product }) {
  if (product.mainImageUrl) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden bg-oat">
        <img
          src={product.mainImageUrl}
          alt={product.mainImage?.altText || product.name}
          width="900"
          height="562"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/35 via-transparent to-transparent" />
        <div className="absolute left-5 top-5 rounded-full border border-white/40 bg-cream/85 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-cocoa backdrop-blur-md">
          {product.category}
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_20%_15%,#fffaf2,#e7d6c0_42%,#bfa181)]">
      <div className="absolute inset-x-8 bottom-10 h-16 rounded-[50%] bg-cocoa/15 blur-xl" />
      <div className="absolute left-1/2 top-1/2 h-24 w-52 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/55 shadow-[inset_0_-16px_25px_rgba(62,44,35,0.12)] transition duration-700 ease-out group-hover:-translate-y-[54%] group-hover:scale-[1.04]" />
      <div className="absolute left-1/2 top-[54%] h-14 w-64 max-w-[76%] -translate-x-1/2 rounded-b-3xl rounded-t-xl bg-oat shadow-lg transition duration-700 ease-out group-hover:bg-[#dbc5aa]" />
      <div className="absolute left-[23%] top-[47%] h-16 w-8 rounded-lg bg-umber/80" />
      <div className="absolute right-[23%] top-[47%] h-16 w-8 rounded-lg bg-umber/80" />
      <div className="absolute left-5 top-5 rounded-full border border-white/40 bg-cream/80 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-cocoa backdrop-blur-md">
        {product.category}
      </div>
    </div>
  );
}

function formatPrice(price, currency = "IDR") {
  if (typeof price !== "number") return price;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

function ProductCard({ product, siteSettings }) {
  const productMessage = product.whatsAppMessage
    || siteSettings.defaultWhatsAppMessage?.replace(/collection/i, product.name)
    || `Hello Luvin Home, I would like to know more about the ${product.name}.`;
  const detailLink = createWhatsAppLink(
    productMessage,
    siteSettings.whatsAppNumber,
  );
  const isUnavailable = product.status === "soldOut" || product.stockStatus === "soldOut";
  const isComingSoon = product.status === "comingSoon";

  return (
    <article className="group fade-up flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-oat/55 bg-cream shadow-[0_20px_60px_rgba(62,44,35,0.07)] transition duration-500 hover:-translate-y-1.5 hover:border-clay/30 hover:shadow-[0_30px_80px_rgba(62,44,35,0.12)]">
      <ProductVisual product={product} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h3 className="font-display text-[1.65rem] leading-[1.15] tracking-[-0.02em] text-cocoa">{product.name}</h3>
            <p className="mt-2 text-sm text-cocoa/58">{product.dimensions}</p>
          </div>
          <div className="flex shrink-0 gap-1.5 pt-1">
            {(product.palette || []).map((color) => (
              <span
                key={color}
                className="h-4 w-4 rounded-full border border-cocoa/10"
                style={{ backgroundColor: color }}
                aria-label={color}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-5 border-t border-oat/50 pt-6 text-sm leading-6 text-cocoa/68">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
              The Story
            </h4>
            <p className="mt-2">{product.productStory || product.shortDescription || product.benefits?.[0]}</p>
          </section>
          <section>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
              Material Notes
            </h4>
            <div className="mt-2 space-y-2">
              {(product.materials || []).map((material) => {
                const key = materialKey(material);
                return (
                  <p key={material}>
                    <span className="font-semibold text-cocoa">{material}</span>
                    {key ? ` - ${materialDescriptions[key]}` : ""}
                  </p>
                );
              })}
            </div>
          </section>
          <section>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
              Made for Living
            </h4>
            <ul className="mt-2 space-y-2">
              {(product.benefits || []).slice(product.productStory || product.shortDescription ? 0 : 1).map((benefit) => (
                <li key={benefit} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
              Details
            </h4>
            {product.colors?.length > 0 && <p className="mt-2">Color: {product.colors.join(", ")}</p>}
            {product.weight && <p>Weight: {product.weight}</p>}
            {(isUnavailable || isComingSoon) && (
              <p className="mt-2 font-semibold text-clay">{isComingSoon ? "Coming soon" : "Sold out — enquire for availability"}</p>
            )}
          </section>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-oat/50 pt-6">
          <div>
            {product.compareAtPrice && <p className="text-sm text-cocoa/45 line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>}
            <p className="font-display text-2xl tracking-[-0.02em] text-cocoa">{formatPrice(product.price, product.currency)}</p>
          </div>
          <a
            href={detailLink}
            {...externalLinkProps}
            className="premium-button inline-flex items-center gap-2 bg-cocoa px-5 py-3 text-sm font-semibold text-cream hover:bg-clay"
          >
            {isComingSoon ? "Notify Me" : "Enquire"} <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

function Products({ products, siteSettings }) {
  return (
    <section id="products" className="section-shell bg-cream">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            kicker="The Luvin Edit"
            title="Objects to live with."
          />
          <p className="max-w-sm leading-7 text-cocoa/67">
            A considered selection of pieces where honest materials, quiet form, and everyday comfort meet.
          </p>
        </div>
        <div className="mt-14 grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3 lg:mt-16">
          {products.map((product) => (
            <ProductCard key={product._id || product.name} product={product} siteSettings={siteSettings} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ({ homepage, faqs }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section-shell bg-cream">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <SectionHeader
          kicker={homepage.faqEyebrow}
          title={homepage.faqTitle}
        />
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <article key={faq.question} className={`overflow-hidden rounded-[1.25rem] border transition duration-300 ${isOpen ? "border-clay/30 bg-linen shadow-[0_16px_40px_rgba(62,44,35,0.06)]" : "border-oat/60 bg-linen/55 hover:border-oat"}`}>
                <button
                  type="button"
                  className="flex min-h-16 w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-cocoa transition hover:text-clay"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  {faq.question}
                  <ChevronDown
                    className={`shrink-0 text-clay transition duration-300 ${isOpen ? "rotate-180" : ""}`}
                    size={20}
                  />
                </button>
                {isOpen && (
                  <p
                    id={`faq-answer-${index}`}
                    className="answer-reveal px-6 pb-6 leading-7 text-cocoa/68"
                  >
                    {faq.answer}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function IntelligenceComingSoon({ homepage, whatsAppLink }) {
  return (
    <section className="section-shell bg-linen">
      <div className="fade-up relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-oat/30 bg-cocoa px-6 py-14 text-cream shadow-[0_32px_90px_rgba(62,44,35,0.18)] sm:px-10 lg:px-16 lg:py-16">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-cream/10" />
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border border-cream/10" />
        <span className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-4 py-2 text-sm font-semibold">
          <Bell size={16} />
          A New Way to Explore
        </span>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="section-kicker text-oat">{homepage.intelligenceEyebrow}</p>
            <h2 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] sm:text-5xl">
              {homepage.intelligenceTitle}
            </h2>
          </div>
          <div>
            <p className="text-xl font-semibold">Consider it a quiet conversation about home.</p>
            <p className="mt-4 max-w-2xl leading-8 text-cream/78">
              {homepage.intelligenceDescription}
            </p>
            <a
              href={whatsAppLink}
              {...externalLinkProps}
              className="premium-button mt-8 inline-flex items-center gap-2 bg-cream px-7 py-4 text-sm font-bold text-cocoa hover:bg-linen"
            >
              {homepage.intelligenceCtaLabel}
              <Send size={17} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCTA({ homepage, siteSettings, whatsAppLink }) {
  return (
    <section id="contact" className="section-shell relative overflow-hidden bg-cocoa text-cream">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_50%,rgba(184,111,77,0.2),transparent_65%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-oat">
            {homepage.contactEyebrow}
          </p>
          <h2 className="mt-5 max-w-2xl font-display text-[2.6rem] leading-[1.04] tracking-[-0.03em] sm:text-5xl lg:text-[3.8rem]">
            {homepage.contactTitle}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-cream/78">
            {homepage.contactDescription}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
          <a
            href={whatsAppLink}
            {...externalLinkProps}
            className="premium-button inline-flex items-center justify-center gap-2 bg-cream px-7 py-4 text-sm font-bold text-cocoa hover:bg-linen"
          >
            <MessageCircle size={18} />
            {homepage.contactPrimaryCtaLabel}
          </a>
          <a
            href={siteSettings.instagramUrl}
            {...externalLinkProps}
            className="premium-button inline-flex items-center justify-center gap-2 border border-cream/35 px-7 py-4 text-sm font-bold text-cream hover:border-cream/60 hover:bg-cream/10"
          >
            <Instagram size={18} />
            {homepage.contactSecondaryCtaLabel}
          </a>
          <span className="inline-flex items-center justify-center rounded-full border border-cream/15 px-7 py-4 text-sm font-semibold text-cream/60">
            Online Store Coming Soon
          </span>
        </div>
      </div>
    </section>
  );
}

function FloatingWhatsApp({ whatsAppLink }) {
  return (
    <a
      href={whatsAppLink}
      {...externalLinkProps}
      aria-label="Chat with Luvin Home on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-cream/30 bg-umber text-cream shadow-[0_16px_45px_rgba(62,44,35,0.22)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-clay"
    >
      <MessageCircle size={26} />
    </a>
  );
}

function Footer({ collections, siteSettings, whatsAppLink }) {
  return (
    <footer className="bg-[#2a1d18] px-5 py-16 text-cream/68 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 border-b border-cream/10 pb-12 text-sm sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <h3 className="font-display text-3xl tracking-[-0.02em] text-cream">{siteSettings.brandName}</h3>
          <p className="mt-5 max-w-xs leading-7">{siteSettings.footerText}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-cream">Collections</h3>
          <div className="mt-5 space-y-3.5">
            {collections.map((collection) => (
              <a key={collection.name} href="#collections" className="block transition hover:text-cream">
                {collection.name}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-cream">Discover</h3>
          <div className="mt-5 space-y-3.5">
            <a href="#products" className="block transition hover:text-cream">
              The Luvin Edit
            </a>
            <a href="#about" className="block transition hover:text-cream">
              Our Story
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-cream">Stay Close</h3>
          <div className="mt-5 space-y-3.5">
            <a href={whatsAppLink} {...externalLinkProps} className="block transition hover:text-cream">
              WhatsApp
            </a>
            <a href={siteSettings.instagramUrl} {...externalLinkProps} className="block transition hover:text-cream">
              {siteSettings.instagramUsername}
            </a>
            <p>Online store coming soon</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const content = useCmsContent();
  const { homepage, siteSettings, collections, products, faqs, philosophy } = content;
  const whatsAppLink = createWhatsAppLink(siteSettings.defaultWhatsAppMessage, siteSettings.whatsAppNumber);

  useScrollReveal(content);
  useHomepageSeo(siteSettings);

  return (
    <>
      <Navbar siteSettings={siteSettings} whatsAppLink={whatsAppLink} />
      <main>
        <Hero homepage={homepage} />
        <About homepage={homepage} />
        <PhilosophySection homepage={homepage} philosophy={philosophy} />
        <CollectionSection collections={collections} />
        <Products products={products} siteSettings={siteSettings} />
        <FAQ homepage={homepage} faqs={faqs} />
        <IntelligenceComingSoon homepage={homepage} whatsAppLink={whatsAppLink} />
        <ContactCTA homepage={homepage} siteSettings={siteSettings} whatsAppLink={whatsAppLink} />
      </main>
      <Footer collections={collections} siteSettings={siteSettings} whatsAppLink={whatsAppLink} />
      <FloatingWhatsApp whatsAppLink={whatsAppLink} />
    </>
  );
}
