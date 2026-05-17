import { t } from "elysia";

export const createTeaBodySchema = t.Object({
  name: t.String({ minLength: 1 }),
  teaType: t.String({ minLength: 1 }),
  origin: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  producer: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  harvestYear: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
  notes: t.Optional(t.Nullable(t.String())),
});
