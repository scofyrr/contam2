import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SireDashboardHub = lazy(() =>
  import("@/modules/sire/components/SireDashboardHub").then((m) => ({
    default: m.SireDashboardHub,
  })),
);

const SireSyncDashboardPremium = lazy(
  () => import("@/modules/sire/components/sire-sync-dashboard-premium"),
);

export const Route = createFileRoute("/_app/sire-sync")({
  component: SireSyncPage,
  validateSearch: (search: Record<string, unknown>) => {
    const tab = search.tab as string;
    return {
      tab: tab === "legacy" ? "legacy" : "hub",
    };
  },
});

function HubSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

function SireSyncPage() {
  const { tab } = Route.useSearch();

  if (tab === "legacy") {
    return (
      <Suspense fallback={<HubSkeleton />}>
        <SireSyncDashboardPremium />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<HubSkeleton />}>
      <SireDashboardHub />
    </Suspense>
  );
}
