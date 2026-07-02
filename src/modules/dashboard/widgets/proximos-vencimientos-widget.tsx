import { CalendarClock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection } from "@/modules/dashboard/components/dashboard-shared";
import { useProximosVencimientos } from "@/hooks/use-dashboard-premium";

export function ProximosVencimientosWidget() {
  const { umbrales, colores, refreshInterval } = useWidgetDashboard();
  const vencimientos = useProximosVencimientos(umbrales.dias_alerta_proxima + 4, true, refreshInterval);

  return (
    <DashboardSection
      title="Próximos vencimientos"
      icon={<CalendarClock className="size-4" style={{ color: colores.urgencia_semana }} />}
    >
      {vencimientos.isLoading ? (
        <Skeleton className="h-32 rounded-lg bg-white/5" />
      ) : (vencimientos.data ?? []).length === 0 ? (
        <p className="text-sm text-[#8899B4] text-center py-4">Sin vencimientos en los próximos días</p>
      ) : (
        <div className="space-y-2">
          {vencimientos.data?.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-2 text-sm rounded-lg border border-white/[0.06] px-3 py-2"
              style={{ borderLeftWidth: 3, borderLeftColor: colores.urgencia_semana }}
            >
              <div className="min-w-0">
                <p className="text-[#E8EDF5] truncate">{t.titulo}</p>
                <p className="text-[10px] text-[#8899B4]">{t.plazo_vencimiento}</p>
              </div>
              <Link to="/tareas" className="text-xs shrink-0" style={{ color: colores.acento }}>
                Ver →
              </Link>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

export default ProximosVencimientosWidget;
