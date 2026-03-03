import { musicConnectionRouter } from "./features/music-connection/controller";
import { createApp } from "./lib/setup";
import { anonRateLimitMiddleware } from "./middlewares/rate-limit.middleware";

const app = createApp();

app.get("/", anonRateLimitMiddleware, (c) => c.text("Hello!"));

app.on(["POST", "GET"], "/v1/auth/*", anonRateLimitMiddleware, (c) =>
  c.get("auth").handler(c.req.raw),
);

app.route("/v1/connections", musicConnectionRouter);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
