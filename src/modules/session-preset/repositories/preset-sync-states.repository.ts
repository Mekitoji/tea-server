import type { AppDb, NewPresetSyncStateRow } from "../../../db";

export interface UpsertPresetSyncStateRecord {
  deviceId: string;
  lastSyncedRevision: number;
  syncedAt: Date | null;
}

export class PresetSyncStatesRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "preset_sync_states";

  findSyncStateByDeviceId(deviceId: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("device_id", "=", deviceId)
      .executeTakeFirst();
  }

  upsertSyncState(record: UpsertPresetSyncStateRecord) {
    const row: NewPresetSyncStateRow = {
      device_id: record.deviceId,
      last_synced_revision: record.lastSyncedRevision,
      synced_at: record.syncedAt,
    };

    return this.db
      .insertInto(this.table)
      .values(row)
      .onConflict((oc) =>
        oc.column("device_id").doUpdateSet({
          last_synced_revision: record.lastSyncedRevision,
          synced_at: record.syncedAt,
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
