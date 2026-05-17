import type { Transaction } from "kysely";
import type { AppDb, DB, NewUserRow } from "../../db";

export interface CreateUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export class UserRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "users";

  withTransaction(transaction: Transaction<DB>) {
    return new UserRepository(transaction);
  }

  create(record: CreateUserRecord) {
    const now = new Date();
    const row: NewUserRow = {
      id: record.id,
      email: record.email,
      display_name: record.displayName,
      role: record.role,
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

  findByEmail(email: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst();
  }

  list() {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .orderBy("created_at", "desc")
      .execute();
  }
}

export const createUserRepository = (db: AppDb) => new UserRepository(db);
