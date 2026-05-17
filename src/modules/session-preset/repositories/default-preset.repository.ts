import type { AppDb } from "../../../db";

export class DefaultPresetRepository {
  constructor(private readonly db: AppDb) {}
  private readonly table = "default_preset_templates";

  listDefaultActive() {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where("is_active", "=", true)
      .orderBy("sort_order", "asc")
      .execute();
  }
}

export const createDefaultPresetRepository = (db: AppDb) =>
  new DefaultPresetRepository(db);
