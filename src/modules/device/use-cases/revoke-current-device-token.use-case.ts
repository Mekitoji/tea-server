import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DeviceTokenRepository } from "../device-token.repository";
import type { DeviceTokenPrincipal } from "../types/device.model";

@UseCaseTelemetry
export class RevokeCurrentDeviceTokenUseCase {
  constructor(private readonly deviceTokenRepository: DeviceTokenRepository) {}

  async exec(currentDevice: DeviceTokenPrincipal) {
    await this.deviceTokenRepository.revoke(currentDevice.tokenId);

    return { ok: true as const };
  }
}
