import { DeviceHelper, DeviceMapper } from "../../device/libs";
import type { DeviceRepository } from "../../device/device.repository";
import type { DB } from "../../../db";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../shared/errors";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import { DevicePairingHelper } from "../libs";
import type { DevicePairingRepository } from "../device-pairing.repository";
import type {
  ClaimDevicePairingRequest,
  ClaimDevicePairingResponse,
} from "../types";
import type { TransactionBuilder } from "kysely";

export interface ClaimDevicePairingInput extends ClaimDevicePairingRequest {
  userId: string;
}

@UseCaseTelemetry
export class ClaimDevicePairingUseCase {
  constructor(
    private readonly devicePairingRepository: DevicePairingRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(
    input: ClaimDevicePairingInput,
  ): Promise<ClaimDevicePairingResponse> {
    const normalizedUserCode = DevicePairingHelper.normalizeUserCode(
      input.userCode,
    );

    if (normalizedUserCode.length < 6) {
      throw new BadRequestError("Device pairing code is invalid");
    }

    const userCodeHash = await DevicePairingHelper.hashUserCode(
      normalizedUserCode,
    );

    return this.transaction.execute(async (trx) => {
      const trxDevicePairingRepository =
        this.devicePairingRepository.withTransaction(trx);
      const trxDeviceRepository = this.deviceRepository.withTransaction(trx);
      const pairing =
        await trxDevicePairingRepository.findByUserCodeHash(userCodeHash);

      if (!pairing) {
        throw new NotFoundError("Device pairing code not found");
      }

      if (pairing.claimed_device_id) {
        throw new ConflictError("Device pairing code has already been claimed");
      }

      if (pairing.expires_at <= new Date()) {
        throw new BadRequestError("Device pairing code has expired");
      }

      const existingDevice = await trxDeviceRepository.findByDeviceUid(
        pairing.device_uid,
      );

      if (existingDevice) {
        throw new ConflictError("Device is already registered");
      }

      const device = await trxDeviceRepository.create({
        id: DeviceHelper.generateDeviceId(),
        userId: input.userId,
        deviceUid: pairing.device_uid,
        name:
          input.name ??
          pairing.name ??
          DevicePairingHelper.defaultDeviceName(
            pairing.model,
            pairing.device_uid,
          ),
        model: pairing.model,
        firmwareVersion: pairing.firmware_version,
      });

      const claimedPairing = await trxDevicePairingRepository.claim(
        pairing.id,
        input.userId,
        device.id,
      );

      if (!claimedPairing) {
        throw new ConflictError("Device pairing code has already been claimed");
      }

      return {
        status: "claimed",
        device: DeviceMapper.toDevice(device),
      };
    });
  }
}
