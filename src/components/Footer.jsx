import { getSocialLinks } from "../config/socialLinks";

export default function Footer({ siteSettings, whatsAppLink }) {
  const socialLinks = getSocialLinks({ whatsAppLink, instagramUrl: siteSettings.instagramUrl });

  return (
    <footer className="text-cream/[0.68] bg-[#2a1d18] px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-5 text-center">
          <img src="/luvin-logo-mark.svg" alt="" className="h-12 w-auto" />
          <h3 className="font-display text-3xl tracking-[-0.02em] text-cream">{siteSettings.brandName}</h3>
          <p className="text-sm">Have a question? Get in touch.</p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ id, label, href, Icon }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream/[0.68] transition hover:border-cream/50 hover:text-cream"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-cream/10 pt-2.5 text-center text-xs text-cream/40">
          © {new Date().getFullYear()} {siteSettings.brandName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
