import type { Transaction } from "kysely";
import type { AppDb, DB, NewUserPresetRow } from "../../../db";

export interface CreateUserSessionPresetRecord {
  id: string;
  userId: string;
  baseTemplateId?: string | null;
  name: string;
  nameCn?: string | null;
  teaType: string;
  dosePer100ml: string;
  tempC: string;
  rinseSec: number;
  infusionsSec: number[];
  maxInfusions: number;
  notes?: string | null;
  sortOrder: number;
  revision: number;
}

export class UserPresetRepository {
  constructor(private readonly db: AppDb) {}

  private readonly table = "user_presets";

  withTransaction(transaction: Transaction<DB>) {
    return new UserPresetRepository(transaction);
  }

  listUserPresets(userId: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("user_id", "=", userId)
      .where("deleted_at", "is", null)
      .orderBy("sort_order", "asc")
      .execute();
  }

  listUserPresetsChangedAfterRevision(userId: string, revision: number) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("user_id", "=", userId)
      .where("revision", ">", revision)
      .orderBy("revision", "asc")
      .execute();
  }

  async getNextUserPresetRevision(userId: string) {
    const row = await this.db
      .selectFrom(this.table)
      .select(({ fn }) => fn.max<number>("revision").as("maxRevision"))
      .where("user_id", "=", userId)
      .executeTakeFirst();

    return (row?.maxRevision ?? 0) + 1;
  }

  createUserPreset(record: CreateUserSessionPresetRecord) {
    const now = new Date();
    const row: NewUserPresetRow = {
      id: record.id,
      user_id: record.userId,
      base_template_id: record.baseTemplateId ?? null,
      name: record.name,
      name_cn: record.nameCn ?? null,
      tea_type: record.teaType,
      dose_per_100ml: record.dosePer100ml,
      temp_c: record.tempC,
      rinse_sec: record.rinseSec,
      infusions_sec: record.infusionsSec,
      max_infusions: record.maxInfusions,
      notes: record.notes ?? null,
      sort_order: record.sortOrder,
      revision: record.revision,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };

    return this.db
      .insertInto(this.table)
      .values(row)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  softDeleteUserPreset(id: string, userId: string, revision: number) {
    const now = new Date();

    return this.db
      .updateTable(this.table)
      .set({
        deleted_at: now,
        revision,
        updated_at: now,
      })
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .where("deleted_at", "is", null)
      .returningAll()
      .executeTakeFirst();
  }
}
