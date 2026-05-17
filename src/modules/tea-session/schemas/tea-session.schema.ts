import { t } from "elysia";

export const attachTeaToSessionBodySchema = t.Object({
  teaId: t.Nullable(t.String({ minLength: 1 })),
});
