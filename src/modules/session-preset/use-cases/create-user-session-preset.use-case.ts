import { SessionPresetHelper, SessionPresetMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DB } from "../../../db";
import type { TeaTypeCode } from "../../tea/types/tea.model";
import type { UserPresetRepository } from "../repositories/user-preset.repository";
import type { TransactionBuilder } from "kysely";

export interface CreateUserSessionPresetInput {
  userId: string;
  baseTemplateId?: string | null;
  name: string;
  nameCn?: string | null;
  teaType: TeaTypeCode;
  dosePer100ml: string;
  tempC: string;
  rinseSec: number;
  infusionsSec: number[];
  maxInfusions: number;
  notes?: string | null;
  sortOrder?: number;
}

@UseCaseTelemetry
export class CreateUserSessionPresetUseCase {
  constructor(
    private readonly userPresetRepository: UserPresetRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(input: CreateUserSessionPresetInput) {
    return this.transaction.execute(async (trx) => {
      const trxUserPresetRepository =
        this.userPresetRepository.withTransaction(trx);
      const revision =
        await trxUserPresetRepository.getNextUserPresetRevision(input.userId);

      return trxUserPresetRepository
        .createUserPreset({
          id: SessionPresetHelper.generateUserSessionPresetId(),
          userId: input.userId,
          baseTemplateId: input.baseTemplateId,
          name: input.name,
          nameCn: input.nameCn,
          teaType: input.teaType,
          dosePer100ml: input.dosePer100ml,
          tempC: input.tempC,
          rinseSec: input.rinseSec,
          infusionsSec: input.infusionsSec,
          maxInfusions: input.maxInfusions,
          notes: input.notes,
          sortOrder: input.sortOrder ?? 0,
          revision,
        })
        .then(SessionPresetMapper.toUserSessionPreset);
    });
  }
}
