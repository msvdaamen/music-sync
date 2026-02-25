import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MusicProvider } from "../types/connection.type";

export async function deleteConnection(provider: MusicProvider): Promise<void> {
  const response = await api.fetch(`/v1/connections/${provider}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete ${provider} connection`);
  }
}

export const useDeleteConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
};
