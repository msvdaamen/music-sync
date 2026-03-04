import { createFactory } from "hono/factory";
import { authMiddleware, type AuthContext } from "./middlewares/auth.middleware";
import { authRateLimitMiddleware } from "../../middlewares/rate-limit.middleware";
import { SetupContext, setupMiddleware } from "../../middlewares/setup.middleware";

export const authRouter = createFactory<AuthContext & SetupContext>({
  initApp: (app) => {
    app.use(setupMiddleware, authMiddleware, authRateLimitMiddleware);
  },
});
