import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNewSireStructure, getSireReadSource, getSireCabeceraTable } from "@/lib/feature-flags";
import {
  fetchRegistroSireById,
  mergeRegistroRows,
  upsertRegistroSire,
  updateRegistroSireCabecera,
} from "@/lib/sire-registros-service";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  ConsistencyMetrics,
  MigrateResult,
  ReconcileFinding,
  SireStructureInfo,
  SireSyncError,
  UnifiedSireRegistro,
} from "@/modules/sire/types/sire-sync";

const STRUCTURE_KEY = ["sire", "structure"] as const;
const CONSISTENCY_KEY = ["sire", "consistency"] as const;
const SYNC_ERRORS_KEY = ["sire", "sync-errors"] as const;

function parseStructure(raw: Record<string, unknown>): Omit<SireStructureInfo, "clientUsesNormalized"> {
  return {
    legacyTable: Boolean(raw.legacy_table),
    normalizedCabecera: Boolean(raw.normalized_cabecera),
    normalizedMontos: Boolean(raw.normalized_montos),
    syncErrorsTable: Boolean(raw.sync_errors_table),
  };
}

function parseMetrics(raw: Record<string, unknown>): ConsistencyMetrics {
  const dist = (raw.tipo_distribution ?? {}) as Record<string, number>;
  return {
    legacyCount: Number(raw.legacy_count ?? 0),
    normalizedCount: Number(raw.normalized_count ?? 0),
    unresolvedErrors: Number(raw.unresolved_errors ?? 0),
    discrepancyCount: Number(raw.discrepancy_count ?? 0),
    inSync: Boolean(raw.in_sync),
    lastLegacyAt: raw.last_legacy_at ? String(raw.last_legacy_at) : null,
    lastNormalizedAt: raw.last_normalized_at ? String(raw.last_normalized_at) : null,
    tipoDistribution: {
      VENTA: Number(dist.VENTA ?? 0),
      COMPRA: Number(dist.COMPRA ?? 0),
    },
  };
}

function mapSyncError(row: Record<string, unknown>): SireSyncError {
  return {
    id: String(row.id),
    operation_type: String(row.operation_type ?? ""),
    source_table: String(row.source_table ?? ""),
    target_table: String(row.target_table ?? ""),
    record_id: row.record_id ? String(row.record_id) : null,
    error_message: String(row.error_message ?? ""),
    error_detail: (row.error_detail as Record<string, unknown>) ?? null,
    created_at: String(row.created_at ?? ""),
    resolved_at: row.resolved_at ? String(row.resolved_at) : null,
    resolved_by: row.resolved_by ? String(row.resolved_by) : null,
  };
}

function mapFinding(row: Record<string, unknown>): ReconcileFinding {
  return {
    discrepancy_type: String(row.discrepancy_type ?? ""),
    record_id: row.record_id ? String(row.record_id) : null,
    legacy_exists: Boolean(row.legacy_exists),
    normalized_exists: Boolean(row.normalized_exists),
    detail: (row.detail as Record<string, unknown>) ?? null,
  };
}

/** Adapter unificado legacy ↔ normalizado con RPCs de consistencia. */
export class SireSyncService {
  /** Detecta tablas existentes vía RPC o fallback por conteo. */
  async detectStructure(): Promise<SireStructureInfo> {
    const { data, error } = await supabase.rpc("rpc_detect_sire_structure");
    if (!error && data && typeof data === "object") {
      return {
        ...parseStructure(data as Record<string, unknown>),
        clientUsesNormalized: useNewSireStructure(),
      };
    }

    const legacyProbe = await supabase.from("registros_sire").select("id", { count: "exact", head: true });
    const normProbe = await supabase
      .from("registros_sire_cabecera")
      .select("id", { count: "exact", head: true });

    return {
      legacyTable: !legacyProbe.error,
      normalizedCabecera: !normProbe.error,
      normalizedMontos: !normProbe.error,
      syncErrorsTable: false,
      clientUsesNormalized: useNewSireStructure(),
    };
  }

  /** Lee registro unificado desde la estructura activa (feature flag). */
  async getRegistro(id: string): Promise<UnifiedSireRegistro> {
    const row = await fetchRegistroSireById(id);
    const merged = mergeRegistroRows(row);
    return merged as UnifiedSireRegistro;
  }

  /** Inserta/actualiza en la estructura disponible según flag. */
  async createRegistro(datos: Record<string, unknown>): Promise<string> {
    return upsertRegistroSire(datos);
  }

  /** Actualiza estado en cabecera (ambas estructuras si triggers activos). */
  async updateEstado(id: string, estado: string): Promise<void> {
    await updateRegistroSireCabecera(id, { estado_validacion: estado });
    if (!useNewSireStructure()) {
      const { error } = await supabase
        .from("registros_sire")
        .update({ estado_validacion: estado })
        .eq("id", id);
      throwIfSupabaseError(error, "Error al actualizar estado legacy");
    }
  }

  /** Métricas de consistencia vía RPC. */
  async getConsistencyMetrics(): Promise<ConsistencyMetrics> {
    const { data, error } = await supabase.rpc("rpc_get_sire_consistency_metrics");
    if (error) {
      const [legacy, normalized, errors] = await Promise.all([
        supabase.from("registros_sire").select("id", { count: "exact", head: true }),
        supabase.from("registros_sire_cabecera").select("id", { count: "exact", head: true }),
        supabase
          .from("sire_sync_errors")
          .select("id", { count: "exact", head: true })
          .is("resolved_at", null),
      ]);
      const lc = legacy.count ?? 0;
      const nc = normalized.count ?? 0;
      return {
        legacyCount: lc,
        normalizedCount: nc,
        unresolvedErrors: errors.count ?? 0,
        discrepancyCount: Math.abs(lc - nc),
        inSync: lc === nc && (errors.count ?? 0) === 0,
        lastLegacyAt: null,
        lastNormalizedAt: null,
        tipoDistribution: { VENTA: 0, COMPRA: 0 },
      };
    }
    return parseMetrics(data as Record<string, unknown>);
  }

  /** Errores de sync no resueltos. */
  async getSyncErrors(limit = 50): Promise<SireSyncError[]> {
    const { data, error } = await supabase
      .from("sire_sync_errors")
      .select("*")
      .is("resolved_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []).map((r) => mapSyncError(r as Record<string, unknown>));
  }

  /** Ejecuta reconciliación (dry run por defecto). */
  async reconcile(dryRun = true): Promise<ReconcileFinding[]> {
    const { data, error } = await supabase.rpc("reconcile_sire_records", { p_dry_run: dryRun });
    throwIfSupabaseError(error, "Error en reconciliación SIRE");
    return (data ?? []).map((r) => mapFinding(r as Record<string, unknown>));
  }

  /** Migración masiva legacy → normalizado. */
  async migrate(batchSize = 500, dryRun = true): Promise<MigrateResult> {
    const { data, error } = await supabase.rpc("migrate_all_sire_data", {
      p_batch_size: batchSize,
      p_dry_run: dryRun,
    });
    throwIfSupabaseError(error, "Error en migración SIRE");
    return (data ?? {}) as MigrateResult;
  }

  /** Marca error como resuelto (requiere admin en BD). */
  async resolveError(errorId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("rpc_resolve_sire_sync_error", {
      p_error_id: errorId,
    });
    throwIfSupabaseError(error, "No se pudo resolver el error");
    return Boolean(data);
  }

  /** Conteos rápidos para sparklines (últimos 6 periodos). */
  async getLegacyPeriodCounts(): Promise<{ periodo: string; count: number }[]> {
    const { data, error } = await supabase
      .from("registros_sire")
      .select("periodo")
      .order("periodo", { ascending: false })
      .limit(2000);
    if (error) return [];
    return aggregatePeriodCounts(data ?? []);
  }

  async getNormalizedPeriodCounts(): Promise<{ periodo: string; count: number }[]> {
    const { data, error } = await supabase
      .from("registros_sire_cabecera")
      .select("periodo")
      .order("periodo", { ascending: false })
      .limit(2000);
    if (error) return [];
    return aggregatePeriodCounts(data ?? []);
  }
}

function aggregatePeriodCounts(rows: { periodo: string }[]): { periodo: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.periodo, (map.get(r.periodo) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([periodo, count]) => ({ periodo, count }))
    .sort((a, b) => b.periodo.localeCompare(a.periodo))
    .slice(0, 6)
    .reverse();
}

export const sireSyncService = new SireSyncService();

/** Estructura detectada — cache 5 min. */
export function useSireStructure() {
  return useQuery({
    queryKey: STRUCTURE_KEY,
    queryFn: () => sireSyncService.detectStructure(),
    staleTime: 5 * 60_000,
  });
}

/** Métricas de consistencia — refetch 60s. */
export function useSireConsistency(enabled = true) {
  return useQuery({
    queryKey: CONSISTENCY_KEY,
    queryFn: () => sireSyncService.getConsistencyMetrics(),
    refetchInterval: 60_000,
    enabled,
  });
}

/** Errores activos — refetch 30s. */
export function useSireSyncErrors(limit = 50) {
  return useQuery({
    queryKey: [...SYNC_ERRORS_KEY, limit],
    queryFn: () => sireSyncService.getSyncErrors(limit),
    refetchInterval: 30_000,
  });
}

/** Mutation: reconciliación con invalidación de cache. */
export function useReconcile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dryRun }: { dryRun: boolean }) => sireSyncService.reconcile(dryRun),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CONSISTENCY_KEY });
      void qc.invalidateQueries({ queryKey: SYNC_ERRORS_KEY });
    },
  });
}

/** Mutation: migración masiva. */
export function useMigrateData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchSize, dryRun }: { batchSize: number; dryRun: boolean }) =>
      sireSyncService.migrate(batchSize, dryRun),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CONSISTENCY_KEY });
      void qc.invalidateQueries({ queryKey: SYNC_ERRORS_KEY });
      void qc.invalidateQueries({ queryKey: STRUCTURE_KEY });
    },
  });
}

/** Mutation: resolver error individual. */
export function useResolveSyncError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (errorId: string) => sireSyncService.resolveError(errorId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SYNC_ERRORS_KEY });
      void qc.invalidateQueries({ queryKey: CONSISTENCY_KEY });
    },
  });
}

/** Fuente de lectura activa (utilidad para debug). */
export function getActiveSireSourceLabel(): string {
  return getSireReadSource();
}

export function getActiveCabeceraTableLabel(): string {
  return getSireCabeceraTable();
}
