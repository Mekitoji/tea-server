import { t } from "elysia";

export const registerLocalBodySchema = t.Object({
  email: t.String({ format: "email" }),
  displayName: t.String({ minLength: 1 }),
  password: t.String({ minLength: 8 }),
});

export const signInLocalBodySchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 1 }),
});

export const signInGoogleBodySchema = t.Object({
  idToken: t.String({ minLength: 1 }),
});

export const refreshTokenBodySchema = t.Object({
  refreshToken: t.String({ minLength: 1 }),
});

export const logoutBodySchema = t.Object({
  refreshToken: t.Optional(t.String({ minLength: 1 })),
});
