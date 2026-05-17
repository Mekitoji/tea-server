import type { Transaction } from "kysely";
import type { AppDb, DB, NewDevicePairingRow } from "../../db";

export interface CreateDevicePairingRecord {
  id: string;
  deviceUid: string;
  name?: string | null;
  model: string;
  firmwareVersion: string;
  userCodeHash: string;
  pairingSecretHash: string;
  expiresAt: Date;
}

export class DevicePairingRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "device_pairings";

  withTransaction(transaction: Transaction<DB>) {
    return new DevicePairingRepository(transaction);
  }

  create(record: CreateDevicePairingRecord) {
    const now = new Date();
    const row: NewDevicePairingRow = {
      id: record.id,
      device_uid: record.deviceUid,
      name: record.name ?? null,
      model: record.model,
      firmware_version: record.firmwareVersion,
      user_code_hash: record.userCodeHash,
      pairing_secret_hash: record.pairingSecretHash,
      claimed_by_user_id: null,
      claimed_device_id: null,
      authorized_at: null,
      expires_at: record.expiresAt,
      consumed_at: null,
      created_at: now,
      updated_at: now,
    };

    return this.db
      .insertInto(this.table)
      .values(row)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  findByUserCodeHash(userCodeHash: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("user_code_hash", "=", userCodeHash)
      .executeTakeFirst();
  }

  countActiveByDeviceUid(deviceUid: string, since: Date) {
    return this.db
      .selectFrom(this.table)
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("device_uid", "=", deviceUid)
      .where("created_at", ">=", since)
      .where("claimed_device_id", "is", null)
      .where("consumed_at", "is", null)
      .executeTakeFirst();
  }

  findByIdAndSecretHashForUpdate(id: string, pairingSecretHash: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("id", "=", id)
      .where("pairing_secret_hash", "=", pairingSecretHash)
      .forUpdate()
      .executeTakeFirst();
  }

  claim(id: string, userId: string, deviceId: string) {
    const now = new Date();

    return this.db
      .updateTable(this.table)
      .set({
        claimed_by_user_id: userId,
        claimed_device_id: deviceId,
        updated_at: now,
      })
      .where("id", "=", id)
      .where("claimed_device_id", "is", null)
      .where("consumed_at", "is", null)
      .where("expires_at", ">", now)
      .returningAll()
      .executeTakeFirst();
  }

  markAuthorized(id: string) {
    const now = new Date();

    return this.db
      .updateTable(this.table)
      .set({
        authorized_at: now,
        updated_at: now,
      })
      .where("id", "=", id)
      .where("authorized_at", "is", null)
      .returningAll()
      .executeTakeFirst();
  }

  markConsumed(id: string) {
    const now = new Date();

    return this.db
      .updateTable(this.table)
      .set({
        consumed_at: now,
        updated_at: now,
      })
      .where("id", "=", id)
      .where("consumed_at", "is", null)
      .returningAll()
      .executeTakeFirst();
  }
}

export const createDevicePairingRepository = (db: AppDb) =>
  new DevicePairingRepository(db);
