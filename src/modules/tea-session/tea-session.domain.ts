import { Elysia } from "elysia";

import type { RootDb } from "../../db";
import { createAuthPlugin, requireAuth } from "../../plugins/auth";
import * as Schemas from "./schemas";
import { TeaSessionController } from "./tea-session.controller";
import { TeaSessionRepository } from "./tea-session.repository";
import {
  createTeaSessionUseCases,
  TeaSessionUseCaseFactory,
} from "./use-cases";
import { TeaRepository } from "../tea/tea.repository";

export const createTeaSessionDomain = (db: RootDb) => {
  const teaSessionRepository = new TeaSessionRepository(db);
  const teaRepository = new TeaRepository(db);
  const teaSessionUseCases = createTeaSessionUseCases(teaSessionRepository);
  const teaSessionUseCasesFactory = new TeaSessionUseCaseFactory(
    teaSessionRepository,
    teaRepository,
    db.transaction.bind(db),
  );
  const teaSessionController = new TeaSessionController(
    teaSessionUseCases,
    teaSessionUseCasesFactory,
  );

  return new Elysia({ prefix: "/tea-sessions" })
    .use(createAuthPlugin(db))
    .guard({ beforeHandle: requireAuth }, (app) =>
      app
        .get("/", (context: any) =>
          teaSessionController.listTeaSessions(context.currentUser.id),
        )
        .get("/:id", async (context: any) =>
          teaSessionController.findTeaSessionById({
            params: context.params,
            userId: context.currentUser.id,
          }),
        )
        .patch(
          "/:id/tea",
          (context: any) =>
            teaSessionController.PatchTeaSession({
              params: context.params,
              userId: context.currentUser.id,
              body: context.body,
            }),
          {
            body: Schemas.attachTeaToSessionBodySchema,
          },
        ),
    );
};
