-- supabase/migrations/20240101000005_vendor_marketplace.sql
-- Marketplace cho vendor: trả thuê bao (PayPal, tháng/năm) để được listing sản phẩm.
--   * Vendor đăng ký là dùng được ngay (status = approved), admin có thể suspend.
--   * Mỗi sản phẩm phải được admin duyệt trước khi hiển thị công khai.
--   * Sản phẩm chỉ hiển thị khi vendor còn gói thuê bao hiệu lực.
--   * Số sản phẩm bị giới hạn theo gói (max_listings).

-- ============================================================
-- 0. Admin helper
-- ============================================================

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- Request đến từ client (không phải SQL editor / migration / service_role)?
create or replace function public.is_client_request()
returns boolean language sql stable as $$
  select coalesce(auth.role(), '') in ('anon', 'authenticated')
$$;

-- ============================================================
-- 1. profiles.role: chỉ còn user / vendor / admin
--    (VIP được xác định bằng bảng subscriptions, không ghi vào role nữa)
-- ============================================================

do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;

update public.profiles set role = 'user' where role is null or role not in ('user', 'vendor', 'admin');
alter table public.profiles alter column role set default 'user';
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'vendor', 'admin'));

-- ============================================================
-- 2. Vendor plans: 3 gói trả phí, có PayPal plan id
-- ============================================================

alter table public.vendor_plans
  add column if not exists paypal_plan_id_monthly text,
  add column if not exists paypal_plan_id_yearly text;

update public.vendor_plans set is_active = false where slug = 'free';

update public.vendor_plans set
  description = 'List up to 5 products with basic analytics.',
  price_monthly = 9.99, price_yearly = 99.99, max_listings = 5, max_team_members = 1,
  analytics_enabled = true, leads_enabled = false, featured_listing = false, is_active = true, sort_order = 1
where slug = 'starter';

update public.vendor_plans set
  description = 'List up to 25 products with analytics and lead capture.',
  price_monthly = 29.99, price_yearly = 299.99, max_listings = 25, max_team_members = 3,
  analytics_enabled = true, leads_enabled = true, featured_listing = false, is_active = true, sort_order = 2
where slug = 'pro';

update public.vendor_plans set
  description = 'Unlimited listings, lead capture and featured placement.',
  price_monthly = 99.99, price_yearly = 999.99, max_listings = 999, max_team_members = 10,
  analytics_enabled = true, leads_enabled = true, featured_listing = true, is_active = true, sort_order = 3
where slug = 'enterprise';

-- ============================================================
-- 3. Vendor subscriptions (vendor_id = auth.users.id của chủ vendor)
-- ============================================================

alter table public.vendor_subscriptions
  add column if not exists paypal_subscription_id text unique,
  add column if not exists gateway text default 'paypal';

create unique index if not exists uq_vendor_subscriptions_vendor on public.vendor_subscriptions(vendor_id);

-- Gói đang hiệu lực của một user (NULL nếu không có).
-- Gói đã hủy vẫn hiệu lực tới hết kỳ đã trả.
create or replace function public.vendor_active_plan(p_user_id uuid)
returns public.vendor_plans language sql stable security definer set search_path = public as $$
  select p.*
  from public.vendor_subscriptions s
  join public.vendor_plans p on p.id = s.plan_id
  where s.vendor_id = p_user_id
    and s.status in ('active', 'trialing')
    and (not coalesce(s.cancel_at_period_end, false) or s.current_period_end > now())
  limit 1
$$;

-- Vendor (theo vendors.id) có đang được phép hiển thị sản phẩm không
create or replace function public.vendor_is_listable(p_vendor_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.vendors v
    where v.id = p_vendor_id
      and v.status = 'approved'
      and (public.vendor_active_plan(v.user_id)).id is not null
  )
$$;

-- Dùng ở trang sản phẩm công khai để biết có hiện form lead không
create or replace function public.vendor_leads_enabled(p_vendor_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select (public.vendor_active_plan(v.user_id)).leads_enabled
    from public.vendors v where v.id = p_vendor_id and v.status = 'approved'
  ), false)
$$;

grant execute on function public.vendor_active_plan(uuid) to authenticated;
grant execute on function public.vendor_is_listable(uuid) to anon, authenticated;
grant execute on function public.vendor_leads_enabled(uuid) to anon, authenticated;

-- ============================================================
-- 4. Vendors: tự động approved, vendor không tự sửa cột kiểm duyệt
-- ============================================================

alter table public.vendors alter column status set default 'approved';
update public.vendors set status = 'approved' where status in ('pending', 'under_review');

create or replace function public.protect_vendor_columns()
returns trigger language plpgsql as $$
begin
  -- Admin, server và các trigger lồng nhau (đếm total_products) được sửa tự do
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
  else
    new.user_id := old.user_id;
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    new.total_products := old.total_products;
    new.total_views := old.total_views;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_vendor_columns on public.vendors;
create trigger trg_protect_vendor_columns
  before insert or update on public.vendors
  for each row execute function public.protect_vendor_columns();

-- ============================================================
-- 5. Digital products: kiểm duyệt + giới hạn theo gói
--    (tên trigger bắt đầu bằng "trg_protect" để chạy trước trg_sync_product_approval)
-- ============================================================

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

    -- Sửa nội dung sản phẩm đã duyệt -> phải duyệt lại (tránh đổi nội dung sau khi duyệt)
    if old.status = 'approved' and new.status = 'approved' and
       (new.title, new.slug, new.short_description, new.full_description, new.category_id, new.tags,
        new.price_model, new.price, new.external_sales_link, new.demo_url, new.cover_image)
       is distinct from
       (old.title, old.slug, old.short_description, old.full_description, old.category_id, old.tags,
        old.price_model, old.price, old.external_sales_link, old.demo_url, old.cover_image) then
      new.status := 'submitted';
    end if;
  end if;

  -- Tạo mới / gửi duyệt: kiểm tra gói và số slot.
  -- Chưa có gói vẫn được soạn tối đa 3 bản nháp để chuẩn bị trước khi trả phí.
  if tg_op = 'INSERT' or (new.status = 'submitted' and old.status is distinct from 'submitted') then
    select v.user_id into v_user from public.vendors v where v.id = new.vendor_id;
    v_plan := public.vendor_active_plan(v_user);

    if v_plan.id is null and new.status = 'submitted' then
      raise exception 'An active vendor subscription is required to submit products for review';
    end if;

    select count(*) into v_count
    from public.digital_products
    where vendor_id = new.vendor_id and status not in ('archived', 'rejected') and id <> new.id;

    if v_plan.id is null and v_count >= 3 then
      raise exception 'You can prepare up to 3 drafts before subscribing. Choose a plan to add more.';
    elsif v_plan.id is not null and v_count >= v_plan.max_listings then
      raise exception 'Listing limit reached: the % plan allows % products. Archive a product or upgrade your plan.',
        v_plan.name, v_plan.max_listings;
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_protect_product_columns on public.digital_products;
create trigger trg_protect_product_columns
  before insert or update on public.digital_products
  for each row execute function public.protect_product_columns();

-- ============================================================
-- 6. RLS
-- ============================================================

-- Sản phẩm công khai: đã duyệt VÀ vendor còn gói hiệu lực
drop policy if exists products_select_public on public.digital_products;
create policy products_select_public on public.digital_products
  for select using (is_approved and public.vendor_is_listable(vendor_id));

-- Admin
drop policy if exists products_admin_all on public.digital_products;
create policy products_admin_all on public.digital_products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists vendors_admin_all on public.vendors;
create policy vendors_admin_all on public.vendors
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists vendor_subs_admin_select on public.vendor_subscriptions;
create policy vendor_subs_admin_select on public.vendor_subscriptions
  for select using (public.is_admin());

drop policy if exists media_admin_select on public.digital_product_media;
create policy media_admin_select on public.digital_product_media
  for select using (public.is_admin());

-- Vendor quản lý gallery của mình (trước đây thiếu update/delete)
drop policy if exists media_update_own on public.digital_product_media;
create policy media_update_own on public.digital_product_media for update using (
  product_id in (select id from public.digital_products where vendor_id in (select id from public.vendors where user_id = auth.uid()))
);
drop policy if exists media_delete_own on public.digital_product_media;
create policy media_delete_own on public.digital_product_media for delete using (
  product_id in (select id from public.digital_products where vendor_id in (select id from public.vendors where user_id = auth.uid()))
);

-- Lead: chỉ cho sản phẩm đang hiển thị, đúng vendor, và gói có tính năng lead
drop policy if exists leads_insert_public on public.vendor_leads;
create policy leads_insert_public on public.vendor_leads for insert with check (
  exists (
    select 1 from public.digital_products p
    where p.id = product_id and p.vendor_id = vendor_leads.vendor_id and p.is_approved
  )
  and public.vendor_leads_enabled(vendor_id)
);

-- Analytics: khách được ghi sự kiện cho sản phẩm đang hiển thị (trước đây thiếu policy -> mọi insert bị chặn)
drop policy if exists analytics_insert_public on public.product_analytics_events;
create policy analytics_insert_public on public.product_analytics_events for insert with check (
  exists (
    select 1 from public.digital_products p
    where p.id = product_id and p.vendor_id = product_analytics_events.vendor_id and p.is_approved
  )
);

-- Tăng tốc truy vấn marketplace
create index if not exists idx_digital_products_listing
  on public.digital_products(featured desc, created_at desc) where is_approved = true;
