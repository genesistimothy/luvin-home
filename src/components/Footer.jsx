import { Link } from "react-router-dom";
import { slugify } from "../lib/slug";

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

export default function Footer({ collections, siteSettings, whatsAppLink }) {
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
              <Link
                key={collection.name}
                to={`/produk?kategori=${collection.slug || slugify(collection.name)}`}
                className="block transition hover:text-cream"
              >
                {collection.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-cream">Discover</h3>
          <div className="mt-5 space-y-3.5">
            <Link to="/produk" className="block transition hover:text-cream">
              The Luvin Edit
            </Link>
            <Link to="/tentang-kami" className="block transition hover:text-cream">
              Our Story
            </Link>
            <Link to="/proyek" className="block transition hover:text-cream">
              Proyek
            </Link>
            <Link to="/blog" className="block transition hover:text-cream">
              Blog
            </Link>
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
            <Link to="/kontak" className="block transition hover:text-cream">
              Kontak
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
