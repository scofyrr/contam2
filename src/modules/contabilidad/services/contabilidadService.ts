import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  AsientoPlano,
  CuentaPcge,
  Formato51Result,
  Formato51Row,
  Formato52MatrizRow,
  Formato52Result,
  GenerarAsientoResult,
} from "@/modules/contabilidad/types/contabilidad";
import { TABLA9_COLUMNAS as TABLA9 } from "@/modules/contabilidad/types/contabilidad";

type ContDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const db = supabase as unknown as ContDb;

type CuentaRow = {
  codigo: string;
  denominacion: string;
  elemento: number;
  nivel: number;
  tipo_cuenta: CuentaPcge["tipoCuenta"];
  permite_movimiento: boolean;
  estado: CuentaPcge["estado"];
};

function mapCuenta(row: CuentaRow): CuentaPcge {
  return {
    codigo: row.codigo,
    denominacion: row.denominacion,
    elemento: row.elemento,
    nivel: row.nivel,
    tipoCuenta: row.tipo_cuenta,
    permiteMovimiento: row.permite_movimiento,
    estado: row.estado,
  };
}

function cleanPeriodo(periodo: string): string {
  return periodo.replace(/\D/g, "").slice(0, 6);
}

function mapF51Row(raw: Record<string, unknown>): Formato51Row {
  return {
    cuo: String(raw.cuo ?? ""),
    correlativoLinea: Number(raw.correlativo_linea ?? 0),
    fechaOperacion: String(raw.fecha_operacion ?? ""),
    glosa: String(raw.glosa ?? ""),
    codigoLibroTabla8: String(raw.codigo_libro_tabla8 ?? "050100"),
    numeroCorrelativoSustentatorio: raw.numero_correlativo_sustentatorio
      ? String(raw.numero_correlativo_sustentatorio)
      : null,
    numeroDocumentoSustentatorio: raw.numero_documento_sustentatorio
      ? String(raw.numero_documento_sustentatorio)
      : null,
    cuentaCodigo: String(raw.cuenta_codigo ?? ""),
    cuentaDenominacion: String(raw.cuenta_denominacion ?? ""),
    debe: Number(raw.debe ?? 0),
    haber: Number(raw.haber ?? 0),
    estadoAsiento: String(raw.estado_asiento ?? "PROVISIONADO"),
    sireRegistroId: raw.sire_registro_id ? String(raw.sire_registro_id) : null,
  };
}

function mapF52Row(raw: Record<string, unknown>): Formato52MatrizRow {
  const pickCols = (keys: readonly string[]) => {
    const out: Record<string, number> = {};
    for (const k of keys) {
      const val = raw[`col_${k}`];
      if (val != null && Number(val) !== 0) {
        out[k] = Number(val);
      }
    }
    return out;
  };

  return {
    fechaOperacion: String(raw.fecha_operacion ?? ""),
    mes: String(raw.mes ?? ""),
    activo: pickCols(TABLA9.activo),
    pasivo: pickCols(TABLA9.pasivo),
    patrimonio: pickCols(TABLA9.patrimonio),
    gastos: pickCols(TABLA9.gastos),
    ingresos: pickCols(TABLA9.ingresos),
  };
}

export async function fetchPlanCuentasPcge(filtroCodigo?: string): Promise<CuentaPcge[]> {
  let query = db.from("plan_cuentas_pcge").select("*").eq("estado", "ACTIVO").order("codigo");

  if (filtroCodigo?.trim()) {
    const term = filtroCodigo.trim();
    query = query.or(`codigo.ilike.%${term}%,denominacion.ilike.%${term}%`);
  }

  const { data, error } = await query;
  throwIfSupabaseError(error, "Error al cargar plan de cuentas PCGE");

  return ((data ?? []) as unknown as CuentaRow[]).map(mapCuenta);
}

export async function fetchLibroDiarioFormato51(
  contribuyenteId: string,
  periodo: string,
): Promise<Formato51Result> {
  const { data, error } = await db.rpc("fn_obtener_libro_diario_f51", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: cleanPeriodo(periodo),
  });

  throwIfSupabaseError(error, "Error al obtener Libro Diario F5.1");

  if (!data) throw new Error("Respuesta vacía del Libro Diario F5.1");

  const row = data as Record<string, unknown>;
  const filasRaw = (row.filas ?? []) as Record<string, unknown>[];

  return {
    contribuyenteId: String(row.contribuyente_id),
    periodo: String(row.periodo),
    formato: "5.1",
    filas: filasRaw.map(mapF51Row),
    totalDebe: Number(row.total_debe ?? 0),
    totalHaber: Number(row.total_haber ?? 0),
    cuadrado: Boolean(row.cuadrado),
    generadoAt: String(row.generado_at ?? new Date().toISOString()),
  };
}

export async function fetchLibroDiarioSimplificadoFormato52(
  contribuyenteId: string,
  periodo: string,
): Promise<Formato52Result> {
  const { data, error } = await db.rpc("fn_obtener_libro_diario_simplificado_f52", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: cleanPeriodo(periodo),
  });

  throwIfSupabaseError(error, "Error al obtener Libro Diario F5.2");

  if (!data) throw new Error("Respuesta vacía del Libro Diario F5.2");

  const row = data as Record<string, unknown>;
  const filasRaw = (row.filas ?? []) as Record<string, unknown>[];
  const tabla9 = (row.tabla9 ?? {}) as Record<string, string[]>;

  return {
    contribuyenteId: String(row.contribuyente_id),
    periodo: String(row.periodo),
    formato: "5.2",
    tabla9: {
      activo: tabla9.activo ?? [...TABLA9.activo],
      pasivo: tabla9.pasivo ?? [...TABLA9.pasivo],
      patrimonio: tabla9.patrimonio ?? [...TABLA9.patrimonio],
      gastos: tabla9.gastos ?? [...TABLA9.gastos],
      ingresos: tabla9.ingresos ?? [...TABLA9.ingresos],
    },
    filas: filasRaw.map(mapF52Row),
    generadoAt: String(row.generado_at ?? new Date().toISOString()),
  };
}

export async function generarAsientoComprobante(
  contribuyenteId: string,
  comprobanteId: string,
  tipoOrigen: "COMPRA" | "VENTA" | "RCE" | "RVIE",
): Promise<GenerarAsientoResult> {
  const { data, error } = await db.rpc("fn_generar_asiento_comprobante", {
    p_contribuyente_id: contribuyenteId,
    p_comprobante_id: comprobanteId,
    p_tipo_origen: tipoOrigen,
  });

  throwIfSupabaseError(error, "Error al generar asiento contable");

  if (!data) throw new Error("Sin respuesta al generar asiento");

  const row = data as Record<string, unknown>;
  return {
    ok: Boolean(row.ok),
    cuo: String(row.cuo),
    contribuyenteId: String(row.contribuyente_id),
    comprobanteId: String(row.comprobante_id),
    tipoOrigen: String(row.tipo_origen),
    lineasGeneradas: Number(row.lineas_generadas ?? 0),
  };
}

export async function crearAsientoManual(asiento: AsientoPlano): Promise<{ cuo: string; ids: string[] }> {
  const periodo = cleanPeriodo(asiento.periodo);
  const cuo =
    asiento.cuo ??
    `CUO-${periodo}-${String(Date.now()).slice(-4)}`;

  const { data: contrib, error: contribErr } = await supabase
    .from("contribuyentes")
    .select("ruc")
    .eq("id", asiento.contribuyenteId)
    .maybeSingle();

  throwIfSupabaseError(contribErr, "Error al resolver contribuyente");

  const ruc = contrib?.ruc ?? null;
  const tipoLibro = asiento.tipoLibro ?? "DIARIO_MANUAL";
  const tipoRegistro = asiento.tipoRegistro ?? "COMPRA";

  const rows = asiento.lineas.map((linea) => ({
    contribuyente_id: asiento.contribuyenteId,
    periodo,
    cuo,
    correlativo_linea: linea.correlativoLinea,
    fecha_operacion: asiento.fechaOperacion,
    fecha_asiento: asiento.fechaOperacion,
    glosa: linea.glosa || asiento.glosa,
    codigo_libro_tabla8: asiento.codigoLibroTabla8,
    numero_correlativo_sustentatorio: asiento.numeroCorrelativoSustentatorio ?? null,
    numero_documento_sustentatorio: asiento.numeroDocumentoSustentatorio ?? null,
    cuenta_codigo: linea.cuentaCodigo,
    cuenta_contable: linea.cuentaCodigo,
    cuenta_denominacion: linea.cuentaDenominacion,
    debe: linea.debe,
    haber: linea.haber,
    naturaleza: linea.debe > 0 ? "debe" : "haber",
    tipo_asiento: "principal",
    tipo_libro: tipoLibro,
    tipo_registro: tipoRegistro,
    sire_registro_id: asiento.sireRegistroId ?? null,
    estado_asiento: asiento.estadoAsiento ?? "PROVISIONADO",
    ruc,
  }));

  const { data, error } = await db.from("asientos_contables").insert(rows).select("id");
  throwIfSupabaseError(error, "Error al crear asiento manual");

  return {
    cuo,
    ids: ((data ?? []) as { id: string }[]).map((r) => r.id),
  };
}

export async function fetchContribuyenteIdByRucCont(ruc: string): Promise<string | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
