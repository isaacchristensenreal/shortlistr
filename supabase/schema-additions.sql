-- ============================================================
-- ShortListr — Schema Additions
-- Run this in: Supabase Dashboard > SQL Editor
-- These additions extend the existing schema without breaking anything.
-- ============================================================

-- 1. Add new columns to profiles
alter table public.profiles
  add column if not exists salary_negotiator_unlocked boolean not null default false,
  add column if not exists username text,
  add column if not exists avatar_url text;

-- 2. user_usage table — daily scan rate limiting
create table if not exists public.user_usage (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  scan_count      integer not null default 0,
  last_reset_date date not null default current_date,
  created_at      timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_usage enable row level security;
create policy "Users can read own usage"  on public.user_usage for select using (auth.uid() = user_id);
create policy "Users can update own usage" on public.user_usage for update using (auth.uid() = user_id);

-- Service role can insert/update usage (edge functions use service role key)
create policy "Service can manage usage" on public.user_usage for all using (true) with check (true);

-- 3. scans table — stores every scan with all AI outputs
create table if not exists public.scans (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  resume_text         text,
  job_description     text,
  ats_score           integer,
  rejection_reasons   jsonb,
  detected_ats        jsonb,
  job_matches         jsonb,
  interview_questions jsonb,
  optimized_resume    jsonb,
  created_at          timestamptz not null default now()
);

alter table public.scans enable row level security;
create policy "Users can read own scans" on public.scans for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on public.scans for insert with check (auth.uid() = user_id);
create policy "Service can manage scans" on public.scans for all using (true) with check (true);

-- 4. Update saved_resumes to add before_score for transformation card
alter table public.saved_resumes
  add column if not exists before_score integer,
  add column if not exists resume_name  text,
  add column if not exists best_score   integer;

-- 5. Function to check and increment daily usage (for rate limiting)
create or replace function public.check_and_increment_usage(p_user_id uuid, p_is_pro boolean)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_usage public.user_usage%rowtype;
  v_limit integer := case when p_is_pro then 999 else 3 end;
begin
  -- Upsert usage row
  insert into public.user_usage (user_id, scan_count, last_reset_date)
  values (p_user_id, 0, current_date)
  on conflict (user_id) do nothing;

  -- Fetch current usage
  select * into v_usage from public.user_usage where user_id = p_user_id;

  -- Reset if new day
  if v_usage.last_reset_date < current_date then
    update public.user_usage
    set scan_count = 0, last_reset_date = current_date
    where user_id = p_user_id;
    v_usage.scan_count := 0;
  end if;

  -- Check limit
  if v_usage.scan_count >= v_limit then
    return jsonb_build_object('allowed', false, 'count', v_usage.scan_count, 'limit', v_limit);
  end if;

  -- Increment
  update public.user_usage set scan_count = scan_count + 1 where user_id = p_user_id;

  return jsonb_build_object('allowed', true, 'count', v_usage.scan_count + 1, 'limit', v_limit);
end;
$$;
