import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WidgetSize } from "@/modules/dashboard/types/dashboard-configurable-types";
import { WIDGET_SKELETON_HEIGHT } from "@/modules/dashboard/registry/widget-registry";

export function WidgetSkeleton({ tamano }: { tamano: WidgetSize }) {
  return (
    <Skeleton
      className={cn("w-full rounded-xl bg-white/5", WIDGET_SKELETON_HEIGHT[tamano])}
      aria-label="Cargando widget"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 min-h-full bg-gradient-to-b from-[#060B14] to-[#080E1E]">
      <Skeleton className="h-24 w-full max-w-2xl rounded-xl bg-white/5" />
      <div className="grid grid-cols-12 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="col-span-12 sm:col-span-6 lg:col-span-2 h-28 rounded-xl bg-white/5" />
        ))}
        <Skeleton className="col-span-12 lg:col-span-6 h-64 rounded-xl bg-white/5" />
        <Skeleton className="col-span-12 lg:col-span-6 h-64 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}
