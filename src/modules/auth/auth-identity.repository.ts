import type { Transaction } from "kysely";
import type { AppDb, DB, NewAuthIdentityRow } from "../../db";
import type { AuthProvider } from "./types/auth.model";

export interface CreateIdentityRecord {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerSubject: string;
  email: string;
  passwordHash?: string | null;
}

export class AuthIdentityRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "auth_identities";

  withTransaction(transaction: Transaction<DB>) {
    return new AuthIdentityRepository(transaction);
  }

  create(record: CreateIdentityRecord) {
    const now = new Date();
    const row: NewAuthIdentityRow = {
      id: record.id,
      user_id: record.userId,
      provider: record.provider,
      provider_subject: record.providerSubject,
      email: record.email,
      password_hash: record.passwordHash ?? null,
      created_at: now,
      updated_at: now,
    };

    return this.db
      .insertInto(this.table)
      .values(row)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  findByProviderSubject(provider: AuthProvider, providerSubject: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("provider", "=", provider)
      .where("provider_subject", "=", providerSubject)
      .executeTakeFirst();
  }

  findLocalByEmail(email: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("provider", "=", "local")
      .where("provider_subject", "=", email.toLowerCase())
      .executeTakeFirst();
  }
}

export const createAuthIdentityRepository = (db: AppDb) =>
  new AuthIdentityRepository(db);
