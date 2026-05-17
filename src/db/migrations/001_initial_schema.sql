create table users (
  id text primary key,
  email text not null unique,
  display_name text not null,
  role text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint users_id_format check (id ~ '^usr_[0-9A-HJKMNP-TV-Z]{26}$')
);

create table auth_identities (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  provider text not null,
  provider_subject text not null,
  password_hash text,
  email text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint auth_identities_id_format check (id ~ '^aid_[0-9A-HJKMNP-TV-Z]{26}$'),
  constraint auth_identities_provider check (provider in ('local', 'google')),
  constraint auth_identities_local_password check (
    (provider = 'local' and password_hash is not null) or
    (provider <> 'local' and password_hash is null)
  ),
  unique (provider, provider_subject)
);

create table auth_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  refresh_token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint auth_sessions_id_format check (id ~ '^ase_[0-9A-HJKMNP-TV-Z]{26}$')
);

create table devices (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  device_uid text not null unique,
  name text not null,
  model text not null,
  firmware_version text not null,
  last_seen_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint devices_id_format check (id ~ '^dev_[0-9A-HJKMNP-TV-Z]{26}$')
);

create table device_pairings (
  id text primary key,
  device_uid text not null,
  name text,
  model text not null,
  firmware_version text not null,
  user_code_hash text not null unique,
  pairing_secret_hash text not null unique,
  claimed_by_user_id text references users(id) on delete cascade,
  claimed_device_id text references devices(id) on delete cascade,
  authorized_at timestamptz,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint device_pairings_id_format check (id ~ '^dpr_[0-9A-HJKMNP-TV-Z]{26}$'),
  constraint device_pairings_claimed_together check (
    (claimed_by_user_id is null and claimed_device_id is null) or
    (claimed_by_user_id is not null and claimed_device_id is not null)
  )
);

create table device_tokens (
  id text primary key,
  device_id text not null references devices(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint device_tokens_id_format check (id ~ '^dtk_[0-9A-HJKMNP-TV-Z]{26}$')
);

create table tea_types (
  id text primary key,
  code text not null unique,
  name text not null,
  name_cn text,
  description text not null,
  typical_temp_c text not null,
  typical_rinse_sec integer,
  typical_infusions text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint tea_types_code_format check (code ~ '^[a-z0-9_]+$'),
  constraint tea_types_id_format check (id = 'teatype_' || code)
);

create table teas (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  name text not null,
  tea_type text not null references tea_types(code),
  origin text,
  producer text,
  harvest_year integer,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint teas_id_format check (id ~ '^tea_[0-9A-HJKMNP-TV-Z]{26}$')
);

create table default_preset_templates (
  id text primary key,
  code text not null unique,
  version integer not null,
  name text not null,
  name_cn text,
  tea_type text not null references tea_types(code),
  dose_per_100ml text not null,
  temp_c text not null,
  rinse_sec integer not null,
  infusions_sec integer[] not null,
  max_infusions integer not null,
  notes text,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint default_preset_templates_id_format check (id = 'tpl_' || code)
);

create table user_presets (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  base_template_id text references default_preset_templates(id) on delete set null,
  name text not null,
  name_cn text,
  tea_type text not null references tea_types(code),
  dose_per_100ml text not null,
  temp_c text not null,
  rinse_sec integer not null,
  infusions_sec integer[] not null,
  max_infusions integer not null,
  notes text,
  sort_order integer not null,
  revision integer not null,
  deleted_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint user_presets_id_format check (id ~ '^upr_[0-9A-HJKMNP-TV-Z]{26}$'),
  unique (user_id, revision)
);

create table device_settings (
  device_id text primary key references devices(id) on delete cascade,
  audio_enabled boolean not null,
  audio_profile text not null,
  power_save_enabled boolean not null,
  display_timeout_sec integer not null,
  clock_auto_sync_enabled boolean not null,
  timezone text not null,
  last_timer_duration_sec integer not null,
  settings_revision integer not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table preset_sync_states (
  device_id text primary key references devices(id) on delete cascade,
  last_synced_revision integer not null,
  synced_at timestamptz
);

create table session_records (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  device_id text not null references devices(id) on delete cascade,
  local_record_id text not null,
  tea_id text references teas(id) on delete set null,
  preset_id text references user_presets(id) on delete set null,
  preset_index integer,
  preset_name text not null,
  started_at timestamptz,
  finished_at timestamptz,
  rinse_started_at timestamptz,
  infusion_started_at timestamptz[] not null default '{}',
  finished_early boolean not null,
  completed_infusion_count integer not null,
  infusion_sec integer[] not null,
  rinse_sec integer not null,
  raw_payload jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint session_records_id_format check (id ~ '^sr_[0-9A-HJKMNP-TV-Z]{26}$'),
  unique (device_id, local_record_id)
);

create index auth_identities_user_id_idx on auth_identities(user_id);
create index auth_identities_email_idx on auth_identities(email);
create index auth_sessions_user_id_idx on auth_sessions(user_id);
create index auth_sessions_active_idx on auth_sessions(user_id, expires_at) where revoked_at is null;
create index devices_user_id_idx on devices(user_id);
create index device_pairings_pending_idx on device_pairings(expires_at) where claimed_device_id is null and consumed_at is null;
create index device_tokens_device_id_idx on device_tokens(device_id);
create index device_tokens_active_idx on device_tokens(device_id, expires_at) where revoked_at is null;
create index tea_types_sort_order_idx on tea_types(sort_order);
create index teas_user_id_idx on teas(user_id);
create index teas_user_archived_idx on teas(user_id, archived_at);
create index user_presets_user_revision_idx on user_presets(user_id, revision);
create index user_presets_user_deleted_idx on user_presets(user_id, deleted_at);
create index session_records_tea_id_idx on session_records(tea_id);
create index session_records_user_started_idx on session_records(user_id, started_at desc);
create index session_records_device_started_idx on session_records(device_id, started_at desc);
create index session_records_preset_id_idx on session_records(preset_id);
