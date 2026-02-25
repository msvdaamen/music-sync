import { add, isAfter, sub } from "date-fns";
import type {
  CallbackParams,
  MusicProvider,
  MusicProviderAccess,
  MusicProviderConnection,
} from "../types/music-provider.type";
import { MusicProviderClient } from "./provider";
import { type Spotify } from "./spotify/types";
import { DbService } from "../../../providers/database";
import { musicConnections, type MusicConnectionEntity } from "../../../schema";
import { and, eq } from "drizzle-orm";
import { decrypt, encrypt } from "../../../lib/encryption";
import type { MusicClient } from "../types/music-client";

export class SpotifyProvider
  extends MusicProviderClient
  implements MusicProviderConnection
{
  accountUrl = "https://accounts.spotify.com";
  apiUrl = "https://api.spotify.com/v1";
  scopes = "user-read-private user-read-email";

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
  ) {
    super();
  }

  async authorize(): Promise<string> {
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

  async callback(params: CallbackParams): Promise<MusicProviderAccess> {
    const authUrl = `${this.accountUrl}/api/token`;
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(this.clientId + ":" + this.clientSecret).toString(
            "base64",
          ),
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: "authorization_code",
        code: params.code,
        redirect_uri: this.redirectUri,
      }),
    });
    const data = (await response.json()) as Spotify.AccessTokenResponse;
    const expiresAt = add(new Date(), { seconds: data.expires_in });
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    };
  }

  createClient(
    userId: string,
    musicConnection: MusicConnectionEntity,
  ): MusicClient {
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

export class SpotifyClient extends DbService implements MusicClient {
  private readonly provider: MusicProvider = "spotify";
  accountUrl = "https://accounts.spotify.com";
  bufferRefreshTimeS = 30; // seconds

  private refreshPromise: Promise<void> | null = null;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private accessToken: string,
    private refreshToken: string,
    private expiresAt: Date,
    private readonly userId: string,
  ) {
    super();
  }

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    const headers = new Headers(options?.headers);
    headers.set("Authorization", `Bearer ${this.accessToken}`);
    return await fetch(url, { ...options, headers });
  }

  private isTokenExpired(): boolean {
    return isAfter(
      this.expiresAt,
      sub(new Date(), { seconds: this.bufferRefreshTimeS }),
    );
  }

  private async refreshAccessToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<void> {
    const response = await fetch(`${this.accountUrl}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(this.clientId + ":" + this.clientSecret).toString(
            "base64",
          ),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to refresh Spotify access token: ${response.status} ${errorBody}`,
      );
    }

    const data = (await response.json()) as Spotify.RefreshTokenResponse;

    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = add(new Date(), { seconds: data.expires_in });
    await this.writeTokens();
  }

  private async writeTokens() {
    const encryptedAccessToken = encrypt(this.accessToken);
    const encryptedRefreshToken = encrypt(this.refreshToken);

    await this.database
      .update(musicConnections)
      .set({
        accessTokenEncrypted: encryptedAccessToken,
        refreshTokenEncrypted: encryptedRefreshToken,
        tokenExpiresAt: this.expiresAt,
      })
      .where(
        and(
          eq(musicConnections.userId, this.userId),
          eq(musicConnections.provider, this.provider),
        ),
      )
      .execute();
  }
}

export const spotifyProvider = new SpotifyProvider(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
  process.env.SPOTIFY_REDIRECT_URI!,
);
