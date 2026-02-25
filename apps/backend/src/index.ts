import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";
import { getConnInfo } from "hono/bun";

const app = new Hono();

app.use(secureHeaders());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minutes
  limit: 120, // Limit each IP to 100 requests per `window` (here, per 1 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c) => {
    const info = getConnInfo(c);
    const cfConnectingIp = c.req.header()["cf-connecting-ip"];
    const realIp = c.req.header()["x-forwarded-for"];
    return cfConnectingIp || realIp || (info.remote.address as string);
  },
});
app.use(limiter);

app.get("/", (c) => c.text("Hello!"));

app.on(["POST", "GET"], "/v1/auth/*", (c) => auth.handler(c.req.raw));

export default app;
