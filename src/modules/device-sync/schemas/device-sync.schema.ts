import { t } from "elysia";

const deviceSessionLogRecordSchema = t.Object({
  id: t.String({ minLength: 1 }),
  presetIndex: t.Number(),
  presetName: t.String({ minLength: 1 }),
  startedAt: t.Number({ minimum: 0 }),
  finishedAt: t.Number({ minimum: 0 }),
  rinseStartedAt: t.Number({ minimum: 0 }),
  infusionStartedAt: t.Array(t.Number({ minimum: 0 })),
  finishedEarly: t.Boolean(),
  completedInfusionCount: t.Number({ minimum: 0 }),
  infusionSec: t.Array(t.Number({ minimum: 0 })),
  rinseSec: t.Number({ minimum: 0 }),
});

export const sessionJournalSyncBodySchema = t.Object({
  schemaVersion: t.Literal(1),
  journal: t.Object({
    version: t.Number({ minimum: 1 }),
    updatedAt: t.Number({ minimum: 0 }),
    status: t.Union([
      t.Literal("pending"),
      t.Literal("synced"),
      t.Literal("failed"),
    ]),
    retryCount: t.Number({ minimum: 0 }),
    records: t.Array(deviceSessionLogRecordSchema),
  }),
});
