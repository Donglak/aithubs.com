-- supabase/migrations/20240101000007_free_listing_deal_partner.sql
-- Chiến lược "kiếm tiền khi chưa có traffic":
-- 1) Listing miễn phí vĩnh viễn (gói 'free') thay cho trial 14 ngày. Vendor không có thuê bao trả phí
--    hiệu lực sẽ tự rơi về gói free -> listing không còn bị ẩn khi hết trial / hủy gói.
-- 2) Tạm dừng bán các gói trả phí (is_active = false). Code PayPal giữ nguyên; bật lại bằng
--    update public.vendor_plans set is_active = true where slug in ('starter','pro','enterprise');
--    Thuê bao PayPal đang chạy vẫn được đồng bộ & hủy bình thường.
-- 3) Deal Partner: sản phẩm có mã giảm giá độc quyền >= 20% + link affiliate -> đủ điều kiện featured.
--    Listing free thường phải gắn badge "Featured on AIThubs" (badge_url) trước khi gửi duyệt.

-- ============================================================
-- 1. PLANS
-- ============================================================

insert into public.vendor_plans
  (name, slug, description, price_monthly, price_yearly, max_listings, max_team_members,
   analytics_enabled, leads_enabled, featured_listing, is_active, sort_order)
values
  ('Free', 'free', 'Free listing with the AIThubs badge, or a Deal Partner listing with an exclusive deal.',
   0, 0, 3, 1, true, false, false, false, 0)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description,
  price_monthly = 0, price_yearly = 0, max_listings = excluded.max_listings,
  analytics_enabled = true, leads_enabled = false, featured_listing = false,
  -- is_active = false: không hiện trong danh sách mua, vendor-billing từ chối "mua" gói free
  is_active = false, sort_order = 0;

update public.vendor_plans set is_active = false where slug in ('starter', 'pro', 'enterprise');

-- Gói hiệu lực: thuê bao trả phí còn hạn, nếu không có thì gói free (miễn là user có store)
create or replace function public.vendor_active_plan(p_user_id uuid)
returns public.vendor_plans language sql stable security definer set search_path = public as $$
  select (x.plan).* from (
    select p as plan, 0 as prio
    from public.vendor_subscriptions s
    join public.vendor_plans p on p.id = s.plan_id
    where s.vendor_id = p_user_id
      and s.status in ('active', 'trialing')
      and (not coalesce(s.cancel_at_period_end, false) or s.current_period_end > now())
    union all
    select p, 1
    from public.vendor_plans p
    where p.slug = 'free'
      and exists (select 1 from public.vendors v where v.user_id = p_user_id)
  ) x
  order by prio
  limit 1
$$;

-- Không tạo trial cho vendor mới nữa (gói free là mặc định)
drop trigger if exists trg_start_vendor_trial on public.vendors;

-- ============================================================
-- 2. DEAL PARTNER + BADGE
-- ============================================================

alter table public.digital_products
  add column if not exists deal_code text,
  add column if not exists deal_discount_percent int,
  add column if not exists deal_terms text,
  add column if not exists deal_expires_at date,
  add column if not exists affiliate_url text,
  add column if not exists badge_url text;

do $$ begin
  alter table public.digital_products add constraint digital_products_deal_discount_check
    check (deal_discount_percent is null or deal_discount_percent between 1 and 100);
exception when duplicate_object then null; end $$;

-- Deal Partner: mã độc quyền >= 20% + link affiliate
create or replace function public.is_deal_partner(p public.digital_products)
returns boolean language sql immutable as $$
  select coalesce(p.deal_discount_percent, 0) >= 20
     and nullif(trim(p.deal_code), '') is not null
     and nullif(trim(p.affiliate_url), '') is not null
$$;

create or replace function public.protect_product_columns()
returns trigger language plpgsql as $$
declare
  v_user uuid;
  v_plan public.vendor_plans;
  v_count int;
begin
  if not public.is_client_request() or public.is_admin() or pg_trigger_depth() > 1 then
    return new;
  end if;

  -- Vendor không được tự duyệt / tự featured / sửa số liệu
  if tg_op = 'INSERT' then
    new.is_approved := false;
    new.featured := false;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.rejection_reason := null;
    new.total_views := 0;
    new.total_clicks := 0;
    new.total_saves := 0;
    new.total_leads := 0;
    if new.status not in ('draft', 'submitted') then
      raise exception 'New products must be saved as draft or submitted for review';
    end if;
  else
    new.vendor_id := old.vendor_id;
    new.is_approved := old.is_approved;
    new.featured := old.featured;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    new.rejection_reason := old.rejection_reason;
    new.total_views := old.total_views;
    new.total_clicks := old.total_clicks;
    new.total_saves := old.total_saves;
    new.total_leads := old.total_leads;

    if new.status is distinct from old.status and new.status not in ('draft', 'submitted', 'archived') then
      raise exception 'Vendors can only set a product to draft, submitted or archived';
    end if;

    -- Sửa nội dung (kể cả deal / link affiliate) của sản phẩm đã duyệt -> phải duyệt lại
    if old.status = 'approved' and new.status = 'approved' and
       (new.title, new.slug, new.short_description, new.full_description, new.category_id, new.tags,
        new.price_model, new.price, new.external_sales_link, new.demo_url, new.cover_image,
        new.deal_code, new.deal_discount_percent, new.deal_terms, new.deal_expires_at, new.affiliate_url, new.badge_url)
       is distinct from
       (old.title, old.slug, old.short_description, old.full_description, old.category_id, old.tags,
        old.price_model, old.price, old.external_sales_link, old.demo_url, old.cover_image,
        old.deal_code, old.deal_discount_percent, old.deal_terms, old.deal_expires_at, old.affiliate_url, old.badge_url) then
      new.status := 'submitted';
    end if;
  end if;

  -- Tạo mới / gửi duyệt: kiểm tra gói, số slot và điều kiện listing free
  if tg_op = 'INSERT' or (new.status = 'submitted' and old.status is distinct from 'submitted') then
    select v.user_id into v_user from public.vendors v where v.id = new.vendor_id;
    v_plan := public.vendor_active_plan(v_user);

    if v_plan.id is null and new.status = 'submitted' then
      raise exception 'Your vendor account is not active';
    end if;

    if new.status = 'submitted' and v_plan.slug = 'free'
       and not public.is_deal_partner(new) and nullif(trim(new.badge_url), '') is null then
      raise exception 'Free listings need the "Featured on AIThubs" badge on your site (add the page URL), or an exclusive deal of 20%% or more with an affiliate link.';
    end if;

    select count(*) into v_count
    from public.digital_products
    where vendor_id = new.vendor_id and status not in ('archived', 'rejected') and id <> new.id;

    if v_plan.id is null and v_count >= 3 then
      raise exception 'You can prepare up to 3 drafts.';
    elsif v_plan.id is not null and v_count >= v_plan.max_listings then
      raise exception 'Listing limit reached: the % plan allows % products. Archive a product to add another.',
        v_plan.name, v_plan.max_listings;
    end if;
  end if;

  return new;
end $$;
