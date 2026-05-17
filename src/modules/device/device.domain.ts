import { Elysia } from "elysia";

import type { AppDb } from "../../db";
import { createAuthPlugin, requireAuth } from "../../plugins/auth";
import {
  createDeviceAuthPlugin,
  requireDeviceAuth,
} from "../../plugins/device-auth";
import * as Schemas from "./schemas";
import { DeviceController } from "./device.controller";
import { DeviceRepository } from "./device.repository";
import { DeviceTokenRepository } from "./device-token.repository";
import { createDeviceUseCases } from "./use-cases";

export const createDeviceDomain = (db: AppDb) => {
  const deviceRepository = new DeviceRepository(db);
  const deviceTokenRepository = new DeviceTokenRepository(db);
  const deviceUseCases = createDeviceUseCases(
    deviceRepository,
    deviceTokenRepository,
  );
  const deviceController = new DeviceController(deviceUseCases);
  const userDeviceRoutes = new Elysia({ prefix: "/devices" })
    .use(createAuthPlugin(db))
    .guard({ beforeHandle: requireAuth }, (app) =>
      app
        .get("/", (context: any) =>
          deviceController.listDevices(context.currentUser.id),
        )
        .get("/:id", async (context: any) =>
          deviceController.findDeviceById({
            params: context.params,
            userId: context.currentUser.id,
          }),
        )
        .post(
          "/",
          (context: any) =>
            deviceController.createDevice({
              body: context.body,
              userId: context.currentUser.id,
              set: context.set,
            }),
          {
            body: Schemas.createDeviceBodySchema,
          },
        )
        .delete("/:id", (context: any) =>
          deviceController.deleteDevice({
            params: context.params,
            userId: context.currentUser.id,
          }),
        ),
    );

  const deviceTokenRoutes = new Elysia({ prefix: "/device-tokens" })
    .use(createDeviceAuthPlugin(db))
    .guard({ beforeHandle: requireDeviceAuth }, (app) =>
      app.delete("/current", (context: any) =>
        deviceController.revokeCurrentDeviceToken(context.currentDevice),
      ),
    );

  return new Elysia().use(userDeviceRoutes).use(deviceTokenRoutes);
};
