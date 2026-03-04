import { createMiddleware } from "hono/factory";
import { createDatabase } from "../providers/database";
import { AsyncLocalStorage } from "node:async_hooks";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { createAuthClient } from "../providers/auth";

export type SetupContext = {
  Variables: {
    db: NodePgDatabase<typeof schema>;
    auth: ReturnType<typeof createAuthClient>;
  };
  Bindings: Env;
};

const resourceStorage = new AsyncLocalStorage<{
  db: NodePgDatabase<typeof schema>;
}>();

export const getDatabase = () => {
  const db = resourceStorage.getStore()?.db;
  if (!db) throw new Error("Database not initialized for request");
  return db;
};

export const setupMiddleware = createMiddleware<SetupContext>(async (c, next) => {
  const db = await createDatabase(c.env.HYPERDRIVE.connectionString);
  const auth = createAuthClient(db, c.env);
  c.set("db", db);
  c.set("auth", auth);
  await resourceStorage.run({ db }, async () => {
    await next();
  });
});
