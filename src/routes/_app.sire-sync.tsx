import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SireSyncDashboardPremium = lazy(
  () => import("@/modules/sire/components/sire-sync-dashboard-premium"),
);

export const Route = createFileRoute("/_app/sire-sync")({
  component: SireSyncPage,
});

function SyncSkeleton() {
  return (
    <div className="min-h-full bg-gradient-to-b from-[#060B14] to-[#0A1628] p-8 space-y-6">
      <Skeleton className="h-10 w-72 bg-white/10" />
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="h-40 rounded-xl bg-white/5" />
        <Skeleton className="h-40 rounded-xl bg-white/5" />
        <Skeleton className="h-40 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

function SireSyncPage() {
  return (
    <Suspense fallback={<SyncSkeleton />}>
      <SireSyncDashboardPremium />
    </Suspense>
  );
}
