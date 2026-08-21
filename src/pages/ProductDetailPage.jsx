import { useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ArrowRight, Check, Heart, MessageCircle, Scale } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import ProductVisualPlaceholder from "../components/ProductVisualPlaceholder";
import { createWhatsAppLink } from "../config/contact";
import { formatPrice } from "../lib/format";
import { productSlug } from "../lib/slug";
import { useSavedProducts } from "../context/SavedProductsContext";

function buildSpecs(product) {
  if (product.specifications?.length) return product.specifications;
  const specs = [];
  if (product.dimensions) specs.push({ label: "Dimensions", value: product.dimensions });
  if (product.weight) specs.push({ label: "Weight", value: product.weight });
  if (product.materials?.length) specs.push({ label: "Material", value: product.materials.join(", ") });
  if (product.colors?.length) specs.push({ label: "Color Options", value: product.colors.join(", ") });
  if (product.leadTime) specs.push({ label: "Production Estimate", value: product.leadTime });
  if (product.sku) specs.push({ label: "SKU", value: product.sku });
  return specs;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { products, siteSettings } = /** @type {any} */ (useOutletContext());
  const [activeImage, setActiveImage] = useState(0);
  const { isWishlisted, toggleWishlist, isCompared, toggleCompare, compareFull } = useSavedProducts();

  const product = useMemo(() => products.find((item) => productSlug(item) === slug), [products, slug]);

  if (!product) {
    return (
      <section className="section-shell flex min-h-[60vh] items-center bg-cream pt-32">
        <div className="mx-auto max-w-xl text-center">
          <p className="section-kicker">404</p>
          <h1 className="mt-4 font-display text-3xl text-cocoa sm:text-4xl">Product not found.</h1>
          <p className="mt-4 leading-7 text-cocoa/[0.68]">The product you&apos;re looking for may no longer be available.</p>
          <Link
            to="/produk"
            className="premium-button mt-8 inline-flex items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-umber"
          >
            Back to Catalog <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    );
  }

  const images = [
    ...(product.mainImageUrl ? [{ url: product.mainImageUrl, altText: product.mainImage?.altText || product.name }] : []),
    ...(product.galleryImageUrls || []),
  ];

  const isUnavailable = product.status === "soldOut" || product.stockStatus === "soldOut";
  const isComingSoon = product.status === "comingSoon";
  const message =
    product.whatsAppMessage
    || siteSettings.defaultWhatsAppMessage?.replace(/collection/i, product.name)
    || `Hello Luvin Home, I would like to know more about the ${product.name}.`;
  const whatsAppLink = createWhatsAppLink(message, siteSettings.whatsAppNumber);
  const specs = buildSpecs(product);
  const wishlisted = isWishlisted(slug);
  const compared = isCompared(slug);
  const compareDisabled = !compared && compareFull;

  return (
    <section className="section-shell bg-cream pt-32">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Products", to: "/produk" },
            ...(product.collection ? [{ label: product.collection.name, to: `/produk?kategori=${product.collection.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            {images.length > 0 ? (
              <>
                <div className="aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-oat">
                  <img
                    src={images[activeImage]?.url}
                    alt={images[activeImage]?.altText || product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {images.map((image, index) => (
                      <button
                        key={image.url}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={`View image ${index + 1} of ${images.length}`}
                        aria-current={index === activeImage}
                        className={`h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${index === activeImage ? "border-clay" : "border-transparent opacity-70 hover:opacity-100"}`}
                      >
                        <img src={image.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[1.5rem] overflow-hidden">
                <ProductVisualPlaceholder category={product.category} />
              </div>
            )}
          </div>

          <div>
            <p className="section-kicker">{product.category}</p>
            <h1 className="mt-3 font-display text-[2.1rem] leading-[1.1] tracking-[-0.02em] text-cocoa sm:text-[2.6rem]">
              {product.name}
            </h1>

            {(isUnavailable || isComingSoon) && (
              <p className="mt-3 inline-block rounded-full bg-clay/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-clay">
                {isComingSoon ? "Coming soon" : "Sold out — enquire for availability"}
              </p>
            )}

            {(product.shortDescription || product.productStory) && (
              <p className="mt-6 max-w-xl leading-8 text-cocoa/[0.72]">{product.productStory || product.shortDescription}</p>
            )}

            <div className="mt-8 flex items-baseline gap-3">
              {product.compareAtPrice && (
                <p className="text-lg text-cocoa/40 line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
              )}
              <p className="font-display text-3xl tracking-[-0.02em] text-cocoa">{formatPrice(product.price, product.currency)}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-button inline-flex items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-clay"
              >
                <MessageCircle size={18} />
                {isComingSoon ? "Notify Me via WhatsApp" : "Consult via WhatsApp"}
              </a>
              <button
                type="button"
                onClick={() => toggleWishlist(slug)}
                aria-pressed={wishlisted}
                className={`premium-button inline-flex items-center justify-center gap-2 border px-6 py-4 text-sm font-bold transition ${wishlisted ? "border-clay bg-clay/10 text-clay" : "border-cocoa/25 text-cocoa hover:border-clay/40 hover:text-clay"}`}
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                {wishlisted ? "Saved" : "Wishlist"}
              </button>
              <button
                type="button"
                onClick={() => toggleCompare(slug)}
                disabled={compareDisabled}
                className={`premium-button inline-flex items-center justify-center gap-2 border px-6 py-4 text-sm font-bold transition ${
                  compared
                    ? "border-clay bg-clay/10 text-clay"
                    : compareDisabled
                      ? "cursor-not-allowed border-cocoa/10 text-cocoa/30"
                      : "border-cocoa/25 text-cocoa hover:border-clay/40 hover:text-clay"
                }`}
              >
                {compared ? <Check size={18} /> : <Scale size={18} />}
                {compared ? "Added" : "Compare"}
              </button>
            </div>

            {specs.length > 0 && (
              <div className="mt-10 border-t border-oat/50 pt-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Specifications</h2>
                <dl className="mt-4 divide-y divide-oat/40">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-6 py-3 text-sm">
                      <dt className="text-cocoa/[0.55]">{spec.label}</dt>
                      <dd className="text-right font-medium text-cocoa">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {product.benefits?.length > 0 && (
              <div className="mt-8 border-t border-oat/50 pt-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Made for Living</h2>
                <ul className="mt-4 space-y-2.5 text-sm leading-6 text-cocoa/[0.68]">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
