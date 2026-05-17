import { Elysia } from "elysia";

import type { RootDb } from "../../db";
import { createAuthPlugin, requireAuth } from "../../plugins/auth";
import * as Schemas from "./schemas";
import { DevicePairingController } from "./device-pairing.controller";
import { DeviceRepository } from "../device/device.repository";
import { DeviceTokenRepository } from "../device/device-token.repository";
import { DevicePairingRepository } from "./device-pairing.repository";
import {
  createDevicePairingUseCases,
  DevicePairingUseCaseFactory,
} from "./use-cases";

export const createDevicePairingDomain = (db: RootDb) => {
  const devicePairingRepository = new DevicePairingRepository(db);
  const deviceRepository = new DeviceRepository(db);
  const deviceTokenRepository = new DeviceTokenRepository(db);
  const devicePairingUseCases = createDevicePairingUseCases(
    devicePairingRepository,
    deviceRepository,
  );
  const devicePairingUseCasesFactory = new DevicePairingUseCaseFactory(
    devicePairingRepository,
    deviceRepository,
    deviceTokenRepository,
    db.transaction.bind(db),
  );
  const devicePairingController = new DevicePairingController(
    devicePairingUseCases,
    devicePairingUseCasesFactory,
  );
  const authenticatedRoutes = new Elysia()
    .use(createAuthPlugin(db))
    .guard({ beforeHandle: requireAuth }, (app) =>
      app.post(
        "/claim",
        (context: any) =>
          devicePairingController.claimPairing({
            body: context.body,
            userId: context.currentUser.id,
            set: context.set,
          }),
        {
          body: Schemas.claimDevicePairingBodySchema,
        },
      ),
    );

  return new Elysia({ prefix: "/device-pairings" })
    .post(
      "/",
      ({ body, set }) => devicePairingController.createPairing({ body, set }),
      {
        body: Schemas.createDevicePairingBodySchema,
      },
    )
    .get("/:id/status", ({ params, headers }) =>
      devicePairingController.getStatus({ params, headers }),
    )
    .post("/:id/complete", ({ params, headers }) =>
      devicePairingController.completePairing({ params, headers }),
    )
    .use(authenticatedRoutes);
};
