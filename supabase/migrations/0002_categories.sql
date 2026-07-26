-- Per-user, customizable income/expense categories.
-- Run this once in the Supabase SQL Editor after 0001_init.sql.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  type text not null check (type in ('income', 'expense')),
  color text not null,
  created_at timestamptz not null default now(),
  -- A user can't have two categories with the same name within one type,
  -- but "Outros" may exist once for income and once for expense.
  unique (user_id, type, name)
);

create index if not exists categories_user_type_idx
  on public.categories (user_id, type);

alter table public.categories enable row level security;

drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own"
  on public.categories
  for select
  using (auth.uid() = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own"
  on public.categories
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own"
  on public.categories
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own"
  on public.categories
  for delete
  using (auth.uid() = user_id);

-- Categories are now free-form per user, so the fixed allow-list on
-- transactions.category no longer applies. (Postgres auto-names the inline
-- CHECK from 0001_init.sql as transactions_category_check.)
alter table public.transactions
  drop constraint if exists transactions_category_check;
