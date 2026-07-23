import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AiCopilotWidget = lazy(() =>
  import("@/modules/ai-copilot/components/AiCopilotWidget").then((m) => ({
    default: m.AiCopilotWidget,
  })),
);

export const Route = createFileRoute("/_app/ai-copilot")({
  component: AiCopilotPage,
});

function AiCopilotSkeleton() {
  return (
    <div className="min-h-full space-y-6 p-6">
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function AiCopilotPage() {
  return (
    <Suspense fallback={<AiCopilotSkeleton />}>
      <AiCopilotWidget />
    </Suspense>
  );
}
