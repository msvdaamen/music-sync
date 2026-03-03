import { musicConnectionRouter } from "./features/music-connection/controller";
import { createApp } from "./lib/setup";

const app = createApp();

app.get("/", (c) => c.text("Hello!"));

app.on(["POST", "GET"], "/v1/auth/*", (c) => c.get("auth").handler(c.req.raw));

app.route("/v1/connections", musicConnectionRouter);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
