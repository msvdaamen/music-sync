import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { v7 as uuid } from "uuid";

export function createAuthClient(db: NodePgDatabase<any>, env: Env) {
  return betterAuth({
    basePath: "/v1/auth",
    database: drizzleAdapter(db, {
      provider: "pg",
      usePlural: true,
    }),
    advanced: {
      database: {
        generateId: () => uuid(),
      },
    },
    secondaryStorage: {
      delete: async (key) => await env.MUSIC_SYNC_CACHE!.delete(key),
      get: async (key) => await env.MUSIC_SYNC_CACHE!.get(key, { type: "json" }),
      set: async (key, value, ttl?: number) => {
        if (ttl) {
          await env.MUSIC_SYNC_CACHE!.put(key, value, { expirationTtl: ttl });
        } else {
          await env.MUSIC_SYNC_CACHE!.put(key, value);
        }
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [
      "https://music-sync-app.msvdaamen.workers.dev",
      // Development mode - Expo's exp:// scheme with local IP ranges
      ...(env.ENVIRONMENT === "development" ? ["http://localhost:5173"] : []),
    ],
  });
}
