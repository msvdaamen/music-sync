import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  infiniteTracksQueryKey,
  useInfiniteTracks,
  type GetTracksResponse,
} from "@/features/connections/api/get-tracks";
import { TrackList } from "@/features/connections/components/tracklist";
import { type InfiniteData } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Music2 } from "lucide-react";

export const Route = createFileRoute("/(main)/connections/spotify/liked")({
  loader: async ({ context: { queryClient } }) => {
    queryClient.setQueryData(
      infiniteTracksQueryKey("spotify"),
      (data: InfiniteData<GetTracksResponse> | undefined) =>
        data
          ? {
              pages: data.pages.slice(0, 1),
              pageParams: data.pageParams.slice(0, 1),
            }
          : data,
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTracks({ provider: "spotify", limit: 50 });

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Spotify — Tracks</h1>
      </div>

      {/* Library */}
      <Card className="flex-1 min-h-0 pb-0">
        <CardHeader>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Music2 className="text-primary size-5" />
              <CardTitle>Your Library</CardTitle>
            </div>
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
              loadMore={fetchNextPage}
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
