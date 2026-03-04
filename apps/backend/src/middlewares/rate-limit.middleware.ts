import { createMiddleware } from "hono/factory";
import type { AuthContext } from "../features/auth/middlewares/auth.middleware";
import { SetupContext } from "./setup.middleware";

export const anonRateLimitMiddleware = createMiddleware(async (c, next) => {
  const ip = c.req.header("cf-connecting-ip") ?? "anonymous";

  const { success } = await c.env.ANON_RATE_LIMITER.limit({ key: ip });

  if (!success) {
    return c.json({ error: "Too many requests" }, 429);
  }

  await next();
});

export const authRateLimitMiddleware = createMiddleware<AuthContext & SetupContext>(
  async (c, next) => {
    const user = c.get("user");

    const { success } = await c.env.AUTH_RATE_LIMITER.limit({ key: user.id });

    if (!success) {
      return c.json({ error: "Too many requests" }, 429);
    }

    await next();
  },
);
