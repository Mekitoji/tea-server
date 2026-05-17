import type {
  DefaultPresetTemplateRow,
  PresetSyncStateRow,
  UserPresetRow,
} from "../../../db";
import type {
  DefaultSessionPreset,
  PresetSyncState,
  PresetSyncDelete,
  PresetSyncUpsert,
  UserSessionPreset,
} from "../types/session-preset.model";

export class SessionPresetMapper {
  static toDefaultSessionPreset = (
    row: DefaultPresetTemplateRow,
  ): DefaultSessionPreset => ({
    id: row.id,
    code: row.code,
    version: row.version,
    name: row.name,
    nameCn: row.name_cn,
    teaType: row.tea_type,
    dosePer100ml: row.dose_per_100ml,
    tempC: row.temp_c,
    rinseSec: row.rinse_sec,
    infusionsSec: row.infusions_sec,
    maxInfusions: row.max_infusions,
    notes: row.notes,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });

  static toUserSessionPreset = (row: UserPresetRow): UserSessionPreset => ({
    id: row.id,
    userId: row.user_id,
    baseTemplateId: row.base_template_id,
    name: row.name,
    nameCn: row.name_cn,
    teaType: row.tea_type,
    dosePer100ml: row.dose_per_100ml,
    tempC: row.temp_c,
    rinseSec: row.rinse_sec,
    infusionsSec: row.infusions_sec,
    maxInfusions: row.max_infusions,
    notes: row.notes,
    sortOrder: row.sort_order,
    revision: row.revision,
    deletedAt: row.deleted_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });

  static toPresetSyncState = (row: PresetSyncStateRow): PresetSyncState => ({
    deviceId: row.device_id,
    lastSyncedRevision: row.last_synced_revision,
    syncedAt: row.synced_at?.toISOString() ?? null,
  });

  static toSyncUpsert = (row: UserPresetRow): PresetSyncUpsert => ({
    id: row.id,
    revision: row.revision,
    name: row.name,
    nameCn: row.name_cn,
    teaType: row.tea_type,
    dosePer100ml: row.dose_per_100ml,
    tempC: row.temp_c,
    rinseSec: row.rinse_sec,
    infusionsSec: row.infusions_sec,
    maxInfusions: row.max_infusions,
    sortOrder: row.sort_order,
    deleted: false,
    updatedAt: row.updated_at.toISOString(),
  });

  static toSyncDelete = (row: UserPresetRow): PresetSyncDelete => ({
    id: row.id,
    revision: row.revision,
    deletedAt: row.deleted_at?.toISOString() ?? row.updated_at.toISOString(),
  });
}
