import type { Context } from "elysia";

import { AuthHelper } from "../auth/libs";
import { UnauthorizedError } from "../../shared/errors";
import type {
  ClaimDevicePairingRequest,
  CreateDevicePairingRequest,
} from "./types";
import type {
  DevicePairingUseCases,
  DevicePairingUseCasesTransactionFactory,
} from "./use-cases";

type ResponseSet = Context["set"];

interface CreateDevicePairingControllerRequest {
  body: CreateDevicePairingRequest;
  set: ResponseSet;
}

interface ClaimDevicePairingControllerRequest {
  body: ClaimDevicePairingRequest;
  userId: string;
  set: ResponseSet;
}

interface GetDevicePairingStatusControllerRequest {
  params: {
    id: string;
  };
  headers: Record<string, string | undefined>;
}

interface CompleteDevicePairingControllerRequest {
  params: {
    id: string;
  };
  headers: Record<string, string | undefined>;
}

export class DevicePairingController {
  constructor(
    private readonly useCases: DevicePairingUseCases,
    private readonly useCasesFactory: DevicePairingUseCasesTransactionFactory,
  ) {}

  async createPairing({ body, set }: CreateDevicePairingControllerRequest) {
    const pairing = await this.useCases.CreateDevicePairing.exec(body);
    set.status = 201;

    return pairing;
  }

  async claimPairing({
    body,
    userId,
    set,
  }: ClaimDevicePairingControllerRequest) {
    const result = await this.useCasesFactory.createClaimDevicePairing().exec({
      ...body,
      userId,
    });
    set.status = 201;

    return result;
  }

  async getStatus({
    params,
    headers,
  }: GetDevicePairingStatusControllerRequest) {
    const pairingSecret = AuthHelper.readBearerToken(headers.authorization);

    if (!pairingSecret) {
      throw new UnauthorizedError();
    }

    return this.useCasesFactory.createGetDevicePairingStatus().exec({
      pairingId: params.id,
      pairingSecret,
    });
  }

  async completePairing({
    params,
    headers,
  }: CompleteDevicePairingControllerRequest) {
    const pairingSecret = AuthHelper.readBearerToken(headers.authorization);

    if (!pairingSecret) {
      throw new UnauthorizedError();
    }

    return this.useCasesFactory.createCompleteDevicePairing().exec({
      pairingId: params.id,
      pairingSecret,
    });
  }
}
