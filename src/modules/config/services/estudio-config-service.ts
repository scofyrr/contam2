import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_ESTUDIO_CONFIG,
  type EstudioConfigBundle,
  type FeatureFlagRow,
} from "@/modules/config/types/estudio-config";

const CLAVES = [
  "dashboard_contador",
  "umbrales_contador",
  "colores_contador",
  "notificaciones_default",
  "sidebar_contador",
  "contenido_contador",
  "tareas_auto",
] as const;

function mergeConfig<T extends object>(defaults: T, partial: unknown): T {
  if (!partial || typeof partial !== "object") return defaults;
  return { ...defaults, ...(partial as Partial<T>) };
}

async function fetchClave(clave: string): Promise<unknown | null> {
  const { data, error } = await supabase.rpc("rpc_get_config_estudio", { p_clave: clave });
  if (error) {
    const { data: row } = await supabase.from("config_estudio").select("valor").eq("clave", clave).maybeSingle();
    return row?.valor ?? null;
  }
  return data;
}

export async function loadEstudioConfig(): Promise<EstudioConfigBundle> {
  try {
    const results = await Promise.all(CLAVES.map((k) => fetchClave(k)));
    const d = DEFAULT_ESTUDIO_CONFIG;
    return {
      dashboard_contador: mergeConfig(d.dashboard_contador, results[0]),
      umbrales: mergeConfig(d.umbrales, results[1]),
      colores: mergeConfig(d.colores, results[2]),
      notificaciones: mergeConfig(d.notificaciones, results[3]),
      sidebar: mergeConfig(d.sidebar, results[4]),
      contenido: mergeConfig(d.contenido, results[5]),
      tareas_auto: mergeConfig(d.tareas_auto, results[6]),
    };
  } catch {
    return DEFAULT_ESTUDIO_CONFIG;
  }
}

export async function loadFeatureFlags(): Promise<FeatureFlagRow[]> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_feature_flags", { p_scope: "global" });
    if (error) throw error;
    return (data ?? []) as FeatureFlagRow[];
  } catch {
    return [
      { codigo: "gamificacion_activa", nombre: "Gamificación", activo: true, descripcion: null },
      { codigo: "fab_alertas_dual", nombre: "FAB Alertas", activo: true, descripcion: null },
      { codigo: "mv_dashboard_stats", nombre: "MV Stats", activo: true, descripcion: null },
    ];
  }
}

export function isFeatureActive(flags: FeatureFlagRow[], codigo: string): boolean {
  return flags.find((f) => f.codigo === codigo)?.activo ?? false;
}

export async function updateConfigClave(
  clave: string,
  valor: Record<string, unknown>,
  descripcion?: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("rpc_update_config_estudio", {
    p_clave: clave,
    p_valor: valor,
    p_descripcion: descripcion ?? null,
  });
  if (error) throw error;
  return data === true;
}

export async function toggleFeatureFlag(codigo: string, activo: boolean): Promise<boolean> {
  const { data, error } = await supabase.rpc("rpc_toggle_feature_flag", {
    p_codigo: codigo,
    p_activo: activo,
  });
  if (error) throw error;
  return data === true;
}
