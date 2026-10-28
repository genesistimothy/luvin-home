# Luvin Home — agent rules

Marketing site + catalogue for a furniture brand. React SPA on Vercel, content from Sanity,
no SSR and no Next.js.

## Stack

- React 19, Vite 6, React Router 6 (`BrowserRouter`), Tailwind CSS 3.4, `lucide-react`
- Sanity CMS via `@sanity/client`; Studio lives in `sanity/` with its own `package.json`
- Vercel Node functions in `api/`; `vercel.json` rewrites every path to `index.html`
- Two UI surfaces: public `src/` (Tailwind) and admin `src/admin/` (plain CSS, lazy-loaded
  when `location.pathname` starts with `/admin`)

## Commands

```bash
npm ci                 # package-lock.json is authoritative — do not use pnpm
npm run dev            # Vite + the api/ functions (dev-only middleware in vite.config.js)
npx vercel dev         # optional: real Vercel runtime, needs `vercel login`
npm run lint           # eslint, --max-warnings=0
npm run typecheck      # tsc --noEmit with checkJs
npm test               # node --test tests/*.test.js
npm run build          # vite build
npm run preview
npm run studio:install # once, installs sanity/ dependencies
npm run studio         # Sanity Studio dev
npm run studio:build / studio:deploy
npm run cms:migrate
npm run cms:seed       # copy Sanity content and WebP image variants into Supabase
npm run cms:seed:cloud # same seed against .env.cloud
npm run preflight:cloud # production cutover guard; reads .env.cloud
npm run build:cloud    # production build using .env.cloud
```

## Code conventions

- **JavaScript only.** No `.ts`/`.tsx`. Types come from JSDoc; `tsconfig` has `allowJs` +
  `checkJs`. Cast router context: `const { products } = /** @type {any} */ (useOutletContext())`.
- **Default exports** for components and pages; **named exports** for `src/lib`, hooks, and
  schema helpers. PropTypes are intentionally off.
- Relative imports (`../lib/format`); no path aliases.
- Tailwind utilities inline. `.premium-button`, `.premium-card`, and `.fade-up` live in
  `@layer components`; `.media-zoom`, `.placeholder-*`, and `.lightbox` are intentionally
  unlayered so they can override utilities.
- Use the palette tokens only: `linen`, `cream`, `oat`, `clay`, `umber`, `cocoa`, `moss`,
  `stone`; `font-display` is Playfair, body is Inter. No dark mode, no RTL.
- Admin is **not** Tailwind — keep its styles in `src/admin/admin.css` and its components in
  `src/admin/`.

## Data flow

- `Layout` calls `useCmsContent()` and passes the normalized object through
  `<Outlet context={content}>`. Home, products, contact, compare, and wishlist read it there.
- Blog, projects, services, and their detail pages use `useSanityQuery(...)` directly.
- `useCmsContent` falls back to `src/data/fallbackContent.js` when Sanity is unset or fails, and
  caches to `localStorage` under `luvin:cmsContent:v1`. Keep the fallback complete and in the
  same shape as CMS data.
- Sanity images are normalized with `sanityImageUrl` (`src/lib/sanityImage.js`); components should
  use `mainImageUrl` / `coverImage.image.asset.url`, never raw image objects.

## Catalogue rules (learned the hard way)

- Prices are **numbers** in data. `parsePrice` / `formatPrice` in `src/lib/format.js` accept
  numbers and formatted strings; unknown, zero, and negative render “Price on request”. Never
  reintroduce string prices in `src/data/products.js`.
- Filtering and sorting must use `parsePrice`; do not compare raw `product.price`. Products with
  unknown prices are excluded from `min`/`max` ranges.
- Counts use `formatProductCount` (`en-US` separators + plural); prices use `id-ID`.
- Pagination uses `pageWindow` (`src/lib/pagination.js`); never render every page number.
- List keys are `product._id || \`${productSlug(product)}-${index}\`` — duplicate fallback names
  exist.
- Search uses `normalizeSearch` (`src/lib/search.js`) so `dang` matches `Đặng`.
- Card titles clamp to two lines with a `title`; badges/chips truncate with a `title`; missing
  dimensions are omitted; a failed image falls back to `ProductVisualPlaceholder`.
- The header is fixed. Catalogue content uses `pt-32 lg:pt-40` to clear it when text is zoomed to
  200%; don’t reduce it without re-testing at 1024 px + 32 px root font.

## Motion

- No motion library. CSS transitions/keyframes plus `--ease-premium`
  (`cubic-bezier(0.22, 1, 0.36, 1)`).
- Animate `transform`/`opacity`; no animated `box-shadow`, `width`, `height`, or `padding`.
- Hover: `motion-safe:` on transforms, and `future.hoverOnlyWhenSupported` in
  `tailwind.config.js` gates both `hover:` and `group-hover:` to fine pointers.
- `@media (prefers-reduced-motion: reduce)` must keep colour feedback and drop movement. The
  lightbox uses `.lightbox` + `@starting-style` and a 200 ms delayed unmount.
- Press feedback is `.premium-button:active` (declared **after** `:hover`) plus small
  `motion-safe:active:` scales on icon/controls.

## API and security

- `api/*.js` are ESM Vercel functions `(req, res)`. Use `json`, `redirect`, `readJson`, and
  `parseCookies` from `api/_lib/http.js`; auth/session helpers live in `api/_lib/`.
- Only `VITE_*` values are public. Never expose `SANITY_WRITE_TOKEN`, `ADMIN_SESSION_SECRET`,
  `GOOGLE_CLIENT_SECRET`, or the allowlist. Admin access is checked against
  `ADMIN_ALLOWED_EMAILS` with a signed session cookie.
- New public routes go in `src/App.jsx`; Vercel’s catch-all rewrite handles deep links.

## Public endpoints

- Vercel Hobby allows one WAF rate-limit rule; apply it in the dashboard to
  `/api/` (60 requests / 10 min / IP). This is deployment config, not repo code.
- Turnstile is verified server-side in `api/_lib/turnstile.js`; set
  `VITE_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Production fails closed
  when the secret is missing.
- New inquiries go to Supabase through `/api/inquiries` and `/api/inquiry-upload`,
  with `SUPABASE_SERVICE_ROLE_KEY` server-side only and RLS denying anon. Run
  `npx supabase start` for local Postgres, Storage, and Studio.
- The public catalogue reads Supabase `content` rows when `VITE_CONTENT_SOURCE=supabase`
  (seed with `npm run cms:seed`). Admin product CRUD always writes `content` and
  uploads to the public `content` bucket, so never deploy the admin writes while
  production still reads Sanity; flip the flag in the same deploy.
- Supabase images store `{url, variants}`; read them through `sanityImageUrl` and
  `sanityImageSrcSet` so the browser gets the WebP set. Do not hardcode `.url`.
- Existing inquiry documents are still in the public Sanity dataset (C2 open)
  until `docs/qa/c2-inquiry-export-runbook.md` runs. Do not send paid traffic to
  the forms before the production Supabase env exists.

## Tests and verification

- `tests/*.test.js` use `node:test` and cover pure helpers (auth, product validation, price
  parsing, pagination, search). Add tests there, not next to components.
- There is no DOM/component test harness. For UI changes, run the app and exercise the changed
  path in a browser at 320/390/768/1440 px, 200% root font, and reduced motion.
- The catalogue has a dev-only fixture switch: `/products?data=worst|empty|one|many`. It is gated
  by `import.meta.env.DEV`; verify fixture strings stay out of `dist/assets/*.js`.
- Before finishing: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Boundaries

- Never commit `.env*`, `dist/`, `node_modules/`, `.vercel/`, `sanity/.sanity/`.
- Do not add dependencies for what CSS or the existing helpers can do.
- Do not “fix” the static `.premium-card`: it is a non-interactive surface.
- `package-lock.json` is the only lockfile. `npm ci` is the install path; do not add a second
  package manager's lockfile to this repo.
- Sanity schema limits already exist (product name 120, price ≥ 0, active-product required
  fields). Change the schema and `validateProductInput` in `api/_lib/sanity.js` together.
