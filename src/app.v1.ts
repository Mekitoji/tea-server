import { Elysia } from "elysia";

// Domains
import { createAuthDomain } from "./modules/auth";
import { createDeviceDomain } from "./modules/device";
import { createDevicePairingDomain } from "./modules/device-pairing";
import { createDeviceSyncDomain } from "./modules/device-sync";
import { createSessionPresetDomain } from "./modules/session-preset";
import { createTeaDomain } from "./modules/tea";
import { createTeaSessionDomain } from "./modules/tea-session";
import { createUserDomain } from "./modules/user";

// Plugins
import { opentelemetryPlugin } from "./plugins/opentelemetry/opentelemetry.plugin";
import { securityPlugin } from "./plugins/security";
import { errorPlugin } from "./plugins/error";
import { dbPlugin, db } from "./plugins/db";
import { loggerPlugin } from "./plugins/logger";

export const createV1Api = () =>
  new Elysia({ prefix: "/api/v1" })
    .use(opentelemetryPlugin)
    .use(loggerPlugin)
    .use(securityPlugin)
    .use(dbPlugin)
    .use(errorPlugin)
    .get("/health", () => ({ status: "ok" as const }))
    .use(createAuthDomain(db))
    .use(createUserDomain(db))
    .use(createDeviceDomain(db))
    .use(createDevicePairingDomain(db))
    .use(createTeaDomain(db))
    .use(createSessionPresetDomain(db))
    .use(createTeaSessionDomain(db))
    .use(createDeviceSyncDomain(db));
