import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ContabilidadHub = lazy(() =>
  import("@/modules/contabilidad/components/ContabilidadHub").then((m) => ({
    default: m.ContabilidadHub,
  })),
);

export const Route = createFileRoute("/_app/contabilidad")({
  component: ContabilidadPage,
});

function ContabilidadSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function ContabilidadPage() {
  return (
    <Suspense fallback={<ContabilidadSkeleton />}>
      <ContabilidadHub />
    </Suspense>
  );
}
