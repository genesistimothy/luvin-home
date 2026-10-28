# Prompt: move Luvin Home production to Supabase

Copy this file into the agent that will run the cutover. The operator does only
the account steps marked **Operator**. The agent does everything else. Do not
paste any secret into the chat.

## Your goal

Move the production catalogue, images, and inquiries from Sanity to a new cloud
Supabase project, then deploy the site without breaking it. Production stays on
Sanity until the Supabase seed and preflight pass. If anything is uncertain,
stop and report instead of guessing.

## Read first

- `AGENTS.md`
- `docs/qa/supabase-content-migration.md`
- `docs/qa/c2-inquiry-export-runbook.md` (separate approval, run last)
- `vercel.json`
- `.env.example`

## Hard rules

- Never print or commit a secret. The operator puts secrets in `.env.cloud` and
  in Vercel. You read them from the environment.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in a `VITE_` variable.
- Never run `supabase db reset` against the cloud project.
- Never deploy the local `dist` folder. Vercel builds from git.
- Never delete Sanity content or inquiry documents without explicit approval.
- Do not set `VITE_CONTENT_SOURCE=supabase` in Vercel until the preflight passes.
- The admin routes write Supabase unconditionally. Do not deploy them while
  production reads Sanity. The flag and the deploy go together.

## Step 1: Operator creates the project

**Operator.** In the Supabase dashboard:

1. Create a project on the Free plan. Use the region closest to the users.
2. Save the database password in the password manager.
3. Open **Project Settings**, then **API**.
4. Collect the **Project URL**, the **anon or publishable key**, and the
   **service_role** secret.

Give the agent the project ref only. Put the keys in `.env.cloud` yourself.

## Step 2: Build `.env.cloud`

**Operator.** Copy `.env.example` to `.env.cloud` and fill:

```
VITE_SANITY_PROJECT_ID=p3ihfsxq
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2025-02-19
SANITY_PROJECT_ID=p3ihfsxq
SANITY_DATASET=production
SANITY_API_VERSION=2025-02-19
SANITY_WRITE_TOKEN=

ADMIN_ALLOWED_EMAILS=<same as production>
ADMIN_SESSION_SECRET=<same as production>
GOOGLE_CLIENT_ID=<same as production>
GOOGLE_CLIENT_SECRET=<same as production>
VITE_TURNSTILE_SITE_KEY=<same as production>
TURNSTILE_SECRET_KEY=<same as production>

SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role>
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon or publishable>
VITE_CONTENT_SOURCE=supabase

# CLI only, not used by the app. Create the token in Supabase account settings.
SUPABASE_ACCESS_TOKEN=
SUPABASE_DB_PASSWORD=
```

Copy the existing `ADMIN_*`, `GOOGLE_*`, `TURNSTILE_*`, and `SANITY_*` values
from Vercel, **Settings**, **Environment Variables**. `.env.*` is gitignored.
Do not commit this file.

## Step 3: Link and migrate

**Agent.** Confirm the repo root, then:

```bash
npm ci
set -a; source .env.cloud; set +a
npx supabase link --project-ref <ref> --password "$SUPABASE_DB_PASSWORD"
npx supabase db push --password "$SUPABASE_DB_PASSWORD"
```

The access token and database password come from `.env.cloud`. If the operator
cannot create an access token, run `npx supabase login` interactively instead
and let the operator approve the browser prompt. Do not ask for the account
password.

Verify the cloud project has:

- tables `public.content` and `public.inquiries`
- a public storage bucket `content`
- a private storage bucket `inquiries`
- RLS enabled on both tables

If any are missing, stop. Do not continue with a partial schema.

## Step 4: Seed the cloud

**Agent.**

```bash
npm run cms:seed:cloud
```

Expect 19 rows: 1 homepage, 1 site settings, 3 collections, 6 products, 4 FAQs,
4 services. Expect WebP variants for the images. The seed reads Sanity's public
API and is safe to rerun. It upserts.

If the seed fails, stop and report the error. Do not deploy.

## Step 5: Preflight

**Agent.**

```bash
npm run preflight:cloud
```

It must print `Preflight passed.` It checks the env, that both Supabase URLs are
the same cloud project, that no `VITE_` var holds the service key, that public
content is readable, that inquiries are private, that the service role can read
inquiries, and that both buckets have the right visibility.

If it fails, fix the cause and rerun. Do not deploy.

## Step 6: Production build check

**Agent.**

```bash
npm run build:cloud
grep -R "127.0.0.1:54321\|localhost:54321" dist/assets
```

The grep must print nothing. If it finds a local URL, the build used the wrong
env file. Stop.

Also run:

```bash
npm run lint
npm run typecheck
npm test
```

All must pass.

## Step 7: Vercel environment

**Operator.** In Vercel, open the project, **Settings**, **Environment
Variables**. Add these for **Production** with the same values as `.env.cloud`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CONTENT_SOURCE=supabase`

Keep the existing `SANITY_*`, `ADMIN_*`, `GOOGLE_*`, and `TURNSTILE_*` values.
Do not add the Supabase values to **Preview** unless previews use a separate
Supabase project. A preview that uses production will create real inquiry rows.

`VITE_` values are baked at build time. Changing them needs a redeploy.

## Step 8: Deploy a preview first

**Agent.** Create a preview deployment from the branch. On the preview URL:

1. Load the home page. The hero image URL must contain `supabase.co`.
2. Load `/products`. Six products. Image URLs must contain `supabase.co`.
3. Load `/services`. Four services.
4. Open the browser console. There must be no CSP error for Supabase.
5. Load `/admin`. The Google login must work. Do not save a product on preview
   if it points at production.
6. Do not submit the contact form on preview unless a real inquiry row is
   acceptable.

If any check fails, stop and report. Do not promote.

## Step 9: Deploy production

**Operator.** Promote the verified preview or redeploy production from the main
branch. Watch the build logs.

**Agent.** After the deploy:

1. `curl -s https://<domain>/api/keepalive` returns `{"ok":true}`.
2. Home, products, and services load from Supabase. Check one image URL.
3. Log in to `/admin`. Create a test product, save it as a draft, confirm it is
   missing from `/products`, publish it, confirm it appears, then archive it and
   confirm it disappears.
4. Submit one test inquiry through the contact form. Confirm the row exists in
   the Supabase `inquiries` table and the private `inquiries` bucket if a photo
   was attached. Delete the test row and the test object from Supabase Studio.
5. Confirm the Vercel cron for `/api/keepalive` exists.

Record the deploy URL, the test product id, and the test inquiry id in the
handoff note. Do not record secrets or customer data.

## Step 10: Handoff and cleanup

The cutover is done when all Step 9 checks pass.

Separate, later work:

- Export and delete the old Sanity inquiry documents. Run
  `docs/qa/c2-inquiry-export-runbook.md` only with `SANITY_WRITE_TOKEN` and
  explicit owner approval.
- Remove the Sanity read path and the Sanity CSP entries after a stable period.
- Move session revocations off Sanity before deleting `SANITY_WRITE_TOKEN`.

## Rollback

If production breaks after the deploy:

1. In Vercel, set `VITE_CONTENT_SOURCE=sanity` and redeploy. The site reads
   Sanity again. The catalogue is unchanged.
2. Do not use the admin while rolled back. It writes Supabase, so edits will not
   appear on the Sanity-backed site.
3. If the deploy itself is bad, promote the previous deployment.
4. The Supabase data stays. Do not delete the project or the tables.

Rollback does not recover inquiries submitted between the deploy and the
rollback. They are in Supabase and remain there.

## Stop conditions

Stop and report if any of these happen:

- `db push` fails or the tables or buckets are missing.
- The seed does not produce 19 rows or image variants.
- The preflight fails.
- The build contains `127.0.0.1` or `localhost`.
- The preview has a CSP error, a missing image, or the wrong product count.
- The admin login or product save fails.
- An anonymous request can read `inquiries`.
- `/api/keepalive` does not return `{"ok":true}`.

## Definition of done

Production reads the catalogue and images from Supabase, the admin writes
Supabase, a test inquiry lands in the private table, the keepalive endpoint
works, and the rollback path is written down.
