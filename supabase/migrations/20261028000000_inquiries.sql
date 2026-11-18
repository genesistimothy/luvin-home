-- Customer inquiries hold PII. The service role is the only writer and reader.
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('contact', 'service')),
  name text not null,
  contact text not null,
  message text not null default '',
  room_type text,
  budget_range text,
  service_name text,
  service_slug text,
  reference_image_path text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);

alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant all on public.inquiries to service_role;

create index inquiries_created_at_idx on public.inquiries (created_at desc);

-- Private bucket. Objects are readable only through the service role.
insert into storage.buckets (id, name, public)
values ('inquiries', 'inquiries', false)
on conflict (id) do update set public = false;

comment on table public.inquiries is 'Customer inquiries. PII, service-role only.';
