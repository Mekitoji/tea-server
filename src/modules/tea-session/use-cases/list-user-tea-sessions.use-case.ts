import { TeaSessionMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { TeaSessionRepository } from "../tea-session.repository";

@UseCaseTelemetry
export class ListUserTeaSessionsUseCase {
  constructor(private readonly teaSessionRepository: TeaSessionRepository) {}

  async exec(userId: string) {
    return this.teaSessionRepository
      .listByUserId(userId)
      .then((rows) => rows.map(TeaSessionMapper.toTeaSession));
  }
}
