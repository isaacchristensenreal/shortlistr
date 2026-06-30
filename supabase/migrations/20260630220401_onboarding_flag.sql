-- ============================================================
-- Durable onboarding-once flag
-- Replaces the localStorage + 5-minute-account-age heuristic that
-- gated the /welcome wizard with a real per-account flag, so
-- onboarding reliably runs exactly once, at account creation —
-- and never again, regardless of device or plan status.
-- ============================================================

alter table public.profiles
  add column if not exists onboarded boolean not null default false;

-- Backfill: anyone who already has an account before this migration
-- has, by definition, already been through (or skipped) signup —
-- they should never see the onboarding wizard again. New rows created
-- after this migration get the column default (false), which is what
-- correctly triggers onboarding for genuinely new signups.
update public.profiles set onboarded = true where onboarded = false;
