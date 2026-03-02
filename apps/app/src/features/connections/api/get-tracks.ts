import { api } from "@/lib/api";
import type { MusicProvider } from "../types/connection.type";
import {
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import type { Track } from "../types/track.type";

export type GetTracksInput = {
  provider: MusicProvider;
  limit: number;
  offset: number;
};

export type GetTracksResponse = {
  limit: number;
  offset: number;
  total: number;
  data: Track[];
};

export type UseInfiniteTracksInput = {
  provider: MusicProvider;
  limit?: number;
};

export async function getTracks(
  input: GetTracksInput,
): Promise<GetTracksResponse> {
  const response = await api.fetch(
    `/v1/connections/${input.provider}/tracks?limit=${input.limit}&offset=${input.offset}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to get tracks for provider: ${input.provider}`);
  }
  return response.json();
}

export const getTracksQuery = (input: GetTracksInput) =>
  queryOptions({
    queryKey: [input.provider, "tracks", input],
    queryFn: () => getTracks(input),
  });

export const useTracks = (input: GetTracksInput) =>
  useQuery(getTracksQuery(input));

export const infiniteTracksQueryKey = (provider: MusicProvider) => [
  provider,
  "tracks",
];

export const useInfiniteTracks = ({
  provider,
  limit = 50,
}: UseInfiniteTracksInput) =>
  useInfiniteQuery({
    queryKey: infiniteTracksQueryKey(provider),
    queryFn: ({ pageParam }) =>
      getTracks({ provider, limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const nextOffset = lastPageParam + limit;
      if (nextOffset >= lastPage.total) return undefined;
      return nextOffset;
    },
  });
