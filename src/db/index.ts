import type { Kysely, Transaction } from "kysely";

export { createPgDb } from "./postgres.db";

export type {
  DB,
  AuthIdentityRow,
  AuthIdentityRowUpdate,
  AuthSessionRow,
  AuthSessionRowUpdate,
  DefaultPresetTemplateRow,
  DevicePairingRow,
  DevicePairingRowUpdate,
  DeviceTokenRow,
  DeviceTokenRowUpdate,
  NewAuthIdentityRow,
  NewAuthSessionRow,
  NewDeviceRow,
  NewDevicePairingRow,
  NewDeviceTokenRow,
  NewPresetSyncStateRow,
  NewSessionRecordRow,
  NewTeaRow,
  NewTeaTypeRow,
  NewUserPresetRow,
  NewUserRow,
  PresetSyncStateRow,
  SessionRecordRow,
  TeaRow,
  TeaTypeRow,
  UserPresetRow,
  UserRow,
} from "./types";

import type { DB } from "./types";

export type RootDb = Kysely<DB>;
export type AppDb = Kysely<DB> | Transaction<DB>;
