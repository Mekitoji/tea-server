import { TeaMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { TeaTypeRepository } from "../tea-type.repository";

@UseCaseTelemetry
export class FindTeaTypeByIdUseCase {
  constructor(private readonly teaTypeRepository: TeaTypeRepository) {}

  async exec(id: string) {
    return this.teaTypeRepository
      .findTeaTypeById(id)
      .then((row) => (row ? TeaMapper.toTeaType(row) : null));
  }
}
