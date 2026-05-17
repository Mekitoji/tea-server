import { AuthHelper } from "../../auth/libs";
import type { DB } from "../../../db";
import { BadRequestError, UnauthorizedError } from "../../../shared/errors";
import { UseCaseTelemetry } from "../../../shared/telemetry";
import type { DevicePairingRepository } from "../device-pairing.repository";
import type { CompleteDevicePairingResponse } from "../types";
import type { TransactionBuilder } from "kysely";

export interface CompleteDevicePairingInput {
  pairingId: string;
  pairingSecret: string;
}

@UseCaseTelemetry
export class CompleteDevicePairingUseCase {
  constructor(
    private readonly devicePairingRepository: DevicePairingRepository,
    private readonly transaction: TransactionBuilder<DB>,
  ) {}

  async exec(
    input: CompleteDevicePairingInput,
  ): Promise<CompleteDevicePairingResponse> {
    const pairingSecretHash = await AuthHelper.hashToken(input.pairingSecret);

    return this.transaction.execute(async (trx) => {
      const trxDevicePairingRepository =
        this.devicePairingRepository.withTransaction(trx);
      const pairing =
        await trxDevicePairingRepository.findByIdAndSecretHashForUpdate(
          input.pairingId,
          pairingSecretHash,
        );

      if (!pairing) {
        throw new UnauthorizedError();
      }

      if (!pairing.claimed_device_id) {
        throw new BadRequestError("Device pairing has not been claimed");
      }

      if (!pairing.authorized_at) {
        throw new BadRequestError("Device pairing has not been authorized");
      }

      if (!pairing.consumed_at) {
        await trxDevicePairingRepository.markConsumed(pairing.id);
      }

      return {
        ok: true,
        status: "consumed",
        serverTime: Math.floor(Date.now() / 1000),
        deviceId: pairing.claimed_device_id,
      };
    });
  }
}
