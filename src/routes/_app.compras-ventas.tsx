import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ComprasVentasHub = lazy(() =>
  import("@/modules/compras-ventas/components/ComprasVentasHub").then((m) => ({
    default: m.ComprasVentasHub,
  })),
);

export const Route = createFileRoute("/_app/compras-ventas")({
  component: ComprasVentasPage,
});

function ComprasVentasSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-96" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function ComprasVentasPage() {
  return (
    <Suspense fallback={<ComprasVentasSkeleton />}>
      <ComprasVentasHub />
    </Suspense>
  );
}
