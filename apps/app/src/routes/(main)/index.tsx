import { createFileRoute } from "@tanstack/react-router";
import { Music2, ListMusic, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { infiniteTracksQueryKey, useInfiniteTracks } from "@/features/connections/api/get-tracks";
import { TrackList } from "@/features/connections/components/tracklist";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { GetTracksResponse } from "@/features/connections/api/get-tracks";

export const Route = createFileRoute("/(main)/")({
  loader: async ({ context: { queryClient } }) => {
    queryClient.setQueryData(
      infiniteTracksQueryKey("spotify"),
      (data: InfiniteData<GetTracksResponse> | undefined) =>
        data ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) } : data,
    );
  },
  component: IndexPage,
});

function IndexPage() {
  const queryClient = useQueryClient();
  const {
    data,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchQuery,
  } = useInfiniteTracks({ provider: "spotify", limit: 50 });

  function refetch() {
    queryClient.setQueryData(
      infiniteTracksQueryKey("spotify"),
      (data: InfiniteData<GetTracksResponse> | undefined) =>
        data ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) } : data,
    );
    refetchQuery();
  }

  const tracks = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage and sync your music library across all your devices.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Synced Tracks"
          value={isPending ? "—" : total !== undefined ? String(total) : "—"}
        />
        <StatCard label="Playlists" value="—" />
        <StatCard label="Devices" value="—" />
      </div>

      {/* Library */}
      <Card className="flex-1 min-h-0 pb-0">
        <CardHeader>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <ListMusic className="text-primary size-5" />
              <CardTitle>Your Library</CardTitle>
            </div>
            {!isPending && (
              <Button onClick={() => refetch()}>
                <RefreshCcw />
              </Button>
            )}
          </div>
          <CardDescription>
            {isPending && "Loading your tracks…"}
            {!isPending && `${total ?? 0} tracks`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 p-0">
          {isPending && <TrackSkeletonList count={12} />}
          {!isPending && tracks.length === 0 && <NoTracks />}
          {!isPending && tracks.length > 0 && (
            <TrackList
              total={total || 0}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              tracks={tracks}
              loadMore={() => {
                console.log("Fetch more");
                fetchNextPage();
              }}
              className="flex-1 min-h-0"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NoTracks() {
  return (
    <div className="border-border m-6 rounded-lg border border-dashed py-16 text-center">
      <Music2 className="text-muted-foreground/40 mx-auto mb-3 size-10" />
      <p className="text-muted-foreground text-sm font-medium">No tracks yet</p>
      <p className="text-muted-foreground/70 mt-1 text-xs">
        Connect a music source to start syncing.
      </p>
      <Button size="sm" className="mt-4">
        Connect a source
      </Button>
    </div>
  );
}

function TrackSkeletonList({ count }: { count: number }) {
  return (
    <ul>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-6 py-3">
          <Skeleton className="h-4 w-4 shrink-0" />
          <Skeleton className="size-9 shrink-0 rounded" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
