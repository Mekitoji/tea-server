import { Elysia } from "elysia";
import { createPgDb } from "../../db/postgres.db";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const db = createPgDb(databaseUrl);

export const dbPlugin = new Elysia({ name: "db" }).onStop(async () => {
  await db.destroy();
});
