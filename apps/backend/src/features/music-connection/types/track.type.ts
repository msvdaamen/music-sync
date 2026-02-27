
export type TrackImage = {
  url: string;
  height: number;
  width: number;
}

export type Artist = {
  id: string;
  name: string;
}

export type Track = {
  id: string;
  name: string;
  images: TrackImage[]
  artists: Artist[];
};
