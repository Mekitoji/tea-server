import type { Transaction } from "kysely";
import type { AppDb, DB, NewSessionRecordRow } from "../../db";
import type { DeviceSessionLogRecord } from "./types/tea-session.model";

export interface CreateTeaSessionFromDeviceRecord {
  id: string;
  userId: string;
  deviceId: string;
  localRecordId: string;
  presetId?: string | null;
  presetIndex?: number | null;
  presetName: string;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  rinseStartedAt?: Date | null;
  infusionStartedAt: Array<Date | null>;
  finishedEarly: boolean;
  completedInfusionCount: number;
  infusionSec: number[];
  rinseSec: number;
  rawPayload: DeviceSessionLogRecord;
}

export class TeaSessionRepository {
  private readonly table = "session_records";

  constructor(private readonly db: AppDb) {}

  withTransaction(transaction: Transaction<DB>) {
    return new TeaSessionRepository(transaction);
  }

  createFromDevice(record: CreateTeaSessionFromDeviceRecord) {
    const now = new Date();
    const row: NewSessionRecordRow = {
      id: record.id,
      user_id: record.userId,
      device_id: record.deviceId,
      local_record_id: record.localRecordId,
      tea_id: null,
      preset_id: record.presetId ?? null,
      preset_index: record.presetIndex ?? null,
      preset_name: record.presetName,
      started_at: record.startedAt ?? null,
      finished_at: record.finishedAt ?? null,
      rinse_started_at: record.rinseStartedAt ?? null,
      infusion_started_at: record.infusionStartedAt,
      finished_early: record.finishedEarly,
      completed_infusion_count: record.completedInfusionCount,
      infusion_sec: record.infusionSec,
      rinse_sec: record.rinseSec,
      raw_payload: record.rawPayload as unknown as Record<string, unknown>,
      created_at: now,
      updated_at: now,
    };

    return this.db
      .insertInto(this.table)
      .values(row)
      .onConflict((oc) =>
        oc.columns(["device_id", "local_record_id"]).doNothing(),
      )
      .returningAll()
      .executeTakeFirst();
  }

  findById(id: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  findByIdForUser(id: string, userId: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .executeTakeFirst();
  }

  listByUserId(userId: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("user_id", "=", userId)
      .orderBy("started_at", "desc")
      .orderBy("created_at", "desc")
      .execute();
  }

  attachTea(sessionId: string, userId: string, teaId: string | null) {
    return this.db
      .updateTable(this.table)
      .set({
        tea_id: teaId,
        updated_at: new Date(),
      })
      .where("id", "=", sessionId)
      .where("user_id", "=", userId)
      .returningAll()
      .executeTakeFirst();
  }
}

export const createTeaSessionRepository = (db: AppDb) =>
  new TeaSessionRepository(db);
