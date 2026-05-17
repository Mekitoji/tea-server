import type { AppDb } from "../../db";

export class TeaTypeRepository {
  constructor(private readonly db: AppDb) {}

  private readonly table = "tea_types";

  listTeaTypes() {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("is_active", "=", true)
      .orderBy("sort_order", "asc")
      .execute();
  }

  findTeaTypeById(id: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }
}

export const createTeaTypeRepository = (db: AppDb) =>
  new TeaTypeRepository(db);
