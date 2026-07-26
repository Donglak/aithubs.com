-- supabase/migrations/20240101000001_add_subscriptions_table.sql
-- Bảng subscriptions: lưu gói VIP của user

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Stripe identifiers
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  stripe_current_period_end timestamptz,

  -- Plan info
  plan text not null check (plan in ('vip_monthly', 'vip_yearly')),
  status text not null check (status in (
    'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid'
  )) default 'incomplete',

  -- Billing
  currency text not null default 'usd' check (currency in ('usd', 'vnd')),
  amount integer not null, -- cents (USD) hoặc VND nguyên
  interval text not null check (interval in ('month', 'year')),
  trial_end timestamptz,

  -- Meta
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  metadata jsonb default '{}',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index để query nhanh
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_sub_id on public.subscriptions(stripe_subscription_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

-- RLS: user chỉ xem sub của mình
alter table public.subscriptions enable row level security;

create policy "User can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "User can insert own subscription (via edge function)"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

-- Trigger cập nhật updated_at
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at_column();

-- Function helper: check user có VIP active không
create or replace function public.is_user_vip(p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user_id
      and status in ('trialing', 'active')
      and (stripe_current_period_end is null or stripe_current_period_end > now())
  )
$$;