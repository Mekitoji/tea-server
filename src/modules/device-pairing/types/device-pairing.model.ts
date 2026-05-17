import type { Device } from "../../device/types/device.model";

export interface CreateDevicePairingRequest {
  deviceUid: string;
  name?: string;
  model: string;
  firmwareVersion: string;
}

export interface CreateDevicePairingResponse {
  status: "pending";
  pairingId: string;
  pairingSecret: string;
  userCode: string;
  verificationUri: string;
  expiresAt: string;
  pollIntervalSec: number;
}

export interface ClaimDevicePairingRequest {
  userCode: string;
  name?: string;
}

export interface ClaimDevicePairingResponse {
  status: "claimed";
  device: Device;
}

export type DevicePairingStatusResponse =
  | {
      status: "pending";
      serverTime: number;
      expiresAt: string;
      pollIntervalSec: number;
    }
  | {
      status: "expired";
      serverTime: number;
    }
  | {
      status: "authorized";
      serverTime: number;
      deviceId: string;
      deviceToken: string;
      tokenType: "Bearer";
    }
  | {
      status: "consumed";
      serverTime: number;
      deviceId: string;
    };

export interface CompleteDevicePairingResponse {
  ok: true;
  status: "consumed";
  serverTime: number;
  deviceId: string;
}
