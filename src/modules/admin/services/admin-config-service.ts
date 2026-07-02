import { supabase } from "@/integrations/supabase/client";
import {
  loadEstudioConfig,
  loadFeatureFlags,
  updateConfigClave,
  toggleFeatureFlag,
} from "@/modules/config/services/estudio-config-service";
import { DEFAULT_ESTUDIO_CONFIG, type EstudioConfigBundle } from "@/modules/config/types/estudio-config";
import {
  validateConfig,
  summarizeJson,
} from "@/modules/admin/services/admin-config-validation";
import type {
  ConfigChangeLog,
  FeatureFlag,
  JsonValue,
  ValidationResult,
} from "@/modules/admin/types/admin-config";

const CHANGELOG_KEY = "contam_config_changelog";
const REVERT_WINDOW_MS = 24 * 60 * 60 * 1000;

const CLAVE_DEFAULTS: Record<string, unknown> = {
  dashboard_contador: DEFAULT_ESTUDIO_CONFIG.dashboard_contador,
  umbrales_contador: DEFAULT_ESTUDIO_CONFIG.umbrales,
  colores_contador: DEFAULT_ESTUDIO_CONFIG.colores,
  notificaciones_default: DEFAULT_ESTUDIO_CONFIG.notificaciones,
  sidebar_contador: DEFAULT_ESTUDIO_CONFIG.sidebar,
  contenido_contador: DEFAULT_ESTUDIO_CONFIG.contenido,
  tareas_auto: DEFAULT_ESTUDIO_CONFIG.tareas_auto,
};

function readChangelog(): ConfigChangeLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHANGELOG_KEY);
    return raw ? (JSON.parse(raw) as ConfigChangeLog[]) : [];
  } catch {
    return [];
  }
}

function writeChangelog(entries: ConfigChangeLog[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHANGELOG_KEY, JSON.stringify(entries.slice(0, 100)));
}

function newChangeId(): string {
  return crypto.randomUUID();
}

async function getCurrentUser(): Promise<{ id: string; nombre: string }> {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  const nombre =
    (u?.user_metadata?.nombre as string | undefined) ??
    (u?.user_metadata?.full_name as string | undefined) ??
    u?.email?.split("@")[0] ??
    "Admin";
  return { id: u?.id ?? "unknown", nombre };
}

async function logAuditoria(
  clave: string,
  valorAnterior: JsonValue,
  valorNuevo: JsonValue,
  userId: string,
): Promise<void> {
  try {
    await supabase.from("auditoria_cambios").insert({
      tabla_nombre: "config_estudio",
      registro_id: clave,
      operacion: "UPDATE",
      datos_anteriores: valorAnterior,
      datos_nuevos: valorNuevo,
      usuario_id: userId,
      modulo_afectado: "CONFIGURACION",
      accion: "MODIFICAR",
      detalle_jsonb: { clave, anterior: valorAnterior, nuevo: valorNuevo },
      severity: "WARNING",
    });
  } catch {
    // auditoría opcional si la tabla no está disponible
  }
}

class AdminConfigService {
  validateConfig(clave: string, valor: unknown): ValidationResult {
    return validateConfig(clave, valor);
  }

  async getConfig<T = unknown>(clave: string): Promise<T> {
    const { data, error } = await supabase.rpc("rpc_get_config_estudio", { p_clave: clave });
    if (error || data == null) {
      return (CLAVE_DEFAULTS[clave] ?? {}) as T;
    }
    return data as T;
  }

  async getAllConfigs(): Promise<Record<string, unknown>> {
    const bundle = await loadEstudioConfig();
    return {
      dashboard_contador: bundle.dashboard_contador,
      umbrales_contador: bundle.umbrales,
      colores_contador: bundle.colores,
      notificaciones_default: bundle.notificaciones,
      sidebar_contador: bundle.sidebar,
      contenido_contador: bundle.contenido,
      tareas_auto: bundle.tareas_auto,
    };
  }

  async getBundle(): Promise<EstudioConfigBundle> {
    return loadEstudioConfig();
  }

  async updateConfig(
    clave: string,
    valor: JsonValue,
  ): Promise<{ success: boolean; changeLog: ConfigChangeLog }> {
    const validation = this.validateConfig(clave, valor);
    if (!validation.valido) {
      throw new Error(validation.errores.map((e) => e.mensaje).join("; "));
    }

    const anterior = (await this.getConfig(clave)) as JsonValue;
    const user = await getCurrentUser();

    await updateConfigClave(clave, valor as Record<string, unknown>);
    await logAuditoria(clave, anterior, valor, user.id);

    const changeLog: ConfigChangeLog = {
      id: newChangeId(),
      clave,
      valorAnterior: anterior,
      valorNuevo: valor,
      cambiadoPor: user.id,
      cambiadoPorNombre: user.nombre,
      timestamp: new Date().toISOString(),
      revertido: false,
    };

    const logs = readChangelog();
    logs.unshift(changeLog);
    writeChangelog(logs);

    return { success: true, changeLog };
  }

  async revertConfig(clave: string, changeLogId: string): Promise<boolean> {
    const logs = readChangelog();
    const entry = logs.find((l) => l.id === changeLogId && l.clave === clave && !l.revertido);
    if (!entry) return false;

    const age = Date.now() - new Date(entry.timestamp).getTime();
    if (age > REVERT_WINDOW_MS) {
      throw new Error("Solo se puede revertir cambios de las últimas 24 horas");
    }

    await updateConfigClave(clave, entry.valorAnterior as Record<string, unknown>);
    entry.revertido = true;
    writeChangelog(logs);

    const user = await getCurrentUser();
    await logAuditoria(clave, entry.valorNuevo, entry.valorAnterior, user.id);

    return true;
  }

  async getChangeHistory(clave?: string, limit = 50): Promise<ConfigChangeLog[]> {
    const local = readChangelog().filter((l) => !clave || l.clave === clave).slice(0, limit);

    try {
      const { data } = await supabase
        .from("auditoria_cambios")
        .select("id, registro_id, datos_anteriores, datos_nuevos, usuario_id, created_at, detalle_jsonb")
        .eq("modulo_afectado", "CONFIGURACION")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (data?.length) {
        for (const row of data) {
          const exists = local.some(
            (l) => l.timestamp === row.created_at && l.clave === row.registro_id,
          );
          if (!exists && (!clave || row.registro_id === clave)) {
            local.push({
              id: row.id,
              clave: row.registro_id,
              valorAnterior: (row.datos_anteriores ?? {}) as JsonValue,
              valorNuevo: (row.datos_nuevos ?? row.detalle_jsonb ?? {}) as JsonValue,
              cambiadoPor: row.usuario_id ?? "",
              cambiadoPorNombre: "Usuario",
              timestamp: row.created_at,
              revertido: false,
            });
          }
        }
      }
    } catch {
      // solo local
    }

    return local
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const flags = await loadFeatureFlags();
    try {
      const { data } = await supabase
        .from("feature_flags")
        .select("codigo, nombre, descripcion, activo, scope, updated_at")
        .order("codigo");
      if (data?.length) {
        return data.map((f) => ({
          codigo: f.codigo,
          nombre: f.nombre,
          descripcion: f.descripcion,
          activo: f.activo ?? false,
          scope: f.scope ?? "global",
          updated_at: f.updated_at ?? undefined,
        }));
      }
    } catch {
      // fallback RPC
    }
    return flags.map((f) => ({ ...f, scope: "global" }));
  }

  async toggleFeatureFlag(codigo: string, activo: boolean): Promise<boolean> {
    const CRITICAL_FLAGS = new Set(["mv_dashboard_stats", "sire_modelo_normalizado"]);
    if (CRITICAL_FLAGS.has(codigo) && !activo) {
      console.warn(`Flag crítico desactivado: ${codigo}`);
    }
    return toggleFeatureFlag(codigo, activo);
  }

  async exportConfig(): Promise<Blob> {
    const [configs, flags] = await Promise.all([this.getAllConfigs(), this.getFeatureFlags()]);
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      config_estudio: configs,
      feature_flags: flags,
    };
    return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  }

  async importConfig(file: File): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const text = await file.text();
    let parsed: { config_estudio?: Record<string, unknown>; feature_flags?: FeatureFlag[] };
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
      return { imported: 0, skipped: 0, errors: ["Archivo JSON inválido"] };
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    if (parsed.config_estudio) {
      for (const [clave, valor] of Object.entries(parsed.config_estudio)) {
        const v = this.validateConfig(clave, valor);
        if (!v.valido) {
          errors.push(`${clave}: ${v.errores.map((e) => e.mensaje).join(", ")}`);
          skipped++;
          continue;
        }
        try {
          await this.updateConfig(clave, valor as JsonValue);
          imported++;
        } catch (e) {
          errors.push(`${clave}: ${e instanceof Error ? e.message : "Error"}`);
          skipped++;
        }
      }
    }

    if (parsed.feature_flags) {
      for (const flag of parsed.feature_flags) {
        try {
          await this.toggleFeatureFlag(flag.codigo, flag.activo);
          imported++;
        } catch (e) {
          errors.push(`flag ${flag.codigo}: ${e instanceof Error ? e.message : "Error"}`);
          skipped++;
        }
      }
    }

    return { imported, skipped, errors };
  }

  previewAsContador(_contadorId: string): { url: string } {
    return { url: "/dashboard?preview=contador" };
  }

  summarizeChange(log: ConfigChangeLog): { anterior: string; nuevo: string } {
    return {
      anterior: summarizeJson(log.valorAnterior),
      nuevo: summarizeJson(log.valorNuevo),
    };
  }

  canRevert(log: ConfigChangeLog): boolean {
    if (log.revertido) return false;
    return Date.now() - new Date(log.timestamp).getTime() < REVERT_WINDOW_MS;
  }
}

export const adminConfigService = new AdminConfigService();
