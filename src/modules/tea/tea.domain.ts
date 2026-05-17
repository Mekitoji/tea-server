import { Elysia } from "elysia";

import type { AppDb } from "../../db";
import { createAuthPlugin, requireAuth } from "../../plugins/auth";
import * as Schemas from "./schemas";
import { TeaController } from "./tea.controller";
import { TeaRepository } from "./tea.repository";
import { TeaTypeRepository } from "./tea-type.repository";
import { createTeaUseCases } from "./use-cases";

export const createTeaDomain = (db: AppDb) => {
  const teaRepository = new TeaRepository(db);
  const teaTypeRepository = new TeaTypeRepository(db);
  const teaUseCases = createTeaUseCases(teaRepository, teaTypeRepository);
  const teaController = new TeaController(teaUseCases);

  return new Elysia({ prefix: "/teas" })
    .use(createAuthPlugin(db))
    .get("/types", () => teaController.listTeaTypes())
    .get("/types/:id", ({ params }) =>
      teaController.findTeaTypeById({ params }),
    )
    .guard({ beforeHandle: requireAuth }, (app) =>
      app
        .get("/", (context: any) =>
          teaController.listTeas(context.currentUser.id),
        )
        .get("/:id", async (context: any) =>
          teaController.findTeaById({
            params: context.params,
            userId: context.currentUser.id,
          }),
        )
        .delete("/:id", async (context: any) =>
          teaController.archiveTea({
            params: context.params,
            userId: context.currentUser.id,
          }),
        )
        .post(
          "/",
          (context: any) =>
            teaController.createTea({
              body: context.body,
              userId: context.currentUser.id,
              set: context.set,
            }),
          {
            body: Schemas.createTeaBodySchema,
          },
        ),
    );
};
