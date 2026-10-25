import { Link, useOutletContext } from "react-router-dom";
import { Scale, X } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import ProductVisualPlaceholder from "../components/ProductVisualPlaceholder";
import { useSavedProducts } from "../context/SavedProductsContext";
import { formatPrice } from "../lib/format";
import { productSlug } from "../lib/slug";

const ROWS = [
  { label: "Category", value: (product) => product.category || "—" },
  { label: "Price", value: (product) => formatPrice(product.price, product.currency) },
  { label: "Dimensions", value: (product) => product.dimensions || "—" },
  { label: "Weight", value: (product) => product.weight || "—" },
  { label: "Material", value: (product) => (product.materials?.length ? product.materials.join(", ") : "—") },
  { label: "Color Options", value: (product) => (product.colors?.length ? product.colors.join(", ") : "—") },
  { label: "Stock Status", value: (product) => product.stockStatus || product.status || "—" },
  { label: "SKU", value: (product) => product.sku || "—" },
];

export default function ComparePage() {
  const { products } = /** @type {any} */ (useOutletContext());
  const { compareIds, removeFromCompare, clearCompare } = useSavedProducts();

  const compared = compareIds
    .map((slug) => products.find((product) => productSlug(product) === slug))
    .filter(Boolean);

  return (
    <section className="section-shell bg-cream pt-32 lg:pt-40">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Compare" }]} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Compare</p>
            <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
              Compare Products
            </h1>
          </div>
          {compared.length > 0 && (
            <button type="button" onClick={clearCompare} className="text-sm font-semibold text-clay-strong hover:text-cocoa">
              Clear All
            </button>
          )}
        </div>

        {compared.length >= 2 ? (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed break-words border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="w-40 border-b border-oat/50 pb-4 align-bottom text-xs font-bold uppercase tracking-[0.15em] text-clay-strong">
                    &nbsp;
                  </th>
                  {compared.map((product) => (
                    <th key={product._id || product.name} className="border-b border-oat/50 px-4 pb-4 align-bottom">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => removeFromCompare(productSlug(product))}
                          aria-label={`Remove ${product.name} from comparison`}
                          className="absolute -right-1 -top-1 inline-grid h-7 w-7 place-items-center rounded-full bg-cream/90 text-cocoa shadow-sm hover:bg-linen"
                        >
                          <X size={14} />
                        </button>
                        <div className="overflow-hidden rounded-xl">
                          {product.mainImageUrl ? (
                            <img
                              src={product.mainImageUrl}
                              alt={product.name}
                              className="aspect-[4/3] w-full object-cover"
                            />
                          ) : (
                            <ProductVisualPlaceholder category={product.category} />
                          )}
                        </div>
                        <Link
                          to={`/products/${productSlug(product)}`}
                          className="mt-3 block font-display text-lg font-normal normal-case tracking-normal text-cocoa hover:text-clay-strong"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-oat/40">
                    <th scope="row" className="py-4 pr-4 align-top text-xs font-bold uppercase tracking-[0.15em] text-clay-strong">
                      {row.label}
                    </th>
                    {compared.map((product) => (
                      <td key={(product._id || product.name) + row.label} className="px-4 py-4 align-top text-cocoa/75">
                        {row.value(product)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <Scale size={40} className="text-cocoa/30" aria-hidden="true" />
            <p className="max-w-sm text-cocoa/70">
              {compared.length === 1
                ? "Choose at least one more product (up to 3) to compare."
                : "Choose 2–3 products from the catalog to compare their specifications side by side."}
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
