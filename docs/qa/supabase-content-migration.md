# Supabase content migration

Status: implemented and verified against local Supabase. Production still reads
Sanity until the cutover checklist below runs.

**Cutover:** the combined setup and cleanup prompt is held with the operator
outside the repo. `npm run preflight:cloud` is the gate before any deploy.

## What moved

The public catalogue and marketing content now live in Supabase `content`, one
row per former Sanity document. `data` is JSONB and mirrors the shape the
storefront already consumes. Images live in the public `content` bucket.

Inquiry data is separate. It lives in the `inquiries` table and the private
`inquiries` bucket, not in `content`.

## Units

1. **Read path.** `useCmsContent` reads Supabase when `VITE_CONTENT_SOURCE=supabase`.
   `npm run cms:seed` copies the Sanity query and 21 images into Supabase.
2. **Admin writes.** Product create, update, publish, archive, category lookup,
   dashboard counts, and image upload use Supabase. Images upload to the public
   `content` bucket.
3. **Images.** Uploads become WebP variants at 480, 768, 1152, 1536, and 1920
   wide, plus the source width, at quality 90. Content stores `{url, variants}`.
4. **Services.** The four static services are seeded as `service` rows, and the
   service pages read them from Supabase when the flag is on.
5. **Cutover.** Not done.
6. **Cleanup.** Remove the Sanity read path and the `content` seed once the
   cutover is verified.

## Verified locally

- 19 rows seeded: 1 homepage, 1 site settings, 3 collections, 6 products, 4 FAQs,
  4 services.
- Anon reads see published rows. Anon reads of `inquiries` return 401.
- Admin create returns a draft that the public API does not return.
- Admin publish makes the row public.
- Admin archive removes it from the public API.
- Admin image upload returns `{url, variants}` and each variant serves 200.
- The storefront loads WebP variants through `srcset` for the hero and products.
- Services render from the seeded rows, and a service detail page resolves.
- Lint, typecheck, tests, and build pass.

## Cutover checklist

1. Create the cloud project.
2. `npx supabase link --project-ref <ref>` and `npx supabase db push`.
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, and `VITE_CONTENT_SOURCE=supabase` in Vercel.
4. Run `npm run cms:seed` with the cloud environment.
5. Deploy.
6. Verify the catalogue, one admin edit, and one inquiry.
7. Run the owner-approved inquiry export and delete procedure for the old documents.

The admin routes write Supabase unconditionally. Do not deploy them while the
public read is still on Sanity. Flip `VITE_CONTENT_SOURCE` in the same deploy.

## Known gaps

- Projects and articles have no CMS documents. Their pages read Supabase when
  the flag is on and show the existing empty states.
- Product rows store the resolved collection name. Renaming a collection needs a
  reseed or an admin save.
- Admin logout still records session revocations in Sanity. Removing Sanity
  entirely means moving that table too.
- The old original images from the first seed remain in the `content` bucket.
  They are unused but public.
- WebP quality is 90. That is visually high quality, not lossless.
