import { Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection } from "@/modules/dashboard/components/dashboard-shared";
import { getUrgencyColor } from "@/modules/dashboard/utils/urgency-colors";
import { usePersonalMetrics, useTareasUrgentesDashboard } from "@/hooks/use-dashboard-premium";
import { useAlertSystem } from "@/hooks/use-alert-system";
import type { PendingTask } from "@/modules/notificaciones/types/alert-system";

function UrgencyTaskRow({ task, colores }: { task: PendingTask; colores: ReturnType<typeof useWidgetDashboard>["colores"] }) {
  const color = getUrgencyColor(task.urgency, colores);
  const pulse = colores.pulse_en_vencidas && task.urgency === "OVERDUE";

  return (
    <div
      className={`rounded-lg border border-white/[0.06] p-3 flex items-start justify-between gap-3 ${pulse ? "animate-pulse-red" : ""}`}
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-bold" style={{ color }}>
          {task.priority} · {task.urgency.replace("_", " ")}
        </p>
        <p className="text-sm font-medium text-[#E8EDF5] truncate">{task.title}</p>
        {task.rucName && <p className="text-xs text-[#8899B4] mt-0.5">{task.rucName}</p>}
      </div>
      {task.metadata?.link && (
        <Button variant="ghost" size="sm" className="shrink-0 h-8 text-xs" style={{ color: colores.acento }} asChild>
          <Link to={task.metadata.link}>Ir →</Link>
        </Button>
      )}
    </div>
  );
}

export function TareasUrgentesWidget() {
  const { config, colores, umbrales, refreshInterval } = useWidgetDashboard();
  const maxTareas = config.max_tareas_urgentes;
  const urgentes = useTareasUrgentesDashboard(true, refreshInterval);
  const metrics = usePersonalMetrics(true, refreshInterval);
  const { setFabDrawerOpen } = useAlertSystem();

  const filtered = (urgentes.data ?? []).slice(0, maxTareas);

  return (
    <DashboardSection
      title="Tareas que requieren acción"
      icon={<ClipboardList className="size-4" style={{ color: colores.urgencia_hoy }} />}
      action={
        <Button variant="ghost" size="sm" className="text-xs" style={{ color: colores.acento }} onClick={() => setFabDrawerOpen(true)}>
          Ver todas
        </Button>
      }
    >
      <div className="space-y-2">
        {urgentes.isLoading ? (
          <Skeleton className="h-32 rounded-lg bg-white/5" />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#8899B4] text-center py-6">🎉 Sin tareas urgentes</p>
        ) : (
          filtered.map((t) => <UrgencyTaskRow key={t.id} task={t} colores={colores} />)
        )}
      </div>
      <p className="text-[10px] text-[#8899B4] mt-2">
        Alerta próxima: {umbrales.dias_alerta_proxima} días
      </p>
      <Button variant="ghost" size="sm" className="w-full mt-2" style={{ color: colores.acento }} asChild>
        <Link to="/tareas">Ver todas ({metrics.data?.tareasPendientes ?? 0}) →</Link>
      </Button>
    </DashboardSection>
  );
}

export default TareasUrgentesWidget;
