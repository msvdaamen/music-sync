import { createMiddleware } from "hono/factory";
import { auth } from "../../../lib/auth";
import type { AuthUser } from "../types/auth-user.type";

export type AuthContext = {
  Variables: {
    user: AuthUser;
  };
};

export const authMiddleware = createMiddleware<AuthContext>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({}, 401);
  }

  const { user } = session;
  c.set("user", user);
  await next();
});
