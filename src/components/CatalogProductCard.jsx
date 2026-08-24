import { Link } from "react-router-dom";
import { ArrowRight, Check, Heart, Scale } from "lucide-react";
import ProductVisualPlaceholder from "./ProductVisualPlaceholder";
import { formatPrice } from "../lib/format";
import { productSlug } from "../lib/slug";
import { useSavedProducts } from "../context/SavedProductsContext";

export default function CatalogProductCard({ product }) {
  const isUnavailable = product.status === "soldOut" || product.stockStatus === "soldOut";
  const isComingSoon = product.status === "comingSoon";
  const slug = productSlug(product);
  const { isWishlisted, toggleWishlist, isCompared, toggleCompare, compareFull } = useSavedProducts();
  const wishlisted = isWishlisted(slug);
  const compared = isCompared(slug);
  const compareDisabled = !compared && compareFull;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-oat/[0.55] bg-cream shadow-[0_20px_60px_rgba(62,44,35,0.07)] transition duration-500 hover:-translate-y-1.5 hover:border-clay/30 hover:shadow-[0_30px_80px_rgba(62,44,35,0.12)]">
      <div className="relative">
        {product.mainImageUrl ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-oat">
            <img
              src={product.mainImageUrl}
              alt={product.mainImage?.altText || product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute left-5 top-5 rounded-full border border-white/40 bg-cream/[0.85] px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-cocoa backdrop-blur-md">
              {product.category}
            </div>
          </div>
        ) : (
          <ProductVisualPlaceholder category={product.category} />
        )}
        <button
          type="button"
          onClick={() => toggleWishlist(slug)}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wishlisted}
          className={`absolute right-4 top-4 inline-grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition ${wishlisted ? "bg-clay text-cream" : "bg-cream/[0.85] text-cocoa hover:bg-cream"}`}
        >
          <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl leading-tight tracking-[-0.02em] text-cocoa">{product.name}</h3>
        <p className="mt-1.5 text-sm text-cocoa/[0.58]">{product.dimensions}</p>
        {(isUnavailable || isComingSoon) && (
          <p className="mt-2 text-xs font-semibold text-clay">{isComingSoon ? "Coming soon" : "Sold out"}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <p className="font-display text-xl tracking-[-0.02em] text-cocoa">{formatPrice(product.price, product.currency)}</p>
          <Link
            to={`/products/${slug}`}
            className="premium-button inline-flex items-center gap-1.5 bg-cocoa px-4 py-2.5 text-xs font-semibold text-cream hover:bg-clay"
          >
            Detail <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          onClick={() => toggleCompare(slug)}
          disabled={compareDisabled}
          className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
            compared
              ? "border-clay bg-clay/10 text-clay"
              : compareDisabled
                ? "cursor-not-allowed border-oat/50 text-cocoa/30"
                : "border-oat/60 text-cocoa/[0.65] hover:border-clay/40 hover:text-clay"
          }`}
        >
          {compared ? <Check size={14} /> : <Scale size={14} />}
          {compared ? "Added to Compare" : "Compare"}
        </button>
      </div>
    </article>
  );
}
