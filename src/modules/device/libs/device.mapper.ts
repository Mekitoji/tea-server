import type { Device } from "../types/device.model";
import type { DeviceRepository } from "../device.repository";

export class DeviceMapper {
  static toDevice = (
    row: Awaited<ReturnType<DeviceRepository["create"]>>,
  ): Device => ({
    id: row.id,
    userId: row.user_id,
    deviceUid: row.device_uid,
    name: row.name,
    model: row.model,
    firmwareVersion: row.firmware_version,
    lastSeenAt: row.last_seen_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}
