import type { Transaction } from "kysely";
import type { AppDb, DB, NewAuthSessionRow } from "../../db";

export interface CreateSessionRecord {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export class AuthSessionRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "auth_sessions";

  withTransaction(transaction: Transaction<DB>) {
    return new AuthSessionRepository(transaction);
  }

  create(record: CreateSessionRecord) {
    const now = new Date();
    const row: NewAuthSessionRow = {
      id: record.id,
      user_id: record.userId,
      refresh_token_hash: record.refreshTokenHash,
      expires_at: record.expiresAt,
      revoked_at: null,
      created_at: now,
      updated_at: now,
    };

    return this.db
      .insertInto(this.table)
      .values(row)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  findActiveByRefreshTokenHash(refreshTokenHash: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("refresh_token_hash", "=", refreshTokenHash)
      .where("revoked_at", "is", null)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();
  }

  revokeByRefreshTokenHash(refreshTokenHash: string) {
    const now = new Date();

    return this.db
      .updateTable(this.table)
      .set({
        revoked_at: now,
        updated_at: now,
      })
      .where("refresh_token_hash", "=", refreshTokenHash)
      .where("revoked_at", "is", null)
      .returningAll()
      .executeTakeFirst();
  }
}

export const createAuthSessionRepository = (db: AppDb) =>
  new AuthSessionRepository(db);
