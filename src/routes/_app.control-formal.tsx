import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ControlFormalHub = lazy(() =>
  import("@/modules/control-formal/components/ControlFormalHub").then((m) => ({
    default: m.ControlFormalHub,
  })),
);

export const Route = createFileRoute("/_app/control-formal")({
  component: ControlFormalPage,
});

function ControlFormalSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function ControlFormalPage() {
  return (
    <Suspense fallback={<ControlFormalSkeleton />}>
      <ControlFormalHub />
    </Suspense>
  );
}
