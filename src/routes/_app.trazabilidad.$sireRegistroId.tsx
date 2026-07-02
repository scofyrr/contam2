import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AsientoTraceabilityViewerPremium = lazy(
  () => import("@/modules/contabilidad/asientos/components/asiento-traceability-viewer-premium"),
);

export const Route = createFileRoute("/_app/trazabilidad/$sireRegistroId")({
  component: TrazabilidadPage,
});

function TraceSkeleton() {
  return (
    <div className="min-h-full bg-[#070C1B] p-8 space-y-6">
      <Skeleton className="h-10 w-64 bg-white/10" />
      <Skeleton className="h-24 rounded-xl bg-white/5" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 rounded-xl bg-white/5" />
        <Skeleton className="h-96 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

function TrazabilidadPage() {
  const { sireRegistroId } = Route.useParams();
  return (
    <Suspense fallback={<TraceSkeleton />}>
      <AsientoTraceabilityViewerPremium sireRegistroId={sireRegistroId} />
    </Suspense>
  );
}
