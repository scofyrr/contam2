import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection } from "@/modules/dashboard/components/dashboard-shared";
import { useCargaTrabajo, usePersonalMetrics } from "@/hooks/use-dashboard-premium";

function WorkloadHeatmap({ days }: { days: { fecha: string; total: number }[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const intensity = (n: number) => {
    if (n === 0) return "bg-white/[0.02]";
    if (n <= 2) return "bg-cyan-500/20";
    if (n <= 5) return "bg-cyan-500/40";
    if (n <= 10) return "bg-cyan-500/60";
    return "bg-amber-500/60";
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.slice(-28).map((d) => (
        <div
          key={d.fecha}
          title={`${d.fecha}: ${d.total} tareas`}
          className={cn(
            "aspect-square rounded-sm",
            intensity(d.total),
            d.fecha === today && "ring-2 ring-[#C8A95A]",
          )}
        />
      ))}
    </div>
  );
}

export function CargaTrabajoWidget() {
  const { umbrales, refreshInterval } = useWidgetDashboard();
  const carga = useCargaTrabajo(4, true, refreshInterval);
  const metrics = usePersonalMetrics(true, refreshInterval);
  const m = metrics.data;

  const cargaLabel =
    (m?.tareasPendientes ?? 0) >= umbrales.carga_critica
      ? "CRITICA"
      : (m?.tareasPendientes ?? 0) >= umbrales.carga_alta
        ? "ALTA"
        : (m?.tareasPendientes ?? 0) <= umbrales.carga_baja
          ? "BAJA"
          : "NORMAL";

  return (
    <DashboardSection title="Mi carga de trabajo" icon={<Target className="size-4 text-[#00D4FF]" />}>
      {carga.isLoading ? (
        <Skeleton className="h-24 rounded-lg bg-white/5" />
      ) : (
        <>
          <WorkloadHeatmap days={carga.data ?? []} />
          <p className="text-xs text-[#8899B4] mt-3">
            Hoy: {m?.tareasHoy ?? 0} tareas · Completadas hoy: {m?.tareasCompletadasHoy ?? 0}
          </p>
          <Badge className="mt-2" variant="outline">
            Carga: {cargaLabel}
          </Badge>
        </>
      )}
    </DashboardSection>
  );
}

export default CargaTrabajoWidget;
