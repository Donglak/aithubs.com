-- supabase/migrations/20240101000000_orders_base.sql
-- Bảng orders gốc (migration 002 bổ sung các cột thanh toán vào bảng này).
-- An toàn khi chạy lại: không làm gì nếu bảng đã tồn tại.

create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
