import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const TesoreriaHub = lazy(() =>
  import("@/modules/tesoreria/components/TesoreriaHub").then((m) => ({
    default: m.TesoreriaHub,
  })),
);

export const Route = createFileRoute("/_app/tesoreria")({
  component: TesoreriaPage,
});

function TesoreriaSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-80" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function TesoreriaPage() {
  return (
    <Suspense fallback={<TesoreriaSkeleton />}>
      <TesoreriaHub />
    </Suspense>
  );
}
