import { TeaMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { TeaRepository } from "../tea.repository";

@UseCaseTelemetry
export class ListUserTeasUseCase {
  constructor(private readonly teaRepository: TeaRepository) {}

  async exec(userId: string) {
    return this.teaRepository
      .listByUserId(userId)
      .then((rows) => rows.map(TeaMapper.toTea));
  }
}
