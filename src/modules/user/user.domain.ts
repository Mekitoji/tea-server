import { Elysia } from "elysia";

import type { AppDb } from "../../db";
import { createAuthPlugin, requireAdmin } from "../../plugins/auth";
import * as Schemas from "./schemas";
import { UserRepository } from "./user.repository";
import { UserController } from "./user.controller";
import { createUserUseCases } from "./use-cases";

export const createUserDomain = (db: AppDb) => {
  const userRepository = new UserRepository(db);
  const userUseCases = createUserUseCases(userRepository);
  const userController = new UserController(userUseCases);

  return new Elysia({ prefix: "/users" })
    .use(createAuthPlugin(db))
    .guard({ beforeHandle: requireAdmin }, (app) =>
      app
        .get("/", () => userController.listUsers())
        .get("/:id", async ({ params }) =>
          userController.findUserById({ params }),
        )
        .post(
          "/",
          ({ body, set }) => userController.createUser({ body, set }),
          {
            body: Schemas.createUserBodySchema,
          },
        ),
    );
};
