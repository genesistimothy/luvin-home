# Catalogue worst-case audit — Luvin Home products page

**Date:** 2026-10-22
**Scope:** `src/pages/ProductsPage.jsx`, `src/components/CatalogProductCard.jsx`, `src/components/ProductVisualPlaceholder.jsx`
**Method:** worst-case data fixtures behind a dev-only toggle, measured in a real browser
**Status:** findings only. No component changes are in this branch.

---

## 1. Summary

Ten findings. Five are **Broken** (content unreadable, an action is unreachable, or the wrong value is shown). Four are **Ugly** (readable but visibly wrong). One is **Fragile** (fine today, one realistic step from breaking).

| # | Severity | Field | One line |
|---|---|---|---|
| F1 | **Broken** | empty list | Zero products shows a blank grid and no message |
| F2 | **Broken** | `name` | Missing name leaves a card with no title |
| F3 | **Broken** | count text | "1 products found" |
| F4 | **Broken** | count text | "1000 products found" — no thousands separator |
| F5 | **Broken** | price row | At 200% text the price row overflows and pushes "Detail" out of the card |
| F6 | Ugly | `category` badge | The long category wraps and the badge grows from 31 px to 49 px over the image |
| F7 | Ugly | filter chips | The same long category makes one filter chip 56 px tall against 36 px |
| F8 | Ugly | `price: null` | No price renders, so "Detail" sits alone on its row |
| F9 | Ugly | `price: 0` | "Rp 0" is printed as a real price |
| F10 | Fragile | `name` | No length limit anywhere in the data path |

---

## 2. How this was tested

The point of the exercise is that **demo data is kind data**. Real names are longer, real categories are translated, and real prices sometimes do not exist.

The test data is not random. Every value is either a realistic example or the longest value the data layer accepts.

### 2.1 The fixture

`src/data/devWorstCase.js` holds six products. Each row carries a different failure, so one screen shows them all:

| Row | `name` | `category` | `price` | Other |
|---|---|---|---|---|
| 1 | `Aleksandra Wiśniewska-Kowalczyk Signature Modular Corner Sectional with Chaise` | `Sofa Bed Collection` | `1999000` | long, hyphenated, diacritics |
| 2 | `Đặng Thị Ngọc Hân Woven Lounge Chair` | `Wohnzimmermöbelkollektion` | `1234567890` | stacked diacritics, German compound, widest price |
| 3 | `王秀英 实木餐桌` | `Dining Collection` | `0` | CJK with no spaces, zero price |
| 4 | `Jo` | `Sofa Collection` | `"Contact for price"` | two letters, string price |
| 5 | `🦊 Fox Side Table` | `Custom Order — European Imported Solid Oak Collection` | `1284` | emoji first, `soldOut` |
| 6 | `""` | `Sofa Collection` | `null` | missing name, missing price, 12 colours, `comingSoon` |

Extra states: **Empty** (0 products), **One** (1 product), **1,000 rows** (a generated list).

### 2.2 The toggle

Dev-only, at the bottom centre of the viewport:

```
/products?data=worst     six products above
/products?data=empty     0 products
/products?data=one       1 product
/products?data=many      1,000 products
/products                the real CMS data
```

The choice lives in the URL, so a reload keeps it and a screenshot is reproducible.

The fixture swaps at the **same boundary the CMS uses** — `Layout.jsx` passes `products` and `collections` down through the router context. No component was edited to produce a break.

### 2.3 Widths and environments

| Condition | Result |
|---|---|
| 1440 px | checked |
| 768 px | checked |
| 390 px (phone) | checked |
| 320 px | checked |
| Root font size 200% | checked — this is where F5 appears |
| Dark mode | **not tested** — the product does not support it |
| RTL | **not tested** — the product does not support it |

---

## 3. Findings

### F1 — Zero products shows a blank grid with no message

**Severity:** Broken
**Where:** `src/pages/ProductsPage.jsx` (grid render, below the results row)

**Reproduce:** open `/products?data=empty`.

**Evidence:** the page renders `0` `<article>` elements. The only sign that anything happened is the text "0 products found". Measured page text after the filter row:

```
– 0 products found Newest Price: Low to High Price: High to Low
```

There is no empty-state block, no suggestion, and no way to clear the filters from the empty area.

**Why it matters:** a shopper who filters into an empty result sees a broken-looking page and has to work out how to get back.

**Proposed fix:** when `filtered.length === 0`, render a block where the grid would be. It should say there are no matches and offer a "Clear filters" button that resets `kategori`, `q`, `min` and `max`.

**Decision needed:** should the copy also suggest a related category? My recommendation: keep it short, and offer the clear-filters action only.

---

### F2 — A missing name leaves a card with no title

**Severity:** Broken
**Where:** `src/components/CatalogProductCard.jsx:47`

**Reproduce:** open `/products?data=worst` and look at the last card.

**Evidence:** the card body starts directly with the dimensions (`116 x 186 x 28 cm`). The `<h3>` renders empty. There is no fallback.

**Why it matters:** the card cannot be identified. Two products with no name look identical apart from the price.

**Proposed fix:** render a fallback string when `product.name` is empty, for example "Untitled product", and keep the same row height so the grid does not shift.

**Decision needed:** should the card be hidden instead of labelled? My recommendation: label it, because a hidden product in a catalogue is usually a data problem someone needs to see.

---

### F3 — "1 products found"

**Severity:** Broken
**Where:** `src/pages/ProductsPage.jsx:165`

```jsx
<p className="text-sm text-cocoa/60">{filtered.length} products found</p>
```

**Reproduce:** open `/products?data=one`.

**Evidence:** measured text is exactly `1 products found`.

**Why it matters:** it is the first line a reviewer reads, and it reads as unfinished.

**Proposed fix:** use `Intl.PluralRules` with `en`, or write two strings and pick one. `Intl.PluralRules` also covers "0 products", which is correct in English.

**Decision needed:** none.

---

### F4 — "1000 products found" has no thousands separator

**Severity:** Broken
**Where:** `src/pages/ProductsPage.jsx:165` (same line as F3)

**Reproduce:** open `/products?data=many`.

**Evidence:** measured text is exactly `1000 products found`.

**Why it matters:** the number is hard to read at a glance, and it looks inconsistent next to prices, which *are* formatted.

**Proposed fix:** `new Intl.NumberFormat("id-ID").format(filtered.length)` — or `en` if the UI language is English. The prices already use `id-ID` through `formatPrice`.

**Decision needed:** which locale should the count use? The page copy is English but the prices are `id-ID`. My recommendation: `en` for the count, so it matches the words around it.

---

### F5 — At 200% text the price row overflows and pushes "Detail" out

**Severity:** Broken
**Where:** `src/components/CatalogProductCard.jsx` (price row, `.mt-auto flex items-center justify-between gap-4 pt-6`)

**Reproduce:** open `/products?data=worst`, then raise the root font size to 32 px (browser text zoom 200%).

**Evidence:** measured `scrollWidth - clientWidth` per element:

| Card | Element | Overflow |
|---|---|---|
| 1 | content column `.flex flex-1 flex-col p-6` | 19 px |
| 1 | price row `.mt-auto flex items-center justify-between` | **67 px** |
| 2 | image container (`aspect-[16/10] overflow-hidden`) | 74 px |
| 2 | price row | **119 px** |

The row does not wrap. The price grows, the "Detail" button keeps its width, and the button is pushed past the card edge.

At normal text there is no overflow. The smallest gap between price and button is 67 px (card 3, "Contact for price").

**Why it matters:** text zoom is an accessibility setting on every phone and browser. A user who sets it loses the primary action.

**Proposed fix:** let the row wrap — `flex-wrap` plus `min-width: 0` on the price — and give the button `flex-shrink: 0` so it keeps its size while the price takes the next line.

**Decision needed:** if the price wraps to its own line, should the button stay right-aligned or move under it? My recommendation: keep it right-aligned on the price line while it fits, and let it drop to a full-width row when it does not.

---

### F6 — The long category badge wraps and grows over the image

**Severity:** Ugly
**Where:** `src/components/CatalogProductCard.jsx:30`

**Reproduce:** open `/products?data=worst`, card 5.

**Evidence:** measured badge box:

| Card | Badge text | Size | `white-space` |
|---|---|---|---|
| 1 | Sofa Bed Collection | 173 × 31 px | normal |
| 2 | Wohnzimmermöbelkollektion | 240 × 31 px | normal |
| 5 | Custom Order — European Imported Solid Oak Collection | **328 × 49 px** | normal |

The badge has no `white-space: nowrap` and no width limit, so a long category becomes a two-line pill that covers more of the product image.

**Why it matters:** the badge is a label, not content. It should never change the composition of the card.

**Proposed fix:** one line, capped with `text-overflow: ellipsis`, plus a `title` attribute holding the full value.

**Decision needed:** truncate, or move the category out of the image into the body? My recommendation: truncate on the image, and show the full category on the product page.

---

### F7 — The long category makes one filter chip twice as tall

**Severity:** Ugly
**Where:** `src/pages/ProductsPage.jsx` (category chips)

**Reproduce:** open `/products?data=worst` and look at the filter row.

**Evidence:** measured chip heights:

```
Wohnzimmermöbelkollektion                                 36 px
Custom Order — European Imported Solid O...               56 px
```

**Why it matters:** the row loses its baseline. Every chip after the tall one is offset.

**Proposed fix:** the same as F6 — one line with ellipsis, and the full value in `title`.

**Decision needed:** none.

---

### F8 — A missing price leaves "Detail" alone on its row

**Severity:** Ugly
**Where:** `src/components/CatalogProductCard.jsx` (price row)

**Reproduce:** open `/products?data=worst`, card 6.

**Evidence:** measured price element width `0 px`, and the gap to the button `215 px`. Nothing is drawn where the price should be.

**Why it matters:** it looks like a rendering failure, not a product without a price.

**Proposed fix:** render a fallback such as "Price on request" when `price` is `null`, `undefined` or an empty string.

**Decision needed:** "Price on request" or "Contact us"? My recommendation: "Price on request" — it is shorter and fits the existing layout.

---

### F9 — A zero price prints "Rp 0"

**Severity:** Ugly
**Where:** `src/lib/format.js:1` (`formatPrice`) and the card

**Reproduce:** open `/products?data=worst`, card 3.

**Evidence:** measured price text `Rp 0` at 41 px wide. It is formatted by `Intl.NumberFormat`, so it is a correct rendering of a value that should probably not exist.

**Why it matters:** "Rp 0" is either a data bug or a free product. A shopper reads it as a mistake.

**Proposed fix:** treat `0` the same as `null` and show the on-request label. If a real free product is possible, add an explicit `priceOnRequest` flag to the data instead of overloading zero.

**Decision needed:** is a free product possible in this catalogue? If yes, this fix is wrong and the data needs a flag.

---

### F10 — `name` has no length limit anywhere in the data path

**Severity:** Fragile
**Where:** data layer (Sanity schema) and the card

**Evidence:** no `maxLength` and no validation was found for the product name in the frontend. The longest title in the fixture wraps to three lines at 390 px and makes that card taller than its neighbours:

```
card heights at 390 px:  491, 486, 441, 441, 465, 440
card heights at 1440 px: 467, 467, 467, 426, 426, 426
```

No title clips, and no word breaks mid-word. This is a data discipline issue, not a rendering bug.

**Why it matters:** card heights already vary by 51 px. A longer title or a longer dimension string widens that gap, and a grid row takes the height of its tallest card.

**Proposed fix:** two steps. Add a sensible limit where products are entered, and clamp the title to two lines on the card with the full name on the detail page.

**Decision needed:** limit, or clamp, or both? My recommendation: both — the limit stops bad data, the clamp protects the layout when the data still arrives.

---

## 4. What held up

These are the cases the component already handles. Do not "fix" them.

- **No horizontal page overflow** at 320, 390, 768 or 1440 px. `document.scrollWidth - clientWidth` was `0` in every state.
- **Long prices fit at normal text size.** The smallest gap between a price and the "Detail" button was 67 px, on the widest price in the set (`Rp 1.234.567.890`).
- **Titles wrap cleanly.** The `<h3>` overflow was `0` on every card at every width. No clipping, no mid-word breaks.
- **1,000 rows paginate.** The listing is paged at 9 per screen, so a large catalogue does not stall the browser.
- **Numeric prices format correctly.** `formatPrice` uses `Intl.NumberFormat("id-ID")`, and a numeric input always produced a correct string.
- **The grid stays stable.** Cards share a row height and do not overlap at any width tested.
- **Status labels render.** `soldOut` and `comingSoon` both showed, and neither broke the layout.

---

## 5. Test environment notes, not findings

- **The CJK title (card 3) rendered as empty boxes in the audit screenshots.** The audit machine has zero CJK-capable fonts installed (`fc-list` count: 0). This is a property of the test machine, not of the app. On a phone the text renders.
- **Dark mode was not tested.** The product has no dark theme and no `dark:` classes.
- **RTL was not tested.** The product has no RTL support and no `dir` handling.

---

## 6. How to reproduce this audit

```bash
git checkout qa/break-ui-harness
npm install
npx vite --port 4200
```

Then open `http://localhost:4200/products?data=worst` and use the toggle at the bottom of the screen.

The fixture is excluded from production builds — `import.meta.env.DEV` gates both the toggle and the data, and a production build was checked: the fixture strings are absent from `dist/assets/*.js`.

---

## 7. Next step

Nothing in this branch changes the app. When the fixes are approved, apply them on a separate branch, then re-run every toggle state — Demo included, because a fix for the worst case must not regress the demo.
