import type { LineaAsientoInput, RegistroSire } from "@/lib/sire-types";

/** Valores permitidos por `asientos_contables_tipo_libro_check`. */
export type TipoLibroDb =
  | "DIARIO_COMPRAS"
  | "DIARIO_VENTAS"
  | "CAJA_BANCOS"
  | "DIARIO_MANUAL";

export const TIPOS_LIBRO_PROVISION: TipoLibroDb[] = ["DIARIO_COMPRAS", "DIARIO_VENTAS"];

/** Valores permitidos por `asientos_contables_tipo_asiento_check`. */
export type TipoAsientoDb = "principal" | "cancelacion_caja";

/** Valores permitidos por `asientos_contables_tipo_registro_check`. */
export type TipoRegistroDb = "COMPRA" | "VENTA";

/** Valores permitidos por `asientos_contables_naturaleza_check`. */
export type NaturalezaDb = "debe" | "haber";

/** Prefijo de glosa para asientos generados por centralización de caja. */
export const GLOSA_CENTRALIZACION_CAJA = "Centralización libro caja";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Columnas nativas de `public.asientos_contables` alineadas a CHECK constraints. */
export type AsientoContableInsert = {
  sire_registro_id: string | null;
  periodo: string;
  tipo_asiento: TipoAsientoDb;
  tipo_libro: TipoLibroDb;
  fecha_asiento: string;
  cuenta_contable: string;
  glosa: string | null;
  debe: number;
  haber: number;
  naturaleza: NaturalezaDb;
  tipo_registro: TipoRegistroDb;
  serie_cdp: string | null;
  nro_cdp_inicial: string | null;
  ruc_contraparte: string | null;
  nombre_contraparte: string | null;
};

export function tipoLibroProvision(tipo: RegistroSire["tipo"]): TipoLibroDb {
  return tipo === "VENTA" ? "DIARIO_VENTAS" : "DIARIO_COMPRAS";
}

export function tipoAsientoProvision(_tipo: RegistroSire["tipo"]): TipoAsientoDb {
  return "principal";
}

export function tipoAsientoCancelacion(): TipoAsientoDb {
  return "cancelacion_caja";
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Extrae código PCGE numérico desde '[601101]' o texto con corchetes (minúsculas). */
export function normalizeCuentaContable(value: string | null | undefined): string {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const match = text.match(/\d+/);
  const code = match ? match[0] : text.replace(/[[\]]/g, "").trim();
  return code.toLowerCase();
}

function parseMonto(value: unknown): number {
  if (value === "" || value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? round2(n) : 0;
}

function resolveNaturaleza(debe: number, haber: number, explicit?: unknown): NaturalezaDb {
  const raw = String(explicit ?? "").trim().toLowerCase();
  if (raw === "debe" || raw === "haber") return raw;
  if (debe > 0) return "debe";
  if (haber > 0) return "haber";
  return "debe";
}

function normalizeTipoLibro(value: unknown): TipoLibroDb {
  const t = String(value ?? "").trim().toUpperCase();
  if (t === "DIARIO_COMPRAS") return "DIARIO_COMPRAS";
  if (t === "DIARIO_VENTAS") return "DIARIO_VENTAS";
  if (t === "CAJA_BANCOS") return "CAJA_BANCOS";
  return "DIARIO_MANUAL";
}

function normalizeTipoAsiento(value: unknown): TipoAsientoDb {
  const t = String(value ?? "").trim().toLowerCase();
  if (t === "cancelacion_caja") return "cancelacion_caja";
  return "principal";
}

function normalizeTipoRegistro(value: unknown): TipoRegistroDb {
  const t = String(value ?? "").trim().toUpperCase();
  if (t === "VENTA" || t === "VENTAS") return "VENTA";
  return "COMPRA";
}

/** Rechaza RUC (11 dígitos); solo acepta UUID de `registros_sire.id`. */
export function resolveSireRegistroId(value: unknown): string | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const digitsOnly = s.replace(/\D/g, "");
  if (digitsOnly.length === 11 && /^\d{11}$/.test(digitsOnly)) return null;
  if (UUID_RE.test(s)) return s;
  return null;
}

/** Auditoría de payload cuando Supabase rechaza el insert (23514 u otros). */
export function logSupabaseAsientosInsertError(
  error: unknown,
  payload: AsientoContableInsert[],
  context = "insert",
): void {
  const err = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };
  console.error("[asientos_contables] insert failed", {
    context,
    code: err?.code,
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
    rowCount: payload.length,
    payload,
    payloadJson: JSON.stringify(payload, null, 2),
  });
}

/** Mapea una fila al payload CHECK-safe de `asientos_contables`. */
export function toAsientoContableInsert(row: Record<string, unknown>): AsientoContableInsert {
  const debe = parseMonto(row.debe);
  const haber = parseMonto(row.haber);

  return {
    sire_registro_id: resolveSireRegistroId(row.sire_registro_id),
    periodo: String(row.periodo ?? ""),
    tipo_asiento: normalizeTipoAsiento(row.tipo_asiento),
    tipo_libro: normalizeTipoLibro(row.tipo_libro),
    fecha_asiento: String(row.fecha_asiento ?? ""),
    cuenta_contable: normalizeCuentaContable(String(row.cuenta_contable ?? "")),
    glosa: row.glosa != null && String(row.glosa).trim() !== "" ? String(row.glosa) : null,
    debe,
    haber,
    naturaleza: resolveNaturaleza(debe, haber, row.naturaleza),
    tipo_registro: normalizeTipoRegistro(row.tipo_registro),
    serie_cdp: row.serie_cdp != null ? String(row.serie_cdp) : null,
    nro_cdp_inicial: row.nro_cdp_inicial != null ? String(row.nro_cdp_inicial) : null,
    ruc_contraparte: row.ruc_contraparte != null ? String(row.ruc_contraparte) : null,
    nombre_contraparte: row.nombre_contraparte != null ? String(row.nombre_contraparte) : null,
  };
}

/** Una fila plana por línea de partida doble en `asientos_contables`. */
export function lineasToAsientosPlanos(params: {
  registro: RegistroSire;
  registroId: string;
  lineas: LineaAsientoInput[];
  tipoAsiento?: TipoAsientoDb;
  tipoLibro?: TipoLibroDb;
}): AsientoContableInsert[] {
  const {
    registro,
    registroId,
    lineas,
    tipoAsiento = "principal",
    tipoLibro = tipoLibroProvision(registro.tipo),
  } = params;
  const sireId = resolveSireRegistroId(registroId) ?? resolveSireRegistroId(registro.id);
  const tipoRegistro: TipoRegistroDb = registro.tipo === "VENTA" ? "VENTA" : "COMPRA";

  return lineas.map((l) => {
    const debe = parseMonto(l.debe);
    const haber = parseMonto(l.haber);
    return toAsientoContableInsert({
      sire_registro_id: sireId,
      periodo: registro.periodo,
      tipo_asiento: tipoAsiento,
      tipo_libro: tipoLibro,
      fecha_asiento: registro.fecha_emision,
      cuenta_contable: l.cuenta,
      glosa: l.glosa,
      debe,
      haber,
      naturaleza: resolveNaturaleza(debe, haber),
      tipo_registro: tipoRegistro,
      serie_cdp: registro.serie_cdp ?? null,
      nro_cdp_inicial: registro.nro_cdp_inicial ?? null,
      ruc_contraparte: registro.ruc ?? null,
      nombre_contraparte: registro.nombre_contraparte ?? null,
    });
  });
}

export const ASIENTOS_CONTABLES_SELECT = `
  id,
  sire_registro_id,
  periodo,
  tipo_asiento,
  tipo_libro,
  tipo_registro,
  fecha_asiento,
  cuenta_contable,
  glosa,
  debe,
  haber,
  naturaleza,
  serie_cdp,
  nro_cdp_inicial,
  ruc_contraparte,
  nombre_contraparte,
  created_at
` as const;

export function esLineaCentralizacionCaja(linea: {
  origen?: string;
  glosa?: string | null;
  tipo_libro?: string | null;
}): boolean {
  if (linea.tipo_libro === "CAJA_BANCOS") return true;
  const glosa = linea.glosa ?? "";
  return glosa.startsWith(GLOSA_CENTRALIZACION_CAJA);
}

/** UUID de lote: movimientos_caja.asiento_id apunta a la primera línea del lote. */
export function idReferenciaLote(linea: { id: string }): string {
  return linea.id;
}
