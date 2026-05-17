import { SessionPresetMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { UserPresetRepository } from "../repositories/user-preset.repository";

@UseCaseTelemetry
export class ListUserSessionPresetsUseCase {
  constructor(private readonly userPresetRepository: UserPresetRepository) {}

  async exec(userId: string) {
    return this.userPresetRepository
      .listUserPresets(userId)
      .then((rows) => rows.map(SessionPresetMapper.toUserSessionPreset));
  }
}
