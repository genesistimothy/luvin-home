-- Admin sessions are stateless signed cookies. Logout records the token id (jti)
-- here so requireAdmin can reject a copied token. Rows carry the token's expiry
-- so they can be pruned. Service role only: no public policy exists.
create table public.session_revocations (
  jti text primary key,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.session_revocations enable row level security;
revoke all on public.session_revocations from anon, authenticated;
grant all on public.session_revocations to service_role;

create index session_revocations_expires_at_idx on public.session_revocations (expires_at);

comment on table public.session_revocations is 'Revoked admin session ids. Service-role only.';
