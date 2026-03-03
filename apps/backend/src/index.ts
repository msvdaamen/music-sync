import { musicConnectionRouter } from "./features/music-connection/controller";
import { createApp } from "./lib/setup";
import * as Sentry from "@sentry/cloudflare";

const app = createApp();

app.get("/", (c) => c.text("Hello!"));

app.on(["POST", "GET"], "/v1/auth/*", (c) => c.get("auth").handler(c.req.raw));

app.route("/v1/connections", musicConnectionRouter);

export default Sentry.withSentry(
  (env: Env) => ({
    enabled: env.ENVIRONMENT === "production",
    dsn: "https://02106c41df94930710e27864500333fb@o4509168904896512.ingest.de.sentry.io/4510982484262992",
    release: env.SENTRY_RELEASE,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
  }),
  {
    fetch: app.fetch,
  } satisfies ExportedHandler<Env>,
);
