import { useMemo } from "react";
import { Users } from "lucide-react";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection } from "@/modules/dashboard/components/dashboard-shared";
import { useClientesAsignados } from "@/hooks/use-dashboard-premium";
import { cn } from "@/lib/utils";

export function ClientesGraficoWidget() {
  const { config, colores, refreshInterval } = useWidgetDashboard();
  const clientes = useClientesAsignados(true, refreshInterval);
  const maxClientes = config.max_clientes_grafico;

  const chart = useMemo(
    () =>
      [...(clientes.data ?? [])]
        .sort((a, b) => b.tareasPendientes - a.tareasPendientes)
        .slice(0, maxClientes)
        .map((c) => ({
          nombre: c.razonSocial.slice(0, 12),
          tareas: c.tareasPendientes,
          alertas: c.alertas,
        })),
    [clientes.data, maxClientes],
  );

  const maxTareas = Math.max(...chart.map((c) => c.tareas), 1);

  return (
    <DashboardSection title="Mis clientes" icon={<Users className="size-4 text-[#60A5FA]" />}>
      <div className="space-y-2">
        {chart.map((c) => (
          <div key={c.nombre} className="flex items-center gap-2 text-sm">
            <span className="w-24 truncate text-[#E8EDF5] text-xs">{c.nombre}</span>
            <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  c.alertas > 2 ? "bg-red-500" : c.alertas > 0 ? "bg-amber-500" : "bg-emerald-500",
                )}
                style={{ width: `${(c.tareas / maxTareas) * 100}%`, backgroundColor: c.alertas > 0 ? colores.urgencia_vencida : undefined }}
              />
            </div>
            <span className="tabular-nums text-[#8899B4] w-6 text-right">{c.tareas}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#8899B4] mt-3">
        Clientes con alertas: {clientes.data?.filter((c) => c.alertas > 0).length ?? 0} 🔴
      </p>
    </DashboardSection>
  );
}

export default ClientesGraficoWidget;
