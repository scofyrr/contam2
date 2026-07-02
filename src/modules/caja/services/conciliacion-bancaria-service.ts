import { supabase } from "@/integrations/supabase/client";
import { createMovimientoCaja, fetchMovimientosCaja, type MovimientoCaja } from "@/lib/caja-service";
import { fetchCuentasFinancieras } from "@/lib/cuentas-financieras-service";
import type { CuentaFinanciera } from "@/lib/cuentas-financieras-types";
import {
  daysDiff,
  formatFechaEs,
  levenshteinSimilarity,
  normalizeText,
  parseFechaCsv,
  parseMontoCsv,
  splitCsvLine,
  tokenSimilarity,
} from "@/modules/caja/services/conciliacion-utils";
import type {
  Anomalia,
  BankFormat,
  BankStatementRow,
  ConciliacionConfig,
  ConciliacionResumen,
  ConciliacionResult,
  MatchedPair,
  MovimientoCajaConciliable,
  NivelMatch,
} from "@/modules/caja/types/conciliacion";
import { DEFAULT_CONCILIACION_CONFIG } from "@/modules/caja/types/conciliacion";

const LOCAL_CONC_KEY = "contam-conciliaciones";

function movimientoNeto(m: MovimientoCaja): number {
  return Math.round((Number(m.haber ?? 0) - Number(m.debe ?? 0)) * 100) / 100;
}

function toConciliable(m: MovimientoCaja, cuenta: CuentaFinanciera): MovimientoCajaConciliable {
  const neto = movimientoNeto(m);
  return {
    id: m.id,
    fecha: String(m.fecha_operacion ?? m.fecha ?? "").slice(0, 10),
    descripcion: m.descripcion ?? m.glosa ?? "",
    monto: neto,
    tipoMovimiento: neto >= 0 ? "INGRESO" : "EGRESO",
    origenDocumento: m.origen_documento ?? m.origen ?? "manual",
    numeroDocumento: m.numero_documento ?? "",
    cuentaFinancieraId: cuenta.id,
    cuentaFinancieraNombre: cuenta.nombre,
    cuentaContable: m.cuenta_contable,
    sireRegistroId: m.registro_sire_id ?? undefined,
    asientoId: m.asiento_id ?? undefined,
    conciliado: false,
  };
}

const BANK_HEADERS: Record<BankFormat, string[]> = {
  BCP: ["fecha", "descripcion", "referencia", "cargo", "abono", "saldo"],
  BBVA: ["fecha", "concepto", "nro_operacion", "debito", "credito", "saldo_contable"],
  INTERBANK: ["fecha", "descripcion", "nro. operacion", "debito", "credito", "saldo"],
  SCOTIABANK: ["fecha", "descripcion", "referencia", "debito", "credito", "saldo"],
  BANCO_NACION: ["fecha", "detalle", "nro_doc", "egreso", "ingreso", "saldo"],
  GENERICO_SUNAT: ["fecha", "descripcion", "referencia", "debe", "haber", "saldo"],
};

export function detectBankFormat(headers: string[]): BankFormat {
  const h = headers.map((x) => normalizeText(x));
  for (const [fmt, cols] of Object.entries(BANK_HEADERS) as [BankFormat, string[]][]) {
    const hits = cols.filter((c) => h.some((hh) => hh.includes(c.replace(/_/g, " ").split(" ")[0]!)));
    if (hits.length >= 3) return fmt;
  }
  if (h.some((x) => x.includes("cargo")) && h.some((x) => x.includes("abono"))) return "BCP";
  return "GENERICO_SUNAT";
}

function colIndex(headers: string[], ...candidates: string[]): number {
  const h = headers.map(normalizeText);
  for (const c of candidates) {
    const i = h.findIndex((x) => x.includes(normalizeText(c)));
    if (i >= 0) return i;
  }
  return -1;
}

export async function parseBankCSV(
  csvContent: string,
  bankFormat?: BankFormat,
  onProgress?: (pct: number) => void,
): Promise<BankStatementRow[]> {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]!);
  const fmt = bankFormat ?? detectBankFormat(headers);
  const rows: BankStatementRow[] = [];

  const iFecha = colIndex(headers, "fecha");
  const iDesc = colIndex(headers, "descripcion", "concepto", "detalle");
  const iRef = colIndex(headers, "referencia", "nro", "operacion", "doc");
  const iDebe = colIndex(headers, "cargo", "debito", "egreso", "debe");
  const iHaber = colIndex(headers, "abono", "credito", "ingreso", "haber");
  const iSaldo = colIndex(headers, "saldo");

  const chunk = 500;
  for (let start = 1; start < lines.length; start += chunk) {
    const end = Math.min(start + chunk, lines.length);
    for (let li = start; li < end; li++) {
      const cols = splitCsvLine(lines[li]!);
      if (cols.every((c) => !c.trim())) continue;

      const fecha = parseFechaCsv(cols[iFecha >= 0 ? iFecha : 0] ?? "");
      const descripcion = cols[iDesc >= 0 ? iDesc : 1] ?? "";
      const referencia = cols[iRef >= 0 ? iRef : 2] ?? "";
      const montoDebe = parseMontoCsv(cols[iDebe >= 0 ? iDebe : 3] ?? "0");
      const montoHaber = parseMontoCsv(cols[iHaber >= 0 ? iHaber : 4] ?? "0");
      const saldo = parseMontoCsv(cols[iSaldo >= 0 ? iSaldo : 5] ?? "0");

      const raw: Record<string, string> = {};
      headers.forEach((h, idx) => {
        raw[h] = cols[idx] ?? "";
      });

      rows.push({
        id: crypto.randomUUID(),
        fecha,
        fechaFormateada: formatFechaEs(fecha),
        descripcion: descripcion.trim(),
        referencia: referencia.trim(),
        montoDebe,
        montoHaber,
        montoNeto: Math.round((montoHaber - montoDebe) * 100) / 100,
        saldo,
        tipoOperacion: classifyOperacion(descripcion),
        sucursal: "",
        moneda: descripcion.includes("USD") || referencia.includes("USD") ? "USD" : "PEN",
        rawData: raw,
      });
    }
    onProgress?.(Math.round((end / lines.length) * 100));
    await new Promise((r) => setTimeout(r, 0));
  }

  return rows;
}

function classifyOperacion(desc: string): string {
  const d = desc.toUpperCase();
  if (d.includes("COMISION") || d.includes("COMISIÓN")) return "COMISION";
  if (d.includes("ITF") || d.includes("IMPUESTO")) return "IMPUESTO";
  if (d.includes("TRANSFER")) return "TRANSFERENCIA";
  if (d.includes("CHEQUE")) return "CHEQUE";
  if (d.includes("DEPOS")) return "DEPOSITO";
  return "OTRO";
}

function matchScore(
  ext: BankStatementRow,
  mov: MovimientoCajaConciliable,
  config: ConciliacionConfig,
): { nivel: NivelMatch | null; score: number; diff: MatchedPair["diferencias"] } {
  const montoExt = ext.montoNeto;
  const montoMov = mov.monto;
  const diffMonto = Math.abs(montoExt - montoMov);
  const diffFecha = daysDiff(ext.fecha, mov.fecha);

  if (diffMonto > config.toleranciaMonto) {
    return { nivel: null, score: 0, diff: { monto: diffMonto } };
  }

  const simDesc = Math.max(tokenSimilarity(ext.descripcion, mov.descripcion), levenshteinSimilarity(ext.descripcion, mov.descripcion));

  if (diffFecha <= config.toleranciaDiasExacto) {
    return { nivel: "EXACTO", score: 100, diff: { monto: diffMonto, fecha: diffFecha } };
  }
  if (diffFecha <= config.toleranciaDiasProbable && simDesc >= config.umbralSimilitudDescripcion) {
    const score = Math.round(60 + 25 * (1 - diffFecha / config.toleranciaDiasProbable) + 15 * simDesc);
    return { nivel: "PROBABLE", score: Math.min(99, score), diff: { monto: diffMonto, fecha: diffFecha, descripcion: ext.descripcion } };
  }
  if (diffFecha <= config.toleranciaDiasSugerido) {
    const score = Math.round(50 + 29 * (1 - diffFecha / config.toleranciaDiasSugerido));
    return { nivel: "SUGERIDO", score: Math.min(79, score), diff: { monto: diffMonto, fecha: diffFecha } };
  }
  return { nivel: null, score: 0, diff: { fecha: diffFecha } };
}

export async function executeConciliacion(params: {
  cuentaFinancieraId: string;
  ruc: string;
  periodo: string;
  extracto: BankStatementRow[];
  config?: Partial<ConciliacionConfig>;
  archivoOriginal?: string;
}): Promise<ConciliacionResult> {
  const t0 = performance.now();
  const config: ConciliacionConfig = { ...DEFAULT_CONCILIACION_CONFIG, ...params.config };

  const cuentas = await fetchCuentasFinancieras(params.ruc);
  const cuenta = cuentas.find((c) => c.id === params.cuentaFinancieraId);
  if (!cuenta) throw new Error("Cuenta financiera no encontrada");

  const movimientosRaw = await fetchMovimientosCaja({ ruc: params.ruc, periodo: params.periodo });
  const movimientos = movimientosRaw
    .filter((m) => m.cuenta_contable === cuenta.cuenta_contable)
    .map((m) => toConciliable(m, cuenta));

  const fechas = params.extracto.map((e) => e.fecha).filter(Boolean);
  const minF = fechas.length ? fechas.reduce((a, b) => (a < b ? a : b)) : "";
  const maxF = fechas.length ? fechas.reduce((a, b) => (a > b ? a : b)) : "";

  const movFiltrados = movimientos.filter((m) => {
    if (!minF || !maxF) return true;
    return m.fecha >= minF && m.fecha <= maxF;
  });

  const usedExt = new Set<string>();
  const usedMov = new Set<string>();
  const partidasConciliadas: MatchedPair[] = [];
  const partidasSugeridas: MatchedPair[] = [];

  const indexByAmount = new Map<string, MovimientoCajaConciliable[]>();
  for (const m of movFiltrados) {
    const key = m.monto.toFixed(2);
    const list = indexByAmount.get(key) ?? [];
    list.push(m);
    indexByAmount.set(key, list);
  }

  for (const ext of params.extracto) {
    const key = ext.montoNeto.toFixed(2);
    const candidates = indexByAmount.get(key) ?? movFiltrados.filter((m) => Math.abs(m.monto - ext.montoNeto) <= config.toleranciaMonto);

    let best: { mov: MovimientoCajaConciliable; nivel: NivelMatch; score: number; diff: MatchedPair["diferencias"] } | null = null;

    for (const mov of candidates) {
      if (usedMov.has(mov.id)) continue;
      const { nivel, score, diff } = matchScore(ext, mov, config);
      if (!nivel || score <= (best?.score ?? 0)) continue;
      best = { mov, nivel, score, diff };
    }

    if (!best) continue;

    const pair: MatchedPair = {
      id: crypto.randomUUID(),
      extractoRow: ext,
      movimientoSistema: best.mov,
      nivelMatch: best.nivel,
      scoreSimilitud: best.score,
      diferencias: best.diff,
      confirmado: best.nivel === "EXACTO" && config.autoConfirmarExactos,
      fechaMatch: new Date().toISOString(),
    };

    usedExt.add(ext.id);
    usedMov.add(best.mov.id);

    if (pair.confirmado) partidasConciliadas.push(pair);
    else partidasSugeridas.push(pair);
  }

  const partidasSoloExtracto = params.extracto.filter((e) => !usedExt.has(e.id));
  const partidasSoloSistema = movFiltrados.filter((m) => !usedMov.has(m.id));

  const totalExtractoIngresos = params.extracto.filter((e) => e.montoNeto > 0).reduce((s, e) => s + e.montoNeto, 0);
  const totalExtractoEgresos = params.extracto.filter((e) => e.montoNeto < 0).reduce((s, e) => s + Math.abs(e.montoNeto), 0);
  const totalSistemaIngresos = movFiltrados.filter((m) => m.monto > 0).reduce((s, m) => s + m.monto, 0);
  const totalSistemaEgresos = movFiltrados.filter((m) => m.monto < 0).reduce((s, m) => s + Math.abs(m.monto), 0);

  const totalPartidas = params.extracto.length + movFiltrados.length;
  const conciliadas = partidasConciliadas.length + partidasSugeridas.filter((p) => p.confirmado).length;

  const result: ConciliacionResult = {
    id: crypto.randomUUID(),
    cuentaFinancieraId: params.cuentaFinancieraId,
    cuentaFinancieraNombre: cuenta.nombre,
    ruc: params.ruc,
    periodo: params.periodo,
    fechaConciliacion: new Date().toISOString(),
    estado: "EN_PROCESO",
    partidasConciliadas,
    partidasSugeridas,
    partidasSoloExtracto,
    partidasSoloSistema,
    resumen: {
      totalExtractoIngresos: Math.round(totalExtractoIngresos * 100) / 100,
      totalExtractoEgresos: Math.round(totalExtractoEgresos * 100) / 100,
      totalExtractoNeto: Math.round((totalExtractoIngresos - totalExtractoEgresos) * 100) / 100,
      totalSistemaIngresos: Math.round(totalSistemaIngresos * 100) / 100,
      totalSistemaEgresos: Math.round(totalSistemaEgresos * 100) / 100,
      totalSistemaNeto: Math.round((totalSistemaIngresos - totalSistemaEgresos) * 100) / 100,
      diferenciaNeta: Math.round(
        (totalExtractoIngresos - totalExtractoEgresos - (totalSistemaIngresos - totalSistemaEgresos)) * 100,
      ) / 100,
      porcentajeConciliacion: totalPartidas ? Math.round((conciliadas * 2 * 100) / totalPartidas) : 0,
      partidasPendientes: partidasSoloExtracto.length + partidasSoloSistema.length + partidasSugeridas.length,
      montoPendienteConciliar: Math.round(
        (partidasSoloExtracto.reduce((s, e) => s + Math.abs(e.montoNeto), 0) +
          partidasSoloSistema.reduce((s, m) => s + Math.abs(m.monto), 0)) *
          100,
      ) / 100,
    },
    metadata: {
      usuario: "authenticated",
      archivoOriginal: params.archivoOriginal ?? "",
      tiempoProcesamiento: Math.round(performance.now() - t0),
      totalFilasExtracto: params.extracto.length,
    },
  };

  await persistConciliacion(result);
  return result;
}

async function persistConciliacion(result: ConciliacionResult) {
  const prev = loadLocalConciliaciones();
  saveLocalConciliaciones([result, ...prev.filter((c) => c.id !== result.id)]);

  const { error } = await supabase.from("conciliaciones_bancarias").insert({
    id: result.id,
    cuenta_financiera_id: result.cuentaFinancieraId,
    ruc: result.ruc,
    periodo: result.periodo,
    estado: result.estado,
    archivo_original: result.metadata.archivoOriginal,
    total_extracto: result.resumen.totalExtractoNeto,
    total_sistema: result.resumen.totalSistemaNeto,
    diferencia_neta: result.resumen.diferenciaNeta,
    porcentaje_conciliacion: result.resumen.porcentajeConciliacion,
    metadata: result,
  });
  if (error) {
    /* fallback local ya guardado */
  }
}

export function detectarAnomalias(movimientos: MovimientoCajaConciliable[]): Anomalia[] {
  const issues: Anomalia[] = [];
  const montos = movimientos.map((m) => Math.abs(m.monto));
  const mean = montos.reduce((a, b) => a + b, 0) / Math.max(montos.length, 1);
  const std = Math.sqrt(montos.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(montos.length, 1));

  for (let i = 0; i < movimientos.length; i++) {
    for (let j = i + 1; j < movimientos.length; j++) {
      const a = movimientos[i]!;
      const b = movimientos[j]!;
      if (a.fecha === b.fecha && Math.abs(a.monto - b.monto) < 0.01 && tokenSimilarity(a.descripcion, b.descripcion) > 0.9) {
        issues.push({
          id: crypto.randomUUID(),
          tipo: "DUPLICADO",
          severidad: "ALTA",
          descripcion: `Posible duplicado: ${a.descripcion.slice(0, 40)}`,
          movimientoIds: [a.id, b.id],
        });
      }
    }
  }

  for (const m of movimientos) {
    if (std > 0 && Math.abs(Math.abs(m.monto) - mean) > 3 * std) {
      issues.push({
        id: crypto.randomUUID(),
        tipo: "MONTO_INUSUAL",
        severidad: "MEDIA",
        descripcion: `Monto atípico: S/ ${Math.abs(m.monto).toFixed(2)}`,
        movimientoIds: [m.id],
      });
    }
    const dow = new Date(m.fecha + "T12:00:00").getDay();
    if (dow === 0 || dow === 6) {
      issues.push({
        id: crypto.randomUUID(),
        tipo: "HORARIO_NO_LABORAL",
        severidad: "BAJA",
        descripcion: `Movimiento en fin de semana: ${m.fecha}`,
        movimientoIds: [m.id],
      });
    }
  }

  return issues.slice(0, 20);
}

export async function confirmarMatch(conciliacionId: string, matchId: string, confirmado: boolean): Promise<void> {
  const stored = loadLocalConciliaciones();
  const conc = stored.find((c) => c.id === conciliacionId);
  if (!conc) return;
  for (const p of [...conc.partidasSugeridas, ...conc.partidasConciliadas]) {
    if (p.id !== matchId) continue;
    p.confirmado = confirmado;
    if (confirmado) {
      if (!conc.partidasConciliadas.some((x) => x.id === matchId)) {
        conc.partidasConciliadas.push(p);
      }
      conc.partidasSugeridas = conc.partidasSugeridas.filter((x) => x.id !== matchId);
      conc.partidasSoloExtracto = conc.partidasSoloExtracto.filter((e) => e.id !== p.extractoRow.id);
      conc.partidasSoloSistema = conc.partidasSoloSistema.filter((m) => m.id !== p.movimientoSistema.id);
    }
  }
  saveLocalConciliaciones(stored);
}

export async function crearMatchManual(
  conciliacionId: string,
  extractoRowId: string,
  movimientoId: string,
): Promise<MatchedPair | null> {
  const stored = loadLocalConciliaciones();
  const conc = stored.find((c) => c.id === conciliacionId);
  if (!conc) return null;

  const ext =
    conc.partidasSoloExtracto.find((e) => e.id === extractoRowId) ??
    [...conc.partidasSugeridas, ...conc.partidasConciliadas].find((p) => p.extractoRow.id === extractoRowId)?.extractoRow;
  const mov =
    conc.partidasSoloSistema.find((m) => m.id === movimientoId) ??
    [...conc.partidasSugeridas, ...conc.partidasConciliadas].find((p) => p.movimientoSistema.id === movimientoId)?.movimientoSistema;

  if (!ext || !mov) return null;

  const pair: MatchedPair = {
    id: crypto.randomUUID(),
    extractoRow: ext,
    movimientoSistema: mov,
    nivelMatch: "MANUAL",
    scoreSimilitud: 100,
    diferencias: { monto: Math.abs(ext.montoNeto - mov.monto), fecha: daysDiff(ext.fecha, mov.fecha) },
    confirmado: true,
    fechaMatch: new Date().toISOString(),
  };

  conc.partidasConciliadas.push(pair);
  conc.partidasSoloExtracto = conc.partidasSoloExtracto.filter((e) => e.id !== extractoRowId);
  conc.partidasSoloSistema = conc.partidasSoloSistema.filter((m) => m.id !== movimientoId);
  conc.partidasSugeridas = conc.partidasSugeridas.filter(
    (p) => p.extractoRow.id !== extractoRowId && p.movimientoSistema.id !== movimientoId,
  );
  saveLocalConciliaciones(stored);
  return pair;
}

export async function agregarMovimientoDesdeExtracto(
  conciliacionId: string,
  extractoRow: BankStatementRow,
  params: { ruc: string; periodo: string; cuentaContable: string },
): Promise<string> {
  const mov = await createMovimientoCaja({
    ruc: params.ruc,
    periodo: params.periodo,
    fecha: extractoRow.fecha,
    fecha_operacion: extractoRow.fecha,
    glosa: extractoRow.descripcion || "Movimiento desde extracto bancario",
    cuenta_contable: params.cuentaContable,
    debe: extractoRow.montoNeto < 0 ? Math.abs(extractoRow.montoNeto) : 0,
    haber: extractoRow.montoNeto >= 0 ? extractoRow.montoNeto : 0,
    origen: "conciliacion",
    origen_documento: "EXTRACTO_BANCARIO",
    numero_documento: extractoRow.referencia,
    registro_sire_id: null,
    asiento_id: null,
  });

  const stored = loadLocalConciliaciones();
  const conc = stored.find((c) => c.id === conciliacionId);
  if (conc) {
    conc.partidasSoloExtracto = conc.partidasSoloExtracto.filter((e) => e.id !== extractoRow.id);
    saveLocalConciliaciones(stored);
  }

  return mov.id;
}

function loadLocalConciliaciones(): ConciliacionResult[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CONC_KEY) ?? "[]") as ConciliacionResult[];
  } catch {
    return [];
  }
}

function saveLocalConciliaciones(list: ConciliacionResult[]) {
  localStorage.setItem(LOCAL_CONC_KEY, JSON.stringify(list.slice(0, 20)));
}

export function getConciliacionLocal(conciliacionId: string): ConciliacionResult | null {
  return loadLocalConciliaciones().find((c) => c.id === conciliacionId) ?? null;
}

export async function obtenerHistorialConciliaciones(cuentaFinancieraId: string): Promise<ConciliacionResumen[]> {
  const { data, error } = await supabase
    .from("conciliaciones_bancarias")
    .select("id, fecha_conciliacion, estado, porcentaje_conciliacion, diferencia_neta")
    .eq("cuenta_financiera_id", cuentaFinancieraId)
    .order("fecha_conciliacion", { ascending: false })
    .limit(20);

  if (!error && data) {
    return data.map((r) => ({
      id: String(r.id),
      fechaConciliacion: String(r.fecha_conciliacion),
      estado: String(r.estado),
      porcentajeConciliacion: Number(r.porcentaje_conciliacion ?? 0),
      diferenciaNeta: Number(r.diferencia_neta ?? 0),
    }));
  }

  const local = loadLocalConciliaciones();
  return local
    .filter((c) => c.cuentaFinancieraId === cuentaFinancieraId)
    .map((c) => ({
      id: c.id,
      fechaConciliacion: c.fechaConciliacion,
      estado: c.estado,
      porcentajeConciliacion: c.resumen.porcentajeConciliacion,
      diferenciaNeta: c.resumen.diferenciaNeta,
    }));
}

export async function finalizarConciliacion(conciliacionId: string): Promise<ConciliacionResult | null> {
  const stored = loadLocalConciliaciones();
  const conc = stored.find((c) => c.id === conciliacionId);
  if (!conc) return null;
  conc.estado = Math.abs(conc.resumen.diferenciaNeta) < 1 ? "COMPLETADA" : "CON_DISCREPANCIAS";
  saveLocalConciliaciones(stored);

  try {
    await supabase
      .from("conciliaciones_bancarias")
      .update({ estado: conc.estado, updated_at: new Date().toISOString() })
      .eq("id", conciliacionId);
  } catch {
    /* tabla puede no existir aún */
  }
  return conc;
}

export const conciliacionBancariaService = {
  parseBankCSV,
  detectBankFormat,
  executeConciliacion,
  detectarAnomalias,
  confirmarMatch,
  crearMatchManual,
  agregarMovimientoDesdeExtracto,
  getConciliacionLocal,
  obtenerHistorialConciliaciones,
  finalizarConciliacion,
};
