import { supabase } from "@/integrations/supabase/client";
import { ASIENTOS_CONTABLES_SELECT } from "@/lib/asientos-contables-utils";
import type { LibroDiarioLinea, RegistroSire } from "@/lib/sire-types";
import { mapRegistroFromDb, resolverMontosSunat } from "@/lib/sire-montos";
import { throwIfSupabaseError } from "@/lib/supabase-error";

export type SireDataFilters = {
  periodo?: string;
  periodoDesde?: string;
  periodoHasta?: string;
  ruc?: string;
};

function applyPeriodFilters<T extends { eq: (col: string, val: string) => T; gte: (col: string, val: string) => T; lte: (col: string, val: string) => T }>(
  q: T,
  filters?: SireDataFilters | string,
  column = "periodo",
): T {
  if (!filters) return q;
  if (typeof filters === "string") {
    return filters ? q.eq(column, filters) : q;
  }
  if (filters.periodo) return q.eq(column, filters.periodo);
  if (filters.periodoDesde) q = q.gte(column, filters.periodoDesde);
  if (filters.periodoHasta) q = q.lte(column, filters.periodoHasta);
  return q;
}

function applyRucFilter<T extends { eq: (col: string, val: string) => T }>(
  q: T,
  filters?: SireDataFilters | string,
  column = "ruc_contraparte",
): T {
  if (!filters || typeof filters === "string") return q;
  const ruc = filters.ruc?.trim();
  return ruc ? q.eq(column, ruc) : q;
}

export async function fetchRegistrosSire(
  filters?: SireDataFilters | string,
): Promise<RegistroSire[]> {
  let q = supabase
    .from("registros_sire")
    .select("*")
    .order("fecha_emision", { ascending: false })
    .limit(5000);

  q = applyPeriodFilters(q, filters);

  q = applyRucFilter(q, filters);

  const { data, error } = await q;
  throwIfSupabaseError(error, "Error al cargar registros SIRE");

  return (data ?? []).map((row) => normalizeRegistroSire(row as Record<string, unknown>));
}

/** Libro diario: vista `v_libro_diario` o tabla plana `asientos_contables`. */
export async function fetchLibroDiario(
  filters?: SireDataFilters | string,
): Promise<LibroDiarioLinea[]> {
  let q = supabase.from("v_libro_diario").select("*");
  q = applyPeriodFilters(q, filters);
  q = applyRucFilter(q, filters, "ruc");

  const { data, error } = await q
    .order("fecha_asiento", { ascending: false })
    .limit(5000);

  if (!error && data?.length) {
    return (data ?? []).map((row) => normalizeLibroLinea(row as Record<string, unknown>));
  }

  return fetchLibroDiarioFromAsientos(filters);
}

async function fetchLibroDiarioFromAsientos(
  filters?: SireDataFilters | string,
): Promise<LibroDiarioLinea[]> {
  let q = supabase
    .from("asientos_contables")
    .select(
      `
      ${ASIENTOS_CONTABLES_SELECT},
      registros_sire (
        ruc,
        razon_social,
        cod_tipo_cdp,
        serie_cdp,
        nro_cdp_inicial
      )
    `,
    )
    .limit(5000);

  q = applyPeriodFilters(q, filters);
  q = applyRucFilter(q, filters);

  const { data, error } = await q.order("fecha_asiento", { ascending: false });
  if (error) {
    throwIfSupabaseError(error, "Error al cargar libro diario");
    return [];
  }

  const lineas: LibroDiarioLinea[] = [];

  for (const row of data ?? []) {
    const flat = row as Record<string, unknown>;
    const rs = flat.registros_sire as Record<string, unknown> | null;
    lineas.push({
      id: String(flat.id ?? ""),
      sire_registro_id:
        flat.sire_registro_id != null ? String(flat.sire_registro_id) : null,
      fecha_asiento: String(flat.fecha_asiento ?? ""),
      periodo: String(flat.periodo ?? ""),
      cuenta_contable: String(flat.cuenta_contable ?? ""),
      debe: Number(flat.debe ?? 0),
      haber: Number(flat.haber ?? 0),
      glosa: flat.glosa != null ? String(flat.glosa) : null,
      naturaleza: flat.naturaleza === "haber" ? "haber" : "debe",
      origen: String(flat.tipo_asiento ?? ""),
      tipo_libro: flat.tipo_libro != null ? String(flat.tipo_libro) : null,
      tipo_registro:
        flat.tipo_registro != null
          ? String(flat.tipo_registro)
          : rs?.tipo != null
            ? String(rs.tipo)
            : null,
      ruc:
        flat.ruc_contraparte != null
          ? String(flat.ruc_contraparte)
          : rs?.ruc != null
            ? String(rs.ruc)
            : null,
      razon_social: rs?.razon_social != null ? String(rs.razon_social) : null,
      cod_tipo_cdp: rs?.cod_tipo_cdp != null ? String(rs.cod_tipo_cdp) : null,
      serie_cdp: rs?.serie_cdp != null ? String(rs.serie_cdp) : flat.serie_cdp != null ? String(flat.serie_cdp) : null,
      nro_cdp_inicial:
        rs?.nro_cdp_inicial != null
          ? String(rs.nro_cdp_inicial)
          : flat.nro_cdp_inicial != null
            ? String(flat.nro_cdp_inicial)
            : null,
    });
  }

  return lineas;
}

export function normalizeRegistroSire(row: Record<string, unknown>): RegistroSire {
  const mapped = mapRegistroFromDb(row);
  const montos = resolverMontosSunat(mapped);

  return {
    id: String(mapped.id ?? ""),
    tipo: (mapped.tipo === "COMPRA" ? "COMPRA" : "VENTA") as RegistroSire["tipo"],
    periodo: String(mapped.periodo ?? ""),
    fecha_emision: String(mapped.fecha_emision ?? ""),
    cod_tipo_cdp: String(mapped.cod_tipo_cdp ?? ""),
    serie_cdp: mapped.serie_cdp != null ? String(mapped.serie_cdp) : null,
    nro_cdp_inicial: String(mapped.nro_cdp_inicial ?? ""),
    nombre_contraparte:
      mapped.nombre_contraparte != null ? String(mapped.nombre_contraparte) : null,
    bi_grav: montos.mto_bi_gravada,
    igv_grav: montos.mto_igv_ipe,
    mto_bi_gravada: montos.mto_bi_gravada,
    mto_igv_ipe: montos.mto_igv_ipe,
    mto_total_cp: montos.mto_total_cp,
    importe_total: montos.mto_total_cp,
    cod_moneda: String(mapped.cod_moneda ?? "PEN"),
    estado_validacion:
      (mapped.estado_validacion as RegistroSire["estado_validacion"]) ?? "pendiente",
    ruc: mapped.ruc != null ? String(mapped.ruc) : undefined,
    razon_social: mapped.razon_social != null ? String(mapped.razon_social) : undefined,
  };
}

function normalizeLibroLinea(row: Record<string, unknown>): LibroDiarioLinea {
  return {
    id: String(row.id ?? ""),
    sire_registro_id:
      row.sire_registro_id != null ? String(row.sire_registro_id) : null,
    fecha_asiento: String(row.fecha_asiento ?? ""),
    periodo: String(row.periodo ?? ""),
    cuenta_contable: String(row.cuenta_contable ?? ""),
    debe: Number(row.debe ?? 0),
    haber: Number(row.haber ?? 0),
    glosa: row.glosa != null ? String(row.glosa) : null,
    naturaleza: row.naturaleza === "haber" ? "haber" : "debe",
    origen: String(row.origen ?? row.tipo_asiento ?? ""),
    tipo_libro: row.tipo_libro != null ? String(row.tipo_libro) : null,
    tipo_registro: row.tipo_registro != null ? String(row.tipo_registro) : null,
    ruc: row.ruc != null ? String(row.ruc) : null,
    razon_social: row.razon_social != null ? String(row.razon_social) : null,
    cod_tipo_cdp: row.cod_tipo_cdp != null ? String(row.cod_tipo_cdp) : null,
    serie_cdp: row.serie_cdp != null ? String(row.serie_cdp) : null,
    nro_cdp_inicial:
      row.nro_cdp_inicial != null ? String(row.nro_cdp_inicial) : null,
  };
}

export function registroToExportRow(r: RegistroSire) {
  return {
    Periodo: r.periodo,
    Tipo: r.tipo,
    RUC: r.ruc ?? "",
    "Razón social": r.razon_social ?? "",
    "Fecha emisión": r.fecha_emision,
    "Tipo CDP": r.cod_tipo_cdp,
    Serie: r.serie_cdp ?? "",
    Número: r.nro_cdp_inicial,
    Contraparte: r.nombre_contraparte ?? "",
    "Base imponible": r.bi_grav ?? 0,
    IGV: r.igv_grav ?? 0,
    "Importe total": r.importe_total,
    Moneda: r.cod_moneda,
    "Estado validación": r.estado_validacion ?? "pendiente",
  };
}

export function libroToExportRow(l: LibroDiarioLinea) {
  return {
    Fecha: l.fecha_asiento,
    Periodo: l.periodo,
    Cuenta: l.cuenta_contable,
    Glosa: l.glosa ?? "",
    Debe: l.debe,
    Haber: l.haber,
    Naturaleza: l.naturaleza,
    "Tipo registro": l.tipo_registro ?? "",
    RUC: l.ruc ?? "",
    "Razón social": l.razon_social ?? "",
    Comprobante: `${l.cod_tipo_cdp ?? ""}-${l.serie_cdp ?? ""}-${l.nro_cdp_inicial ?? ""}`,
  };
}
