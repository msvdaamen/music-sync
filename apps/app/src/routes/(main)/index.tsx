import { createFileRoute, redirect } from "@tanstack/react-router";
import { Music2, ListMusic, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(main)/")({
  component: IndexPage,
});

function IndexPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary size-6 animate-spin" />
      </div>
    );
  }

  const user = session?.user;

  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Welcome back
          {user?.name ? `, ${user.name}` : ``}!
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage and sync your music library across all your devices.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Synced Tracks" value="—" />
        <StatCard label="Playlists" value="—" />
        <StatCard label="Devices" value="—" />
      </div>

      {/* Placeholder library */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListMusic className="text-primary size-5" />
            <CardTitle>Your Library</CardTitle>
          </div>
          <CardDescription>
            Your synced tracks will appear here once you connect a music source.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-border rounded-lg border border-dashed py-16 text-center">
            <Music2 className="text-muted-foreground/40 mx-auto mb-3 size-10" />
            <p className="text-muted-foreground text-sm font-medium">
              No tracks yet
            </p>
            <p className="text-muted-foreground/70 mt-1 text-xs">
              Connect a music source to start syncing.
            </p>
            <Button size="sm" className="mt-4">
              Connect a source
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
