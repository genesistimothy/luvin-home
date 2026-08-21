import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import ConsultationForm from "../components/form/ConsultationForm";
import { useSanityQuery } from "../hooks/useSanityQuery";
import { serviceBySlugQuery } from "../lib/queries";
import { mergeServiceContent } from "../data/services";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { siteSettings } = /** @type {any} */ (useOutletContext());
  const { data } = useSanityQuery(serviceBySlugQuery, { slug });

  const service = useMemo(() => {
    const merged = mergeServiceContent(data ? [data] : []);
    return merged.find((item) => item.slug === slug);
  }, [data, slug]);

  if (!service) {
    return (
      <section className="section-shell flex min-h-[60vh] items-center bg-cream pt-32">
        <div className="mx-auto max-w-xl text-center">
          <p className="section-kicker">404</p>
          <h1 className="mt-4 font-display text-3xl text-cocoa sm:text-4xl">Service not found.</h1>
          <Link
            to="/layanan"
            className="premium-button mt-8 inline-flex items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-umber"
          >
            Back to Services <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell bg-cream pt-32">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Services", to: "/layanan" }, { label: service.name }]} />

        <div className="mt-6 max-w-2xl">
          <p className="section-kicker">Services</p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-6 leading-8 text-cocoa/[0.68]">{service.summary}</p>
        </div>

        {service.heroImage?.image && (
          <div className="mt-10 aspect-[21/9] overflow-hidden rounded-[1.5rem] bg-oat">
            <img
              src={service.heroImage.image.asset?.url}
              alt={service.heroImage.altText || service.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {service.processSteps?.length > 0 && (
          <div className="mt-14">
            <p className="section-kicker">Our Process</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {service.processSteps.map((step, index) => (
                <div key={step.title} className="premium-card p-6">
                  <span className="font-display text-3xl text-clay/60">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 font-display text-lg tracking-[-0.01em] text-cocoa">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-cocoa/[0.68]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14">
          <p className="section-kicker">Start a Consultation</p>
          <h2 className="mt-3 font-display text-2xl tracking-[-0.02em] text-cocoa">Tell Us About Your Space</h2>
          <div className="mt-6 max-w-2xl">
            <ConsultationForm
              serviceName={service.name}
              serviceSlug={service.slug}
              whatsAppNumber={siteSettings.whatsAppNumber}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
