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
import {
  collections,
  faqs,
  galleryImages,
  materialDescriptions,
  philosophy,
  products,
  testimonials,
  whyLuvin,
} from "./data/products";
import { createWhatsAppLink, INSTAGRAM_LINK } from "./config/contact";

const whatsAppLink = createWhatsAppLink();
const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

function SectionHeader({ kicker, title, description, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h2 className="mt-3 font-display text-4xl leading-tight text-cocoa sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg leading-8 text-cocoa/68">{description}</p>
      )}
    </div>
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/35 bg-cream/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#home" className="flex min-w-0 items-center gap-3" aria-label="Luvin Home — back to top" onClick={closeMenu}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cocoa text-sm font-semibold text-cream">
            LH
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl text-cocoa">Luvin Home</span>
            <span className="hidden text-xs uppercase tracking-[0.24em] text-umber/70 sm:block">
              Stories of Living
            </span>
          </span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium text-cocoa/75 lg:flex">
          <a className="transition hover:text-clay" href="#about">
            Our Story
          </a>
          <a className="transition hover:text-clay" href="#collections">
            Collections
          </a>
          <a className="transition hover:text-clay" href="#products">
            The Edit
          </a>
          <a className="transition hover:text-clay" href="#spaces">
            At Home
          </a>
          <a className="transition hover:text-clay" href="#contact">
            Visit Us
          </a>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsAppLink}
            {...externalLinkProps}
            className="hidden items-center gap-2 rounded-full bg-cocoa px-4 py-2.5 text-sm font-semibold text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-umber sm:inline-flex"
          >
            <MessageCircle size={17} aria-hidden="true" />
            WhatsApp
          </a>
          <button
            type="button"
            className="inline-grid h-11 w-11 place-items-center rounded-full border border-cocoa/20 text-cocoa transition hover:bg-cocoa/5 lg:hidden"
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
        className={`${isMenuOpen ? "grid" : "hidden"} border-t border-cocoa/10 bg-cream px-5 pb-5 pt-3 shadow-soft lg:hidden`}
      >
        {[
          ["Our Story", "#about"],
          ["Collections", "#collections"],
          ["The Edit", "#products"],
          ["At Home", "#spaces"],
          ["Visit Us", "#contact"],
        ].map(([label, href]) => (
          <a key={href} href={href} onClick={closeMenu} className="rounded-md px-3 py-3 text-base font-medium text-cocoa/80 transition hover:bg-linen hover:text-clay">
            {label}
          </a>
        ))}
        <a href={whatsAppLink} {...externalLinkProps} onClick={closeMenu} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-cocoa px-5 py-3 text-sm font-semibold text-cream sm:hidden">
          <MessageCircle size={17} aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative min-h-[94vh] overflow-hidden bg-cocoa text-cream">
      <img
        src="/hero-living-room.jpg"
        alt="Warm modern living room with Luvin Home furniture"
        width="1694"
        height="928"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(42,29,22,0.88),rgba(62,44,35,0.58),rgba(62,44,35,0.12))]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-cocoa/85 to-transparent" />
      <div className="relative mx-auto flex min-h-[94vh] max-w-7xl items-end px-5 pb-16 pt-32 sm:px-8 lg:pb-20">
        <div className="fade-up max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream/35 bg-cream/10 px-4 py-2 text-sm font-medium backdrop-blur">
            <Sparkles size={16} />
            Thoughtful furniture for the life within
          </p>
          <h1 className="max-w-2xl font-display text-4xl leading-[1.04] text-cream min-[390px]:text-5xl sm:text-6xl lg:text-7xl">
            Every Space
            <span className="block">Tells a Story.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-cream/86">
            We create timeless, comfortable pieces for the rooms where life unfolds—
            and the homes people love coming back to.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#collections"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-bold text-cocoa transition hover:-translate-y-0.5 hover:bg-linen"
            >
              Explore the Collection
              <ArrowRight size={17} />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-cream/45 px-6 py-3.5 text-sm font-bold text-cream transition hover:-translate-y-0.5 hover:bg-cream/12"
            >
              Discover Our Story
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="bg-linen px-5 py-20 sm:px-8 lg:py-28">
      <div className="fade-up mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="section-kicker">Our Story</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-cocoa sm:text-5xl">
            The beauty of coming home.
          </h2>
        </div>
        <div className="space-y-6 text-lg leading-9 text-cocoa/75">
          <p>A home is shaped slowly—in morning light, familiar rituals, and conversations that linger.</p>
          <p>We design furniture to belong to these moments. Each piece balances quiet beauty with genuine comfort, made to feel natural from the very first day.</p>
          <p>Because a room should hold more than furniture.</p>
          <p className="font-display text-3xl leading-tight text-cocoa">
            It should hold the story of your life.
          </p>
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker="Our Philosophy"
          title="A quieter way of living."
          description="We believe good design feels instinctive: beautiful without being precious, comfortable without compromise, and made to remain."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {philosophy.map((item) => (
            <article
              key={item.title}
              className="fade-up rounded-lg border border-oat/60 bg-linen/70 p-7 shadow-[0_18px_50px_rgba(62,44,35,0.07)] transition hover:-translate-y-1 hover:bg-white"
            >
              <HeartHandshake className="text-clay" size={25} />
              <h3 className="mt-7 font-display text-2xl text-cocoa">{item.title}</h3>
              <p className="mt-4 leading-7 text-cocoa/68">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionSection() {
  return (
    <section id="collections" className="bg-linen px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker="Collections"
          title="For every rhythm of home."
          description="From a quiet corner to the table everyone gathers around, each collection is designed for the way a space feels—and the life it welcomes."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.name}
              className="fade-up rounded-lg border border-oat/60 bg-white/65 p-7 shadow-[0_18px_50px_rgba(62,44,35,0.07)] transition hover:-translate-y-1 hover:border-clay/45"
            >
              <div className="mb-8 h-1.5 w-16 rounded-full bg-clay" />
              <h3 className="font-display text-2xl text-cocoa">{collection.name}</h3>
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
  return (
    <div className="relative h-56 overflow-hidden bg-[radial-gradient(circle_at_20%_15%,#fffaf2,#e7d6c0_42%,#bfa181)]">
      <div className="absolute inset-x-8 bottom-10 h-16 rounded-[50%] bg-cocoa/15 blur-xl" />
      <div className="absolute left-1/2 top-1/2 h-24 w-52 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/55 shadow-[inset_0_-16px_25px_rgba(62,44,35,0.12)] transition duration-500 group-hover:scale-105" />
      <div className="absolute left-1/2 top-[54%] h-14 w-64 -translate-x-1/2 rounded-b-3xl rounded-t-lg bg-oat shadow-lg transition duration-500 group-hover:bg-[#dbc5aa]" />
      <div className="absolute left-[23%] top-[47%] h-16 w-8 rounded-lg bg-umber/80" />
      <div className="absolute right-[23%] top-[47%] h-16 w-8 rounded-lg bg-umber/80" />
      <div className="absolute left-5 top-5 rounded-full bg-cream/86 px-3 py-1 text-xs font-semibold text-cocoa">
        {product.category}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const detailLink = createWhatsAppLink(
    `Hello Luvin Home, I would like to know more about the ${product.name}.`,
  );

  return (
    <article className="group fade-up flex h-full flex-col overflow-hidden rounded-lg border border-oat/60 bg-cream shadow-[0_18px_55px_rgba(62,44,35,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-soft">
      <ProductVisual product={product} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h3 className="font-display text-2xl leading-tight text-cocoa">{product.name}</h3>
            <p className="mt-2 text-sm text-cocoa/58">{product.dimensions}</p>
          </div>
          <div className="flex shrink-0 gap-1.5 pt-1">
            {product.palette.map((color) => (
              <span
                key={color}
                className="h-4 w-4 rounded-full border border-cocoa/10"
                style={{ backgroundColor: color }}
                aria-label={color}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-5 text-sm leading-6 text-cocoa/70">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
              The Story
            </h4>
            <p className="mt-2">{product.benefits[0]}</p>
          </section>
          <section>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
              Material Notes
            </h4>
            <div className="mt-2 space-y-2">
              {product.materials.map((material) => {
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
              {product.benefits.slice(1).map((benefit) => (
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
            <p className="mt-2">Color: {product.colors.join(", ")}</p>
            {product.weight && <p>Weight: {product.weight}</p>}
          </section>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <p className="font-display text-2xl text-cocoa">{product.price}</p>
          <a
            href={detailLink}
            {...externalLinkProps}
            className="inline-flex items-center gap-2 rounded-full bg-cocoa px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-clay"
          >
            Enquire
          </a>
        </div>
      </div>
    </article>
  );
}

function Products() {
  return (
    <section id="products" className="bg-cream px-5 py-20 sm:px-8 lg:py-28">
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
        <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function InspiredSpaces() {
  return (
    <section id="spaces" className="bg-linen px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker="At Home"
          title="Rooms with a point of view."
          description="A glimpse into spaces shaped by texture, light, and the people who make them their own."
          align="center"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((src, index) => (
            <figure
              key={src}
              className="group fade-up relative aspect-[4/3] overflow-hidden rounded-lg bg-oat shadow-[0_18px_50px_rgba(62,44,35,0.08)]"
            >
              <img
                src={src}
                alt={`Luvin inspired space ${index + 1}`}
                width="1200"
                height="900"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.style.opacity = "0";
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,249,240,0.15),rgba(62,44,35,0.24))]" />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-cream/86 px-3 py-1 text-xs font-semibold text-cocoa">
                Story {String(index + 1).padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyLuvin() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker="Our Approach"
          title="Considered in every sense."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {whyLuvin.map((reason) => (
            <article
              key={reason.title}
              className="fade-up rounded-lg border border-oat/60 bg-linen/70 p-5 transition hover:-translate-y-1 hover:bg-white"
            >
              <Sparkles className="text-clay" size={21} />
              <h3 className="mt-5 text-lg font-semibold leading-snug text-cocoa">
                {reason.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-cocoa/68">{reason.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-linen px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader kicker="Notes from Home" title="In their own words." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((quote) => (
            <blockquote
              key={quote}
              className="fade-up rounded-lg border border-oat/60 bg-white/70 p-7 text-lg leading-8 text-cocoa/76 shadow-[0_18px_50px_rgba(62,44,35,0.07)] transition hover:-translate-y-1"
            >
              "{quote}"
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-cream px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <SectionHeader
          kicker="FAQ"
          title="A few things to know."
        />
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <article key={faq.question} className="rounded-lg border border-oat/70 bg-linen/65">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-cocoa"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  {faq.question}
                  <ChevronDown
                    className={`shrink-0 text-clay transition ${isOpen ? "rotate-180" : ""}`}
                    size={20}
                  />
                </button>
                {isOpen && (
                  <p
                    id={`faq-answer-${index}`}
                    className="px-5 pb-5 leading-7 text-cocoa/68"
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

function IntelligenceComingSoon() {
  return (
    <section className="bg-linen px-5 py-20 sm:px-8 lg:py-24">
      <div className="fade-up mx-auto max-w-7xl rounded-lg border border-oat/70 bg-cocoa px-6 py-12 text-cream shadow-soft sm:px-10 lg:px-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-4 py-2 text-sm font-semibold">
          <Bell size={16} />
          A New Way to Explore
        </span>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="section-kicker text-oat">Coming Soon</p>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              A thoughtful eye for your space.
            </h2>
          </div>
          <div>
            <p className="text-xl font-semibold">Consider it a quiet conversation about home.</p>
            <p className="mt-4 max-w-2xl leading-8 text-cream/78">
              Luvin Intelligence will help you find pieces that feel true to your room,
              your rituals, and the way you live—guided by proportion, palette, and what
              matters most to you.
            </p>
            <a
              href={whatsAppLink}
              {...externalLinkProps}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-bold text-cocoa transition hover:-translate-y-0.5 hover:bg-linen"
            >
              Keep Me Informed
              <Send size={17} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCTA() {
  return (
    <section id="contact" className="bg-cocoa px-5 py-20 text-cream sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-oat">
            A Personal Invitation
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Let the room
            <span className="block">become yours.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-cream/78">
            Tell us how you live and what you hope your space might become. We’ll help you find pieces that feel naturally at home.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
          <a
            href={whatsAppLink}
            {...externalLinkProps}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-bold text-cocoa transition hover:-translate-y-0.5 hover:bg-linen"
          >
            <MessageCircle size={18} />
            Begin a Conversation
          </a>
          <a
            href={INSTAGRAM_LINK}
            {...externalLinkProps}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/35 px-6 py-3.5 text-sm font-bold text-cream transition hover:-translate-y-0.5 hover:bg-cream/10"
          >
            <Instagram size={18} />
            Instagram
          </a>
          <span className="inline-flex items-center justify-center rounded-full border border-cream/20 px-6 py-3.5 text-sm font-bold text-cream/65">
            Online Store Coming Soon
          </span>
        </div>
      </div>
    </section>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href={whatsAppLink}
      {...externalLinkProps}
      aria-label="Chat with Luvin Home on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-cream/30 bg-umber text-cream shadow-soft transition hover:-translate-y-1 hover:scale-105 hover:bg-clay"
    >
      <MessageCircle size={26} />
    </a>
  );
}

function Footer() {
  return (
    <footer className="bg-[#2f211b] px-5 py-12 text-cream/70 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl text-cream">Luvin Home</h3>
          <p className="mt-4 leading-7">Creating homes people love coming back to.</p>
        </div>
        <div>
          <h3 className="font-semibold text-cream">Collections</h3>
          <div className="mt-4 space-y-3">
            {collections.map((collection) => (
              <a key={collection.name} href="#collections" className="block transition hover:text-cream">
                {collection.name}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-cream">Discover</h3>
          <div className="mt-4 space-y-3">
            <a href="#products" className="block transition hover:text-cream">
              The Luvin Edit
            </a>
            <a href="#spaces" className="block transition hover:text-cream">
              Stories at Home
            </a>
            <a href="#about" className="block transition hover:text-cream">
              Our Story
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-cream">Stay Close</h3>
          <div className="mt-4 space-y-3">
            <a href={whatsAppLink} {...externalLinkProps} className="block transition hover:text-cream">
              WhatsApp
            </a>
            <a href={INSTAGRAM_LINK} {...externalLinkProps} className="block transition hover:text-cream">
              @luvinhome.id
            </a>
            <p>Online store coming soon</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Philosophy />
        <CollectionSection />
        <Products />
        <InspiredSpaces />
        <WhyLuvin />
        <Testimonials />
        <FAQ />
        <IntelligenceComingSoon />
        <ContactCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
