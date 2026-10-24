# Perf finding: the global hero preload fetches an asset production never shows

Recorded 2026-10-23 against production (`luvin-home.vercel.app`), commit `dfa3c3a`.

## The tag

`index.html` line 20:

```html
<link rel="preload" as="image" href="/hero-living-room.jpg" fetchpriority="high" />
```

It is in the static shell, so it ships on **every** route, not only the homepage.

## Evidence

**1. The preloaded file is 282,643 bytes.**

```
$ curl -sI https://luvin-home.vercel.app/hero-living-room.jpg
content-length: 282643
cache-control: public, max-age=0, must-revalidate
```

`max-age=0, must-revalidate` means it is revalidated on each navigation — it is not a long-lived cache win either.

**2. Production does not use that file for the hero.** The homepage hero `<img>` resolves to the CMS image:

```json
{"src": "https://cdn.sanity.io/images/p3ihfsxq/production/4ff7ddd8...", "w": 1920, "h": 1280, "loading": "eager", "attrs": {"w": "1694", "h": "928"}}
```

`/hero-living-room.jpg` is only the fallback used when Sanity is unset or fails (`HomePage.jsx`: `src={homepage.heroImage?.url || "/hero-living-room.jpg"}`).

**3. The preload still fires.** DevTools Protocol, fresh profile, 1440×900:

| Route | `link[rel=preload]` present | Hero image in DOM from that URL |
|---|---|---|
| `/` | `/hero-living-room.jpg` | no — hero comes from `cdn.sanity.io` |
| `/products` | `/hero-living-room.jpg` | no — no hero on that page |

## Impact

- Every cold visit to a non-home route downloads or revalidates **282 KB of JPEG that is never displayed**.
- On the homepage it competes for bandwidth with the real LCP image (the Sanity hero), and a preload for an unused URL is pure cost.
- Non-home routes are the common case for a catalogue site: `/products`, product detail, `/services`, `/projects`, `/blog`, `/contact`.

## Fix (no new dependencies)

Remove the tag from `index.html`. The fallback still works — it is only needed when the CMS call fails, and at that point the browser fetches it as a normal `<img>` request.

If preloading the CMS hero is worth doing later, do it from the component that knows the real URL (`HomePage.jsx`, after `useCmsContent` resolves), not from the static shell.

## How to re-check

1. `curl -s https://<host>/products | grep 'rel="preload"'` → should print nothing.
2. Load `/` and `/products` with DevTools open, filter Network for `hero-living-room` → should be absent on both, or only present on `/` when the CMS fallback actually rendered.
3. Confirm the real hero still loads on `/` (Network shows `cdn.sanity.io/images/...`).
