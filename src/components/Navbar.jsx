import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Heart, Menu, MessageCircle, Scale, X } from "lucide-react";
import { serviceLinks } from "../data/services";
import { slugify } from "../lib/slug";
import { useSavedProducts } from "../context/SavedProductsContext";

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

const navLinkClass = ({ isActive }) =>
  `transition hover:text-clay ${isActive ? "text-clay" : "text-cocoa/70"}`;

function NavDropdown({ label, items }) {
  return (
    <div className="group relative">
      <button type="button" className="flex items-center gap-1 text-cocoa/70 transition hover:text-clay">
        {label}
        <ChevronDown size={14} className="transition duration-300 group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-0 top-full z-10 mt-3 w-60 rounded-2xl border border-oat/60 bg-cream p-2 opacity-0 shadow-[0_20px_50px_rgba(62,44,35,0.14)] transition duration-200 group-hover:visible group-hover:opacity-100">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block rounded-xl px-3.5 py-2.5 text-sm text-cocoa/75 transition hover:bg-linen hover:text-clay"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavIconLink({ to, label, count, children }) {
  return (
    <Link
      to={to}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative inline-grid h-11 w-11 place-items-center rounded-full border border-cocoa/20 text-cocoa transition duration-300 hover:border-cocoa/35 hover:bg-cocoa/5"
    >
      {children}
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[0.65rem] font-bold text-cream">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar({ siteSettings, collections, whatsAppLink }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { wishlist, compareIds } = useSavedProducts();

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

  const productItems = [
    { to: "/produk", label: "Semua Produk" },
    ...collections.map((collection) => ({
      to: `/produk?kategori=${collection.slug || slugify(collection.name)}`,
      label: collection.name,
    })),
  ];

  const serviceItems = [
    { to: "/layanan", label: "Semua Layanan" },
    ...serviceLinks.map((service) => ({ to: `/layanan/${service.slug}`, label: service.name })),
  ];

  const mobileLinks = [
    ["Produk", "/produk"],
    ["Layanan", "/layanan"],
    ["Proyek", "/proyek"],
    ["Blog", "/blog"],
    ["Tentang Kami", "/tentang-kami"],
    ["Kontak", "/kontak"],
    [`Wishlist${wishlist.length ? ` (${wishlist.length})` : ""}`, "/wishlist"],
    [`Bandingkan${compareIds.length ? ` (${compareIds.length})` : ""}`, "/compare"],
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-500 ${isScrolled ? "border-cocoa/10 bg-cream/[0.94] shadow-[0_12px_40px_rgba(62,44,35,0.07)]" : "border-white/35 bg-cream/[0.88]"}`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 sm:px-8 ${isScrolled ? "py-3" : "py-4"}`}
      >
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Luvin Home — beranda" onClick={closeMenu}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cocoa text-sm font-semibold text-cream">
            LH
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl text-cocoa">{siteSettings.brandName}</span>
            <span className="hidden text-xs uppercase tracking-[0.24em] text-umber/70 sm:block">
              {siteSettings.brandPromise}
            </span>
          </span>
        </Link>
        <div className="hidden items-center gap-8 text-[0.82rem] font-semibold tracking-[0.02em] lg:flex">
          <NavDropdown label="Produk" items={productItems} />
          <NavDropdown label="Layanan" items={serviceItems} />
          <NavLink to="/proyek" className={navLinkClass}>
            Proyek
          </NavLink>
          <NavLink to="/blog" className={navLinkClass}>
            Blog
          </NavLink>
          <NavLink to="/tentang-kami" className={navLinkClass}>
            Tentang Kami
          </NavLink>
          <NavLink to="/kontak" className={navLinkClass}>
            Kontak
          </NavLink>
        </div>
        <div className="flex items-center gap-2">
          <NavIconLink to="/wishlist" label="Wishlist" count={wishlist.length}>
            <Heart size={19} aria-hidden="true" />
          </NavIconLink>
          <NavIconLink to="/compare" label="Bandingkan produk" count={compareIds.length}>
            <Scale size={19} aria-hidden="true" />
          </NavIconLink>
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
        {mobileLinks.map(([label, to]) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeMenu}
            className={({ isActive }) =>
              `rounded-xl px-3 py-3.5 text-base font-medium transition duration-300 hover:bg-linen hover:text-clay ${isActive ? "text-clay" : "text-cocoa/80"}`
            }
          >
            {label}
          </NavLink>
        ))}
        <a
          href={whatsAppLink}
          {...externalLinkProps}
          onClick={closeMenu}
          className="premium-button mt-3 inline-flex items-center justify-center gap-2 bg-cocoa px-5 py-3.5 text-sm font-semibold text-cream sm:hidden"
        >
          <MessageCircle size={17} aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </header>
  );
}
