import { createMiddleware } from "hono/factory";
import type { SetupContext } from "../lib/setup";
import type { AuthContext } from "../features/auth/middlewares/auth.middleware";

/**
 * Rate limit middleware for unauthenticated routes (e.g. /v1/auth/*).
 * Keyed by the CF-Connecting-IP header so each IP address gets its own
 * counter: 20 requests per 60 seconds as configured in wrangler.jsonc.
 */
export const anonRateLimitMiddleware = createMiddleware<SetupContext>(async (c, next) => {
  const ip = c.req.header("cf-connecting-ip") ?? "anonymous";

  const { success } = await c.env.ANON_RATE_LIMITER.limit({ key: ip });

  if (!success) {
    return c.json({ error: "Too many requests" }, 429);
  }

  await next();
});

/**
 * Rate limit middleware for authenticated routes (e.g. /v1/connections/*).
 * Must be applied AFTER the auth middleware so the user is available on context.
 * Keyed by the user's ID so each account gets its own counter: 100 requests
 * per 60 seconds as configured in wrangler.jsonc.
 */
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
