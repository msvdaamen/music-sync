export namespace Spotify {
  export type GetCurrentUserProfileResponse = {
    id: string;
    /** @deprecated */
    country: string;
    display_name: string;
    /** @deprecated */
    email: string;
  };

  export type GetUserTracksResponse = {
    items: SavedTrack[];
  };

  export type SavedTrack = {
    added_at: string;
    track: Track;
  };

  export type Track = {
    id: string;
    name: string;
  };

  export type TokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number; // number of seconds
    token_type: string;
    scope: string;
  };

  export type RefreshTokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };
}
