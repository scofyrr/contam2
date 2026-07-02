/** Detección de tablas SIRE disponibles en la BD. */
export type SireStructureInfo = {
  legacyTable: boolean;
  normalizedCabecera: boolean;
  normalizedMontos: boolean;
  syncErrorsTable: boolean;
  /** Fuente activa según feature flag del cliente. */
  clientUsesNormalized: boolean;
};

/** Métricas de consistencia legacy ↔ normalizado. */
export type ConsistencyMetrics = {
  legacyCount: number;
  normalizedCount: number;
  unresolvedErrors: number;
  discrepancyCount: number;
  inSync: boolean;
  lastLegacyAt: string | null;
  lastNormalizedAt: string | null;
  tipoDistribution: { VENTA: number; COMPRA: number };
};

/** Error registrado por el sistema de sync. */
export type SireSyncError = {
  id: string;
  operation_type: string;
  source_table: string;
  target_table: string;
  record_id: string | null;
  error_message: string;
  error_detail: Record<string, unknown> | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
};

/** Hallazgo de reconciliación. */
export type ReconcileFinding = {
  discrepancy_type: string;
  record_id: string | null;
  legacy_exists: boolean;
  normalized_exists: boolean;
  detail: Record<string, unknown> | null;
};

/** Resultado de migración masiva. */
export type MigrateResult = {
  dry_run: boolean;
  pending?: number;
  pending_before?: number;
  migrated?: number;
  errors?: number;
  batches?: number;
  batch_size?: number;
  estimated_batches?: number;
  success?: boolean;
  error?: string;
};

/** Registro SIRE unificado (lectura agnóstica de estructura). */
export type UnifiedSireRegistro = Record<string, unknown> & {
  id: string;
  tipo: "VENTA" | "COMPRA";
  ruc: string;
  periodo: string;
  estado_validacion?: string;
};
