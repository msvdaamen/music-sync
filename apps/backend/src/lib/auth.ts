import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../providers/database";

export const auth = betterAuth({
  basePath: "/v1/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: () => Bun.randomUUIDv7(),
    },
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return await Bun.password.hash(password);
      },
      verify: async ({ password, hash }) => {
        return await Bun.password.verify(password, hash);
      },
    },
  },
  trustedOrigins: [
    "https://music-sync.app",
    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(import.meta.env.ENVIREMENT !== "production"
      ? ["http://localhost:5173"]
      : []),
  ],
});
