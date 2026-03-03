export type MusicProvider = "spotify" | "apple_music";

export type Connection = {
  id: string;
  provider: MusicProvider;
  providerUserId: string;
  providerDisplayName: string;
  createdAt: string;
  updatedAt: string;
};
