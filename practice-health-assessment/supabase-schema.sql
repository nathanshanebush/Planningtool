-- ============================================================
-- Practice Health Assessment — Supabase schema
--
-- Run once: Supabase dashboard → SQL Editor → New query → paste
-- this whole file → Run. Safe to re-run (uses IF NOT EXISTS /
-- CREATE OR REPLACE throughout).
--
-- After running this, create your own login:
--   Authentication → Users → Add user → your email + a password.
-- That's the only account allowed into dashboard.html.
-- ============================================================

create extension if not exists "pgcrypto";

-- One row per presentation/event. Nathan creates these from the
-- Sessions tab in dashboard.html; the slug is what attendees and
-- the live screen use to tag/find responses.
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- One row per completed assessment. session_slug is plain text
-- (not a foreign key) so an attendee's browser can insert a result
-- without ever needing read access to the sessions table.
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  session_slug text not null default 'general',
  name text not null,
  email text not null,
  phone text,
  title text,
  organization text,
  practice_type text,
  leadership_score int not null,
  operational_score int not null,
  communication_score int not null,
  staffing_score int not null,
  technology_score int not null,
  financial_score int not null,
  overall_score int not null,
  created_at timestamptz not null default now()
);

create index if not exists submissions_session_slug_idx on submissions (session_slug);
create index if not exists submissions_created_at_idx on submissions (created_at);

alter table sessions enable row level security;
alter table submissions enable row level security;

drop policy if exists "public sessions are readable" on sessions;
drop policy if exists "authenticated full access to sessions" on sessions;
drop policy if exists "anyone can submit a result" on submissions;
drop policy if exists "authenticated can read submissions" on submissions;
drop policy if exists "authenticated can manage submissions" on submissions;
drop policy if exists "authenticated can delete submissions" on submissions;

-- SESSIONS
-- Anyone can see a session marked public — this is only ever the
-- name/slug/is_public flag (no attendee data lives on this table),
-- and it's what lets the unauthenticated Live screen resolve a slug.
create policy "public sessions are readable" on sessions
  for select using (is_public = true);

-- Only Nathan (logged in) can create, edit, or see private sessions.
create policy "authenticated full access to sessions" on sessions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- SUBMISSIONS
-- Any attendee (anonymous) can insert their own result — that's the
-- assessment app saving what it just scored. Nothing anonymous can
-- ever read, edit, or delete a row, so names/emails/phones stay private.
create policy "anyone can submit a result" on submissions
  for insert with check (true);

create policy "authenticated can read submissions" on submissions
  for select using (auth.role() = 'authenticated');

create policy "authenticated can manage submissions" on submissions
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can delete submissions" on submissions
  for delete using (auth.role() = 'authenticated');

-- Public, PII-free aggregate for the projector/Live screen. This is
-- the ONLY way an unauthenticated visitor can read anything derived
-- from submissions — raw rows (names, emails, phones) are never
-- reachable without logging in. SECURITY DEFINER lets it bypass RLS
-- internally, but it only ever returns rounded averages and counts.
create or replace function get_session_aggregate(p_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  is_pub boolean;
  sess_name text;
begin
  select is_public, name into is_pub, sess_name from sessions where slug = p_slug;

  if is_pub is null or is_pub = false then
    return json_build_object('error', 'not_found');
  end if;

  select json_build_object(
    'session_name', sess_name,
    'response_count', count(*),
    'dims', json_build_object(
      'leadership',    coalesce(round(avg(leadership_score)), 0),
      'operational',   coalesce(round(avg(operational_score)), 0),
      'communication', coalesce(round(avg(communication_score)), 0),
      'staffing',      coalesce(round(avg(staffing_score)), 0),
      'technology',    coalesce(round(avg(technology_score)), 0),
      'financial',     coalesce(round(avg(financial_score)), 0)
    ),
    'overall', coalesce(round(avg(overall_score)), 0),
    'tier_dist', json_build_object(
      'Strong',   count(*) filter (where overall_score >= 80),
      'Building', count(*) filter (where overall_score >= 60 and overall_score < 80),
      'Strained', count(*) filter (where overall_score >= 40 and overall_score < 60),
      'Critical', count(*) filter (where overall_score < 40)
    )
  ) into result
  from submissions
  where session_slug = p_slug;

  return result;
end;
$$;

grant execute on function get_session_aggregate(text) to anon, authenticated;
grant select on sessions to anon;
grant insert on submissions to anon, authenticated;
grant select, update, delete on submissions to authenticated;
grant all on sessions to authenticated;

-- Public, PII-free "brag stat" — cumulative numbers across every session
-- ever run, regardless of is_public. This is the proprietary-dataset
-- number (e.g. "2,340 practice owners across 41 sessions") — safe to
-- show on the projector because it's a blanket total, not tied to any
-- one room or person.
create or replace function get_global_benchmark()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'response_count', count(*),
    'session_count', count(distinct session_slug),
    'dims', json_build_object(
      'leadership',    coalesce(round(avg(leadership_score)), 0),
      'operational',   coalesce(round(avg(operational_score)), 0),
      'communication', coalesce(round(avg(communication_score)), 0),
      'staffing',      coalesce(round(avg(staffing_score)), 0),
      'technology',    coalesce(round(avg(technology_score)), 0),
      'financial',     coalesce(round(avg(financial_score)), 0)
    ),
    'overall', coalesce(round(avg(overall_score)), 0)
  ) into result
  from submissions;

  return result;
end;
$$;

grant execute on function get_global_benchmark() to anon, authenticated;
