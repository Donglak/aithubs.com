-- supabase/migrations/20240101000004_secure_payments.sql
-- Khóa các đường cho phép user tự cấp VIP / tự tạo đơn "đã thanh toán".
-- Mọi thay đổi trạng thái thanh toán chỉ đi qua Edge Function (service_role).

-- 1) Orders: user chỉ được xem, không được tự insert (có thể insert status = 'COMPLETED')
drop policy if exists "User can create own orders" on public.orders;

-- create_pending_order là security definer và nhận p_user_id/p_amount tùy ý
revoke execute on function public.create_pending_order(uuid, text, integer, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_pending_order(uuid, text, integer, text, text, jsonb) to service_role;

create index if not exists idx_orders_payment_session on public.orders(payment_session_id);

-- 2) Subscriptions: chỉ webhook ghi
drop policy if exists "User can insert own subscription (via edge function)" on public.subscriptions;

-- 3) Hàm đổi role VIP: không cho client gọi
revoke execute on function public.update_user_role_to_vip(uuid, boolean) from public, anon, authenticated;
grant execute on function public.update_user_role_to_vip(uuid, boolean) to service_role;

-- 4) Profiles: user vẫn sửa được hồ sơ của mình, nhưng không được đổi role / stripe_customer_id
create or replace function public.protect_profile_billing_columns()
returns trigger language plpgsql as $$
begin
  -- Chỉ chặn request từ client (anon/authenticated). SQL editor, migration và
  -- service_role (Edge Functions) vẫn đổi được, ví dụ để cấp quyền admin.
  if auth.role() in ('anon', 'authenticated')
     and (new.role is distinct from old.role or new.stripe_customer_id is distinct from old.stripe_customer_id) then
    raise exception 'Không được tự thay đổi role hoặc thông tin thanh toán';
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_profile_billing on public.profiles;
create trigger trg_protect_profile_billing
  before update on public.profiles
  for each row execute function public.protect_profile_billing_columns();

-- User mới tự tạo profile không được tự đặt role khác 'user'
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id and coalesce(role, 'user') = 'user');
