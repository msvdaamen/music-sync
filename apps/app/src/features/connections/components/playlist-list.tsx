import type { Playlist } from "../types/playlist.type";
import { Heart, ListMusic } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  isFetchingNextPage: boolean;
  playlists: Playlist[];
  className?: string;
  likedClicked?: () => void;
  playlistClicked?: (playlistId: string) => void;
};

export function PlaylistList({
  isFetchingNextPage,
  playlists,
  className,
  likedClicked,
  playlistClicked,
}: Props) {
  return (
    <div className={cn("overflow-y-auto", className)}>
      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {/* Liked Songs tile */}
        <div
          className="group flex cursor-pointer flex-col gap-2"
          onClick={likedClicked}
        >
          <div className="relative aspect-square overflow-hidden rounded-md shadow-sm bg-linear-to-br from-indigo-400 via-purple-500 to-pink-400">
            <div className="flex size-full items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Heart className="size-10 fill-white text-white drop-shadow-md" />
            </div>
          </div>
          <p className="truncate text-sm font-medium leading-tight">
            Liked Songs
          </p>
        </div>

        {/* Regular playlist tiles */}
        {playlists.map((playlist) => {
          const image = [...(playlist.images ?? [])].sort(
            (a, b) => b.height - a.height,
          )[0];

          return (
            <div
              key={playlist.id}
              className="group flex cursor-pointer flex-col gap-2"
              onClick={playlistClicked}
            >
              <div className="bg-muted relative aspect-square overflow-hidden rounded-md shadow-sm">
                {image ? (
                  <img
                    src={image.url}
                    alt={playlist.name}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ListMusic className="text-muted-foreground size-10" />
                  </div>
                )}
              </div>
              <p className="truncate text-sm font-medium leading-tight">
                {playlist.name}
              </p>
            </div>
          );
        })}

        {/* Skeleton tiles while fetching next page */}
        {isFetchingNextPage &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
      </div>
    </div>
  );
}
