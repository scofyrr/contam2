import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LibroMayorHub = lazy(() =>
  import("@/modules/libro-mayor/components/LibroMayorHub").then((m) => ({
    default: m.LibroMayorHub,
  })),
);

export const Route = createFileRoute("/_app/libro-mayor")({
  component: LibroMayorPage,
});

function LibroMayorSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function LibroMayorPage() {
  return (
    <Suspense fallback={<LibroMayorSkeleton />}>
      <LibroMayorHub />
    </Suspense>
  );
}
