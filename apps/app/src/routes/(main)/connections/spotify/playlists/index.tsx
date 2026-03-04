import { useEffect } from "react";
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
  infinitePlaylistsQueryKey,
  useInfinitePlaylists,
  type GetPlaylistsResponse,
} from "@/features/connections/api/get-playlists";
import { PlaylistList } from "@/features/connections/components/playlist-list";

import { type InfiniteData } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ListMusic, Music2 } from "lucide-react";

export const Route = createFileRoute("/(main)/connections/spotify/playlists/")({
  loader: async ({ context: { queryClient } }) => {
    queryClient.setQueryData(
      infinitePlaylistsQueryKey("spotify"),
      (data: InfiniteData<GetPlaylistsResponse> | undefined) =>
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
  const router = useRouter();
  const {
    data,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePlaylists({ provider: "spotify", limit: 50 });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const playlists = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total;

  function likedClicked() {
    router.navigate({ to: "/connections/spotify/liked" });
  }

  function playlistClicked(playlistId: string) {
    router.navigate({ to: `/connections/spotify/playlists/${playlistId}` });
  }

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
        <h1 className="text-2xl font-semibold">Spotify</h1>
      </div>

      {/* Playlists */}
      <Card>
        <CardHeader>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <ListMusic className="text-primary size-5" />
              <CardTitle>Your Playlists</CardTitle>
            </div>
          </div>
          <CardDescription>
            {isPending && "Loading your playlists…"}
            {!isPending && `${total ?? 0} playlists`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isPending && <PlaylistSkeletonGrid count={12} />}
          {!isPending && playlists.length === 0 && <NoPlaylists />}
          {!isPending && playlists.length > 0 && (
            <PlaylistList
              isFetchingNextPage={isFetchingNextPage}
              playlists={playlists}
              likedClicked={likedClicked}
              playlistClicked={playlistClicked}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NoPlaylists() {
  return (
    <div className="border-border m-6 rounded-lg border border-dashed py-16 text-center">
      <Music2 className="text-muted-foreground/40 mx-auto mb-3 size-10" />
      <p className="text-muted-foreground text-sm font-medium">
        No playlists yet
      </p>
      <p className="text-muted-foreground/70 mt-1 text-xs">
        Connect a music source to start syncing.
      </p>
      <Button size="sm" className="mt-4">
        Connect a source
      </Button>
    </div>
  );
}

function PlaylistSkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
