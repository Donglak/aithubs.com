-- supabase/migrations/20240101000006_vendor_trial_analytics.sql
-- 1) Dùng thử 14 ngày cho vendor mới (không cần thẻ), tối đa 3 listing, mỗi tài khoản 1 lần.
-- 2) Tổng hợp sự kiện analytics vào product_analytics_daily + bộ đếm trên sản phẩm
--    (trước đây không có gì ghi vào các bảng này nên dashboard luôn = 0).

-- ============================================================
-- 1. TRIAL
-- ============================================================

alter table public.vendors add column if not exists trial_started_at timestamptz;

-- Gói trial: is_active = false để không hiện trong danh sách mua và vendor-billing từ chối mua
insert into public.vendor_plans
  (name, slug, description, price_monthly, price_yearly, max_listings, max_team_members,
   analytics_enabled, leads_enabled, featured_listing, is_active, sort_order)
values
  ('Free Trial', 'trial', '14-day free trial with up to 3 listings.', 0, 0, 3, 1, true, false, false, false, 0)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, max_listings = excluded.max_listings,
  analytics_enabled = excluded.analytics_enabled, leads_enabled = excluded.leads_enabled,
  featured_listing = excluded.featured_listing, is_active = false;

-- Vendor không tự sửa trial_started_at (bổ sung vào trigger bảo vệ ở migration 005)
create or replace function public.protect_vendor_columns()
returns trigger language plpgsql as $$
begin
  if not public.is_client_request() or public.is_admin() or pg_trigger_depth() > 1 then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'approved';
    new.rejection_reason := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.total_products := 0;
    new.total_views := 0;
    new.trial_started_at := null;
  else
    new.user_id := old.user_id;
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    new.total_products := old.total_products;
    new.total_views := old.total_views;
    new.trial_started_at := old.trial_started_at;
  end if;
  return new;
end $$;

-- Bắt đầu trial cho một user. Trả về false nếu không đủ điều kiện
-- (đã dùng trial, đã từng có gói, hoặc vendor bị khóa).
create or replace function public.start_vendor_trial(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_vendor public.vendors;
  v_plan_id uuid;
begin
  select * into v_vendor from public.vendors where user_id = p_user_id for update;
  if not found or v_vendor.status <> 'approved' or v_vendor.trial_started_at is not null then
    return false;
  end if;
  if exists (select 1 from public.vendor_subscriptions where vendor_id = p_user_id) then
    return false;
  end if;

  select id into v_plan_id from public.vendor_plans where slug = 'trial';

  update public.vendors set trial_started_at = now() where id = v_vendor.id;

  -- cancel_at_period_end = true -> vendor_active_plan() tự hết hiệu lực sau 14 ngày
  insert into public.vendor_subscriptions
    (vendor_id, plan_id, status, gateway, current_period_start, current_period_end, trial_end, cancel_at_period_end)
  values
    (p_user_id, v_plan_id, 'trialing', 'trial', now(), now() + interval '14 days', now() + interval '14 days', true);

  return true;
end $$;

revoke execute on function public.start_vendor_trial(uuid) from public, anon, authenticated;

create or replace function public.start_trial_on_vendor_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.start_vendor_trial(new.user_id);
  return new;
end $$;

drop trigger if exists trg_start_vendor_trial on public.vendors;
create trigger trg_start_vendor_trial
  after insert on public.vendors
  for each row execute function public.start_trial_on_vendor_insert();

-- Vendor đã tạo trước migration này và chưa có gói: cho dùng thử luôn
select public.start_vendor_trial(v.user_id)
from public.vendors v
where v.trial_started_at is null
  and not exists (select 1 from public.vendor_subscriptions s where s.vendor_id = v.user_id);

-- ============================================================
-- 2. ANALYTICS AGGREGATION
-- ============================================================

create or replace function public.aggregate_analytics_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  d date := (new.created_at at time zone 'utc')::date;
begin
  insert into public.product_analytics_daily
    (product_id, vendor_id, date, impressions, clicks, bookmarks, saves, outbound_clicks, leads)
  values (
    new.product_id, new.vendor_id, d,
    (new.event_type = 'impression')::int,
    (new.event_type = 'click')::int,
    (new.event_type = 'bookmark')::int,
    (new.event_type = 'save')::int,
    (new.event_type = 'outbound_click')::int,
    (new.event_type = 'lead_capture')::int
  )
  on conflict (product_id, date) do update set
    impressions     = product_analytics_daily.impressions     + excluded.impressions,
    clicks          = product_analytics_daily.clicks          + excluded.clicks,
    bookmarks       = product_analytics_daily.bookmarks       + excluded.bookmarks,
    saves           = product_analytics_daily.saves           + excluded.saves,
    outbound_clicks = product_analytics_daily.outbound_clicks + excluded.outbound_clicks,
    leads           = product_analytics_daily.leads           + excluded.leads;

  -- Bộ đếm tổng trên sản phẩm / vendor (trigger lồng nhau nên không bị protect_* chặn)
  update public.digital_products set
    total_views  = total_views  + (new.event_type = 'impression')::int,
    total_clicks = total_clicks + (new.event_type = 'outbound_click')::int,
    total_saves  = total_saves  + (new.event_type = 'save')::int,
    total_leads  = total_leads  + (new.event_type = 'lead_capture')::int
  where id = new.product_id;

  if new.event_type = 'impression' then
    update public.vendors set total_views = total_views + 1 where id = new.vendor_id;
  end if;

  return new;
end $$;

drop trigger if exists trg_aggregate_analytics_event on public.product_analytics_events;
create trigger trg_aggregate_analytics_event
  after insert on public.product_analytics_events
  for each row execute function public.aggregate_analytics_event();

-- Backfill từ các sự kiện đã có
insert into public.product_analytics_daily
  (product_id, vendor_id, date, impressions, clicks, bookmarks, saves, outbound_clicks, leads)
select
  product_id, vendor_id, (created_at at time zone 'utc')::date,
  count(*) filter (where event_type = 'impression'),
  count(*) filter (where event_type = 'click'),
  count(*) filter (where event_type = 'bookmark'),
  count(*) filter (where event_type = 'save'),
  count(*) filter (where event_type = 'outbound_click'),
  count(*) filter (where event_type = 'lead_capture')
from public.product_analytics_events
group by product_id, vendor_id, (created_at at time zone 'utc')::date
on conflict (product_id, date) do update set
  impressions = excluded.impressions, clicks = excluded.clicks, bookmarks = excluded.bookmarks,
  saves = excluded.saves, outbound_clicks = excluded.outbound_clicks, leads = excluded.leads;

update public.digital_products p set
  total_views  = coalesce(a.views, 0),
  total_clicks = coalesce(a.clicks, 0),
  total_saves  = coalesce(a.saves, 0),
  total_leads  = coalesce(a.leads, 0)
from (
  select product_id,
         sum(impressions) as views, sum(outbound_clicks) as clicks, sum(saves) as saves, sum(leads) as leads
  from public.product_analytics_daily group by product_id
) a
where a.product_id = p.id;

update public.vendors v set total_views = coalesce(a.views, 0)
from (select vendor_id, sum(impressions) as views from public.product_analytics_daily group by vendor_id) a
where a.vendor_id = v.id;
