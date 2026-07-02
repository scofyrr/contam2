import { Link } from "@tanstack/react-router";
import { Lightbulb, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection } from "@/modules/dashboard/components/dashboard-shared";
import { useSugerenciasInteligentes } from "@/hooks/use-dashboard-premium";

export function SugerenciasWidget() {
  const { config, colores, isFeatureActive, refreshInterval } = useWidgetDashboard();
  const sugerencias = useSugerenciasInteligentes(true, refreshInterval);

  if (!config.mostrar_sugerencias || !isFeatureActive("sugerencias_inteligentes")) {
    return null;
  }

  return (
    <DashboardSection title="Sugerencias inteligentes" icon={<Lightbulb className="size-4 text-[#F0A500]" />}>
      <div className="space-y-3">
        {sugerencias.isLoading ? (
          <Skeleton className="h-24 rounded-lg bg-white/5" />
        ) : (sugerencias.data ?? []).length === 0 ? (
          <p className="text-sm text-[#8899B4] text-center py-4">Sin sugerencias por ahora</p>
        ) : (
          (sugerencias.data ?? []).slice(0, 4).map((s) => (
            <div key={s.id} className="rounded-lg border border-white/[0.06] p-3 text-sm">
              <p className="font-medium text-[#E8EDF5] flex items-center gap-1">
                {s.tipo === "LOGRO" ? (
                  <Star className="size-3 text-amber-400" />
                ) : (
                  <Lightbulb className="size-3 text-cyan-400" />
                )}
                {s.titulo}
              </p>
              <p className="text-xs text-[#8899B4] mt-0.5">{s.descripcion}</p>
              {s.accion.link && (
                <Button variant="link" size="sm" className="h-auto p-0 mt-1" style={{ color: colores.acento }} asChild>
                  <Link to={s.accion.link}>{s.accion.label} →</Link>
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardSection>
  );
}

export default SugerenciasWidget;
