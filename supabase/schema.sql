-- ============================================================
-- ResumeForge — Supabase Schema
-- Run this entire file in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Profiles table
create table if not exists public.profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,
  email                     text,
  tier                      text not null default 'free' check (tier in ('free', 'pro')),
  optimizations_this_month  integer not null default 0,
  month_reset_at            timestamptz not null default date_trunc('month', now()),
  stripe_customer_id        text,
  created_at                timestamptz not null default now()
);

-- 2. Row Level Security
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Atomic usage increment (resets counter if it's a new month)
create or replace function public.increment_optimization_count(user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  current_month timestamptz := date_trunc('month', now());
begin
  update public.profiles
  set
    optimizations_this_month = case
      when month_reset_at < current_month then 1
      else optimizations_this_month + 1
    end,
    month_reset_at = case
      when month_reset_at < current_month then current_month
      else month_reset_at
    end
  where id = user_id;
end;
$$;
