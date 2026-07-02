import { Target, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection, formatSoles } from "@/modules/dashboard/components/dashboard-shared";
import { useFacturacionMensualPersonal } from "@/hooks/use-dashboard-premium";

function diasRestantesMes(): number {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.getDate() - now.getDate();
}

export function MetaMensualWidget() {
  const { contenido, umbrales, refreshInterval } = useWidgetDashboard();
  const facturacion = useFacturacionMensualPersonal(true, refreshInterval);

  if (!contenido.meta_mensual_activa || contenido.meta_mensual_monto <= 0) {
    return null;
  }

  const meta = contenido.meta_mensual_monto;
  const actual = facturacion.data ?? 0;
  const porcentaje = meta > 0 ? Math.min(100, (actual / meta) * 100) : 0;
  const restante = Math.max(0, meta - actual);

  const color =
    porcentaje >= umbrales.efectividad_excelente
      ? "#00C897"
      : porcentaje >= umbrales.efectividad_meta
        ? "#00D4FF"
        : porcentaje >= 70
          ? "#F0A500"
          : "#FF5E7A";

  return (
    <DashboardSection title="Meta mensual" icon={<Target className="size-4 text-[#C8A95A]" />}>
      {facturacion.isLoading ? (
        <Skeleton className="h-20 rounded-lg bg-white/5" />
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#E8EDF5] font-medium">
              {formatSoles(actual)} de {formatSoles(meta)}
            </span>
            <span className="tabular-nums font-semibold" style={{ color }}>
              {porcentaje.toFixed(0)}%
            </span>
          </div>
          <Progress value={porcentaje} className="h-2.5" style={{ ["--progress-color" as string]: color }} />
          <p className="text-xs text-[#8899B4]">
            Restan {formatSoles(restante)} · Quedan {diasRestantesMes()} días
            {porcentaje >= 100 && (
              <span className="inline-flex items-center gap-1 ml-2 text-[#00C897]">
                <Sparkles className="size-3.5" /> Meta alcanzada
              </span>
            )}
            {porcentaje >= umbrales.efectividad_meta && porcentaje < 100 && " · ⭐ Vas por buen camino"}
          </p>
        </div>
      )}
    </DashboardSection>
  );
}

export default MetaMensualWidget;
