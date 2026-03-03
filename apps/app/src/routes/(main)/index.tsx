import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/(main)/")({
  component: IndexPage,
});

function IndexPage() {
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
        <StatCard label="Synced Tracks" value="—" />
        <StatCard label="Playlists" value="—" />
        <StatCard label="Devices" value="—" />
      </div>
    </div>
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
