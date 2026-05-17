import { AuthHelper } from "../../auth/libs";
import { DeviceHelper } from "../../device/libs";
import type { DeviceTokenRepository } from "../../device/device-token.repository";
import type { DB } from "../../../db";
import { UnauthorizedError } from "../../../shared/errors";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import { DevicePairingHelper } from "../libs";
import type { DevicePairingRepository } from "../device-pairing.repository";
import type { DevicePairingStatusResponse } from "../types";
import type { TransactionBuilder } from "kysely";

export interface GetDevicePairingStatusInput {
  pairingId: string;
  pairingSecret: string;
}

@UseCaseTelemetry
export class GetDevicePairingStatusUseCase {
  constructor(
    private readonly devicePairingRepository: DevicePairingRepository,
    private readonly deviceTokenRepository: DeviceTokenRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(
    input: GetDevicePairingStatusInput,
  ): Promise<DevicePairingStatusResponse> {
    const pairingSecretHash = await AuthHelper.hashToken(input.pairingSecret);

    return this.transaction.execute(async (trx) => {
      const trxDevicePairingRepository =
        this.devicePairingRepository.withTransaction(trx);
      const trxDeviceTokenRepository =
        this.deviceTokenRepository.withTransaction(trx);
      const pairing =
        await trxDevicePairingRepository.findByIdAndSecretHashForUpdate(
          input.pairingId,
          pairingSecretHash,
        );

      if (!pairing) {
        throw new UnauthorizedError();
      }

      const serverTime = Math.floor(Date.now() / 1000);

      if (!pairing.claimed_device_id) {
        if (pairing.expires_at <= new Date()) {
          return {
            status: "expired",
            serverTime,
          };
        }

        return {
          status: "pending",
          serverTime,
          expiresAt: pairing.expires_at.toISOString(),
          pollIntervalSec: DevicePairingHelper.pollIntervalSec(),
        };
      }

      if (pairing.consumed_at) {
        return {
          status: "consumed",
          serverTime,
          deviceId: pairing.claimed_device_id,
        };
      }

      const deviceToken = DevicePairingHelper.generateDeviceToken();

      await trxDeviceTokenRepository.revokeActiveForDevice(
        pairing.claimed_device_id,
      );
      await trxDeviceTokenRepository.create({
        id: DeviceHelper.generateDeviceTokenId(),
        deviceId: pairing.claimed_device_id,
        tokenHash: await AuthHelper.hashToken(deviceToken),
        expiresAt: null,
      });
      await trxDevicePairingRepository.markAuthorized(pairing.id);

      return {
        status: "authorized",
        serverTime,
        deviceId: pairing.claimed_device_id,
        deviceToken,
        tokenType: "Bearer",
      };
    });
  }
}
