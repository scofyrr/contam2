/** Utilidades de montos SUNAT — columnas mto_* y sincronización con legacy */

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type MontosSireInput = {
  mto_bi_gravada?: number | null;
  mto_igv_ipe?: number | null;
  mto_total_cp?: number | null;
  bi_grav?: number | null;
  igv_grav?: number | null;
  importe_total?: number | null;
  bi_grav_y_no_grav?: number | null;
  igv_grav_y_no_grav?: number | null;
  bi_no_grav?: number | null;
  igv_no_grav?: number | null;
  valor_no_grav?: number | null;
  isc?: number | null;
  icbper?: number | null;
  otros_tributos?: number | null;
  /** Alias UI legacy (compras) */
  bi_adq_grav?: number | null;
  igv_adq_grav?: number | null;
  bi_adq_grav_y_no_grav?: number | null;
  igv_adq_grav_y_no_grav?: number | null;
  bi_adq_no_grav?: number | null;
  igv_adq_no_grav?: number | null;
  valor_adq_no_grav?: number | null;
};

function num(v: unknown): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Base imponible gravada (SUNAT mto_bi_gravada) */
export function getMtoBiGravada(row: MontosSireInput): number {
  return round2(
    num(row.mto_bi_gravada) ||
      num(row.bi_grav) ||
      num(row.bi_adq_grav),
  );
}

/** IGV (SUNAT mto_igv_ipe) */
export function getMtoIgvIpe(row: MontosSireInput): number {
  return round2(
    num(row.mto_igv_ipe) ||
      num(row.igv_grav) ||
      num(row.igv_adq_grav),
  );
}

/**
 * Total exacto del comprobante: suma matemática de base, IGV y tributos.
 * Corrige el bug de montos adicionales incorrectos (p. ej. S/ 200 fantasma).
 */
export function calcularMtoTotalCp(row: MontosSireInput): number {
  const bi = getMtoBiGravada(row);
  const igv = getMtoIgvIpe(row);
  const biGng = round2(num(row.bi_grav_y_no_grav) || num(row.bi_adq_grav_y_no_grav));
  const igvGng = round2(num(row.igv_grav_y_no_grav) || num(row.igv_adq_grav_y_no_grav));
  const biNg = round2(num(row.bi_no_grav) || num(row.bi_adq_no_grav));
  const igvNg = round2(num(row.igv_no_grav) || num(row.igv_adq_no_grav));
  const valorNg = round2(num(row.valor_no_grav) || num(row.valor_adq_no_grav));
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
  const almacenado = round2(num(row.mto_total_cp) || num(row.importe_total));

  // Preferir total calculado cuando hay componentes; evita totales inflados en BD
  const mto_total_cp =
    mto_bi_gravada > 0 || mto_igv_ipe > 0 || calculado > 0
      ? calculado
      : almacenado;

  return { mto_bi_gravada, mto_igv_ipe, mto_total_cp };
}

/** Mapea registro UI/form → payload Supabase con columnas mto_* y legacy sincronizadas */
export function mapRegistroToDb(reg: Record<string, unknown>): Record<string, unknown> {
  const payload = { ...reg };

  const mto_bi = getMtoBiGravada(payload as MontosSireInput);
  const mto_igv = getMtoIgvIpe(payload as MontosSireInput);

  payload.mto_bi_gravada = mto_bi;
  payload.mto_igv_ipe = mto_igv;
  payload.bi_grav = mto_bi;
  payload.igv_grav = mto_igv;

  payload.bi_grav_y_no_grav = num(payload.bi_grav_y_no_grav) || num(payload.bi_adq_grav_y_no_grav);
  payload.igv_grav_y_no_grav = num(payload.igv_grav_y_no_grav) || num(payload.igv_adq_grav_y_no_grav);
  payload.bi_no_grav = num(payload.bi_no_grav) || num(payload.bi_adq_no_grav);
  payload.igv_no_grav = num(payload.igv_no_grav) || num(payload.igv_adq_no_grav);
  payload.valor_no_grav = num(payload.valor_no_grav) || num(payload.valor_adq_no_grav);

  const total = calcularMtoTotalCp(payload as MontosSireInput);
  payload.mto_total_cp = total;
  payload.importe_total = total;

  delete payload.bi_adq_grav;
  delete payload.igv_adq_grav;
  delete payload.bi_adq_grav_y_no_grav;
  delete payload.igv_adq_grav_y_no_grav;
  delete payload.bi_adq_no_grav;
  delete payload.igv_adq_no_grav;
  delete payload.valor_adq_no_grav;

  return payload;
}

/** Mapea fila BD → campos UI (compatibilidad formulario SIRE) */
export function mapRegistroFromDb(reg: Record<string, unknown>): Record<string, unknown> {
  const montos = resolverMontosSunat(reg as MontosSireInput);
  return {
    ...reg,
    ...montos,
    bi_grav: montos.mto_bi_gravada,
    igv_grav: montos.mto_igv_ipe,
    importe_total: montos.mto_total_cp,
    bi_adq_grav: montos.mto_bi_gravada,
    igv_adq_grav: montos.mto_igv_ipe,
    bi_adq_grav_y_no_grav: num(reg.bi_grav_y_no_grav),
    igv_adq_grav_y_no_grav: num(reg.igv_grav_y_no_grav),
    bi_adq_no_grav: num(reg.bi_no_grav),
    igv_adq_no_grav: num(reg.igv_no_grav),
    valor_adq_no_grav: num(reg.valor_no_grav),
  };
}
