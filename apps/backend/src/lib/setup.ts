import { createFactory } from "hono/factory";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { createDatabase } from "../providers/database";
import { createAuthClient } from "../providers/auth";
import { AsyncLocalStorage } from "node:async_hooks";

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

const factory = createFactory<SetupContext>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = createDatabase(c.env.HYPERDRIVE!.connectionString);
      const auth = createAuthClient(db, c.env);
      c.set("db", db);
      c.set("auth", auth);
      await resourceStorage.run({ db }, async () => {
        await next();
      });
    });
  },
});

export function createApp() {
  return factory.createApp();
}
