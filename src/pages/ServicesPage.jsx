import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { useSanityQuery } from "../hooks/useSanityQuery";
import { servicesQuery } from "../lib/queries";
import { mergeServiceContent } from "../data/services";

export default function ServicesPage() {
  const { data } = useSanityQuery(servicesQuery);
  const services = mergeServiceContent(data);

  return (
    <section className="section-shell bg-cream pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Services" }]} />
        <div className="mt-6 max-w-2xl">
          <p className="section-kicker">Services</p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
            Our Services
          </h1>
          <p className="mt-6 leading-8 text-cocoa/[0.68]">
            From design consultation to full-scale project execution, our team walks alongside you through
            every stage of your space&apos;s journey.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className="group flex flex-col justify-between rounded-[1.5rem] border border-oat/[0.55] bg-linen/60 p-8 transition-[transform,border-color,background-color] duration-200 ease-[var(--ease-premium)] motion-safe:hover:-translate-y-1 hover:border-clay/40 hover:bg-white/[0.85]"
            >
              <div>
                <h2 className="font-display text-2xl tracking-[-0.02em] text-cocoa">{service.name}</h2>
                <p className="mt-3 leading-7 text-cocoa/[0.68]">{service.summary}</p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clay-strong">
                Learn More
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
