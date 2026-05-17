import type { Transaction } from "kysely";
import type { AppDb, DB, NewDeviceTokenRow } from "../../db";

export interface CreateDeviceTokenRecord {
  id: string;
  deviceId: string;
  tokenHash: string;
  expiresAt?: Date | null;
}

export class DeviceTokenRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "device_tokens";

  withTransaction(transaction: Transaction<DB>) {
    return new DeviceTokenRepository(transaction);
  }

  create(record: CreateDeviceTokenRecord) {
    const now = new Date();
    const row: NewDeviceTokenRow = {
      id: record.id,
      device_id: record.deviceId,
      token_hash: record.tokenHash,
      expires_at: record.expiresAt ?? null,
      revoked_at: null,
      last_used_at: null,
      created_at: now,
      updated_at: now,
    };

    return this.db
      .insertInto(this.table)
      .values(row)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  findActiveByTokenHash(tokenHash: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("token_hash", "=", tokenHash)
      .where("revoked_at", "is", null)
      .where((eb) =>
        eb.or([
          eb("expires_at", "is", null),
          eb("expires_at", ">", new Date()),
        ]),
      )
      .executeTakeFirst();
  }

  touch(id: string, usedAt = new Date()) {
    return this.db
      .updateTable(this.table)
      .set({
        last_used_at: usedAt,
        updated_at: usedAt,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  revoke(id: string, revokedAt = new Date()) {
    return this.db
      .updateTable(this.table)
      .set({
        revoked_at: revokedAt,
        updated_at: revokedAt,
      })
      .where("id", "=", id)
      .where("revoked_at", "is", null)
      .returningAll()
      .executeTakeFirst();
  }

  revokeActiveForDevice(deviceId: string, revokedAt = new Date()) {
    return this.db
      .updateTable(this.table)
      .set({
        revoked_at: revokedAt,
        updated_at: revokedAt,
      })
      .where("device_id", "=", deviceId)
      .where("revoked_at", "is", null)
      .where((eb) =>
        eb.or([
          eb("expires_at", "is", null),
          eb("expires_at", ">", revokedAt),
        ]),
      )
      .execute();
  }
}

export const createDeviceTokenRepository = (db: AppDb) =>
  new DeviceTokenRepository(db);
