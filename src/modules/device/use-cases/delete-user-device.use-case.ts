import { NotFoundError } from "../../../shared/errors";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DeviceRepository } from "../device.repository";

export interface DeleteUserDeviceInput {
  deviceId: string;
  userId: string;
}

@UseCaseTelemetry
export class DeleteUserDeviceUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async exec(input: DeleteUserDeviceInput) {
    const deletedDevice = await this.deviceRepository.deleteForUser(
      input.deviceId,
      input.userId,
    );

    if (!deletedDevice) {
      throw new NotFoundError("Device not found");
    }

    return { ok: true as const };
  }
}
