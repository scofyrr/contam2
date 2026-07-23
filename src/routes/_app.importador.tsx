import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ImportadorHub = lazy(() =>
  import("@/modules/importador/components/ImportadorHub").then((m) => ({
    default: m.ImportadorHub,
  })),
);

export const Route = createFileRoute("/_app/importador")({
  component: ImportadorPage,
});

function ImportadorSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl border-2 border-dashed" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

function ImportadorPage() {
  return (
    <Suspense fallback={<ImportadorSkeleton />}>
      <ImportadorHub />
    </Suspense>
  );
}
