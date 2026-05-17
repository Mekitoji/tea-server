import { TeaSessionMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { TeaSessionRepository } from "../tea-session.repository";

@UseCaseTelemetry
export class FindTeaSessionByIdUseCase {
  constructor(private readonly teaSessionRepository: TeaSessionRepository) {}

  async exec(id: string, userId: string) {
    return this.teaSessionRepository
      .findByIdForUser(id, userId)
      .then((row) => (row ? TeaSessionMapper.toTeaSession(row) : null));
  }
}
