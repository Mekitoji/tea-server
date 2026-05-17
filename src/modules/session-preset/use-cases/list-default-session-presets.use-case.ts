import { SessionPresetMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DefaultPresetRepository } from "../repositories/default-preset.repository";

@UseCaseTelemetry
export class ListDefaultSessionPresetsUseCase {
  constructor(
    private readonly defaultPresetRepository: DefaultPresetRepository,
  ) {}

  async exec() {
    return this.defaultPresetRepository
      .listDefaultActive()
      .then((rows) => rows.map(SessionPresetMapper.toDefaultSessionPreset));
  }
}
