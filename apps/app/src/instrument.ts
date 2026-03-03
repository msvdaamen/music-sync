import * as Sentry from "@sentry/react";
import type { Register } from "@tanstack/react-router";

export const initSentry = (router: Register["router"]) => {
  Sentry.init({
    enabled: import.meta.env.PROD,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
    enableLogs: true,
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      "https://music-sync-api-production.msvdaamen.workers.dev",
    ],
  });
};
