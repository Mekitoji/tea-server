import type { Transaction } from "kysely";
import type { AppDb, DB, NewDeviceRow } from "../../db";

export interface CreateDeviceRecord {
  id: string;
  userId: string;
  deviceUid: string;
  name: string;
  model: string;
  firmwareVersion: string;
}

export class DeviceRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "devices";

  withTransaction(transaction: Transaction<DB>) {
    return new DeviceRepository(transaction);
  }

  create(record: CreateDeviceRecord) {
    const now = new Date();
    const row: NewDeviceRow = {
      id: record.id,
      user_id: record.userId,
      device_uid: record.deviceUid,
      name: record.name,
      model: record.model,
      firmware_version: record.firmwareVersion,
      last_seen_at: null,
      created_at: now,
      updated_at: now,
    };

    return this.db
      .insertInto(this.table)
      .values(row)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  findById(id: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  findByDeviceUid(deviceUid: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("device_uid", "=", deviceUid)
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

  updateLastSeen(id: string, lastSeenAt = new Date()) {
    return this.db
      .updateTable(this.table)
      .set({
        last_seen_at: lastSeenAt,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  list() {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .orderBy("created_at", "desc")
      .execute();
  }

  listByUserId(userId: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("user_id", "=", userId)
      .orderBy("created_at", "desc")
      .execute();
  }

  deleteForUser(id: string, userId: string) {
    return this.db
      .deleteFrom(this.table)
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .returningAll()
      .executeTakeFirst();
  }
}

export const createDeviceRepository = (db: AppDb) => new DeviceRepository(db);
