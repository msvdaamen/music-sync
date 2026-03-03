import { musicConnectionRouter } from "./features/music-connection/controller";
import { createApp } from "./lib/setup";
import { cors } from "hono/cors";

const app = createApp();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://music-sync-app.msvdaamen.workers.dev"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
app.get("/", (c) => c.text("Hello!"));

app.on(["POST", "GET"], "/v1/auth/*", (c) => c.get("auth").handler(c.req.raw));

app.route("/v1/connections", musicConnectionRouter);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
