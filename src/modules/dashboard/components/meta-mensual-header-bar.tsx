import { Target, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { formatSoles } from "@/modules/dashboard/components/dashboard-shared";
import { useFacturacionMensualPersonal } from "@/hooks/use-dashboard-premium";

function diasRestantesMes(): number {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.getDate() - now.getDate();
}

/** Barra de meta mensual en el header (cuando el widget no está en el grid). */
export function MetaMensualHeaderBar() {
  const { contenido, umbrales, colores, refreshInterval } = useWidgetDashboard();
  const facturacion = useFacturacionMensualPersonal(true, refreshInterval);

  const meta = contenido.meta_mensual_monto;
  const actual = facturacion.data ?? 0;
  const porcentaje = meta > 0 ? Math.min(100, (actual / meta) * 100) : 0;
  const restante = Math.max(0, meta - actual);

  const color =
    porcentaje >= umbrales.efectividad_excelente
      ? "#00C897"
      : porcentaje >= umbrales.efectividad_meta
        ? colores.acento
        : porcentaje >= 70
          ? "#F0A500"
          : "#FF5E7A";

  if (facturacion.isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl bg-white/5" />;
  }

  return (
    <div
      className="rounded-xl border border-[#C8A95A]/20 bg-[#C8A95A]/5 p-5"
      role="region"
      aria-label="Meta mensual de facturación"
    >
      <div className="flex items-center gap-2 mb-3">
        <Target className="size-4 text-[#C8A95A]" />
        <span className="text-sm font-semibold text-[#E8EDF5]">
          Meta mensual: {formatSoles(actual)} de {formatSoles(meta)}
        </span>
        {porcentaje >= 100 && (
          <span className="inline-flex items-center gap-1 text-xs text-[#00C897] ml-auto">
            <Sparkles className="size-3.5" /> ¡Meta alcanzada!
          </span>
        )}
      </div>
      <Progress value={porcentaje} className="h-3" />
      <p className="text-xs text-[#8899B4] mt-2">
        {porcentaje.toFixed(0)}% · Restan {formatSoles(restante)} · {diasRestantesMes()} días del mes
      </p>
    </div>
  );
}
