-- Gunita: initial database schema
-- Run this once in Supabase → SQL Editor.
-- Every table uses Row Level Security so each person can only see and
-- change their own rows. Signed-out visitors (anon role) get no access.

-- ─────────────────────────────────────────────────────────────
-- 1. Profiles: one row per account, created automatically on sign up
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

grant select on public.profiles to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. Journal entries
--    id is created on the phone so entries written offline can sync later.
--    deleted_at marks a deleted entry so the delete also reaches other phones.
-- ─────────────────────────────────────────────────────────────
create table public.journal_entries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  question_id text not null,
  answer text not null,
  mood text check (mood in ('calm', 'hopeful', 'heavy', 'grateful')),
  draft boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (user_id, id)
);

alter table public.journal_entries enable row level security;

create policy "Users manage their own journal entries"
  on public.journal_entries for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.journal_entries to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. Favorites (deleted_at set when a heart is removed)
-- ─────────────────────────────────────────────────────────────
create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id text not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (user_id, question_id)
);

alter table public.favorites enable row level security;

create policy "Users manage their own favorites"
  on public.favorites for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.favorites to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 4. Deck progress (which cards are picked / still on the table)
-- ─────────────────────────────────────────────────────────────
create table public.deck_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  deck_id text not null,
  remaining text[] not null default '{}',
  picked text[] not null default '{}',
  depth text not null check (depth in ('light', 'deeper', 'all')),
  updated_at timestamptz not null,
  primary key (user_id, deck_id)
);

alter table public.deck_progress enable row level security;

create policy "Users manage their own deck progress"
  on public.deck_progress for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.deck_progress to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. Delete account (required by Google Play for apps with accounts)
--    Deletes the signed-in user; every table above is removed with it
--    through "on delete cascade".
-- ─────────────────────────────────────────────────────────────
create function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
