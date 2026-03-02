import { createMiddleware } from "hono/factory";
import type { AuthUser } from "../types/auth-user.type";
import { SetupContext } from "../../../lib/setup";

export type AuthContext = {
  Variables: {
    user: AuthUser;
  };
};

export const authMiddleware = createMiddleware<AuthContext & SetupContext>(async (c, next) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({}, 401);
  }

  const { user } = session;
  c.set("user", user);
  await next();
});
