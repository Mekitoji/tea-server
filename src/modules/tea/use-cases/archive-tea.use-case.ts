import { TeaMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { TeaRepository } from "../tea.repository";

@UseCaseTelemetry
export class ArchiveTeaUseCase {
  constructor(private readonly teaRepository: TeaRepository) {}

  async exec(id: string, userId: string) {
    return this.teaRepository
      .archive(id, userId)
      .then((row) => (row ? TeaMapper.toTea(row) : null));
  }
}
