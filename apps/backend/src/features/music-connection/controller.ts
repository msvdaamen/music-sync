import { authRouter } from "../auth/auth.controller";
import { encrypt } from "../../lib/encryption";
import { musicConnectionService } from "./service";
import { sValidator } from "@hono/standard-validator";
import { type } from "arktype";
import { spotifyProvider } from "./providers/spotify.provider";

const app = authRouter.createApp();

app.get("/", async (c) => {
  const user = c.get("user");

  const connections = await musicConnectionService.getConnections(user.id);

  return c.json({ connections });
});

app.delete(
  "/:provider",
  sValidator("param", type({ provider: "'spotify'|'apple_music'" })),
  async (c) => {
    const validated = c.req.valid("param");
    const user = c.get("user");
    const provider = validated.provider;

    await musicConnectionService.deleteConnection(user.id, provider);

    return c.json({ success: true });
  },
);

app.get("/spotify/authorize", async (c) => {
  const redirectUrl = await spotifyProvider.authorize();

  return c.json({ redirectUrl: redirectUrl });
});

app.post(
  "/spotify/callback",
  sValidator(
    "json",
    type({
      code: "string",
      state: "string",
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const validated = c.req.valid("json");
    const providerAccess = await spotifyProvider.callback(validated);

    const accessTokenEncrypted = encrypt(providerAccess.accessToken);
    const refreshTokenEncrypted = encrypt(providerAccess.refreshToken);

    await musicConnectionService.createConnection({
      id: Bun.randomUUIDv7(),
      userId: user.id,
      provider: "spotify",
      accessTokenEncrypted: accessTokenEncrypted,
      refreshTokenEncrypted: refreshTokenEncrypted,
      tokenExpiresAt: providerAccess.expiresAt,
    });
  },
);

export const musicConnectionRouter = app;
