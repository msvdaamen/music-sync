export namespace Spotify {
  type GetCurrentUserProfileResponse = {
    /** @deprecated */
    country: string;
    display_name: string;
    /** @deprecated */
    email: string;
  };

  export type AccessTokenResponse = {
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
