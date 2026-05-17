import type { TeaRow, TeaTypeRow } from "../../../db";
import type { Tea, TeaType } from "../types/tea.model";

export class TeaMapper {
  static toTea = (row: TeaRow): Tea => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    teaType: row.tea_type,
    origin: row.origin,
    producer: row.producer,
    harvestYear: row.harvest_year,
    notes: row.notes,
    archivedAt: row.archived_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });

  static toTeaType = (row: TeaTypeRow): TeaType => ({
    id: row.id as TeaType["id"],
    code: row.code,
    name: row.name,
    nameCn: row.name_cn,
    description: row.description,
    typicalTempC: row.typical_temp_c,
    typicalRinseSec: row.typical_rinse_sec,
    typicalInfusions: row.typical_infusions,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}
