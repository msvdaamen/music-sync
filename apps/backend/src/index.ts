import { Hono } from "hono";
import { anonRateLimitMiddleware } from "./middlewares/rate-limit.middleware";
import { cors } from "hono/cors";
import { setupMiddleware } from "./middlewares/setup.middleware";
import { musicConnectionRouter } from "./features/music-connection/controller";

const app = new Hono();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://music-sync-app.msvdaamen.workers.dev"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
  }),
);

app.get("/", anonRateLimitMiddleware, (c) => c.text("Hello!"));

app.on(["POST", "GET"], "/v1/auth/*", anonRateLimitMiddleware, setupMiddleware, (c) =>
  c.get("auth").handler(c.req.raw),
);

app.route("/v1/connections", musicConnectionRouter);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
