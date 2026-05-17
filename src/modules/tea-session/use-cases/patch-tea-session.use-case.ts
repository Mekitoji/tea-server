import { TeaSessionMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DB } from "../../../db";
import type { TeaSessionRepository } from "../tea-session.repository";
import type { TeaRepository } from "../../tea/tea.repository";
import type { TransactionBuilder } from "kysely";

export interface PatchTeaSessionInput {
  sessionId: string;
  userId: string;
  teaId: string | null;
}

@UseCaseTelemetry
export class PatchTeaSessionUseCase {
  constructor(
    private readonly teaSessionRepository: TeaSessionRepository,
    private readonly teaRepository: TeaRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(input: PatchTeaSessionInput) {
    return this.transaction.execute(async (trx) => {
      const trxTeaSessionRepository =
        this.teaSessionRepository.withTransaction(trx);
      const trxTeaRepository = this.teaRepository.withTransaction(trx);

      if (
        input.teaId &&
        !(await trxTeaRepository.isTeaBelongsToUser(input.teaId, input.userId))
      ) {
        return null;
      }

      return trxTeaSessionRepository
        .attachTea(input.sessionId, input.userId, input.teaId)
        .then((row) => (row ? TeaSessionMapper.toTeaSession(row) : null));
    });
  }
}
