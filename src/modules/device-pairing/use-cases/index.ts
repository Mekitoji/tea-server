import { ClaimDevicePairingUseCase } from "./claim-device-pairing.use-case";
import { CompleteDevicePairingUseCase } from "./complete-device-pairing.use-case";
import { CreateDevicePairingUseCase } from "./create-device-pairing.use-case";
import { GetDevicePairingStatusUseCase } from "./get-device-pairing-status.use-case";
import type { DB } from "../../../db";
import type { DeviceRepository } from "../../device/device.repository";
import type { DeviceTokenRepository } from "../../device/device-token.repository";
import type { DevicePairingRepository } from "../device-pairing.repository";
import type { TransactionBuilder } from "kysely";

export interface DevicePairingUseCases {
  CreateDevicePairing: CreateDevicePairingUseCase;
}

export interface DevicePairingUseCasesTransactionFactory {
  createClaimDevicePairing(): ClaimDevicePairingUseCase;
  createGetDevicePairingStatus(): GetDevicePairingStatusUseCase;
  createCompleteDevicePairing(): CompleteDevicePairingUseCase;
}

export const createDevicePairingUseCases = (
  devicePairingRepository: DevicePairingRepository,
  deviceRepository: DeviceRepository,
): DevicePairingUseCases => ({
  CreateDevicePairing: new CreateDevicePairingUseCase(
    devicePairingRepository,
    deviceRepository,
  ),
});

export class DevicePairingUseCaseFactory
  implements DevicePairingUseCasesTransactionFactory
{
  constructor(
    private readonly devicePairingRepository: DevicePairingRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly deviceTokenRepository: DeviceTokenRepository,
    private readonly transaction: () => TransactionBuilder<DB>,
  ) {}

  createClaimDevicePairing() {
    return new ClaimDevicePairingUseCase(
      this.devicePairingRepository,
      this.deviceRepository,
      this.transaction(),
    );
  }

  createGetDevicePairingStatus() {
    return new GetDevicePairingStatusUseCase(
      this.devicePairingRepository,
      this.deviceTokenRepository,
      this.transaction(),
    );
  }

  createCompleteDevicePairing() {
    return new CompleteDevicePairingUseCase(
      this.devicePairingRepository,
      this.transaction(),
    );
  }
}
