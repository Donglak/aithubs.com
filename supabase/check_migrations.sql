-- supabase/check_migrations.sql
-- Chạy trong Supabase SQL Editor để biết migration nào đã chạy / cần chạy.
-- Chỉ ĐỌC dữ liệu, không thay đổi gì.

with c as (
  select
    to_regclass('public.orders') is not null                                         as has_orders,
    to_regclass('public.vendor_plans') is not null                                   as m001,
    to_regclass('public.subscriptions') is not null                                  as m01,
    exists (select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_gateway') as m02,
    to_regprocedure('public.is_user_vip(uuid)') is not null                          as m03,
    to_regprocedure('public.protect_profile_billing_columns()') is not null          as m04,
    to_regprocedure('public.vendor_active_plan(uuid)') is not null                   as m05,
    exists (select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'vendors' and column_name = 'trial_started_at') as m06
)
select buoc, file, trang_thai
from c, lateral (values
  (1, '001_vendor_module.sql',                      case when m001 then 'đã chạy'          else 'CẦN CHẠY' end),
  (2, '20240101000000_orders_base.sql',             case when has_orders then 'đã có'      else 'CẦN CHẠY' end),
  (3, '20240101000001_add_subscriptions_table.sql', case when m01  then 'đã chạy'          else 'CẦN CHẠY' end),
  (4, '20240101000002_add_payment_columns_to_orders.sql', case when m02 then 'đã chạy'    else 'CẦN CHẠY' end),
  (5, '20240101000003_add_rls_and_helpers.sql',     case when m03  then 'đã chạy'          else 'CẦN CHẠY' end),
  (6, '20240101000004_secure_payments.sql',         case when m04  then 'đã chạy (chạy lại an toàn)' else 'CẦN CHẠY' end),
  (7, '20240101000005_vendor_marketplace.sql',      case when m05  then 'đã chạy (chạy lại an toàn)' else 'CẦN CHẠY' end),
  (8, '20240101000006_vendor_trial_analytics.sql',  case when m06  then 'đã chạy (chạy lại an toàn)' else 'CẦN CHẠY' end)
) as t(buoc, file, trang_thai)
order by buoc;
