import { registerProcessErrorHandlers } from "./plugins/error";
import { logger } from "./shared/logger";

registerProcessErrorHandlers();

const { createV1Api } = await import("./app.v1");

const port = Number(Bun.env.PORT ?? 3000);
const hostname = Bun.env.HOST ?? "localhost";

const app = createV1Api().listen({
  hostname,
  port,
});

logger.info(
  {
    hostname: app.server?.hostname,
    port: app.server?.port,
  },
  "server started",
);
