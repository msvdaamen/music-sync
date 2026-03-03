import type { OffsetPagination } from "../../../types/offset-pagination";
import type { Track } from "./track.type";

export interface MusicClient {
  getTracks(offset: number, limit: number): Promise<OffsetPagination<Track>>;
}
