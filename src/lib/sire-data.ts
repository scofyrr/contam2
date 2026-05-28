import { supabase } from "@/integrations/supabase/client";
import type { LibroDiarioLinea, RegistroSire } from "@/lib/sire-types";
import { DEMO_LIBRO_DIARIO, DEMO_REGISTROS } from "@/lib/stats-service";

/** Misma tabla que usa `_app.sire-registros` */
export async function fetchRegistrosSire(periodo?: string): Promise<{
  rows: RegistroSire[];
  demo: boolean;
}> {
  let q = supabase
    .from("registros_sire")
    .select("*")
    .order("fecha_emision", { ascending: false })
    .limit(2000);

  if (periodo) q = q.eq("periodo", periodo);

  const { data, error } = await q;
  if (error) {
    const rows = periodo
      ? DEMO_REGISTROS.filter((r) => r.periodo === periodo)
      : DEMO_REGISTROS;
    return { rows, demo: true };
  }

  return {
    rows: (data ?? []).map((row) => normalizeRegistroSire(row as Record<string, unknown>)),
    demo: false,
  };
}

/** Vista v_libro_diario o, si no existe (404), join lineas_asiento + asientos + registros_sire */
export async function fetchLibroDiario(periodo?: string): Promise<{
  rows: LibroDiarioLinea[];
  demo: boolean;
}> {
  let q = supabase.from("v_libro_diario").select("*");
  if (periodo) q = q.eq("periodo", periodo);

  const { data, error } = await q
    .order("fecha_asiento", { ascending: false })
    .limit(5000);

  if (!error && data) {
    return {
      rows: (data ?? []).map((row) => normalizeLibroLinea(row as Record<string, unknown>)),
      demo: false,
    };
  }

  const fallback = await fetchLibroDiarioFromTables(periodo);
  if (fallback.length > 0) {
    return { rows: fallback, demo: false };
  }

  const rows = (periodo
    ? DEMO_LIBRO_DIARIO.filter((r) => r.periodo === periodo)
    : DEMO_LIBRO_DIARIO) as LibroDiarioLinea[];
  return { rows, demo: true };
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
  return {
    id: String(row.id ?? ""),
    tipo: (row.tipo === "COMPRA" ? "COMPRA" : "VENTA") as RegistroSire["tipo"],
    periodo: String(row.periodo ?? ""),
    fecha_emision: String(row.fecha_emision ?? ""),
    cod_tipo_cdp: String(row.cod_tipo_cdp ?? ""),
    serie_cdp: row.serie_cdp != null ? String(row.serie_cdp) : null,
    nro_cdp_inicial: String(row.nro_cdp_inicial ?? ""),
    nombre_contraparte:
      row.nombre_contraparte != null ? String(row.nombre_contraparte) : null,
    bi_grav: Number(row.bi_grav ?? row.bi_adq_grav ?? 0),
    igv_grav: Number(row.igv_grav ?? row.igv_adq_grav ?? 0),
    importe_total: Number(row.importe_total ?? 0),
    cod_moneda: String(row.cod_moneda ?? "PEN"),
    estado_validacion:
      (row.estado_validacion as RegistroSire["estado_validacion"]) ?? "pendiente",
    cuenta_pcge: row.cuenta_pcge != null ? String(row.cuenta_pcge) : null,
    finalidad_operativa:
      row.finalidad_operativa != null ? String(row.finalidad_operativa) : null,
    descripcion_items:
      row.descripcion_items != null ? String(row.descripcion_items) : null,
    ruc: row.ruc != null ? String(row.ruc) : undefined,
    razon_social: row.razon_social != null ? String(row.razon_social) : undefined,
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
