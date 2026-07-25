-- Vendor Module: Complete Schema
-- Run this in Supabase SQL Editor to set up all vendor-related tables.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type vendor_status as enum ('pending', 'under_review', 'approved', 'rejected', 'suspended');
create type product_status as enum ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended', 'archived');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired');
create type price_model as enum ('free', 'paid', 'freemium', 'contact');
create type media_type as enum ('image', 'video', 'embed');
create type analytics_event_type as enum ('impression', 'click', 'bookmark', 'save', 'outbound_click', 'lead_capture', 'share');
create type team_role as enum ('owner', 'admin', 'editor', 'viewer');

-- ============================================================
-- 1. PROFILES — extends auth.users
-- ============================================================

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  bio           text,
  website       text,
  role          text not null default 'user' check (role in ('user', 'vendor', 'admin')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. VENDOR PLANS — plan definitions (seeded by admin)
-- ============================================================

create table if not exists public.vendor_plans (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text unique not null,
  description       text,
  price_monthly     numeric(10,2) default 0,
  price_yearly      numeric(10,2) default 0,
  max_listings      int default 5,
  max_team_members  int default 1,
  analytics_enabled boolean default false,
  leads_enabled     boolean default false,
  featured_listing  boolean default false,
  stripe_price_id_monthly text,
  stripe_price_id_yearly  text,
  is_active         boolean default true,
  sort_order        int default 0,
  created_at        timestamptz default now()
);

-- Seed default plans
insert into public.vendor_plans (name, slug, description, price_monthly, max_listings, analytics_enabled, leads_enabled, sort_order)
values
  ('Free', 'free', 'List up to 1 product. Basic visibility.', 0, 1, false, false, 1),
  ('Starter', 'starter', 'List up to 5 products with basic analytics.', 9.99, 5, true, false, 2),
  ('Pro', 'pro', 'List up to 25 products with analytics and lead capture.', 29.99, 25, true, true, 3),
  ('Enterprise', 'enterprise', 'Unlimited listings, priority support, team members.', 99.99, 999, true, true, 4)
on conflict (slug) do nothing;

-- ============================================================
-- 3. VENDOR SUBSCRIPTIONS — billing state
-- ============================================================

create table if not exists public.vendor_subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  vendor_id           uuid not null references auth.users(id) on delete cascade,
  plan_id             uuid not null references public.vendor_plans(id),
  status              subscription_status not null default 'incomplete',
  stripe_subscription_id text unique,
  stripe_customer_id     text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean default false,
  trial_end              timestamptz,
  billing_interval       text check (billing_interval in ('month', 'year')),
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create index if not exists idx_vendor_subscriptions_vendor on public.vendor_subscriptions(vendor_id);

-- ============================================================
-- 4. VENDORS — vendor profiles
-- ============================================================

create table if not exists public.vendors (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  brand_name      text not null,
  slug            text unique not null,
  logo_url        text,
  cover_url       text,
  bio             text,
  website         text,
  support_email   text,
  social_links    jsonb default '{}'::jsonb,
  contact_email   text,
  status          vendor_status not null default 'pending',
  rejection_reason text,
  reviewed_by     uuid references auth.users(id),
  reviewed_at     timestamptz,
  total_products  int default 0,
  total_views     int default 0,
  seo_title       text,
  seo_description text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_vendors_slug on public.vendors(slug);
create index if not exists idx_vendors_status on public.vendors(status);
create index if not exists idx_vendors_user on public.vendors(user_id);

-- ============================================================
-- 5. VENDOR TEAM MEMBERS (future use)
-- ============================================================

create table if not exists public.vendor_team_members (
  id          uuid primary key default uuid_generate_v4(),
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        team_role not null default 'editor',
  invited_at  timestamptz default now(),
  joined_at   timestamptz,
  created_at  timestamptz default now(),
  unique(vendor_id, user_id)
);

-- ============================================================
-- 6. PRODUCT CATEGORIES
-- ============================================================

create table if not exists public.product_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  icon        text,
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Seed default categories
insert into public.product_categories (name, slug, description, sort_order) values
  ('AI Tool', 'ai-tool', 'AI-powered software and tools', 1),
  ('Course', 'course', 'Online courses and educational content', 2),
  ('Ebook', 'ebook', 'Digital books and guides', 3),
  ('Template', 'template', 'Templates for various use cases', 4),
  ('Plugin', 'plugin', 'Browser extensions, plugins, and add-ons', 5),
  ('Design Asset', 'design-asset', 'Icons, illustrations, UI kits, and design resources', 6),
  ('Audio', 'audio', 'Music, sound effects, and audio resources', 7),
  ('Video', 'video', 'Video content, stock footage, and animations', 8),
  ('SaaS', 'saas', 'Software as a Service products', 9),
  ('Other', 'other', 'Other digital products', 10)
on conflict (slug) do nothing;

-- ============================================================
-- 7. DIGITAL PRODUCTS — main listing table
-- ============================================================

create table if not exists public.digital_products (
  id                uuid primary key default uuid_generate_v4(),
  vendor_id         uuid not null references public.vendors(id) on delete cascade,
  title             text not null,
  slug              text not null,
  short_description text,
  full_description  text,
  category_id       uuid references public.product_categories(id),
  tags              text[] default '{}',
  price_model       price_model not null default 'paid',
  price             numeric(10,2),
  external_sales_link text,
  demo_url          text,
  cover_image       text,
  status            product_status not null default 'draft',
  rejection_reason  text,
  reviewed_by       uuid references auth.users(id),
  reviewed_at       timestamptz,
  featured          boolean default false,
  is_approved       boolean default false,
  seo_title         text,
  seo_description   text,
  total_views       int default 0,
  total_clicks      int default 0,
  total_saves       int default 0,
  total_leads       int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(vendor_id, slug)
);

create index if not exists idx_digital_products_vendor on public.digital_products(vendor_id);
create index if not exists idx_digital_products_slug on public.digital_products(slug);
create index if not exists idx_digital_products_status on public.digital_products(status);
create index if not exists idx_digital_products_category on public.digital_products(category_id);
create index if not exists idx_digital_products_approved on public.digital_products(is_approved) where is_approved = true;

-- ============================================================
-- 8. DIGITAL PRODUCT MEDIA — gallery
-- ============================================================

create table if not exists public.digital_product_media (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.digital_products(id) on delete cascade,
  url         text not null,
  type        media_type not null default 'image',
  alt_text    text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

create index if not exists idx_product_media_product on public.digital_product_media(product_id);

-- ============================================================
-- 9. DIGITAL PRODUCT FILES (downloads)
-- ============================================================

create table if not exists public.digital_product_files (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.digital_products(id) on delete cascade,
  name        text not null,
  description text,
  url         text not null,
  file_size   bigint,
  mime_type   text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

create index if not exists idx_product_files_product on public.digital_product_files(product_id);

-- ============================================================
-- 10. VENDOR LEADS — customer inquiries
-- ============================================================

create table if not exists public.vendor_leads (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.digital_products(id) on delete cascade,
  vendor_id     uuid not null references public.vendors(id) on delete cascade,
  name          text not null,
  email         text not null,
  phone         text,
  message       text,
  metadata      jsonb default '{}'::jsonb,
  read          boolean default false,
  created_at    timestamptz default now()
);

create index if not exists idx_vendor_leads_vendor on public.vendor_leads(vendor_id);
create index if not exists idx_vendor_leads_product on public.vendor_leads(product_id);

-- ============================================================
-- 11. PRODUCT ANALYTICS EVENTS
-- ============================================================

create table if not exists public.product_analytics_events (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.digital_products(id) on delete cascade,
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  event_type  analytics_event_type not null,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

create index if not exists idx_analytics_product on public.product_analytics_events(product_id);
create index if not exists idx_analytics_vendor on public.product_analytics_events(vendor_id);
create index if not exists idx_analytics_event_type on public.product_analytics_events(event_type);
create index if not exists idx_analytics_created on public.product_analytics_events(created_at);

-- Daily aggregate table for fast dashboard queries
create table if not exists public.product_analytics_daily (
  product_id  uuid not null references public.digital_products(id) on delete cascade,
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  date        date not null,
  impressions int default 0,
  clicks      int default 0,
  bookmarks   int default 0,
  saves       int default 0,
  outbound_clicks int default 0,
  leads       int default 0,
  primary key (product_id, date)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.vendor_plans enable row level security;
alter table public.vendor_subscriptions enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_team_members enable row level security;
alter table public.digital_products enable row level security;
alter table public.digital_product_media enable row level security;
alter table public.digital_product_files enable row level security;
alter table public.product_categories enable row level security;
alter table public.vendor_leads enable row level security;
alter table public.product_analytics_events enable row level security;
alter table public.product_analytics_daily enable row level security;

-- Profiles
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

-- Vendor plans (public read)
create policy plans_select_public on public.vendor_plans for select using (true);

-- Subscriptions (vendor reads own)
create policy subs_select_own on public.vendor_subscriptions for select using (vendor_id = auth.uid());

-- Vendors: approved visible publicly; owner manages own
create policy vendors_select_public on public.vendors for select using (status = 'approved');
create policy vendors_select_own on public.vendors for select using (user_id = auth.uid());
create policy vendors_insert_own on public.vendors for insert with check (user_id = auth.uid());
create policy vendors_update_own on public.vendors for update using (user_id = auth.uid());

-- Digital Products: approved visible publicly; vendor manages own
create policy products_select_public on public.digital_products for select using (is_approved = true);
create policy products_select_own on public.digital_products for select using (vendor_id in (select id from public.vendors where user_id = auth.uid()));
create policy products_insert_own on public.digital_products for insert with check (vendor_id in (select id from public.vendors where user_id = auth.uid()));
create policy products_update_own on public.digital_products for update using (vendor_id in (select id from public.vendors where user_id = auth.uid()));
create policy products_delete_own on public.digital_products for delete using (vendor_id in (select id from public.vendors where user_id = auth.uid()));

-- Product media/files: public reads approved; vendor manages own
create policy media_select_public on public.digital_product_media for select using (
  product_id in (select id from public.digital_products where is_approved = true)
  or
  product_id in (select id from public.digital_products where vendor_id in (select id from public.vendors where user_id = auth.uid()))
);
create policy media_insert_own on public.digital_product_media for insert with check (
  product_id in (select id from public.digital_products where vendor_id in (select id from public.vendors where user_id = auth.uid()))
);

create policy files_select_public on public.digital_product_files for select using (
  product_id in (select id from public.digital_products where is_approved = true)
  or
  product_id in (select id from public.digital_products where vendor_id in (select id from public.vendors where user_id = auth.uid()))
);

-- Categories (public read)
create policy categories_select_public on public.product_categories for select using (true);

-- Leads: public insert (anyone can submit); vendor reads own
create policy leads_insert_public on public.vendor_leads for insert with check (true);
create policy leads_select_own on public.vendor_leads for select using (vendor_id in (select id from public.vendors where user_id = auth.uid()));
create policy leads_update_own on public.vendor_leads for update using (vendor_id in (select id from public.vendors where user_id = auth.uid()));

-- Analytics: vendor reads own
create policy analytics_select_own on public.product_analytics_events for select using (vendor_id in (select id from public.vendors where user_id = auth.uid()));

-- Analytics daily
create policy analytics_daily_select_own on public.product_analytics_daily for select using (vendor_id in (select id from public.vendors where user_id = auth.uid()));

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Update total_products count on vendors when product status changes
create or replace function public.update_vendor_product_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.vendors set total_products = total_products + 1 where id = new.vendor_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.vendors set total_products = total_products - 1 where id = old.vendor_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_update_vendor_product_count on public.digital_products;
create trigger trg_update_vendor_product_count
  after insert or delete on public.digital_products
  for each row execute function public.update_vendor_product_count();

-- Auto-update is_approved when status changes to approved
create or replace function public.sync_product_approval()
returns trigger as $$
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    new.is_approved = true;
  elsif new.status is distinct from 'approved' and old.status = 'approved' then
    new.is_approved = false;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_product_approval on public.digital_products;
create trigger trg_sync_product_approval
  before update on public.digital_products
  for each row execute function public.sync_product_approval();