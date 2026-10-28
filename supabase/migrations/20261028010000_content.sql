-- Public catalogue and marketing content. Mirrors Sanity documents as JSONB so
-- the storefront reads the same shapes it reads today.
create table public.content (
  id text primary key,
  type text not null check (type in ('homepage', 'siteSettings', 'product', 'collection', 'service', 'project', 'article', 'faq')),
  slug text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 100,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index content_type_status_idx on public.content (type, status);
create unique index content_type_slug_idx on public.content (type, slug) where slug is not null;

alter table public.content enable row level security;

create policy "published content is public" on public.content
  for select to anon, authenticated
  using (status = 'published');

grant select on public.content to anon, authenticated;
grant all on public.content to service_role;

-- Public by design: these are the same images the storefront serves today.
insert into storage.buckets (id, name, public)
values ('content', 'content', true)
on conflict (id) do update set public = true;

comment on table public.content is 'Public catalogue and marketing content, one row per former Sanity document.';
