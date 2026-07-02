import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection } from "@/modules/dashboard/components/dashboard-shared";
import { useLogrosPersonales } from "@/hooks/use-dashboard-premium";

export function LogrosWidget() {
  const { config, umbrales, isFeatureActive, refreshInterval } = useWidgetDashboard();
  const logros = useLogrosPersonales(true, refreshInterval);

  if (!config.mostrar_gamificacion || !isFeatureActive("gamificacion_activa")) {
    return null;
  }

  const desbloqueados = (logros.data ?? []).filter((l) => l.desbloqueado);

  return (
    <DashboardSection title="Logros y rachas" icon={<Trophy className="size-4 text-[#C8A95A]" />}>
      {logros.isLoading ? (
        <Skeleton className="h-24 rounded-lg bg-white/5" />
      ) : desbloqueados.length === 0 ? (
        <p className="text-sm text-[#8899B4] text-center py-4">
          Meta racha: {umbrales.racha_minima_logro} días
        </p>
      ) : (
        <div className="space-y-2">
          {desbloqueados.slice(0, 4).map((l) => (
            <div key={l.id} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm">
              <p className="font-medium text-[#E8EDF5]">{l.titulo}</p>
              <p className="text-xs text-[#8899B4] mt-0.5">{l.descripcion}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

export default LogrosWidget;
