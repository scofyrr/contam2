import { supabase } from "@/integrations/supabase/client";
import type { LibroDiarioLinea, RegistroSire } from "@/lib/sire-types";
import { mapRegistroFromDb, resolverMontosSunat } from "@/lib/sire-montos";

/** Misma tabla que usa `_app.sire-registros` */
export async function fetchRegistrosSire(periodo?: string): Promise<RegistroSire[]> {
  let q = supabase
    .from("registros_sire")
    .select("*")
    .order("fecha_emision", { ascending: false })
    .limit(2000);

  if (periodo) q = q.eq("periodo", periodo);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((row) => normalizeRegistroSire(row as Record<string, unknown>));
}

/** Vista v_libro_diario o join lineas_asiento + asientos + registros_sire */
export async function fetchLibroDiario(periodo?: string): Promise<LibroDiarioLinea[]> {
  let q = supabase.from("v_libro_diario").select("*");
  if (periodo) q = q.eq("periodo", periodo);

  const { data, error } = await q
    .order("fecha_asiento", { ascending: false })
    .limit(5000);

  if (!error && data?.length) {
    return (data ?? []).map((row) => normalizeLibroLinea(row as Record<string, unknown>));
  }

  return fetchLibroDiarioFromTables(periodo);
}

async function fetchLibroDiarioFromTables(periodo?: string): Promise<LibroDiarioLinea[]> {
  let q = supabase
    .from("lineas_asiento")
    .select(
      `
      id,
      cuenta,
      glosa,
      debe,
      haber,
      asientos_contables!inner (
        fecha,
        periodo,
        origen,
        glosa,
        registro_sire_id,
        registros_sire (
          tipo,
          ruc,
          razon_social,
          cod_tipo_cdp,
          serie_cdp,
          nro_cdp_inicial
        )
      )
    `,
    )
    .not("asientos_contables.registro_sire_id", "is", null)
    .limit(5000);

  if (periodo) {
    q = q.eq("asientos_contables.periodo", periodo);
  }

  const { data, error } = await q;
  if (error || !data?.length) return [];

  const lineas: LibroDiarioLinea[] = [];

  for (const row of data as Record<string, unknown>[]) {
    const ac = row.asientos_contables as Record<string, unknown> | null;
    if (!ac) continue;
    const rs = ac.registros_sire as Record<string, unknown> | null;

    lineas.push({
      id: String(row.id ?? ""),
      sire_registro_id:
        ac.registro_sire_id != null ? String(ac.registro_sire_id) : null,
      fecha_asiento: String(ac.fecha ?? ""),
      periodo: String(ac.periodo ?? ""),
      cuenta_contable: String(row.cuenta ?? ""),
      debe: Number(row.debe ?? 0),
      haber: Number(row.haber ?? 0),
      glosa: String(row.glosa ?? ac.glosa ?? ""),
      naturaleza: Number(row.debe ?? 0) > 0 ? "debe" : "haber",
      origen: String(ac.origen ?? ""),
      tipo_registro: rs?.tipo != null ? String(rs.tipo) : null,
      ruc: rs?.ruc != null ? String(rs.ruc) : null,
      razon_social: rs?.razon_social != null ? String(rs.razon_social) : null,
      cod_tipo_cdp: rs?.cod_tipo_cdp != null ? String(rs.cod_tipo_cdp) : null,
      serie_cdp: rs?.serie_cdp != null ? String(rs.serie_cdp) : null,
      nro_cdp_inicial:
        rs?.nro_cdp_inicial != null ? String(rs.nro_cdp_inicial) : null,
    });
  }

  return lineas.sort((a, b) => b.fecha_asiento.localeCompare(a.fecha_asiento));
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
    cuenta_pcge: mapped.cuenta_pcge != null ? String(mapped.cuenta_pcge) : null,
    finalidad_operativa:
      mapped.finalidad_operativa != null ? String(mapped.finalidad_operativa) : null,
    descripcion_items:
      mapped.descripcion_items != null ? String(mapped.descripcion_items) : null,
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
    origen: String(row.origen ?? ""),
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
    "Cuenta PCGE": r.cuenta_pcge ?? "",
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
