import { createFileRoute } from "@tanstack/react-router";
import { Music2, ExternalLink, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateSpotifyConnection } from "@/features/connections/api/create-spotify-connection";
import { useDeleteConnection } from "@/features/connections/api/delete-connection";
import { useConnections } from "@/features/connections/api/get-connection";

export const Route = createFileRoute("/(main)/connections/")({
  component: IndexPage,
});

// ─── Page ───────────────────────────────────────────────────

function IndexPage() {
  const { data: connections, isPending, error } = useConnections();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const hasSpotifyConnection = connections?.some(
    (connection) => connection.provider === "spotify",
  );
  // const hasAppleMusicConnection = connections?.some(
  //   (connection) => connection.provider === "apple_music",
  // );

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Connected Services</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Link your music streaming accounts so Music&nbsp;Sync can read your
          libraries and playlists.
        </p>
      </div>

      {/* Service cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SpotifyCard isConnected={hasSpotifyConnection} />
        <AppleMusicCard isConnected={false} />
      </div>
    </>
  );
}

function SpotifyCard({ isConnected }: { isConnected: boolean }) {
  const createSpotifyConnection = useCreateSpotifyConnection();
  const deleteConnection = useDeleteConnection();

  async function startAuthFlow() {
    await createSpotifyConnection.mutateAsync();
  }

  async function disconnect() {
    await deleteConnection.mutateAsync("spotify");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#1DB954]/10">
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="#1DB954"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">Spotify</CardTitle>
            <CardDescription>
              Connect your Spotify account to sync your library.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected && (
          <Button
            size="sm"
            onClick={startAuthFlow}
            disabled={createSpotifyConnection.isPending}
          >
            <ExternalLink className="size-4" />
            Connect Spotify
          </Button>
        )}
        {isConnected && (
          <Button
            size="sm"
            variant="destructive"
            onClick={disconnect}
            disabled={deleteConnection.isPending}
          >
            <Unlink className="size-4" />
            Disconnect
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Apple Music Card ───────────────────────────────────────

function AppleMusicCard({ isConnected }: { isConnected: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#FC3C44]/10">
            <Music2 className="size-5 text-[#FC3C44]" />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Apple Music
            </CardTitle>
            <CardDescription>
              {isConnected
                ? "Your Apple Music account is linked."
                : "Connect your Apple Music account to sync your library."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button size="sm">
          <ExternalLink className="size-4" />
          Connect Apple Music
        </Button>
      </CardContent>
    </Card>
  );
}
