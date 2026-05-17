import type { DeviceId } from "../../device/types/device.model";
import type { UserSessionPresetId } from "../../session-preset/types/session-preset.model";
import type { TeaId } from "../../tea/types/tea.model";
import type { ISODateTime, UserId } from "../../user/types/user.model";

export type UnixSeconds = number;
export type TeaSessionId = string;
export type LocalTeaSessionRecordId = string;

export interface DeviceSessionLogRecord {
  id: LocalTeaSessionRecordId;
  presetIndex: number;
  presetName: string;
  startedAt: UnixSeconds;
  finishedAt: UnixSeconds;
  rinseStartedAt: UnixSeconds;
  infusionStartedAt: UnixSeconds[];
  finishedEarly: boolean;
  completedInfusionCount: number;
  infusionSec: number[];
  rinseSec: number;
}

export interface TeaSession {
  id: TeaSessionId;
  userId: UserId;
  deviceId: DeviceId;
  localRecordId: LocalTeaSessionRecordId;
  teaId: TeaId | null;
  presetId: UserSessionPresetId | null;
  presetIndex: number | null;
  presetName: string;
  startedAt: ISODateTime | null;
  finishedAt: ISODateTime | null;
  rinseStartedAt: ISODateTime | null;
  infusionStartedAt: Array<ISODateTime | null>;
  finishedEarly: boolean;
  completedInfusionCount: number;
  infusionSec: number[];
  rinseSec: number;
  rawPayload: DeviceSessionLogRecord;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
