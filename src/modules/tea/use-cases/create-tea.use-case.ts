import { TeaHelper, TeaMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { TeaTypeCode } from "../types/tea.model";
import type { TeaRepository } from "../tea.repository";

export interface CreateTeaInput {
  userId: string;
  name: string;
  teaType: TeaTypeCode;
  origin?: string | null;
  producer?: string | null;
  harvestYear?: number | null;
  notes?: string | null;
}

@UseCaseTelemetry
export class CreateTeaUseCase {
  constructor(private readonly teaRepository: TeaRepository) {}

  async exec(input: CreateTeaInput) {
    return this.teaRepository
      .create({
        id: TeaHelper.generateTeaId(),
        userId: input.userId,
        name: input.name,
        teaType: input.teaType,
        origin: input.origin,
        producer: input.producer,
        harvestYear: input.harvestYear,
        notes: input.notes,
      })
      .then(TeaMapper.toTea);
  }
}
