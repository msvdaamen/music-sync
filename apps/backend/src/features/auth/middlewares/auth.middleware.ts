import { createMiddleware } from "hono/factory";
import type { AuthUser } from "../types/auth-user.type";
import { SetupContext } from "../../../middlewares/setup.middleware";

export type AuthContext = {
  Variables: {
    user: AuthUser;
  };
};

export const authMiddleware = createMiddleware<AuthContext & SetupContext>(async (c, next) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    const ip = c.req.header("cf-connecting-ip") ?? "anonymous";
    const { success } = await c.env.ANON_RATE_LIMITER.limit({ key: ip });

    if (!success) {
      return c.json({ error: "Too many requests" }, 429);
    }
    return c.json({}, 401);
  }

  const { user } = session;
  c.set("user", user);
  await next();
});
