import { Elysia } from "elysia";

import type { RootDb } from "../../db";
import {
  createDeviceAuthPlugin,
  requireDeviceAuth,
} from "../../plugins/device-auth";
import * as Schemas from "./schemas";
import { DeviceSyncController } from "./device-sync.controller";
import { DeviceRepository } from "../device/device.repository";
import { TeaSessionRepository } from "../tea-session/tea-session.repository";
import { DeviceSyncUseCaseFactory } from "./use-cases";

export const createDeviceSyncDomain = (db: RootDb) => {
  const teaSessionRepository = new TeaSessionRepository(db);
  const deviceRepository = new DeviceRepository(db);

  const deviceSyncUseCases = new DeviceSyncUseCaseFactory(
    deviceRepository,
    teaSessionRepository,
    db.transaction.bind(db),
  );

  const deviceSyncController = new DeviceSyncController(deviceSyncUseCases);

  return new Elysia({ prefix: "/device-sync" })
    .use(createDeviceAuthPlugin(db))
    .guard({ beforeHandle: requireDeviceAuth }, (app) =>
      app.post(
        "/session-journal",
        (context: any) =>
          deviceSyncController.syncSessionJournal({
            body: context.body,
            currentDevice: context.currentDevice,
          }),
        {
          body: Schemas.sessionJournalSyncBodySchema,
        },
      ),
    );
};
