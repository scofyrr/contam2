import { Suspense, useEffect, useMemo } from "react";
import { Flame, RefreshCw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEstudioConfig } from "@/hooks/use-estudio-config";
import { useSession } from "@/hooks/use-session";
import { useDashboardWidgets } from "@/hooks/use-dashboard-widgets";
import { useAnunciosEstudio } from "@/hooks/use-anuncios-estudio";
import { WidgetDashboardProvider } from "@/modules/dashboard/context/widget-dashboard-context";
import { AnunciosBannerPremium } from "@/modules/dashboard/components/anuncios-banner-premium";
import { WidgetErrorBoundary } from "@/modules/dashboard/components/widget-error-boundary";
import { DashboardSkeleton, WidgetSkeleton } from "@/modules/dashboard/components/widget-skeleton";
import { MetaMensualHeaderBar } from "@/modules/dashboard/components/meta-mensual-header-bar";
import { WIDGET_SIZE_CLASSES } from "@/modules/dashboard/registry/widget-registry";
import { applyContadorCssVariables } from "@/modules/dashboard/utils/urgency-colors";
import type { WidgetProps } from "@/modules/dashboard/types/dashboard-configurable-types";
import { usePersonalMetrics } from "@/hooks/use-dashboard-premium";
import { cn } from "@/lib/utils";

export function ContadorDashboardPremium() {
  const { user } = useSession();
  const {
    dashboard_contador: config,
    umbrales,
    colores,
    contenido,
    cargando: configLoading,
    isFeatureActive,
    recargar,
  } = useEstudioConfig();

  const { widgets, kpisVisibles, refreshInterval } = useDashboardWidgets();
  const { anuncioActivo, marcarComoVisto } = useAnunciosEstudio(contenido.anuncios);
  const metrics = usePersonalMetrics(widgets.some((w) => w.id === "kpis"), refreshInterval);

  const periodoActual = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const widgetContext: WidgetProps = useMemo(
    () => ({
      config,
      umbrales,
      colores,
      contenido,
      kpisVisibles,
      periodoActual,
      refreshInterval,
      isFeatureActive,
    }),
    [config, umbrales, colores, contenido, kpisVisibles, periodoActual, refreshInterval, isFeatureActive],
  );

  useEffect(() => {
    applyContadorCssVariables(colores, colores.reducir_animaciones_global);
  }, [colores]);

  const userName = user?.user_metadata?.nombre ?? user?.email?.split("@")[0] ?? "Contador";
  const m = metrics.data;

  const showMetaHeader =
    contenido.meta_mensual_activa &&
    contenido.meta_mensual_monto > 0 &&
    !widgets.some((w) => w.id === "meta_mensual");

  if (configLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <WidgetDashboardProvider value={widgetContext}>
      <div
        className={cn(
          "min-h-full bg-gradient-to-b from-[#060B14] to-[#080E1E] p-6 space-y-6",
          colores.reducir_animaciones_global && "motion-reduce:*:transition-none",
        )}
      >
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ color: colores.acento }}>
              <Target className="size-5" />
              <span className="text-xs font-semibold tracking-widest uppercase">Centro de Operaciones</span>
            </div>
            <h1 className="text-2xl font-display font-semibold text-[#E8EDF5] mt-1">
              {contenido.mensaje_bienvenida || "Mi Centro de Operaciones"}
            </h1>
            <p className="text-sm text-[#8899B4] flex items-center gap-2 mt-1">
              Contador: {userName}
              {(m?.rachaDiasProductivos ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 text-orange-400">
                  <Flame className="size-3.5" />
                  Racha: {m.rachaDiasProductivos} días
                </span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            style={{ borderColor: `${colores.acento}4D`, color: colores.acento }}
            onClick={() => {
              void metrics.refetch();
              void recargar();
            }}
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Actualizar
          </Button>
        </header>

        {anuncioActivo && (
          <AnunciosBannerPremium
            anuncio={anuncioActivo}
            onDismiss={() => marcarComoVisto(anuncioActivo.id)}
            canDismiss={anuncioActivo.prioridad !== "CRITICA"}
          />
        )}

        {showMetaHeader && <MetaMensualHeaderBar />}

        <div className="grid grid-cols-12 gap-4 auto-rows-min">
          {widgets.map((widget) => {
            const LazyWidget = widget.component;
            return (
              <div key={widget.id} className={WIDGET_SIZE_CLASSES[widget.tamano]}>
                <WidgetErrorBoundary widgetName={widget.nombre}>
                  <Suspense fallback={<WidgetSkeleton tamano={widget.tamano} />}>
                    <LazyWidget />
                  </Suspense>
                </WidgetErrorBoundary>
              </div>
            );
          })}
        </div>

        {widgets.length === 0 && (
          <p className="text-sm text-center text-[#8899B4] py-12">
            No hay widgets activos. El administrador puede configurarlos en Configuración del Estudio.
          </p>
        )}
      </div>
    </WidgetDashboardProvider>
  );
}

export default ContadorDashboardPremium;
