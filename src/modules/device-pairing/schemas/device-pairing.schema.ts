import { t } from "elysia";

export const createDevicePairingBodySchema = t.Object({
  deviceUid: t.String({ minLength: 1 }),
  name: t.Optional(t.String({ minLength: 1 })),
  model: t.String({ minLength: 1 }),
  firmwareVersion: t.String({ minLength: 1 }),
});

export const claimDevicePairingBodySchema = t.Object({
  userCode: t.String({ minLength: 1 }),
  name: t.Optional(t.String({ minLength: 1 })),
});
