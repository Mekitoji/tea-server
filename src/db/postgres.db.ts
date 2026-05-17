import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DB } from "./types";

const readNumberEnv = (name: string, fallback: number) => {
  const raw = process.env[name];

  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
};

const readBooleanEnv = (name: string, fallback: boolean) => {
  const raw = process.env[name];

  if (!raw) {
    return fallback;
  }

  return raw === "true";
};

export const createPgDb = (connectionString: string): Kysely<DB> => {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create a database connection");
  }

  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString,
        application_name: process.env.PG_APPLICATION_NAME ?? "tea-server-api",
        max: readNumberEnv("PG_POOL_MAX", 10),
        min: readNumberEnv("PG_POOL_MIN", 1),
        idleTimeoutMillis: readNumberEnv("PG_POOL_IDLE_TIMEOUT_MS", 0),
        connectionTimeoutMillis: readNumberEnv(
          "PG_POOL_CONNECTION_TIMEOUT_MS",
          5_000,
        ),
        keepAlive: readBooleanEnv("PG_POOL_KEEP_ALIVE", true),
      }),
    }),
  });
};
