import { t } from "elysia";

export const createUserBodySchema = t.Object({
  email: t.String({ format: "email" }),
  displayName: t.String({ minLength: 1 }),
  role: t.Optional(t.Union([t.Literal("admin"), t.Literal("user")])),
});
