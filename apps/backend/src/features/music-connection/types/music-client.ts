import type { OffsetPagination } from "../../../types/offset-pagination";
import { Playlist } from "./playlist.type";
import type { Track } from "./track.type";

export interface MusicClient {
  getTracks(offset: number, limit: number): Promise<OffsetPagination<Track>>;
  getPlaylists(offset: number, limit: number): Promise<OffsetPagination<Playlist>>;
}
