-- The app uses one JSONB state document during its initial deployment.
-- Keep this table inaccessible to anon/authenticated clients; only server code
-- using SUPABASE_SERVICE_ROLE_KEY may read or modify it.
create table if not exists public.app_state (
  id text primary key check (id = 'primary'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

revoke all on table public.app_state from anon, authenticated;
grant all on table public.app_state to service_role;
