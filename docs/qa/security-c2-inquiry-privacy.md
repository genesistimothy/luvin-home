# C2 — inquiry PII is readable from the public dataset

**Status:** deferred by the owner on 2026-10-23. The project stays on the Sanity
Free plan, so no private dataset and no paid upgrade. Not fixed. Do not fix
without reading this first.

## The exposure

Sanity project `p3ihfsxq`, dataset `production`, is public-read. Verified: an
anonymous request with no token returns `200` (`count(*[_type=="siteSettings"])` → 1).

The same dataset holds `inquiry` documents (`sanity/schemas/inquiry.js`):
`name`, `contact` (email or phone), `message`, `roomType`, `budgetRange`, and an
optional reference image. Anyone who reads the project ID from the client bundle
can query every submission.

No inquiry document was read or counted while producing this note.

## Why it is still open

Free Sanity allows **2 datasets, public only**. Private datasets are a Growth
feature. Both real fixes therefore need **$15/seat/month (~$180/year)**. There is
no free fix that stays inside the current stack.

## Options, if it is picked up again

**A — Make `production` private, add a read proxy.**
Every marketing read goes through a serverless function holding a token. About
4–6 hours: the function, caching so pages stay fast, CSP `connect-src` back to
self. Most code, and it puts a new hop in front of every page load. No data
migration.

**B — Split the datasets (recommended).**
`production` stays public for catalogue content. A new private dataset holds
inquiries only. The app's read path is unchanged; the write client points at the
private dataset; Studio gets a second workspace so inquiries stay visible.
2–3 hours including migrating existing documents. Nothing changes for visitors.

**C — Leave it.**
Zero cost, exposure continues. This is the current state.

## If B is chosen, the migration rules

- Take a backup before touching anything: `sanity dataset export`.
- Copy documents first, verify the copy, then delete from the public dataset.
- Deleting customer data needs explicit approval. Never in the same step as the copy.

## When to revisit

- Before any paid campaign that pushes traffic to the contact form.
- When an inquiry contains data a customer would not want public — the form
  invites exactly that today.
- If GDPR/PDP-style obligations apply (deletion and export requests).

## What this note does not cover

- Rate limiting on the form (C3) — deliberately out of scope under the
  "existing stack only" rule.
- The upload endpoint (C1) — separate, already fixed in PR #7.
