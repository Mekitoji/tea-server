import type { DeviceId } from "../../device/types/device.model";
import type { TeaTypeCode } from "../../tea/types/tea.model";
import type { ISODateTime, UserId } from "../../user/types/user.model";

export type DefaultSessionPresetId = string;
export type UserSessionPresetId = string;

export interface DefaultSessionPreset {
  id: DefaultSessionPresetId;
  code: string;
  version: number;
  name: string;
  nameCn: string | null;
  teaType: TeaTypeCode;
  dosePer100ml: string;
  tempC: string;
  rinseSec: number;
  infusionsSec: number[];
  maxInfusions: number;
  notes: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface UserSessionPreset {
  id: UserSessionPresetId;
  userId: UserId;
  baseTemplateId: DefaultSessionPresetId | null;
  name: string;
  nameCn: string | null;
  teaType: TeaTypeCode;
  dosePer100ml: string;
  tempC: string;
  rinseSec: number;
  infusionsSec: number[];
  maxInfusions: number;
  notes: string | null;
  sortOrder: number;
  revision: number;
  deletedAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface PresetSyncState {
  deviceId: DeviceId;
  lastSyncedRevision: number;
  syncedAt: ISODateTime | null;
}

export interface PresetSyncUpsert {
  id: UserSessionPresetId;
  revision: number;
  name: string;
  nameCn: string | null;
  teaType: TeaTypeCode;
  dosePer100ml: string;
  tempC: string;
  rinseSec: number;
  infusionsSec: number[];
  maxInfusions: number;
  sortOrder: number;
  deleted: false;
  updatedAt: ISODateTime;
}

export interface PresetSyncDelete {
  id: UserSessionPresetId;
  revision: number;
  deletedAt: ISODateTime;
}

export interface PresetSyncDeltaResponse {
  schemaVersion: 1;
  deviceId: DeviceId;
  revision: number;
  upserts: PresetSyncUpsert[];
  deletes: PresetSyncDelete[];
}
