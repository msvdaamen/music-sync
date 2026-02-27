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
    limit: number;
    offset: number;
    total: number;
    items: SavedTrack[];
  };

  export type SavedTrack = {
    added_at: string;
    track: Track;
  };

  export type Image = {
    url: string;
    height: number;
    width: number;
  }

  export type SimpleArtist = {
    id: string;
    name: string;
  }

  export type Album = {
    id: string;
    name: string;
    images: Image[];
  }

  export type Track = {
    id: string;
    name: string;
    album: Album;
    artists: SimpleArtist[];
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
    refresh_token: string | undefined;
    expires_in: number;
    token_type: string;
    scope: string;
  };
}
