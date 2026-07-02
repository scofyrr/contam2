import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection } from "@/modules/dashboard/components/dashboard-shared";
import { relativeTime } from "@/modules/dashboard/services/dashboard-service";
import { useActividadPersonal } from "@/hooks/use-dashboard-premium";

export function ActividadRecienteWidget() {
  const { config, refreshInterval } = useWidgetDashboard();
  const actividad = useActividadPersonal(10, true, refreshInterval);

  if (!config.mostrar_actividad_reciente) return null;

  return (
    <DashboardSection title="Mi actividad reciente" icon={<CheckCircle2 className="size-4 text-[#00C897]" />}>
      <div className="space-y-2">
        {actividad.isLoading ? (
          <Skeleton className="h-24 rounded-lg bg-white/5" />
        ) : (actividad.data ?? []).length === 0 ? (
          <p className="text-sm text-[#8899B4] text-center py-4">Sin actividad registrada recientemente</p>
        ) : (
          actividad.data?.map((a) => (
            <div key={a.id} className="flex gap-3 text-sm">
              <span className="text-[10px] text-[#8899B4] shrink-0">{relativeTime(a.createdAt)}</span>
              <p className="text-[#E8EDF5]">{a.titulo}</p>
            </div>
          ))
        )}
      </div>
    </DashboardSection>
  );
}

export default ActividadRecienteWidget;
