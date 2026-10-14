-- Refmatrix schema for Supabase
-- Run this in Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('admin','customer')),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_links (
  id text primary key default ('RM-' || upper(substr(encode(gen_random_bytes(5),'hex'),1,8))),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount > 0),
  customer_email text,
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.payment_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  phone text,
  bank text,
  owner_name text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.payment_links enable row level security;
alter table public.payment_settings enable row level security;

create or replace function public.is_refmatrix_admin()
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Each user can read their own profile; admins can read all profiles.
create policy "profiles read own or admin" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_refmatrix_admin());
-- A user can update their own display name only in a production deployment
-- with a column-level grant or a dedicated RPC. Role and is_active are admin controlled.
create policy "profiles update admin only" on public.profiles
for update to authenticated using (public.is_refmatrix_admin()) with check (public.is_refmatrix_admin());
create policy "profiles insert self" on public.profiles
for insert to authenticated with check (id = auth.uid() and role = 'customer' and is_active = false);

create policy "links read own or admin" on public.payment_links
for select to authenticated using (user_id = auth.uid() or public.is_refmatrix_admin());
create policy "links create for self" on public.payment_links
for insert to authenticated with check (user_id = auth.uid());
create policy "links update admin only" on public.payment_links
for update to authenticated using (public.is_refmatrix_admin()) with check (public.is_refmatrix_admin());
create policy "links delete admin only" on public.payment_links
for delete to authenticated using (public.is_refmatrix_admin());

create policy "settings read own or admin" on public.payment_settings
for select to authenticated using (user_id = auth.uid() or public.is_refmatrix_admin());
create policy "settings insert own" on public.payment_settings
for insert to authenticated with check (user_id = auth.uid());
create policy "settings update own" on public.payment_settings
for update to authenticated using (user_id = auth.uid() or public.is_refmatrix_admin())
with check (user_id = auth.uid() or public.is_refmatrix_admin());

-- Create a profile row automatically after a new auth signup.
create or replace function public.handle_new_refmatrix_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, is_active)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), 'customer', false)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_refmatrix on auth.users;
create trigger on_auth_user_created_refmatrix
after insert on auth.users
for each row execute procedure public.handle_new_refmatrix_user();

-- IMPORTANT: after signing up with your own email, promote ONLY your account:
-- replace YOUR_EMAIL with your actual email and run:
-- update public.profiles set role = 'admin', is_active = true where email = 'YOUR_EMAIL';
-- Never put a Supabase service_role key in frontend code or GitHub.
