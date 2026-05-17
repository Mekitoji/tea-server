import { Elysia } from "elysia";

import type { RootDb } from "../../db";
import { UserRepository } from "../user/user.repository";
import { AuthController } from "./auth.controller";
import { AuthIdentityRepository } from "./auth-identity.repository";
import { AuthSessionRepository } from "./auth-session.repository";
import * as Schemas from "./schemas";
import { AuthUseCaseFactory, createAuthUseCases } from "./use-cases";

export const createAuthDomain = (db: RootDb) => {
  const userRepository = new UserRepository(db);
  const authIdentityRepository = new AuthIdentityRepository(db);
  const authSessionRepository = new AuthSessionRepository(db);
  const authUseCases = createAuthUseCases(
    userRepository,
    authIdentityRepository,
    authSessionRepository,
  );
  const authUseCasesFactory = new AuthUseCaseFactory(
    userRepository,
    authIdentityRepository,
    authSessionRepository,
    db.transaction.bind(db),
  );
  const authController = new AuthController(
    authUseCases,
    authUseCasesFactory,
  );

  return new Elysia({ prefix: "/auth" })
    .post(
      "/register",
      ({ body, set }) => authController.registerLocal({ body, set }),
      {
        body: Schemas.registerLocalBodySchema,
      },
    )
    .post(
      "/sign-in",
      ({ body, set }) => authController.signInLocal({ body, set }),
      {
        body: Schemas.signInLocalBodySchema,
      },
    )
    .post(
      "/google",
      ({ body, set }) => authController.signInGoogle({ body, set }),
      {
        body: Schemas.signInGoogleBodySchema,
      },
    )
    .post(
      "/refresh",
      ({ body, set }) => authController.refresh({ body, set }),
      {
        body: Schemas.refreshTokenBodySchema,
      },
    )
    .get("/me", ({ headers }) => authController.me({ headers }))
    .post(
      "/logout",
      ({ body, set }) => authController.logout({ body, set }),
      {
        body: Schemas.logoutBodySchema,
      },
    );
};
