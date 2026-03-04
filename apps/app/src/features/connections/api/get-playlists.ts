import { api } from "@/lib/api";
import type { MusicProvider } from "../types/connection.type";
import {
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import type { Playlist } from "../types/playlist.type";

export type GetPlaylistsInput = {
  provider: MusicProvider;
  limit: number;
  offset: number;
};

export type GetPlaylistsResponse = {
  limit: number;
  offset: number;
  total: number;
  data: Playlist[];
};

export type UseInfinitePlaylistsInput = {
  provider: MusicProvider;
  limit?: number;
};

export async function getPlaylists(
  input: GetPlaylistsInput,
): Promise<GetPlaylistsResponse> {
  const response = await api.fetch(
    `/v1/connections/${input.provider}/playlists?limit=${input.limit}&offset=${input.offset}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to get playlists for provider: ${input.provider}`);
  }
  return response.json();
}

export const getPlaylistsQuery = (input: GetPlaylistsInput) =>
  queryOptions({
    queryKey: [input.provider, "playlists", input],
    queryFn: () => getPlaylists(input),
  });

export const usePlaylists = (input: GetPlaylistsInput) =>
  useQuery(getPlaylistsQuery(input));

export const infinitePlaylistsQueryKey = (provider: MusicProvider) => [
  provider,
  "playlists",
];

export const useInfinitePlaylists = ({
  provider,
  limit = 50,
}: UseInfinitePlaylistsInput) =>
  useInfiniteQuery({
    queryKey: infinitePlaylistsQueryKey(provider),
    queryFn: ({ pageParam }) =>
      getPlaylists({ provider, limit, offset: pageParam }),
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const nextOffset = lastPageParam + limit;
      if (nextOffset >= lastPage.total) return undefined;
      return nextOffset;
    },
  });
