import { useEffect, useRef } from "react";
import type { Track } from "../types/track.type";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Music2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  total: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  tracks: Track[];
  loadMore: () => void;
  className?: string;
};

export function TrackList({
  total,
  hasNextPage,
  isFetchingNextPage,
  tracks,
  loadMore,
  className,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: total,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const pendingLoadRef = useRef(false);

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (isFetchingNextPage) {
      // Fetch is now in-flight — safe to reset the guard so the next
      // page can be triggered once this one completes.
      pendingLoadRef.current = false;
      return;
    }

    if (lastItem.index >= tracks.length - 1 && hasNextPage && !pendingLoadRef.current) {
      // Set the guard synchronously before the next render so rapid
      // scroll events cannot fire loadMore() more than once per page.
      pendingLoadRef.current = true;
      loadMore();
    }
  }, [virtualItems, tracks.length, hasNextPage, isFetchingNextPage, loadMore]);

  return (
    <div ref={parentRef} className={cn("overflow-y-auto", className)}>
      <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= tracks.length;
          const track = tracks[virtualRow.index];
          const albumImages = track?.images
            ? [...track.images].sort((a, b) => a.height - b.height)
            : [];
          const image = albumImages[0];
          const artists = track?.artists || [];
          const artistNames = artists.map((artist) => artist.name).join(", ");

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="border-border absolute top-0 left-0 w-full border-b last:border-b-0"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {isLoaderRow ? (
                <TrackSkeleton />
              ) : (
                <div className="hover:bg-muted/50 flex items-center gap-3 px-6 py-3 transition-colors">
                  <span className="text-muted-foreground w-6 shrink-0 text-right text-xs tabular-nums">
                    {virtualRow.index + 1}
                  </span>
                  <div className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded">
                    {image ? (
                      <img src={image.url} alt={track.name} className="size-full object-cover" />
                    ) : (
                      <Music2 className="text-muted-foreground size-4" />
                    )}
                  </div>
                  <span className="flex flex-col min-w-0 truncate text-sm font-medium">
                    <span>{track.name}</span>
                    <span className="text-muted-foreground">{artistNames}</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!hasNextPage && tracks.length > 0 && (
        <p className="text-muted-foreground py-4 text-center text-xs">
          All {tracks.length} tracks loaded
        </p>
      )}
    </div>
  );
}

function TrackSkeleton() {
  return (
    <ul>
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-6 py-3">
          <Skeleton className="h-4 w-4 shrink-0" />
          <Skeleton className="size-9 shrink-0 rounded" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </li>
      ))}
    </ul>
  );
}
