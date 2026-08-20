import { Link } from "react-router-dom";
import { Instagram, MessageCircle } from "lucide-react";

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

export default function Footer({ siteSettings, whatsAppLink }) {
  return (
    <footer className="bg-[#2a1d18] px-5 py-16 text-cream/68 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-display text-3xl tracking-[-0.02em] text-cream">{siteSettings.brandName}</h3>
            <p className="mt-4 max-w-xs leading-7">{siteSettings.footerText}</p>
          </div>
          <nav className="flex flex-col gap-3.5 text-sm sm:items-end">
            <Link to="/produk" className="transition hover:text-cream">
              Produk
            </Link>
            <Link to="/layanan" className="transition hover:text-cream">
              Layanan
            </Link>
            <Link to="/tentang-kami" className="transition hover:text-cream">
              Tentang Kami
            </Link>
            <Link to="/kontak" className="transition hover:text-cream">
              Kontak
            </Link>
          </nav>
        </div>

        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <p className="text-sm">Punya pertanyaan? Hubungi kami.</p>
          <div className="flex items-center gap-3">
            <a
              href={whatsAppLink}
              {...externalLinkProps}
              aria-label="WhatsApp"
              className="inline-grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream/68 transition hover:border-cream/50 hover:text-cream"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href={siteSettings.instagramUrl}
              {...externalLinkProps}
              aria-label="Instagram"
              className="inline-grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream/68 transition hover:border-cream/50 hover:text-cream"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/10 pt-6 text-center text-xs text-cream/40">
          © {new Date().getFullYear()} {siteSettings.brandName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
