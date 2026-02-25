import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { type } from "arktype";
import { useCallbackSpotifyConnection } from "@/features/connections/api/callback-spotify-connection";

const validation = type({
  "code?": "string",
  state: "string",
  "error?": "string",
});
export const Route = createFileRoute("/(main)/connections/spotify/callback")({
  validateSearch: validation,
  component: SpotifyCallbackPage,
});

function SpotifyCallbackPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const spotifyCallback = useCallbackSpotifyConnection();
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent running twice in StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    async function handleCallback() {
      // Handle errors from Spotify (e.g. user denied access)
      if (search.error) {
        navigate({
          to: "/connections",
          search: { error: search.error },
          replace: true,
        });
        return;
      }

      if (!search.code || !search.state) {
        navigate({
          to: "/connections",
          search: { error: "missing_params" },
          replace: true,
        });
        return;
      }

      try {
        await spotifyCallback.mutateAsync({
          code: search.code,
          state: search.state,
        });

        navigate({
          to: "/connections",
          search: { connected: "spotify" },
          replace: true,
        });
      } catch {
        navigate({
          to: "/connections",
          search: { error: "token_exchange_failed" },
          replace: true,
        });
      }
    }

    handleCallback();
  }, [search, navigate, spotifyCallback]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="text-primary size-8 animate-spin" />
      <p className="text-muted-foreground text-sm">
        Connecting your Spotify account…
      </p>
    </div>
  );
}
