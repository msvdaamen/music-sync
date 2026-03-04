export type PlaylistImage = {
  url: string;
  height: number;
  width: number;
};

export type Playlist = {
  id: string;
  name: string;
  images: PlaylistImage[];
};
