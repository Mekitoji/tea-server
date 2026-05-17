import { SessionPresetMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DB } from "../../../db";
import type { UserPresetRepository } from "../repositories/user-preset.repository";
import type { TransactionBuilder } from "kysely";

@UseCaseTelemetry
export class DeleteUserSessionPresetUseCase {
  constructor(
    private readonly userPresetRepository: UserPresetRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(input: { id: string; userId: string }) {
    return this.transaction.execute(async (trx) => {
      const trxUserPresetRepository =
        this.userPresetRepository.withTransaction(trx);
      const revision =
        await trxUserPresetRepository.getNextUserPresetRevision(input.userId);

      return trxUserPresetRepository
        .softDeleteUserPreset(input.id, input.userId, revision)
        .then((row) =>
          row ? SessionPresetMapper.toUserSessionPreset(row) : null,
        );
    });
  }
}
