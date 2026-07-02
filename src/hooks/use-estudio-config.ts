import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loadEstudioConfig,
  loadFeatureFlags,
  isFeatureActive,
} from "@/modules/config/services/estudio-config-service";
import { DEFAULT_ESTUDIO_CONFIG } from "@/modules/config/types/estudio-config";
import { useEstudioConfigOverride } from "@/hooks/estudio-config-override";

export function useEstudioConfig() {
  const qc = useQueryClient();
  const override = useEstudioConfigOverride();

  const query = useQuery({
    queryKey: ["estudio", "config"],
    queryFn: loadEstudioConfig,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const flagsQuery = useQuery({
    queryKey: ["estudio", "feature-flags"],
    queryFn: loadFeatureFlags,
    staleTime: 5 * 60_000,
  });

  const cfg = override ?? query.data ?? DEFAULT_ESTUDIO_CONFIG;

  const recargar = async () => {
    await qc.invalidateQueries({ queryKey: ["estudio"] });
  };

  return {
    dashboard_contador: cfg.dashboard_contador,
    umbrales: cfg.umbrales,
    colores: cfg.colores,
    notificaciones: cfg.notificaciones,
    sidebar: cfg.sidebar,
    contenido: cfg.contenido,
    tareas_auto: cfg.tareas_auto,
    featureFlags: flagsQuery.data ?? [],
    cargando: query.isLoading || flagsQuery.isLoading,
    error: query.error ? String(query.error) : flagsQuery.error ? String(flagsQuery.error) : null,
    recargar,
    isFeatureActive: (codigo: string) => isFeatureActive(flagsQuery.data ?? [], codigo),
  };
}

export function useFeatureFlag(codigo: string): boolean {
  const { isFeatureActive, cargando } = useEstudioConfig();
  if (cargando) return false;
  return isFeatureActive(codigo);
}
