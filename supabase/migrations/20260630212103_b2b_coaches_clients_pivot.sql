-- ============================================================
-- B2B Pivot: coaches, clients, client-keyed resumes, version history
-- Career coaches (not individual job seekers) are now the paying account;
-- each coach manages many clients, each client has resumes.
-- ============================================================

-- 1. Coaches — the paying account. 1:1 with auth.users, same identity
--    pattern as public.profiles (id = auth.uid()).
create table if not exists public.coaches (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text,
  stripe_customer_id  text,
  plan                text not null default 'trialing',
  created_at          timestamptz not null default now()
);

-- Backfill: every existing user becomes a coach account.
insert into public.coaches (id, email, stripe_customer_id, created_at)
select id, email, stripe_customer_id, created_at
from public.profiles
on conflict (id) do nothing;

-- 2. Clients — belong to a coach.
create table if not exists public.clients (
  id                uuid primary key default gen_random_uuid(),
  coach_id          uuid not null references public.coaches(id) on delete cascade,
  name              text not null,
  contact_email     text,
  status            text not null default 'active' check (status in ('active', 'placed', 'inactive')),
  created_at        timestamptz not null default now(),
  last_activity_at  timestamptz not null default now()
);

create index if not exists clients_coach_id_idx on public.clients(coach_id);

-- 3. Re-key saved_resumes off client_id instead of user_id.
--    Old column is renamed (not dropped) so existing data is preserved
--    until the app is fully cut over; it is no longer written to going
--    forward.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'saved_resumes' and column_name = 'user_id'
  ) then
    alter table public.saved_resumes rename column user_id to user_id_deprecated;
    alter table public.saved_resumes alter column user_id_deprecated drop not null;
    comment on column public.saved_resumes.user_id_deprecated is
      'Deprecated by the B2B pivot — superseded by client_id. Kept for backfill/audit only, no longer written to.';
  end if;
end $$;

alter table public.saved_resumes
  add column if not exists client_id uuid references public.clients(id) on delete cascade;

create index if not exists saved_resumes_client_id_idx on public.saved_resumes(client_id);

-- 4. Resume version history — one row per snapshot of a resume.
create table if not exists public.resume_versions (
  id          uuid primary key default gen_random_uuid(),
  resume_id   uuid not null references public.saved_resumes(id) on delete cascade,
  resume_data jsonb not null,
  ats_score   integer,
  created_at  timestamptz not null default now()
);

create index if not exists resume_versions_resume_id_idx on public.resume_versions(resume_id);

-- 5. New signups must get a coaches row too, not just a profiles row,
--    or RLS joins through coaches will find nothing for them.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  insert into public.coaches (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 6. Lock down the new tables by default; explicit policies are added
--    in the next migration (RLS pass). Enabling RLS with no policies
--    yet defined means nobody — including via the anon/auth role — can
--    read or write until policies are explicitly granted.
alter table public.coaches enable row level security;
alter table public.clients enable row level security;
alter table public.resume_versions enable row level security;
