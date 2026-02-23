create extension if not exists pgcrypto;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists duration_minutes int null;
alter table public.courses add column if not exists language text null;
alter table public.courses add column if not exists level text null;
alter table public.courses add column if not exists category text null;

-- Add foreign key relationship to profiles table
alter table public.courses 
add constraint courses_user_id_fkey 
foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.courses enable row level security;

create policy "courses_select_all" on public.courses
for select
using (true);

create policy "courses_insert_own" on public.courses
for insert
with check (auth.uid() = user_id);

create policy "courses_update_own" on public.courses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "courses_delete_own" on public.courses
for delete
using (auth.uid() = user_id);

create index if not exists courses_user_id_created_at_idx on public.courses (user_id, created_at desc);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  phone text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
for select
using (true);

create policy "profiles_insert_own" on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
