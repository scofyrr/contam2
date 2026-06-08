/** Utilidades de montos SUNAT — columnas bi_adq_* (Supabase producción) */

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type MontosSireInput = {
  bi_adq_grav?: number | null;
  igv_adq_grav?: number | null;
  bi_adq_grav_y_no_grav?: number | null;
  igv_adq_grav_y_no_grav?: number | null;
  bi_adq_no_grav?: number | null;
  igv_adq_no_grav?: number | null;
  valor_adq_no_grav?: number | null;
  isc?: number | null;
  icbper?: number | null;
  otros_tributos?: number | null;
  importe_total?: number | null;
  /** Alias legacy (lectura de datos antiguos) */
  bi_grav?: number | null;
  igv_grav?: number | null;
  bi_grav_y_no_grav?: number | null;
  igv_grav_y_no_grav?: number | null;
  bi_no_grav?: number | null;
  igv_no_grav?: number | null;
  valor_no_grav?: number | null;
  mto_bi_gravada?: number | null;
  mto_igv_ipe?: number | null;
  mto_total_cp?: number | null;
};

function num(v: unknown): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Base imponible gravada (columna bi_adq_grav) */
export function getMtoBiGravada(row: MontosSireInput): number {
  return round2(
    num(row.bi_adq_grav) || num(row.bi_grav) || num(row.mto_bi_gravada),
  );
}

/** IGV (columna igv_adq_grav) */
export function getMtoIgvIpe(row: MontosSireInput): number {
  return round2(
    num(row.igv_adq_grav) || num(row.igv_grav) || num(row.mto_igv_ipe),
  );
}

export function getBiGravYNoGrav(row: MontosSireInput): number {
  return round2(num(row.bi_adq_grav_y_no_grav) || num(row.bi_grav_y_no_grav));
}

export function getIgvGravYNoGrav(row: MontosSireInput): number {
  return round2(num(row.igv_adq_grav_y_no_grav) || num(row.igv_grav_y_no_grav));
}

export function getBiNoGrav(row: MontosSireInput): number {
  return round2(num(row.bi_adq_no_grav) || num(row.bi_no_grav));
}

export function getIgvNoGrav(row: MontosSireInput): number {
  return round2(num(row.igv_adq_no_grav) || num(row.igv_no_grav));
}

export function getValorNoGrav(row: MontosSireInput): number {
  return round2(num(row.valor_adq_no_grav) || num(row.valor_no_grav));
}

/**
 * Total exacto del comprobante: suma matemática de base, IGV y tributos.
 */
export function calcularMtoTotalCp(row: MontosSireInput): number {
  const bi = getMtoBiGravada(row);
  const igv = getMtoIgvIpe(row);
  const biGng = getBiGravYNoGrav(row);
  const igvGng = getIgvGravYNoGrav(row);
  const biNg = getBiNoGrav(row);
  const igvNg = getIgvNoGrav(row);
  const valorNg = getValorNoGrav(row);
  const isc = round2(num(row.isc));
  const icbper = round2(num(row.icbper));
  const otros = round2(num(row.otros_tributos));

  return round2(bi + igv + biGng + igvGng + biNg + igvNg + valorNg + isc + icbper + otros);
}

/** Montos normalizados para asientos y UI */
export function resolverMontosSunat(row: MontosSireInput): {
  mto_bi_gravada: number;
  mto_igv_ipe: number;
  mto_total_cp: number;
} {
  const mto_bi_gravada = getMtoBiGravada(row);
  const mto_igv_ipe = getMtoIgvIpe(row);
  const calculado = calcularMtoTotalCp(row);
  const almacenado = round2(num(row.importe_total) || num(row.mto_total_cp));

  const mto_total_cp =
    mto_bi_gravada > 0 || mto_igv_ipe > 0 || calculado > 0
      ? calculado
      : almacenado;

  return { mto_bi_gravada, mto_igv_ipe, mto_total_cp };
}

/** UI/form → payload Supabase (solo columnas reales bi_adq_*) */
export function mapRegistroToDb(reg: Record<string, unknown>): Record<string, unknown> {
  const payload = { ...reg };

  const mto_bi = getMtoBiGravada(payload as MontosSireInput);
  const mto_igv = getMtoIgvIpe(payload as MontosSireInput);

  payload.bi_adq_grav = mto_bi;
  payload.igv_adq_grav = mto_igv;
  payload.bi_adq_grav_y_no_grav = getBiGravYNoGrav(payload as MontosSireInput);
  payload.igv_adq_grav_y_no_grav = getIgvGravYNoGrav(payload as MontosSireInput);
  payload.bi_adq_no_grav = getBiNoGrav(payload as MontosSireInput);
  payload.igv_adq_no_grav = getIgvNoGrav(payload as MontosSireInput);
  payload.valor_adq_no_grav = getValorNoGrav(payload as MontosSireInput);

  const total = calcularMtoTotalCp(payload as MontosSireInput);
  payload.importe_total = total;

  if (!payload.estado_cobro) payload.estado_cobro = "pendiente";
  if (!payload.estado_pago) payload.estado_pago = "pendiente";
  if (!payload.estado_validacion) payload.estado_validacion = "pendiente";

  // UI usa nombres distintos → columnas BD
  if (payload.porcentaje_participacion == null && payload.pct_participacion != null) {
    payload.porcentaje_participacion = payload.pct_participacion;
  }
  if (payload.impuesto_materia_beneficio != null) {
    payload.impuesto_materia_beneficio = String(payload.impuesto_materia_beneficio);
  }

  const dropKeys = [
    "bi_grav",
    "igv_grav",
    "bi_grav_y_no_grav",
    "igv_grav_y_no_grav",
    "bi_no_grav",
    "igv_no_grav",
    "valor_no_grav",
    "mto_bi_gravada",
    "mto_igv_ipe",
    "mto_total_cp",
    "pct_participacion",
    "impuesto_beneficio",
    "id_proyecto_operadores",
    "cuenta_pcge",
    "descripcion_items",
    "finalidad_operativa",
    "observaciones",
    "tipo_venta_config",
  ];
  for (const k of dropKeys) {
    delete payload[k];
  }

  return payload;
}

/** Fila BD → campos UI (compatibilidad formulario SIRE) */
export function mapRegistroFromDb(reg: Record<string, unknown>): Record<string, unknown> {
  const montos = resolverMontosSunat(reg as MontosSireInput);
  return {
    ...reg,
    ...montos,
    bi_adq_grav: getMtoBiGravada(reg as MontosSireInput),
    igv_adq_grav: getMtoIgvIpe(reg as MontosSireInput),
    bi_adq_grav_y_no_grav: getBiGravYNoGrav(reg as MontosSireInput),
    igv_adq_grav_y_no_grav: getIgvGravYNoGrav(reg as MontosSireInput),
    bi_adq_no_grav: getBiNoGrav(reg as MontosSireInput),
    igv_adq_no_grav: getIgvNoGrav(reg as MontosSireInput),
    valor_adq_no_grav: getValorNoGrav(reg as MontosSireInput),
    bi_grav: montos.mto_bi_gravada,
    igv_grav: montos.mto_igv_ipe,
    importe_total: montos.mto_total_cp,
    porcentaje_participacion: num(reg.porcentaje_participacion) || num(reg.pct_participacion),
    impuesto_materia_beneficio: s(reg.impuesto_materia_beneficio) || s(reg.impuesto_beneficio),
    id_proyecto: s(reg.id_proyecto),
    operadores: s(reg.operadores),
  };
}

function s(v: unknown): string {
  return v == null ? "" : String(v);
}
