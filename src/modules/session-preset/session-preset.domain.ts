import { Elysia } from "elysia";

import type { RootDb } from "../../db";
import { createAuthPlugin, requireAuth } from "../../plugins/auth";
import * as Schemas from "./schemas";
import { SessionPresetController } from "./session-preset.controller";
import { DefaultPresetRepository } from "./repositories/default-preset.repository";
import {
  createSessionPresetUseCases,
  SessionPresetUseCaseFactory,
} from "./use-cases";
import { UserPresetRepository } from "./repositories/user-preset.repository";

export const createSessionPresetDomain = (db: RootDb) => {
  const defaultPresetRepository = new DefaultPresetRepository(db);
  const userPresetRepository = new UserPresetRepository(db);
  const sessionPresetUseCases = createSessionPresetUseCases(
    defaultPresetRepository,
    userPresetRepository,
  );
  const sessionPresetUseCasesFactory = new SessionPresetUseCaseFactory(
    userPresetRepository,
    db.transaction.bind(db),
  );
  const sessionPresetController = new SessionPresetController(
    sessionPresetUseCases,
    sessionPresetUseCasesFactory,
  );

  return new Elysia({ prefix: "/session-presets" })
    .use(createAuthPlugin(db))
    .get("/defaults", () => sessionPresetController.listDefaultSessionPresets())
    .guard({ beforeHandle: requireAuth }, (app) =>
      app
        .get("/", (context: any) =>
          sessionPresetController.listUserSessionPresets({
            userId: context.currentUser.id,
          }),
        )
        .post(
          "/",
          (context: any) =>
            sessionPresetController.createUserSessionPreset({
              body: context.body,
              userId: context.currentUser.id,
              set: context.set,
            }),
          {
            body: Schemas.createUserSessionPresetBodySchema,
          },
        )
        .delete("/:id", (context: any) =>
          sessionPresetController.deleteUserSessionPreset({
            params: context.params,
            userId: context.currentUser.id,
          }),
        ),
    );
};
