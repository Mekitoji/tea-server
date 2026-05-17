import { DeviceMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DeviceRepository } from "../device.repository";

@UseCaseTelemetry
export class ListAllDevicesUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async exec(userId: string) {
    return this.deviceRepository
      .listByUserId(userId)
      .then((rows) => rows.map(DeviceMapper.toDevice));
  }
}
