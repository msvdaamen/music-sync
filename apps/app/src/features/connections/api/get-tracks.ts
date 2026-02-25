import { api } from "@/lib/api";
import type { MusicProvider } from "../types/connection.type";
import { queryOptions, useQuery } from "@tanstack/react-query";

export async function getTracks(
  provider: MusicProvider,
): Promise<{ id: string; name: string }[]> {
  const response = await api.fetch(`/v1/connections/${provider}/tracks`);
  if (!response.ok) {
    throw new Error(`Failed to get tracks for provider: ${provider}`);
  }
  return response.json();
}

export const getTracksQuery = (provider: MusicProvider) =>
  queryOptions({
    queryKey: [provider, "tracks"],
    queryFn: () => getTracks(provider),
  });

export const useTracks = (provider: MusicProvider) =>
  useQuery(getTracksQuery(provider));
