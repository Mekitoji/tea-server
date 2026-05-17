import { AuthHelper } from "../../auth/libs";
import type { DeviceRepository } from "../../device/device.repository";
import { ConflictError } from "../../../shared/errors";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import { DevicePairingHelper } from "../libs";
import type { DevicePairingRepository } from "../device-pairing.repository";
import type {
  CreateDevicePairingRequest,
  CreateDevicePairingResponse,
} from "../types";

@UseCaseTelemetry
export class CreateDevicePairingUseCase {
  constructor(
    private readonly devicePairingRepository: DevicePairingRepository,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async exec(
    input: CreateDevicePairingRequest,
  ): Promise<CreateDevicePairingResponse> {
    const userCode = DevicePairingHelper.generateUserCode();
    const normalizedUserCode = DevicePairingHelper.normalizeUserCode(userCode);
    const pairingSecret = DevicePairingHelper.generatePairingSecret();
    const expiresAt = DevicePairingHelper.pairingExpiresAt();
    const existingDevice = await this.deviceRepository.findByDeviceUid(
      input.deviceUid,
    );

    if (existingDevice) {
      throw new ConflictError("Device is already registered");
    }

    const activePairings =
      await this.devicePairingRepository.countActiveByDeviceUid(
        input.deviceUid,
        DevicePairingHelper.activePairingWindowStart(),
      );
    const activePairingCount = Number(activePairings?.count ?? 0);

    if (
      activePairingCount >= DevicePairingHelper.maxActivePairingsPerDevice()
    ) {
      throw new ConflictError("Device has too many active pairing attempts");
    }

    const pairing = await this.devicePairingRepository.create({
      id: DevicePairingHelper.generatePairingId(),
      deviceUid: input.deviceUid,
      name: input.name,
      model: input.model,
      firmwareVersion: input.firmwareVersion,
      userCodeHash: await DevicePairingHelper.hashUserCode(normalizedUserCode),
      pairingSecretHash: await AuthHelper.hashToken(pairingSecret),
      expiresAt,
    });

    return {
      status: "pending",
      pairingId: pairing.id,
      pairingSecret,
      userCode,
      verificationUri: DevicePairingHelper.verificationUri(userCode),
      expiresAt: pairing.expires_at.toISOString(),
      pollIntervalSec: DevicePairingHelper.pollIntervalSec(),
    };
  }
}
