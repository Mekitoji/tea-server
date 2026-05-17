import { DeviceMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DeviceRepository } from "../device.repository";

@UseCaseTelemetry
export class FindDeviceByIdUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async exec(id: string, userId: string) {
    return this.deviceRepository
      .findByIdForUser(id, userId)
      .then((row) => (row ? DeviceMapper.toDevice(row) : null));
  }
}
