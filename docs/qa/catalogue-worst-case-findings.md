# Catalogue worst-case audit — consolidated findings

**Date:** 2026-10-23
**Scope:** `src/pages/ProductsPage.jsx`, `src/components/CatalogProductCard.jsx`,
`src/components/ProductVisualPlaceholder.jsx`, `src/lib/format.js`, `src/data/products.js`
**Method:** dev-only worst-case fixtures, measured in Chromium at 320 / 390 / 768 / 1440 px,
root font 32 px, and `prefers-reduced-motion: reduce`
**Status:** findings only. No component fixes are in this branch.

This consolidates the first catalogue audit with a second pass and corrects three claims that did
not reproduce. IDs are stable and ordered by leverage.

---

## 1. Summary

| # | Severity | Field | Finding |
| --- | --- | --- | --- |
| C1 | **Broken** | pagination | Large catalogues blow the grid to 1,773 px columns and clip most of the pager |
| C2 | **Broken** | `name` | An unbreakable name is clipped mid-glyph with no ellipsis |
| C3 | **Broken** | 200% text | Price row overflows; "Detail" is pushed outside the card; header/nav collide |
| C4 | **Broken** | price filter | `min`/`max` keep products with string or missing prices |
| C5 | **Broken** | `name` | A missing name renders a card with no title |
| C6 | **Broken** | `price` | Numeric-string prices render raw and bypass filter/sort |
| C7 | Ugly | `category` badge | Long badge wraps to 49 px and overlaps the heart by 52 px |
| C8 | Ugly | filter chip | Long category makes one chip 56 px against 36 px |
| C9 | Ugly | `dimensions` | Missing value leaves an empty line |
| C10 | Ugly | `price` | Missing value leaves "Detail" alone on the row |
| C11 | Ugly | `price: 0` | Prints "Rp 0" |
| C12 | Ugly | `mainImageUrl` | 404 image renders alt text over the image area |
| C13 | Ugly | `category` | Empty category renders a 30 × 14 blank pill |
| C14 | Ugly | count copy | "1 products found"; "1000" has no separator |
| C15 | Ugly | empty copy | "No products match these filters" with no filters active |
| C16 | Ugly | 320 px header | Brand wraps to two lines and grows the header |
| C17 | Fragile | `dimensions`/`weight` | No schema limit; long values grow the card |
| C18 | Fragile | keys | Duplicate names without `_id` collide as React keys |
| C19 | Fragile | search | Diacritics are not normalised: "dang" does not find "Đặng" |
| C20 | Fragile | `price` | A negative price renders "-Rp 1.000" if it bypasses the schema |
| M1 | **Broken** | motion | Reduced motion still lifts cards, zooms images, and scales the press state |
| M2 | Medium | motion | Card hover still animates `box-shadow` (paint) |
| M3 | Medium | touch | Tap highlight removed, but only `.premium-button` has an `:active` state |
| M4 | Low | motion | `.premium-card` lifts a non-interactive `<div>` |

---

## 2. Broken

### C1 — Large-catalogue pagination destroys the layout

**Where:** `src/pages/ProductsPage.jsx:192-205`; the results column at `:163`.

**Reproduce:** `/products?data=many`, 1440 px.

**Evidence:** 112 page buttons render in one non-wrapping flex row.

```
page buttons:        112
pager row width:     5,368 px
grid columns:        1,773.33 px × 3
viewport:            1,440 px
last page right:     5,740 px
document scrollWidth: 1,440 px   (body { overflow-x: hidden } clips it)
```

The grid's `1fr` column has `min-width: auto`, so the pager's intrinsic width expands the track,
which expands all three card columns. Roughly the first 30 of 112 pages are visible; the rest of the
pager and most of the catalogue are unreachable, and no horizontal scrollbar appears because the
overflow is hidden.

**Fix:** window the pager (first/last/current ±1 with ellipses), allow the row to wrap, and put
`min-w-0` on the results column. Never render `Array.from({length: totalPages})`.

### C2 — Unbreakable names are clipped

**Where:** `src/components/CatalogProductCard.jsx:47`.

**Reproduce:** `/products?data=worst` with a name such as
`Aurelia131SinteredStoneDiningTableLimitedEditionCarrara`.

**Evidence:** the `<h3>` has `scrollWidth 520` inside `clientWidth 300` at 390 px; the card is
`overflow-hidden`, so the text is cut mid-glyph with no ellipsis and no way to read it. The card
reports `scrollWidth 544` against `clientWidth 348`.

**Fix:** `[overflow-wrap:anywhere]` on the title, clamp to two lines, and expose the full value in
`title`. A 120-character name can still take three lines at phone width.

### C3 — 200% text pushes the primary action out of the card

**Where:** `src/components/CatalogProductCard.jsx:54` (price row); header at
`src/components/Navbar.jsx:117-125`.

**Reproduce:** `/products?data=worst`, set root font size to 32 px.

**Evidence:** per-card price-row overflow `72–268 px`; the "Detail" button's right edge lands up
to 168 px beyond the card's right edge. The header brand, nav links, and action icons overlap at
the same setting.

**Fix:** `flex-wrap` on the price row, `min-w-0` on the price, `shrink-0` on the button; let the
header wrap or shrink deliberately (`text-lg` brand, tighter gaps at 320).

### C4 — Numeric price filters keep unpriced products

**Where:** `src/pages/ProductsPage.jsx:46-47`.

```jsx
if (min) list = list.filter((product) => typeof product.price !== "number" || product.price >= Number(min));
```

**Reproduce:** `/products?data=worst&min=100000000`.

**Evidence:** three products are returned: `Rp 1.234.567.890`, `"Contact for price"`, and a
missing price. The `typeof !== "number"` guard treats unknown prices as matching every range.

**Fix:** parse to a number and exclude products whose price is unknown:

```js
const value = parsePrice(product.price);
return value !== null && value >= Number(min);
```

If a product's price is unknown, it cannot be proven inside a numeric range.

### C5 — Missing name leaves an untitled card

**Where:** `src/components/CatalogProductCard.jsx:47`.

**Evidence:** `<h3>` height `0`; the body starts with dimensions, then price. Two nameless
products are indistinguishable.

**Fix:** render `"Untitled product"` and keep the `<h3>` present for screen readers.

### C6 — Numeric-string prices render raw and bypass filter/sort

**Where:** `src/lib/format.js:1-4`; `src/data/products.js:28,43,58,77,91,105`.

**Evidence:** `formatPrice("1999000")` returns the string `1999000` with no currency. All six
fallback products use string prices (`"Rp 1.999.000"`), so:

- `?min=100000000` returns every fallback product;
- price sort pushes all of them to the end;
- a bulk-imported `"1999000"` is displayed without `Rp`.

**Fix:** a single `parsePrice` used by `formatPrice`, the filters, and the sort; normalise the
fallback data to numbers.

---

## 3. Ugly

### C7 — Long category badge wraps and overlaps the heart

**Where:** `CatalogProductCard.jsx:29`; `ProductVisualPlaceholder.jsx:9-12`.

**Evidence:** badge `291 × 49 px` (vs `31 px` high for short categories) and its right edge is
`52 px` past the wishlist button's left edge. The category text is clipped behind the button.

**Fix:** one line, `max-w-[calc(100%-4.5rem)]`, `truncate`, `title` with the full value.

### C8 — Long category makes one filter chip twice as tall

**Evidence:** `Custom Order — European Imported Solid Oak Collection` chip is `56 px`; the others
are `36 px`. The row loses its baseline.

**Fix:** one line with ellipsis and a `title`, same as C7.

### C9 — Missing dimensions leave an empty line

**Evidence:** `<p class="mt-1.5 text-sm">` renders with no text, reserving a line of height.

**Fix:** conditional render.

### C10 — Missing price leaves "Detail" alone

**Evidence:** the price row's children are `["", "Detail"]`; the price element is `0 px` wide.

**Fix:** `"Price on request"` fallback.

### C11 — Zero price prints "Rp 0"

**Evidence:** `formatPrice(0)` → `Rp 0`. The Sanity schema allows `0` (`sanity/schemas/product.js:43`,
`Rule.min(0)`), so this is reachable.

**Decision:** if a free product is possible, render `"Free"`. If `0` only ever means "not set",
tighten the schema to `min(1)` and render `"Price on request"`. Recommendation: `min(1)` for a
furniture catalogue, because a free product is almost certainly a data-entry error.

### C12 — Broken image URL renders alt text over the image area

**Where:** `CatalogProductCard.jsx:21-28`.

**Evidence:** a 404 `mainImageUrl` leaves the `<img>` box empty with the alt text painted at its
top-left, colliding with the category badge. There is no `onError`.

**Fix:** on error, swap to `ProductVisualPlaceholder` (state flag), not `display: none`.

### C13 — Empty category renders a blank pill

**Evidence:** a `30 × 14 px` empty capsule at the image's top-left when `category` is `""`.

**Fix:** render the badge only when the category is non-empty.

### C14 — Count copy

**Evidence:** exactly `1 products found` for one product, and `1000 products found` for 1,000.
Prices are formatted; the count is not.

**Fix:** `Intl.NumberFormat("en-US")` for the count (the page copy is English) and a plural branch.
`1,000 products found` / `1 product found`.

### C15 — Empty-state copy is wrong when no filters are active

**Evidence:** `/products?data=empty` renders "No products match these filters." with zero active
filters. The message exists — the first draft's claim that the area is blank did not reproduce.
When filters *are* active, the sidebar already offers **Reset Filters**.

**Fix:** branch the copy: `No products available yet.` when no filters are active; keep the
filter copy and the reset action when they are.

### C16 — 320 px header brand wraps

**Evidence:** at 320 px "Luvin Home" wraps to two lines, growing the header; the logo and three
44 px icon buttons leave ~147 px for the brand.

**Fix:** `text-lg` below `sm`, `whitespace-nowrap`, and a smaller gap between the logo and the
brand. If it still does not fit, hide the compare icon below 360 px rather than wrapping.

---

## 4. Fragile

### C17 — Dimensions and weight have no length limit

`dimensions` (`sanity/schemas/product.js:38`) and `weight` (`:39`) are unbounded strings. A long
dimension string can wrap to four lines and grow a card; at 200% text it also overflows.

**Fix:** `Rule.max(120)` on both, plus `break-words` on the card.

### C18 — Duplicate names collide as keys

`ProductsPage.jsx:185` and `WishlistPage.jsx:31` use `product._id || product.name`. Fallback
products have no `_id`, so two products with the same name share a key.

**Fix:** `product._id || productSlug(product)` and, when those collide, append the index.

### C19 — Diacritics are not normalised in search

`ProductsPage.jsx:43` uses `toLowerCase().includes()`. `"Đặng Thị Ngọc Hân"` does not match
`"dang"`. Prices and names can arrive translated.

**Fix:** `value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()`.

### C20 — Negative prices render as "-Rp 1.000"

`formatPrice(-1000)` → `-Rp 1.000`. The schema rejects negatives, but fallback/import data can
bypass it. Treat non-finite or negative values as unknown and show the on-request label.

---

## 5. Motion and accessibility on the same surfaces

These come from the animation audit; they are visible on the catalogue and should ship with it.

- **M1 (Broken):** reduced motion still lifts cards (`translateY(-6px)`), zooms
  `.media-zoom`/`.media-zoom-sm`, and applies `:active scale(0.97)`. `hoverOnlyWhenSupported` is
  pointer-only. Plans 002 and 003 cover the fix.
- **M2 (Medium):** card hover interpolates `box-shadow` at 200 ms — a paint every frame. Remove
  the shadow transition; keep the static shadow.
- **M3 (Medium):** `-webkit-tap-highlight-color: transparent` with only `.premium-button:active`
  means most catalogue controls have no press feedback. Add `:active` to buttons/links or restore
  the highlight.
- **M4 (Low):** `.premium-card:hover` lifts a static `<div>` at `ServiceDetailPage.jsx:65`.

Not a finding: 16 px inputs on coarse pointers, safe-area insets, `100dvh`, and
`touch-action: manipulation` all verified correctly.

---

## 6. Corrections to the first draft

1. **F1 is false.** `/products?data=empty` renders "No products match these filters." The real
   issue is the copy when no filters are active (C15), and **Reset Filters** already exists when
   filters are set.
2. **F3 and F4 are Ugly, not Broken.** Both are readable; neither blocks an action.
3. **F10 is partly false.** The Sanity schema already enforces `max(120)` on `name`
   (`sanity/schemas/product.js:28`). The frontend and fallback data do not enforce it, and 120
   characters still overflows the card — hence C2 and C17.
4. **F9 is informed by the schema.** `price` uses `Rule.min(0)`, so `0` is allowed, not
   necessarily a bug. The decision is C11.
5. **Missing:** C1 (pagination), C2 (unbreakable names), C4 (filter semantics), C6
   (string prices), C7 overlap, C12 (image 404), C13 (blank badge), C16 (320 header), C18
   (keys), C19 (diacritics), C20 (negative price).
6. **"No horizontal overflow" is misleading.** The document is 1,440 px wide because
   `body { overflow-x: hidden }` clips 5,368 px of pager. Clipping is not a fix.

---

## 7. What held up

- Generated placeholder for a missing `mainImageUrl` (only the *broken URL* case fails).
- CJK, emoji, and diacritics render.
- Names that contain spaces wrap cleanly; no mid-word breaks.
- Cards share a row height and stay aligned.
- Empty, one, and 1,000-row states render without crashing.
- Numeric prices format correctly; status labels render; HTML in names is escaped.
- No document-level horizontal scroll at 320/390/768/1440 — but see C1 for clipped content.
- Modal zoom, keyboard navigation, and focus outlines on the product page still work.

---

## 8. Fix plan

Ordered; each step is independently shippable.

1. **Price helpers** (`src/lib/format.js`, `src/data/products.js`)
   - Add `parsePrice(value): number | null`; handle numbers, `"Rp 1.999.000"`, `"1999000"`;
     reject non-finite and negative.
   - `formatPrice` uses `parsePrice`; unknown → `"Price on request"`.
   - Convert the six fallback prices to numbers.
   - Unit tests for `"Rp 1.999.000"`, `"1999000"`, `null`, `0`, `-1`, `"Contact for price"`.
2. **Card** (`CatalogProductCard.jsx`, `ProductVisualPlaceholder.jsx`)
   - Title: fallback + `[overflow-wrap:anywhere]` + `line-clamp-2` + `title`.
   - Dimensions: conditional; `break-words`.
   - Price: new fallback; row `flex-wrap`, price `min-w-0`, button `shrink-0`.
   - Badge: conditional + `max-w-[calc(100%-4.5rem)] truncate` + `title`.
   - Image: `onError` → placeholder.
   - Key: `_id || slug || name` (pages).
3. **Products page** (`ProductsPage.jsx`)
   - Count: `en-US` separators + plural.
   - Empty: copy branches on `hasActiveFilters`.
   - Filters: `parsePrice`; unknown excluded from numeric ranges.
   - Search: NFD normalisation.
   - Pagination: window (max 7 visible), `flex-wrap`, `min-w-0` on the results column.
4. **Header** (`Navbar.jsx`)
   - 320 px brand: `text-lg`, `whitespace-nowrap`, tighter gap.
5. **Schema** (`sanity/schemas/product.js`)
   - `dimensions`/`weight`: `Rule.max(120)`.
   - Price: decision C11 (`min(1)` recommended).
6. **Motion** — apply plans 002 and 003 (shadow paint, reduced motion, press feedback).

**Acceptance:** every `?data=` state at 320/390/768/1440, root 32 px, reduced motion, and touch
emulation; no clipped content, no unpriced product matching a numeric range, and every card
identifiable and actionable.

---

## 9. Reproduce

```bash
git checkout qa/break-ui-harness    # PR #3
npm install
npx vite --port 4200
```

Open `http://localhost:4200/products?data=worst|empty|one|many` and use the bottom-centre toggle.

Checked at 320, 390, 768, 1440 px; root font 32 px; `prefers-reduced-motion: reduce`; touch
emulation (`pointer: coarse`). Dark mode and RTL are unsupported by the product and were not
tested.
