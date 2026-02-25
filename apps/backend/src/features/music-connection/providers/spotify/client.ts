import { add, isAfter, sub } from "date-fns";
import { encrypt } from "../../../../lib/encryption";
import { DbService } from "../../../../providers/database";
import type { MusicClient } from "../../types/music-client";
import type { MusicProvider } from "../../types/music-provider.type";
import type { Spotify } from "./types";
import { musicConnections } from "../../../../schema";
import { and, eq } from "drizzle-orm";

export class SpotifyClient extends DbService implements MusicClient {
  private readonly provider: MusicProvider = "spotify";
  accountUrl = "https://accounts.spotify.com";
  apiUrl = "https://api.spotify.com";
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
  async getTracks(): Promise<any[]> {
    const response = await this.fetch(`${this.apiUrl}/v1/me/tracks`);
    const data = (await response.json()) as Spotify.GetUserTracksResponse;
    return data.items.map((item) => item.track);
  }

  async getProfile(): Promise<Spotify.GetCurrentUserProfileResponse> {
    const response = await this.fetch(`${this.apiUrl}/v1/me`);
    return response.json() as Promise<Spotify.GetCurrentUserProfileResponse>;
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
      sub(new Date(), { seconds: this.bufferRefreshTimeS }),
      this.expiresAt,
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
