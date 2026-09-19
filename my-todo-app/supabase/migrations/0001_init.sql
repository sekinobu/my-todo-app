-- Todo app schema.
--
-- This app does not use Supabase Auth (login is a simple "pick a name"
-- selector, no password). Because there is no auth.uid() to check against,
-- RLS is enabled but the policies below allow full access to the anon role.
-- This is fine for local prototyping but must NOT be used as-is in
-- production — anyone with the anon key can read/write every user's data.
-- Migrate to real Supabase Auth and auth.uid()-scoped policies before
-- shipping this for real users.

create extension if not exists "pgcrypto";

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users (id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks (id) on delete cascade,
  author_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

insert into app_users (id, name, email) values
  ('11111111-1111-1111-1111-111111111111', '田中太郎', 'tanaka@example.com'),
  ('22222222-2222-2222-2222-222222222222', '佐藤花子', 'sato@example.com'),
  ('33333333-3333-3333-3333-333333333333', '山田次郎', 'yamada@example.com')
on conflict (id) do nothing;

alter table app_users enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;

create policy "Allow all access to app_users" on app_users
  for all using (true) with check (true);

create policy "Allow all access to tasks" on tasks
  for all using (true) with check (true);

create policy "Allow all access to comments" on comments
  for all using (true) with check (true);
