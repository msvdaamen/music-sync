import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

type CreateSpotifyConnectionResponse = {
  redirectUrl: string;
};

export async function createSpotifyConnection(): Promise<CreateSpotifyConnectionResponse> {
  const response = await api.fetch("/v1/connections/spotify/authorize");
  if (!response.ok) {
    throw new Error("Failed to init spotify oauth flow");
  }
  return response.json();
}

export const useCreateSpotifyConnection = () =>
  useMutation({
    mutationFn: createSpotifyConnection,
    onSuccess: (data) => {
      console.log(data.redirectUrl);
      window.location.href = data.redirectUrl;
    },
  });
