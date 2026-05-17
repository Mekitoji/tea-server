import type { Transaction } from "kysely";
import type { AppDb, DB, NewTeaRow } from "../../db";

export interface CreateTeaRecord {
  id: string;
  userId: string;
  name: string;
  teaType: string;
  origin?: string | null;
  producer?: string | null;
  harvestYear?: number | null;
  notes?: string | null;
}

export class TeaRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "teas";

  withTransaction(transaction: Transaction<DB>) {
    return new TeaRepository(transaction);
  }

  create(record: CreateTeaRecord) {
    const now = new Date();
    const row: NewTeaRow = {
      id: record.id,
      user_id: record.userId,
      name: record.name,
      tea_type: record.teaType,
      origin: record.origin ?? null,
      producer: record.producer ?? null,
      harvest_year: record.harvestYear ?? null,
      notes: record.notes ?? null,
      archived_at: null,
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
      .where("archived_at", "is", null)
      .executeTakeFirst();
  }

  findByIdForUser(id: string, userId: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .where("archived_at", "is", null)
      .executeTakeFirst();
  }

  listByUserId(userId: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("user_id", "=", userId)
      .where("archived_at", "is", null)
      .orderBy("created_at", "desc")
      .execute();
  }

  async isTeaBelongsToUser(teaId: string, userId: string) {
    const tea = await this.db
      .selectFrom(this.table)
      .select("id")
      .where("id", "=", teaId)
      .where("user_id", "=", userId)
      .where("archived_at", "is", null)
      .executeTakeFirst();

    return Boolean(tea);
  }

  archive(id: string, userId: string) {
    const now = new Date();

    return this.db
      .updateTable(this.table)
      .set({
        archived_at: now,
        updated_at: now,
      })
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .where("archived_at", "is", null)
      .returningAll()
      .executeTakeFirst();
  }
}

export const createTeaRepository = (db: AppDb) => new TeaRepository(db);
