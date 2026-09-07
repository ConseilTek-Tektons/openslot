create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table organisation (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table app_user (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id) on delete cascade,
  identity_subject text not null,
  email text not null,
  display_name text not null,
  timezone text not null default 'UTC',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organisation_id, identity_subject),
  unique (organisation_id, email)
);

create table event_type (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id) on delete cascade,
  name text not null,
  slug text not null,
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  mode text not null check (mode in ('personal', 'round_robin', 'collective', 'group')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organisation_id, slug)
);

create table event_type_host (
  event_type_id uuid not null references event_type(id) on delete cascade,
  host_id uuid not null references app_user(id) on delete cascade,
  weight integer not null default 100 check (weight > 0),
  priority integer not null default 100,
  primary key (event_type_id, host_id)
);

create table availability_rule (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id) on delete cascade,
  host_id uuid not null references app_user(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_local time not null,
  ends_local time not null,
  valid_from date,
  valid_until date,
  check (ends_local > starts_local)
);

create table routing_rule (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id) on delete cascade,
  name text not null,
  version integer not null default 1,
  priority integer not null,
  conditions jsonb not null default '{}'::jsonb,
  destination jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organisation_id, name, version)
);

create table booking (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id) on delete cascade,
  event_type_id uuid not null references event_type(id),
  host_id uuid not null references app_user(id),
  invitee_name text not null,
  invitee_email text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  status text not null default 'confirmed' check (status in ('tentative', 'confirmed', 'cancelled', 'completed', 'no_show')),
  qualification_response jsonb not null default '{}'::jsonb,
  routing_decision jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  constraint booking_no_overlap exclude using gist (
    host_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('tentative', 'confirmed'))
);

create index booking_org_starts_idx on booking (organisation_id, starts_at);
create index booking_invitee_search_idx on booking using gin (to_tsvector('simple', invitee_name || ' ' || invitee_email));

create table audit_event (
  id bigint generated always as identity primary key,
  organisation_id uuid not null references organisation(id) on delete cascade,
  actor_id text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index audit_event_org_time_idx on audit_event (organisation_id, occurred_at desc);

create table role_policy (
  organisation_id uuid not null references organisation(id) on delete cascade,
  role_key text not null,
  permissions text[] not null default '{}',
  updated_by text not null,
  updated_at timestamptz not null default now(),
  primary key (organisation_id, role_key)
);
