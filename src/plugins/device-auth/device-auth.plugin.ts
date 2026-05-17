import { Elysia } from "elysia";

import type { AppDb } from "../../db";
import { DeviceRepository } from "../../modules/device/device.repository";
import { DeviceTokenRepository } from "../../modules/device/device-token.repository";
import { AuthHelper } from "../../modules/auth/libs";
import type { DeviceTokenPrincipal } from "../../modules/device/types/device.model";
import { UnauthorizedError } from "../../shared/errors";

interface DeviceAuthContext extends Record<string, unknown> {
  currentDevice: DeviceTokenPrincipal | null;
}

export const createDeviceAuthPlugin = (db: AppDb) => {
  const deviceRepository = new DeviceRepository(db);
  const deviceTokenRepository = new DeviceTokenRepository(db);

  return new Elysia().derive(
    async ({ headers }): Promise<DeviceAuthContext> => {
      const token = AuthHelper.readBearerToken(headers.authorization);

      if (!token) {
        return { currentDevice: null };
      }

      const tokenHash = await AuthHelper.hashToken(token);
      const deviceToken =
        await deviceTokenRepository.findActiveByTokenHash(tokenHash);

      if (!deviceToken) {
        return { currentDevice: null };
      }

      const device = await deviceRepository.findById(deviceToken.device_id);

      if (!device) {
        return { currentDevice: null };
      }

      await deviceTokenRepository.touch(deviceToken.id);

      return {
        currentDevice: {
          tokenId: deviceToken.id,
          deviceId: device.id,
          userId: device.user_id,
          deviceUid: device.device_uid,
        },
      };
    },
  );
};

export const requireDeviceAuth = (context: any) => {
  if (!context.currentDevice) {
    throw new UnauthorizedError();
  }
};
