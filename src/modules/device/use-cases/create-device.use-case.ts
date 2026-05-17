import { DeviceHelper, DeviceMapper } from "../libs";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DeviceRepository } from "../device.repository";

export interface CreateDeviceInput {
  userId: string;
  deviceUid: string;
  name: string;
  model: string;
  firmwareVersion: string;
}

@UseCaseTelemetry
export class CreateDeviceUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async exec(input: CreateDeviceInput) {
    return this.deviceRepository
      .create({
        id: DeviceHelper.generateDeviceId(),
        userId: input.userId,
        deviceUid: input.deviceUid,
        name: input.name,
        model: input.model,
        firmwareVersion: input.firmwareVersion,
      })
      .then(DeviceMapper.toDevice);
  }
}
