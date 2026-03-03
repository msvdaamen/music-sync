import { add } from "date-fns";
import { MusicProviderClient } from "../provider";
import { type Spotify } from "./types";
import { type MusicConnectionEntity } from "../../../../schema";
import { decrypt } from "../../../../lib/encryption";
import type { MusicClient } from "../../types/music-client";
import { SpotifyClient } from "./client";
import { env } from "cloudflare:workers";

export class SpotifyProvider extends MusicProviderClient {
  accountUrl = "https://accounts.spotify.com";
  apiUrl = "https://api.spotify.com/v1";
  scopes =
    "user-read-private user-read-email user-library-modify user-library-read playlist-read-private playlist-modify-private";

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
  ) {
    super();
  }

  async authorize(_: string): Promise<string> {
    const authUrl = new URL(`${this.accountUrl}/authorize`);
    const state = this.generateRandomString(16);
    const params = {
      response_type: "code",
      client_id: this.clientId,
      scope: this.scopes,
      state,
      redirect_uri: this.redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    return authUrl.toString();
  }

  async callback(userId: string, state: string, code: string) {
    const authUrl = `${this.accountUrl}/api/token`;
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(this.clientId + ":" + this.clientSecret).toString("base64"),
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: this.redirectUri,
      }),
    });
    const data = (await response.json()) as Spotify.TokenResponse;
    const expiresAt = add(new Date(), { seconds: data.expires_in });

    const client = new SpotifyClient(
      this.clientId,
      this.clientSecret,
      data.access_token,
      data.refresh_token,
      expiresAt,
      userId,
    );

    const profile = await client.getProfile();

    return {
      displayName: profile.display_name,
      userId,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    };
  }

  createClient(userId: string, musicConnection: MusicConnectionEntity): MusicClient {
    const accessToken = decrypt(musicConnection.accessTokenEncrypted);
    const refreshToken = decrypt(musicConnection.refreshTokenEncrypted);
    const expiresAt = musicConnection.tokenExpiresAt;
    return new SpotifyClient(
      this.clientId,
      this.clientSecret,
      accessToken,
      refreshToken,
      expiresAt,
      userId,
    );
  }
}

export const spotifyProvider = new SpotifyProvider(
  env.SPOTIFY_CLIENT_ID,
  env.SPOTIFY_CLIENT_SECRET,
  env.SPOTIFY_REDIRECT_URI,
);
