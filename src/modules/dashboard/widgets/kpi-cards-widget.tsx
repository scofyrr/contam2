import { Flame } from "lucide-react";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardKpiCard } from "@/modules/dashboard/components/dashboard-shared";
import { getEfectividadColor } from "@/modules/dashboard/utils/urgency-colors";
import { usePersonalMetrics } from "@/hooks/use-dashboard-premium";
import { useAlertSystem } from "@/hooks/use-alert-system";

const KPI_DEFS: Record<
  string,
  {
    label: string;
    getValue: (m: NonNullable<ReturnType<typeof usePersonalMetrics>["data"]>) => string | number;
    getSublabel?: (m: NonNullable<ReturnType<typeof usePersonalMetrics>["data"]>, umbrales?: { efectividad_excelente: number }) => string | undefined;
    getColor: (m: NonNullable<ReturnType<typeof usePersonalMetrics>["data"]>, accent: string, umbrales: { efectividad_excelente: number; efectividad_meta: number }) => string;
    pulse?: (m: NonNullable<ReturnType<typeof usePersonalMetrics>["data"]>) => boolean;
    onClick?: boolean;
  }
> = {
  clientes: {
    label: "Clientes asignados",
    getValue: (m) => m.clientesAsignados,
    getColor: () => "#60A5FA",
  },
  tareas: {
    label: "Tareas pendientes",
    getValue: (m) => m.tareasPendientes,
    getSublabel: (m) => (m.tareasVencidas ? `${m.tareasVencidas} vencidas 🔴` : undefined),
    getColor: () => "#00D4FF",
  },
  vencidas: {
    label: "Tareas vencidas",
    getValue: (m) => m.tareasVencidas,
    getColor: (m) => (m.tareasVencidas ? "var(--color-urgencia-vencida, #FF0000)" : "#00C897"),
    pulse: (m) => m.tareasVencidas > 0,
    onClick: true,
  },
  efectividad: {
    label: "Efectividad",
    getValue: (m) => `${m.efectividad}%`,
    getSublabel: (m, umbrales) =>
      m.efectividad >= umbrales.efectividad_excelente ? "⭐ Excelente" : undefined,
    getColor: (m, _a, umbrales) => getEfectividadColor(m.efectividad, umbrales),
  },
  racha: {
    label: "Días productivos",
    getValue: (m) => m.rachaDiasProductivos,
    getSublabel: () => "🔥 racha actual",
    getColor: () => "var(--color-urgencia-hoy, #FF6B00)",
  },
  facturacion: {
    label: "Asientos del mes",
    getValue: (m) => m.asientosDelMes,
    getColor: () => "#C8A95A",
  },
};

export function KpiCardsWidget() {
  const { umbrales, colores, kpisVisibles, refreshInterval } = useWidgetDashboard();
  const metrics = usePersonalMetrics(true, refreshInterval);
  const { setFabDrawerOpen } = useAlertSystem();
  const m = metrics.data;
  const visible = kpisVisibles.filter((id) => KPI_DEFS[id]);

  if (!visible.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {visible.map((id) => {
        const def = KPI_DEFS[id];
        const umbralesLocal = umbrales;
        return (
          <DashboardKpiCard
            key={id}
            label={def.label}
            value={m ? def.getValue(m) : "—"}
            sublabel={m && def.getSublabel ? def.getSublabel(m, umbralesLocal) : undefined}
            accentColor={m ? def.getColor(m, colores.acento, umbralesLocal) : colores.acento}
            loading={metrics.isLoading}
            pulse={m && def.pulse ? def.pulse(m) : false}
            onClick={def.onClick ? () => setFabDrawerOpen(true) : undefined}
          />
        );
      })}
      {visible.includes("racha") && m && m.rachaDiasProductivos > 0 && (
        <span className="sr-only">
          <Flame aria-hidden />
        </span>
      )}
    </div>
  );
}

export default KpiCardsWidget;
