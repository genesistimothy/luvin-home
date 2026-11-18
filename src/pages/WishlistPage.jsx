import { Link, useOutletContext } from "react-router-dom";
import { HeartOff } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import CatalogProductCard from "../components/CatalogProductCard";
import { useSavedProducts } from "../context/SavedProductsContext";
import { productSlug } from "../lib/slug";

export default function WishlistPage() {
  const { products } = /** @type {any} */ (useOutletContext());
  const { wishlist } = useSavedProducts();

  const savedProducts = products.filter((product) => wishlist.includes(productSlug(product)));

  return (
    <section className="section-shell bg-cream pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Wishlist" }]} />
        <div className="mt-6">
          <p className="section-kicker">Wishlist</p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
            Saved Products
          </h1>
        </div>

        {savedProducts.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {savedProducts.map((product, index) => (
              <CatalogProductCard
                key={product._id || `${productSlug(product)}-${index}`}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <HeartOff size={40} className="text-cocoa/30" aria-hidden="true" />
            <p className="max-w-sm text-cocoa/70">
              No products saved yet. Browse the catalog and tap the heart icon to save your favorite
              pieces.
            </p>
            <Link
              to="/products"
              className="premium-button inline-flex items-center gap-2 bg-cocoa px-7 py-3.5 text-sm font-bold text-cream hover:bg-umber"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
