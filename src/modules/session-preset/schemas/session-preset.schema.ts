import { t } from "elysia";

export const createUserSessionPresetBodySchema = t.Object({
  baseTemplateId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  name: t.String({ minLength: 1 }),
  nameCn: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  teaType: t.String({ minLength: 1 }),
  dosePer100ml: t.String({ minLength: 1 }),
  tempC: t.String({ minLength: 1 }),
  rinseSec: t.Number({ minimum: 0 }),
  infusionsSec: t.Array(t.Number({ minimum: 0 }), { minItems: 1 }),
  maxInfusions: t.Number({ minimum: 1 }),
  notes: t.Optional(t.Nullable(t.String())),
  sortOrder: t.Optional(t.Number()),
});
