export type MusicProvider = "spotify" | "apple_music";

export type MusicProviderAccess = {
  userId: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export type CallbackParams = {
  code: string;
  state: string;
};

export interface MusicProviderConnection {
  // Returns the redirect URL for the authorization flow
  authorize(): Promise<string>;

  callback(params: CallbackParams): Promise<MusicProviderAccess>;
}
