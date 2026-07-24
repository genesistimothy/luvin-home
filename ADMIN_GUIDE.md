# LUVIN Admin Panel

The LUVIN Admin Panel is available at `/admin`. Sanity remains the only product content backend; the admin interface reads and writes the existing `product` and `collection` document types through authenticated server-side API routes.

## Authentication

Admin authentication uses Google OAuth. No passwords are stored by LUVIN HOME. A signed, `HttpOnly`, `SameSite=Lax` session cookie is created only when the verified Google email appears in `ADMIN_ALLOWED_EMAILS`.

Create a Google OAuth 2.0 Web application and register these redirect URIs:

- Production: `https://luvin-home.vercel.app/api/auth/callback`
- Local Vercel development: `http://localhost:3000/api/auth/callback`

## Environment variables

Public website variables:

- `VITE_SANITY_PROJECT_ID`
- `VITE_SANITY_DATASET`
- `VITE_SANITY_API_VERSION`

Server-only variables:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_WRITE_TOKEN`
- `ADMIN_ALLOWED_EMAILS` — comma-separated Google emails
- `ADMIN_SESSION_SECRET` — random value of at least 32 characters
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Never prefix the write token, session secret, or Google client secret with `VITE_`. The Sanity token needs permission to create/update documents and upload assets in the production dataset.

## Product workflow

- **Save Draft** writes `drafts.<product-id>` in Sanity and does not change the public website.
- **Publish** writes the canonical product document and removes its draft.
- **Archive** sets the existing product status to `archived`; it does not permanently delete content.
- Images are uploaded directly to the Sanity asset pipeline and referenced by the product document.

## Local development

Use `vercel dev` rather than plain `npm run dev` when testing authentication and API routes. The public Vite website can still be run with `npm run dev` when admin APIs are not needed.
