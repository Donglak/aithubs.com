-- supabase/migrations/20240101000003_add_rls_and_helpers.sql
-- Cập nhật profiles để có role và stripe_customer_id
-- Function helper: check user có VIP active không

alter table public.profiles
  add column if not exists role text default 'free' check (role in ('free', 'vip', 'admin')),
  add column if not exists stripe_customer_id text unique;

create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);

-- Function: check user có VIP active không
create or replace function public.is_user_vip(p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user_id
      and status in ('trialing', 'active')
      and (stripe_current_period_end is null or stripe_current_period_end > now())
  )
$$;

-- Function: cập nhật role user thành VIP
create or replace function public.update_user_role_to_vip(p_user_id uuid, p_is_vip boolean)
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set role = case when p_is_vip then 'vip' else 'free' end
  where id = p_user_id;
end $$;

grant execute on function public.update_user_role_to_vip to authenticated;
grant execute on function public.is_user_vip to authenticated;