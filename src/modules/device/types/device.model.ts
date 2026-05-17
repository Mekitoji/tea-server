import type { ISODateTime, UserId } from "../../user/types/user.model";

export type DeviceId = string;
export type DeviceUid = string;

export type AudioProfile = "soft" | "normal" | "loud";

export interface Device {
  id: DeviceId;
  userId: UserId;
  deviceUid: DeviceUid;
  name: string;
  model: string;
  firmwareVersion: string;
  lastSeenAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DeviceTokenPrincipal {
  tokenId: string;
  deviceId: DeviceId;
  userId: UserId;
  deviceUid: DeviceUid;
}

export type DisplayTimeoutMs = 1000 | 30000 | 60000 | 120000 | 300000;

export interface DeviceSettings {
  deviceId: DeviceId;
  audioEnabled: boolean;
  audioProfile: AudioProfile;
  powerSaveEnabled: boolean;
  displayTimeoutMs: DisplayTimeoutMs;
  clockAutoSyncEnabled: boolean;
  timezone: string;
  lastTimerDurationSec: number;
  settingsRevision: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
