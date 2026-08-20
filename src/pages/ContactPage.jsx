import { useOutletContext } from "react-router-dom";
import { Clock, Mail, MapPin, MessageCircle, Truck } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import ContactForm from "../components/form/ContactForm";
import { createWhatsAppLink } from "../config/contact";

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 inline-grid h-9 w-9 shrink-0 place-items-center rounded-full bg-clay/10 text-clay">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-clay">{label}</p>
        <p className="mt-1 leading-6 text-cocoa/75">{value}</p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { siteSettings, faqs } = /** @type {any} */ (useOutletContext());
  const whatsAppLink = createWhatsAppLink(siteSettings.defaultWhatsAppMessage, siteSettings.whatsAppNumber);
  const mapQuery = encodeURIComponent(siteSettings.businessAddress || siteSettings.brandName || "Luvin Home");

  return (
    <section className="section-shell bg-cream pt-32">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Kontak" }]} />
        <div className="mt-6 max-w-2xl">
          <p className="section-kicker">Kontak</p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
            Mari Berbincang Tentang Ruang Anda
          </h1>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="space-y-8">
            <div className="space-y-6 rounded-[1.5rem] border border-oat/55 bg-linen/50 p-7">
              <InfoRow icon={MapPin} label="Alamat" value={siteSettings.businessAddress} />
              <InfoRow icon={Clock} label="Jam Operasional" value={siteSettings.operatingHours} />
              <InfoRow icon={Truck} label="Area Pengiriman" value={siteSettings.deliveryArea} />
              <InfoRow icon={Mail} label="Email" value={siteSettings.email} />
            </div>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-button inline-flex items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-clay"
            >
              <MessageCircle size={18} /> Chat via WhatsApp
            </a>

            {siteSettings.businessAddress && (
              <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-oat/55">
                <iframe
                  title="Lokasi Luvin Home"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          <div>
            <ContactForm />
          </div>
        </div>

        {faqs?.length > 0 && (
          <div className="mt-16 border-t border-oat/50 pt-10">
            <p className="section-kicker">Pertanyaan Umum</p>
            <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <p className="font-semibold text-cocoa">{faq.question}</p>
                  <p className="mt-1.5 text-sm leading-6 text-cocoa/62">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
