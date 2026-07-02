import { useCallback, useMemo } from "react";
import { useEstudioConfig } from "@/hooks/use-estudio-config";
import { usePermissions } from "@/hooks/use-permissions";
import { WIDGET_REGISTRY } from "@/modules/dashboard/registry/widget-registry";
import type { DashboardWidget } from "@/modules/dashboard/types/dashboard-configurable-types";

export function useDashboardWidgets() {
  const { dashboard_contador: config, isFeatureActive } = useEstudioConfig();
  const { tiene } = usePermissions();

  const widgetsActivos = useMemo((): DashboardWidget[] => {
    const { activos, orden } = config.widgets;

    return orden
      .filter((id) => activos.includes(id))
      .filter((id) => WIDGET_REGISTRY[id])
      .filter((id) => {
        const entry = WIDGET_REGISTRY[id];
        if (!entry.permisosRequeridos?.length) return true;
        return entry.permisosRequeridos.every((p) => tiene(p));
      })
      .filter((id) => {
        if (id === "sugerencias") {
          return config.mostrar_sugerencias && isFeatureActive("sugerencias_inteligentes");
        }
        if (id === "logros") {
          return config.mostrar_gamificacion && isFeatureActive("gamificacion_activa");
        }
        if (id === "actividad_reciente") {
          return config.mostrar_actividad_reciente;
        }
        return true;
      })
      .map((id, index) => ({
        ...WIDGET_REGISTRY[id],
        id,
        visible: true,
        orden: index,
      }));
  }, [config, tiene, isFeatureActive]);

  const estaVisible = useCallback(
    (widgetId: string) => widgetsActivos.some((w) => w.id === widgetId),
    [widgetsActivos],
  );

  return {
    widgets: widgetsActivos,
    kpisVisibles: config.kpis_visibles,
    refreshInterval: config.intervalo_refresh_seg,
    estaVisible,
    reordenar: () => {
      /* solo admin vía config remota */
    },
    toggleVisibilidad: () => {
      /* solo admin vía config remota */
    },
  };
}
