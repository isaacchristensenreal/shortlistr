-- ============================================================
-- B2B Pivot: RLS policies for coaches / clients / client-keyed resumes
-- All tables below have RLS enabled with NO policies by default
-- (Postgres RLS default-denies every row when enabled with zero
-- policies), so until this file runs, coaches/clients/resume_versions
-- are unreadable and unwritable by anyone except the service role.
-- ============================================================

-- 1. Coaches can read/update their own account row only.
create policy "Coaches can read own account"
  on public.coaches for select
  using (auth.uid() = id);

create policy "Coaches can update own account"
  on public.coaches for update
  using (auth.uid() = id);

-- 2. Clients belong to exactly one coach; that coach has full CRUD,
--    nobody else can see or touch them.
create policy "Coaches can read own clients"
  on public.clients for select
  using (coach_id = auth.uid());

create policy "Coaches can insert own clients"
  on public.clients for insert
  with check (coach_id = auth.uid());

create policy "Coaches can update own clients"
  on public.clients for update
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy "Coaches can delete own clients"
  on public.clients for delete
  using (coach_id = auth.uid());

-- 3. saved_resumes: access is via the owning client's coach, i.e.
--    saved_resumes.client_id -> clients.coach_id = auth.uid().
--    Ensure RLS is actually on (it predates this migration and isn't
--    guaranteed to already be enabled).
alter table public.saved_resumes enable row level security;

-- Drop every pre-existing policy on this table by name (not guessed —
-- these predate this repo's migrations and were created by hand in the
-- dashboard, so their exact names aren't known). RLS policies are OR'd
-- together, so leaving even one old "auth.uid() = user_id_deprecated"
-- policy in place would let the original individual owner keep direct
-- access alongside the new coach-scoped policies. Clearing all of them
-- first guarantees the table is default-deny before we re-grant access.
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'saved_resumes'
  loop
    execute format('drop policy %I on public.saved_resumes', pol.policyname);
  end loop;
end $$;

create policy "Coaches can read client resumes"
  on public.saved_resumes for select
  using (
    client_id in (select id from public.clients where coach_id = auth.uid())
  );

create policy "Coaches can insert client resumes"
  on public.saved_resumes for insert
  with check (
    client_id in (select id from public.clients where coach_id = auth.uid())
  );

create policy "Coaches can update client resumes"
  on public.saved_resumes for update
  using (
    client_id in (select id from public.clients where coach_id = auth.uid())
  )
  with check (
    client_id in (select id from public.clients where coach_id = auth.uid())
  );

create policy "Coaches can delete client resumes"
  on public.saved_resumes for delete
  using (
    client_id in (select id from public.clients where coach_id = auth.uid())
  );

-- Service role (edge functions) bypasses RLS entirely, so no separate
-- "service can manage" policy is needed here, unlike the legacy
-- scans/user_usage policies which predate this convention.

-- 4. resume_versions: same coach-via-client-via-resume chain.
create policy "Coaches can read own resume versions"
  on public.resume_versions for select
  using (
    resume_id in (
      select sr.id from public.saved_resumes sr
      join public.clients c on c.id = sr.client_id
      where c.coach_id = auth.uid()
    )
  );

create policy "Coaches can insert own resume versions"
  on public.resume_versions for insert
  with check (
    resume_id in (
      select sr.id from public.saved_resumes sr
      join public.clients c on c.id = sr.client_id
      where c.coach_id = auth.uid()
    )
  );

-- No update/delete policy on resume_versions: version history is
-- intentionally append-only.

-- Default-deny check: every table above has RLS enabled, and every
-- policy created here is scoped with `using`/`with check` tied to
-- auth.uid() (no `using (true)` permissive policy was added). A
-- logged-out request or a coach querying another coach's data has zero
-- matching policies and gets zero rows, per Postgres RLS semantics.
