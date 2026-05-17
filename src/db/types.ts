import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export type TimestampColumn = ColumnType<Date, Date | string, Date | string>;
export type NullableTimestampColumn = ColumnType<
  Date | null,
  Date | string | null,
  Date | string | null
>;
export type NullableTimestampArrayColumn = ColumnType<
  Array<Date | null>,
  Array<Date | string | null>,
  Array<Date | string | null>
>;
export type JsonColumn<T> = ColumnType<T, T, T>;

export interface UsersTable {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface AuthIdentitiesTable {
  id: string;
  user_id: string;
  provider: string;
  provider_subject: string;
  password_hash: string | null;
  email: string;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface AuthSessionsTable {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  expires_at: TimestampColumn;
  revoked_at: NullableTimestampColumn;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface DevicesTable {
  id: string;
  user_id: string;
  device_uid: string;
  name: string;
  model: string;
  firmware_version: string;
  last_seen_at: NullableTimestampColumn;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface DevicePairingsTable {
  id: string;
  device_uid: string;
  name: string | null;
  model: string;
  firmware_version: string;
  user_code_hash: string;
  pairing_secret_hash: string;
  claimed_by_user_id: string | null;
  claimed_device_id: string | null;
  authorized_at: NullableTimestampColumn;
  expires_at: TimestampColumn;
  consumed_at: NullableTimestampColumn;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface DeviceTokensTable {
  id: string;
  device_id: string;
  token_hash: string;
  expires_at: NullableTimestampColumn;
  revoked_at: NullableTimestampColumn;
  last_used_at: NullableTimestampColumn;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface TeaTypesTable {
  id: string;
  code: string;
  name: string;
  name_cn: string | null;
  description: string;
  typical_temp_c: string;
  typical_rinse_sec: number | null;
  typical_infusions: string;
  sort_order: number;
  is_active: boolean;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface TeasTable {
  id: string;
  user_id: string;
  name: string;
  tea_type: string;
  origin: string | null;
  producer: string | null;
  harvest_year: number | null;
  notes: string | null;
  archived_at: NullableTimestampColumn;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface DefaultPresetTemplatesTable {
  id: string;
  code: string;
  version: number;
  name: string;
  name_cn: string | null;
  tea_type: string;
  dose_per_100ml: string;
  temp_c: string;
  rinse_sec: number;
  infusions_sec: number[];
  max_infusions: number;
  notes: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface UserPresetsTable {
  id: string;
  user_id: string;
  base_template_id: string | null;
  name: string;
  name_cn: string | null;
  tea_type: string;
  dose_per_100ml: string;
  temp_c: string;
  rinse_sec: number;
  infusions_sec: number[];
  max_infusions: number;
  notes: string | null;
  sort_order: number;
  revision: number;
  deleted_at: NullableTimestampColumn;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface DeviceSettingsTable {
  device_id: string;
  audio_enabled: boolean;
  audio_profile: string;
  power_save_enabled: boolean;
  display_timeout_sec: number;
  clock_auto_sync_enabled: boolean;
  timezone: string;
  last_timer_duration_sec: number;
  settings_revision: number;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface PresetSyncStatesTable {
  device_id: string;
  last_synced_revision: number;
  synced_at: NullableTimestampColumn;
}

export interface SessionRecordsTable {
  id: string;
  user_id: string;
  device_id: string;
  local_record_id: string;
  tea_id: string | null;
  preset_id: string | null;
  preset_index: number | null;
  preset_name: string;
  started_at: NullableTimestampColumn;
  finished_at: NullableTimestampColumn;
  rinse_started_at: NullableTimestampColumn;
  infusion_started_at: NullableTimestampArrayColumn;
  finished_early: boolean;
  completed_infusion_count: number;
  infusion_sec: number[];
  rinse_sec: number;
  raw_payload: JsonColumn<Record<string, unknown>>;
  created_at: TimestampColumn;
  updated_at: TimestampColumn;
}

export interface DB {
  users: UsersTable;
  auth_identities: AuthIdentitiesTable;
  auth_sessions: AuthSessionsTable;
  devices: DevicesTable;
  device_pairings: DevicePairingsTable;
  device_tokens: DeviceTokensTable;
  tea_types: TeaTypesTable;
  teas: TeasTable;
  default_preset_templates: DefaultPresetTemplatesTable;
  user_presets: UserPresetsTable;
  device_settings: DeviceSettingsTable;
  preset_sync_states: PresetSyncStatesTable;
  session_records: SessionRecordsTable;
}

export type UserRow = Selectable<UsersTable>;
export type NewUserRow = Insertable<UsersTable>;
export type UserRowUpdate = Updateable<UsersTable>;

export type AuthIdentityRow = Selectable<AuthIdentitiesTable>;
export type NewAuthIdentityRow = Insertable<AuthIdentitiesTable>;
export type AuthIdentityRowUpdate = Updateable<AuthIdentitiesTable>;

export type AuthSessionRow = Selectable<AuthSessionsTable>;
export type NewAuthSessionRow = Insertable<AuthSessionsTable>;
export type AuthSessionRowUpdate = Updateable<AuthSessionsTable>;

export type DeviceRow = Selectable<DevicesTable>;
export type NewDeviceRow = Insertable<DevicesTable>;
export type DeviceRowUpdate = Updateable<DevicesTable>;

export type DevicePairingRow = Selectable<DevicePairingsTable>;
export type NewDevicePairingRow = Insertable<DevicePairingsTable>;
export type DevicePairingRowUpdate = Updateable<DevicePairingsTable>;

export type DeviceTokenRow = Selectable<DeviceTokensTable>;
export type NewDeviceTokenRow = Insertable<DeviceTokensTable>;
export type DeviceTokenRowUpdate = Updateable<DeviceTokensTable>;

export type TeaRow = Selectable<TeasTable>;
export type NewTeaRow = Insertable<TeasTable>;
export type TeaRowUpdate = Updateable<TeasTable>;

export type TeaTypeRow = Selectable<TeaTypesTable>;
export type NewTeaTypeRow = Insertable<TeaTypesTable>;
export type TeaTypeRowUpdate = Updateable<TeaTypesTable>;

export type DefaultPresetTemplateRow = Selectable<DefaultPresetTemplatesTable>;
export type NewDefaultPresetTemplateRow = Insertable<DefaultPresetTemplatesTable>;
export type DefaultPresetTemplateRowUpdate =
  Updateable<DefaultPresetTemplatesTable>;

export type UserPresetRow = Selectable<UserPresetsTable>;
export type NewUserPresetRow = Insertable<UserPresetsTable>;
export type UserPresetRowUpdate = Updateable<UserPresetsTable>;

export type PresetSyncStateRow = Selectable<PresetSyncStatesTable>;
export type NewPresetSyncStateRow = Insertable<PresetSyncStatesTable>;
export type PresetSyncStateRowUpdate = Updateable<PresetSyncStatesTable>;

export type SessionRecordRow = Selectable<SessionRecordsTable>;
export type NewSessionRecordRow = Insertable<SessionRecordsTable>;
export type SessionRecordRowUpdate = Updateable<SessionRecordsTable>;
