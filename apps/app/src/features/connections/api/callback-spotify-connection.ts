import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

type CallbackSpotifyConnectionInput = {
  state: string;
  code: string;
};

export async function callbackSpotifyConnection(
  input: CallbackSpotifyConnectionInput,
): Promise<void> {
  const response = await api.fetch("/v1/connections/spotify/callback", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to init spotify oauth flow");
  }
}

export const useCallbackSpotifyConnection = () =>
  useMutation({
    mutationFn: callbackSpotifyConnection,
  });
