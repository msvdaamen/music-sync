import { api } from "@/lib/api";
import type { Connection } from "../types/connection.type";
import { queryOptions, useQuery } from "@tanstack/react-query";

export async function getConnections(): Promise<Connection[]> {
  const response = await api.fetch("/v1/connections");
  if (!response.ok) {
    throw new Error("Failed to fetch connections");
  }
  return response.json();
}

export const getConnectionQuery = () =>
  queryOptions({
    queryKey: ["connections"],
    queryFn: getConnections,
  });

export const useConnections = () => useQuery(getConnectionQuery());
