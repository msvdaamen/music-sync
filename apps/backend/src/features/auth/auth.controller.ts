import { createFactory } from "hono/factory";
import { authMiddleware, type AuthContext } from "./middlewares/auth.middleware";
import { SetupContext } from "../../lib/setup";

export const authRouter = createFactory<AuthContext & SetupContext>({
  initApp: (app) => {
    app.use(authMiddleware);
  },
});
