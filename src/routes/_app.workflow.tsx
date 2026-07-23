import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const WorkflowWizardHub = lazy(() =>
  import("@/modules/workflow/components/WorkflowWizardHub").then((m) => ({
    default: m.WorkflowWizardHub,
  })),
);

export const Route = createFileRoute("/_app/workflow")({
  component: WorkflowPage,
});

function WorkflowSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}

function WorkflowPage() {
  return (
    <Suspense fallback={<WorkflowSkeleton />}>
      <WorkflowWizardHub />
    </Suspense>
  );
}
