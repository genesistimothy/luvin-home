import { useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import CatalogProductCard from "../components/CatalogProductCard";
import { productCategorySlug, slugify } from "../lib/slug";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "termurah", label: "Harga: Termurah" },
  { value: "termahal", label: "Harga: Termahal" },
];

export default function ProductsPage() {
  const { products, collections } = /** @type {any} */ (useOutletContext());
  const [searchParams, setSearchParams] = useSearchParams();

  const kategori = searchParams.get("kategori") || "";
  const q = searchParams.get("q") || "";
  const min = searchParams.get("min") || "";
  const max = searchParams.get("max") || "";
  const sort = searchParams.get("sort") || "terbaru";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

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
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (product) =>
          product.name?.toLowerCase().includes(needle) || product.shortDescription?.toLowerCase().includes(needle)
      );
    }
    if (min) list = list.filter((product) => typeof product.price !== "number" || product.price >= Number(min));
    if (max) list = list.filter((product) => typeof product.price !== "number" || product.price <= Number(max));

    return [...list].sort((a, b) => {
      if (sort === "termurah" || sort === "termahal") {
        const priceA = typeof a.price === "number" ? a.price : null;
        const priceB = typeof b.price === "number" ? b.price : null;
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

  const activeCategory = collections.find((collection) => (collection.slug || slugify(collection.name)) === kategori);
  const hasActiveFilters = Boolean(kategori || q || min || max);

  return (
    <section className="section-shell bg-cream pt-32">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb
          items={
            activeCategory
              ? [{ label: "Home", to: "/" }, { label: "Produk", to: "/produk" }, { label: activeCategory.name }]
              : [{ label: "Home", to: "/" }, { label: "Produk" }]
          }
        />
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Katalog</p>
            <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
              {activeCategory ? activeCategory.name : "Semua Produk"}
            </h1>
          </div>
          <div className="relative w-full max-w-sm">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cocoa/40" />
            <input
              type="search"
              value={q}
              onChange={(event) => updateParam("q", event.target.value)}
              placeholder="Cari produk..."
              aria-label="Cari produk"
              className="w-full rounded-full border border-oat/60 bg-white/70 py-3 pl-11 pr-4 text-sm text-cocoa placeholder:text-cocoa/40 focus:border-clay/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-8 self-start">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Kategori</h3>
              <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
                <button
                  type="button"
                  onClick={() => updateParam("kategori", "")}
                  className={`rounded-full px-4 py-2 text-left text-sm transition lg:rounded-xl ${!kategori ? "bg-cocoa text-cream" : "bg-linen text-cocoa/70 hover:bg-oat/50"}`}
                >
                  Semua Kategori
                </button>
                {collections.map((collection) => {
                  const slug = collection.slug || slugify(collection.name);
                  return (
                    <button
                      key={collection.name}
                      type="button"
                      onClick={() => updateParam("kategori", slug)}
                      className={`rounded-full px-4 py-2 text-left text-sm transition lg:rounded-xl ${kategori === slug ? "bg-cocoa text-cream" : "bg-linen text-cocoa/70 hover:bg-oat/50"}`}
                    >
                      {collection.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Rentang Harga</h3>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={min}
                  onChange={(event) => updateParam("min", event.target.value)}
                  placeholder="Min"
                  aria-label="Harga minimum"
                  className="w-full rounded-xl border border-oat/60 bg-white/70 px-3 py-2.5 text-sm text-cocoa focus:border-clay/50 focus:outline-none"
                />
                <span className="text-cocoa/40">–</span>
                <input
                  type="number"
                  min="0"
                  value={max}
                  onChange={(event) => updateParam("max", event.target.value)}
                  placeholder="Maks"
                  aria-label="Harga maksimum"
                  className="w-full rounded-xl border border-oat/60 bg-white/70 px-3 py-2.5 text-sm text-cocoa focus:border-clay/50 focus:outline-none"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-cocoa"
              >
                <X size={14} /> Reset Filter
              </button>
            )}
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-oat/50 pb-5">
              <p className="text-sm text-cocoa/60">{filtered.length} produk ditemukan</p>
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

            {paged.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((product) => (
                  <CatalogProductCard key={product._id || product.name} product={product} />
                ))}
              </div>
            ) : (
              <p className="mt-14 text-center text-cocoa/60">Tidak ada produk yang cocok dengan filter ini.</p>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => updateParam("page", String(pageNumber))}
                    className={`h-10 w-10 rounded-full text-sm font-semibold transition ${pageNumber === currentPage ? "bg-cocoa text-cream" : "bg-linen text-cocoa/70 hover:bg-oat/50"}`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
