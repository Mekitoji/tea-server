import { TeaMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { TeaTypeRepository } from "../tea-type.repository";

@UseCaseTelemetry
export class ListTeaTypesUseCase {
  constructor(private readonly teaTypeRepository: TeaTypeRepository) {}

  async exec() {
    return this.teaTypeRepository
      .listTeaTypes()
      .then((rows) => rows.map(TeaMapper.toTeaType));
  }
}
