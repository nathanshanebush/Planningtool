-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  role text not null default 'viewer' check (role in ('viewer','contributor','editor','admin','super_admin')),
  status text not null default 'invited' check (status in ('invited','active','deactivated')),
  invited_by uuid references profiles(id),
  created_at timestamptz default now(),
  last_login timestamptz
);

-- Dropdown categories
create table dropdown_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Dropdown registry
create table dropdown_registry (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category_id uuid references dropdown_categories(id),
  description text,
  is_system boolean default false,
  created_at timestamptz default now()
);

-- Dropdown options
create table dropdown_options (
  id uuid primary key default uuid_generate_v4(),
  dropdown_id uuid references dropdown_registry(id) on delete cascade,
  label text not null,
  display_order int default 0,
  is_default boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Campaigns
create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  campaign_type text,
  description text,
  start_date date,
  end_date date,
  status text default 'active',
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tactics
create table tactics (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null,
  tactic_type text,
  platform text,
  traffic_source text,
  funnel_step text,
  content_pillar text,
  assigned_to uuid references profiles(id),
  due_date date,
  status text default 'Not Started',
  priority text default 'Medium',
  copy_notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Creative assets
create table creative_assets (
  id uuid primary key default uuid_generate_v4(),
  tactic_id uuid references tactics(id) on delete cascade,
  file_name text not null,
  file_type text,
  file_size bigint,
  storage_path text not null,
  thumbnail_path text,
  uploaded_by uuid references profiles(id),
  uploaded_at timestamptz default now()
);

-- Comments
create table comments (
  id uuid primary key default uuid_generate_v4(),
  tactic_id uuid references tactics(id) on delete cascade,
  user_id uuid references profiles(id),
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Audit log
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  action text not null,
  record_type text,
  record_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- Tactic history
create table tactic_history (
  id uuid primary key default uuid_generate_v4(),
  tactic_id uuid references tactics(id) on delete cascade,
  user_id uuid references profiles(id),
  field_changed text,
  old_value text,
  new_value text,
  changed_at timestamptz default now()
);

-- RLS Policies
alter table profiles enable row level security;
alter table campaigns enable row level security;
alter table tactics enable row level security;
alter table creative_assets enable row level security;
alter table comments enable row level security;
alter table audit_log enable row level security;
alter table dropdown_categories enable row level security;
alter table dropdown_registry enable row level security;
alter table dropdown_options enable row level security;
alter table tactic_history enable row level security;

-- Profiles: users can read all profiles, only update own
create policy "profiles_select" on profiles for select using (auth.uid() is not null);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_admin" on profiles for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
);

-- Campaigns: all authenticated users can view; editors+ can insert/update/delete
create policy "campaigns_select" on campaigns for select using (auth.uid() is not null);
create policy "campaigns_insert" on campaigns for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
);
create policy "campaigns_update" on campaigns for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
);
create policy "campaigns_delete" on campaigns for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
);

-- Tactics: all authenticated can view; editors+ can modify
create policy "tactics_select" on tactics for select using (auth.uid() is not null);
create policy "tactics_insert" on tactics for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
);
create policy "tactics_update" on tactics for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
  or (assigned_to = auth.uid() and exists (select 1 from profiles where id = auth.uid() and role = 'contributor'))
);
create policy "tactics_delete" on tactics for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
);

-- Creative assets: contributors+ can insert; editors+ can delete
create policy "creative_select" on creative_assets for select using (auth.uid() is not null);
create policy "creative_insert" on creative_assets for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('contributor','editor','admin','super_admin'))
);
create policy "creative_delete" on creative_assets for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
);

-- Comments: contributors+ can add; editors+ can delete
create policy "comments_select" on comments for select using (auth.uid() is not null);
create policy "comments_insert" on comments for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('contributor','editor','admin','super_admin'))
);
create policy "comments_delete" on comments for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
);

-- Audit log: only super_admin can read
create policy "audit_select" on audit_log for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'super_admin')
);
create policy "audit_insert" on audit_log for insert with check (auth.uid() is not null);

-- Dropdowns: all auth users can view; admin+ can modify
create policy "dropdown_cat_select" on dropdown_categories for select using (auth.uid() is not null);
create policy "dropdown_cat_modify" on dropdown_categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
);
create policy "dropdown_reg_select" on dropdown_registry for select using (auth.uid() is not null);
create policy "dropdown_reg_modify" on dropdown_registry for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
);
create policy "dropdown_opt_select" on dropdown_options for select using (auth.uid() is not null);
create policy "dropdown_opt_modify" on dropdown_options for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
);

-- Tactic history: editors+ can read
create policy "history_select" on tactic_history for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin','super_admin'))
);
create policy "history_insert" on tactic_history for insert with check (auth.uid() is not null);

-- Trigger: auto-update updated_at on tactics/campaigns
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger tactics_updated_at before update on tactics for each row execute function update_updated_at();
create trigger campaigns_updated_at before update on campaigns for each row execute function update_updated_at();

-- Seed data function (call manually after setup)
create or replace function seed_dropdown_data()
returns void language plpgsql as $$
declare
  cat_campaign uuid; cat_asset uuid; cat_team uuid; cat_platform uuid; cat_status uuid;
  dr_type uuid; dr_traffic uuid; dr_funnel uuid; dr_status uuid; dr_priority uuid;
  dr_tactic uuid; dr_platform uuid; dr_pillar uuid;
begin
  insert into dropdown_categories (name, display_order) values
    ('Campaign Settings', 1), ('Asset & Creative', 2),
    ('Team & Assignment', 3), ('Platform & Channel', 4), ('Status & Priority', 5);
  select id into cat_campaign from dropdown_categories where name = 'Campaign Settings';
  select id into cat_asset from dropdown_categories where name = 'Asset & Creative';
  select id into cat_team from dropdown_categories where name = 'Team & Assignment';
  select id into cat_platform from dropdown_categories where name = 'Platform & Channel';
  select id into cat_status from dropdown_categories where name = 'Status & Priority';

  insert into dropdown_registry (name, category_id, is_system) values ('Campaign Type', cat_campaign, true) returning id into dr_type;
  insert into dropdown_options (dropdown_id, label, display_order) values
    (dr_type, 'Podcast/Webinar', 1),(dr_type, 'Trade Show', 2),(dr_type, 'Blog', 3),
    (dr_type, 'Email/SMS', 4),(dr_type, 'Paid Ads', 5),(dr_type, 'Organic Social', 6);

  insert into dropdown_registry (name, category_id, is_system) values ('Traffic Source', cat_campaign, true) returning id into dr_traffic;
  insert into dropdown_options (dropdown_id, label, display_order) values
    (dr_traffic, 'Paid Ads', 1),(dr_traffic, 'Social Media — Organic', 2),(dr_traffic, 'Email/SMS', 3);

  insert into dropdown_registry (name, category_id, is_system) values ('Funnel Step', cat_campaign, true) returning id into dr_funnel;
  insert into dropdown_options (dropdown_id, label, display_order) values
    (dr_funnel, 'Landing Page', 1),(dr_funnel, 'Thank You Page', 2),(dr_funnel, 'Retargeting Page', 3);

  insert into dropdown_registry (name, category_id, is_system) values ('Asset Status', cat_status, true) returning id into dr_status;
  insert into dropdown_options (dropdown_id, label, display_order) values
    (dr_status, 'Not Started', 1),(dr_status, 'In Progress', 2),(dr_status, 'Needs Review', 3),
    (dr_status, 'Approved', 4),(dr_status, 'Published', 5),(dr_status, 'On Hold', 6);

  insert into dropdown_registry (name, category_id, is_system) values ('Priority', cat_status, true) returning id into dr_priority;
  insert into dropdown_options (dropdown_id, label, display_order) values
    (dr_priority, 'Low', 1),(dr_priority, 'Medium', 2),(dr_priority, 'High', 3),(dr_priority, 'Urgent', 4);

  insert into dropdown_registry (name, category_id, is_system) values ('Tactic Type', cat_asset, true) returning id into dr_tactic;
  insert into dropdown_options (dropdown_id, label, display_order) values
    (dr_tactic, 'Social Media Post', 1),(dr_tactic, 'Email', 2),(dr_tactic, 'SMS', 3),
    (dr_tactic, 'Ad Creative', 4),(dr_tactic, 'Landing Page Copy', 5),(dr_tactic, 'Thank You Page Copy', 6),
    (dr_tactic, 'Retargeting Page Copy', 7),(dr_tactic, 'Blog Post', 8),(dr_tactic, 'Podcast Script', 9),
    (dr_tactic, 'Webinar Slide Deck', 10),(dr_tactic, 'Video Script', 11),(dr_tactic, 'Quote Graphic', 12),
    (dr_tactic, 'LinkedIn Carousel', 13),(dr_tactic, 'Podcast Thumbnail', 14),(dr_tactic, 'Webinar Thumbnail', 15);

  insert into dropdown_registry (name, category_id, is_system) values ('Platform', cat_platform, true) returning id into dr_platform;
  insert into dropdown_options (dropdown_id, label, display_order) values
    (dr_platform, 'LinkedIn', 1),(dr_platform, 'Facebook', 2),(dr_platform, 'Instagram', 3),
    (dr_platform, 'YouTube', 4),(dr_platform, 'Email (GHL)', 5),(dr_platform, 'SMS (GHL)', 6),
    (dr_platform, 'Meta Ads', 7),(dr_platform, 'Google Ads', 8),(dr_platform, 'Buzzsprout', 9),(dr_platform, 'Website', 10);

  insert into dropdown_registry (name, category_id, is_system) values ('Content Pillar', cat_campaign, true) returning id into dr_pillar;
  insert into dropdown_options (dropdown_id, label, display_order) values
    (dr_pillar, 'Pain/Problem Awareness', 1),(dr_pillar, 'Social Proof / Case Study', 2),
    (dr_pillar, 'Education / How-To', 3),(dr_pillar, 'Myth-Bust', 4),
    (dr_pillar, 'Offer / CTA', 5),(dr_pillar, 'Team / Culture', 6);
end; $$;
