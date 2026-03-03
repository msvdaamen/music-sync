import { authRouter } from "../auth/auth.controller";
import { encrypt } from "../../lib/encryption";
import { musicConnectionService } from "./service";
import { sValidator } from "@hono/standard-validator";
import { type } from "arktype";
import { spotifyProvider } from "./providers/spotify/provider";
import { providerDto } from "./dto/provider.dto";
import { getTracksDto } from "./dto/get-tracks.dto";
import { v7 as uuid } from "uuid";

const app = authRouter.createApp();

app.get("/", async (c) => {
  const user = c.get("user");

  const connections = await musicConnectionService.getConnections(user.id);

  return c.json(connections);
});

app.get(
  "/:provider/tracks",
  sValidator("param", providerDto),
  sValidator("query", getTracksDto),
  async (c) => {
    const user = c.get("user");
    const { provider } = c.req.valid("param");
    const { offset, limit } = c.req.valid("query");

    const connection = await musicConnectionService.getConnectionCredentials(user.id, provider);

    if (!connection) {
      return c.json({ error: "No connection found" }, 404);
    }

    const client = spotifyProvider.createClient(user.id, connection);

    const tracks = await client.getTracks(offset, limit);

    return c.json(tracks);
  },
);

app.delete("/:provider", sValidator("param", providerDto), async (c) => {
  const validated = c.req.valid("param");
  const user = c.get("user");
  const provider = validated.provider;

  await musicConnectionService.deleteConnection(user.id, provider);

  return c.json({ success: true });
});

app.get("/spotify/authorize", async (c) => {
  const user = c.get("user");
  const redirectUrl = await spotifyProvider.authorize(user.id);

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
    const providerAccess = await spotifyProvider.callback(user.id, validated.state, validated.code);

    const accessTokenEncrypted = encrypt(providerAccess.accessToken);
    const refreshTokenEncrypted = encrypt(providerAccess.refreshToken);

    await musicConnectionService.createConnection({
      id: uuid(),
      userId: user.id,
      providerUserId: providerAccess.userId,
      providerDisplayName: providerAccess.displayName,
      provider: "spotify",
      accessTokenEncrypted: accessTokenEncrypted,
      refreshTokenEncrypted: refreshTokenEncrypted,
      tokenExpiresAt: providerAccess.expiresAt,
    });
    return c.json({ success: true });
  },
);

export const musicConnectionRouter = app;
