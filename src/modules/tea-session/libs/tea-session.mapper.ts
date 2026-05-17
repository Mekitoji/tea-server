import type { SessionRecordRow } from "../../../db";
import type {
  DeviceSessionLogRecord,
  TeaSession,
} from "../types/tea-session.model";

export class TeaSessionMapper {
  static toTeaSession = (row: SessionRecordRow): TeaSession => ({
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    localRecordId: row.local_record_id,
    teaId: row.tea_id,
    presetId: row.preset_id,
    presetIndex: row.preset_index,
    presetName: row.preset_name,
    startedAt: row.started_at?.toISOString() ?? null,
    finishedAt: row.finished_at?.toISOString() ?? null,
    rinseStartedAt: row.rinse_started_at?.toISOString() ?? null,
    infusionStartedAt: row.infusion_started_at.map(
      (startedAt) => startedAt?.toISOString() ?? null,
    ),
    finishedEarly: row.finished_early,
    completedInfusionCount: row.completed_infusion_count,
    infusionSec: row.infusion_sec,
    rinseSec: row.rinse_sec,
    rawPayload: row.raw_payload as unknown as DeviceSessionLogRecord,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}
