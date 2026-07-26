-- supabase/migrations/20240101000002_add_payment_columns_to_orders.sql
-- Bổ sung cột thanh toán vào orders (giả sử bảng orders đã tồn tại)

alter table public.orders
  add column if not exists payment_gateway text check (payment_gateway in ('stripe', 'vnpay', 'momo', 'paypal')),
  add column if not exists payment_intent_id text,       -- Stripe PI / VNPay TxnRef / MoMo OrderId
  add column if not exists payment_session_id text,      -- Stripe Checkout Session ID
  add column if not exists currency text default 'usd' check (currency in ('usd', 'vnd')),
  add column if not exists amount integer,               -- cents (USD) hoặc VND nguyên
  add column if not exists type text check (type in ('ebook', 'vip_subscription')) default 'ebook',
  add column if not exists metadata jsonb default '{}',  -- ebook_id, plan, etc.
  add column if not exists paid_at timestamptz,
  add column if not exists failed_at timestamptz,
  add column if not exists failure_reason text;

-- Index
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_payment_intent on public.orders(payment_intent_id);
create index if not exists idx_orders_status on public.orders(status);

-- RLS
alter table public.orders enable row level security;

create policy "User can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "User can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Function: tạo order PENDING
create or replace function public.create_pending_order(
  p_user_id uuid,
  p_type text,
  p_amount integer,
  p_currency text,
  p_gateway text,
  p_metadata jsonb
) returns uuid language plpgsql security definer as $$
declare
  v_order_id uuid;
begin
  insert into public.orders (user_id, type, amount, currency, payment_gateway, status, metadata)
  values (p_user_id, p_type, p_amount, p_currency, p_gateway, 'PENDING', p_metadata)
  returning id into v_order_id;
  return v_order_id;
end $$;

grant execute on function public.create_pending_order to authenticated;