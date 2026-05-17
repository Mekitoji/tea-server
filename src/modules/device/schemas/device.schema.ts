import { t } from "elysia";

export const createDeviceBodySchema = t.Object({
  deviceUid: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  model: t.String({ minLength: 1 }),
  firmwareVersion: t.String({ minLength: 1 }),
});
