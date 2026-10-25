import { Fragment, useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import CatalogProductCard from "../components/CatalogProductCard";
import { formatProductCount, parsePrice } from "../lib/format";
import { pageWindow } from "../lib/pagination";
import { normalizeSearch } from "../lib/search";
import { productCategorySlug, productSlug, slugify } from "../lib/slug";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: "terbaru", label: "Newest" },
  { value: "termurah", label: "Price: Low to High" },
  { value: "termahal", label: "Price: High to Low" },
];

export default function ProductsPage() {
  const { products, collections } = /** @type {any} */ (useOutletContext());
  const [searchParams, setSearchParams] = useSearchParams();

  const kategori = searchParams.get("kategori") || "";
  const q = searchParams.get("q") || "";
  const min = searchParams.get("min") || "";
  const max = searchParams.get("max") || "";
  const sort = searchParams.get("sort") || "terbaru";
  const page = Math.max(1, Math.trunc(Number(searchParams.get("page")) || 1));

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    let list = products.filter((product) => product.status !== "draft" && product.status !== "archived");

    if (kategori) list = list.filter((product) => productCategorySlug(product) === kategori);
    if (q.trim()) {
      const needle = normalizeSearch(q.trim());
      list = list.filter(
        (product) =>
          normalizeSearch(product.name).includes(needle) ||
          normalizeSearch(product.shortDescription).includes(needle)
      );
    }

    const minValue = min ? Number(min) : null;
    const maxValue = max ? Number(max) : null;

    if (min && Number.isFinite(minValue)) {
      list = list.filter((product) => {
        const value = parsePrice(product.price);
        return value !== null && value >= minValue;
      });
    }
    if (max && Number.isFinite(maxValue)) {
      list = list.filter((product) => {
        const value = parsePrice(product.price);
        return value !== null && value <= maxValue;
      });
    }

    return [...list].sort((a, b) => {
      if (sort === "termurah" || sort === "termahal") {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);
        if (priceA === null) return 1;
        if (priceB === null) return -1;
        return sort === "termurah" ? priceA - priceB : priceB - priceA;
      }
      if (a._createdAt && b._createdAt) return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime();
      return (a.displayOrder ?? 100) - (b.displayOrder ?? 100);
    });
  }, [products, kategori, q, min, max, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageNumbers = pageWindow(currentPage, totalPages);

  const activeCategory = collections.find((collection) => (collection.slug || slugify(collection.name)) === kategori);
  const hasActiveFilters = Boolean(kategori || q || min || max);

  return (
    <section className="section-shell bg-cream pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb
          items={
            activeCategory
              ? [{ label: "Home", to: "/" }, { label: "Products", to: "/products" }, { label: activeCategory.name }]
              : [{ label: "Home", to: "/" }, { label: "Products" }]
          }
        />
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Catalog</p>
            <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
              {activeCategory ? activeCategory.name : "All Products"}
            </h1>
          </div>
          <div className="relative w-full max-w-sm">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cocoa/70" />
            <input
              type="search"
              value={q}
              onChange={(event) => updateParam("q", event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-full border border-oat/60 bg-white/70 py-3 pl-11 pr-4 text-sm text-cocoa placeholder:text-cocoa/70 focus:border-clay/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-8 self-start">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-clay-strong">Category</h2>
              <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
                <button
                  type="button"
                  onClick={() => updateParam("kategori", "")}
                  className={`rounded-full px-4 py-2 text-left text-sm transition motion-safe:active:scale-[0.98] lg:rounded-xl ${!kategori ? "bg-cocoa text-cream" : "bg-linen text-cocoa/70 hover:bg-oat/50"}`}
                >
                  All Categories
                </button>
                {collections.map((collection) => {
                  const slug = collection.slug || slugify(collection.name);
                  return (
                    <button
                      key={collection.name}
                      type="button"
                      title={collection.name}
                      onClick={() => updateParam("kategori", slug)}
                      className={`min-w-0 max-w-full truncate rounded-full px-4 py-2 text-left text-sm transition motion-safe:active:scale-[0.98] lg:w-full lg:rounded-xl ${kategori === slug ? "bg-cocoa text-cream" : "bg-linen text-cocoa/70 hover:bg-oat/50"}`}
                    >
                      {collection.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-clay-strong">Price Range</h2>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={min}
                  onChange={(event) => updateParam("min", event.target.value)}
                  placeholder="Min"
                  aria-label="Minimum price"
                  className="w-full rounded-xl border border-oat/60 bg-white/70 px-3 py-2.5 text-sm text-cocoa focus:border-clay/50 focus:outline-none"
                />
                <span className="text-cocoa/70">–</span>
                <input
                  type="number"
                  min="0"
                  value={max}
                  onChange={(event) => updateParam("max", event.target.value)}
                  placeholder="Max"
                  aria-label="Maximum price"
                  className="w-full rounded-xl border border-oat/60 bg-white/70 px-3 py-2.5 text-sm text-cocoa focus:border-clay/50 focus:outline-none"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay-strong hover:text-cocoa"
              >
                <X size={14} /> Reset Filters
              </button>
            )}
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-oat/50 pb-5">
              <p className="text-sm text-cocoa/70">{formatProductCount(filtered.length)}</p>
              <label className="flex items-center gap-2 text-sm text-cocoa/70">
                <SlidersHorizontal size={15} aria-hidden="true" />
                <select
                  value={sort}
                  onChange={(event) => updateParam("sort", event.target.value)}
                  className="rounded-full border border-oat/60 bg-white/70 px-3.5 py-2 text-sm text-cocoa focus:border-clay/50 focus:outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <h2 className="sr-only">Product catalogue</h2>
            {paged.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((product, index) => (
                  <CatalogProductCard
                    key={product._id || `${productSlug(product)}-${index}`}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-14 text-center text-cocoa/70">
                {hasActiveFilters
                  ? "No products match these filters."
                  : "No products are available yet."}
              </p>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                {pageNumbers.map((pageNumber, index) => {
                  const previous = pageNumbers[index - 1];
                  return (
                    <Fragment key={pageNumber}>
                      {previous && pageNumber - previous > 1 && (
                        <span className="px-1 text-sm text-cocoa/70" aria-hidden="true">
                          …
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => updateParam("page", String(pageNumber))}
                        aria-current={pageNumber === currentPage ? "page" : undefined}
                        className={`h-10 w-10 shrink-0 rounded-full text-sm font-semibold transition motion-safe:active:scale-95 ${pageNumber === currentPage ? "bg-cocoa text-cream" : "bg-linen text-cocoa/70 hover:bg-oat/50"}`}
                      >
                        {pageNumber}
                      </button>
                    </Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
