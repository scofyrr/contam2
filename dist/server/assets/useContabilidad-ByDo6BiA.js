import { u as useQuery } from "./useQuery-GwWd8T8C.js";
import { ab as supabase, ac as throwIfSupabaseError, aq as useQueryClient, ai as toast } from "./router-B2oVQHub.js";
import { u as useMutation } from "./useMutation-DD5rBZOv.js";
const TABLA9_COLUMNAS = {
  activo: ["10", "12", "16", "20", "21", "33", "34", "38", "39"],
  pasivo: ["4011D", "4011C", "4017D", "4017C", "402", "42", "46"],
  patrimonio: ["50", "58", "59"],
  gastos: ["60", "61", "62", "63", "65", "66", "67", "68", "69", "96", "97"],
  ingresos: ["70", "75", "76", "77", "79"]
};
const TIPO_CUENTA_COLORS = {
  ACTIVO: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  PASIVO: "border-red-500/40 bg-red-500/10 text-red-300",
  PATRIMONIO: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  GASTOS: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  INGRESOS: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  ORDEN: "border-slate-500/40 bg-slate-500/10 text-slate-400"
};
const db = supabase;
function mapCuenta(row) {
  return {
    codigo: row.codigo,
    denominacion: row.denominacion,
    elemento: row.elemento,
    nivel: row.nivel,
    tipoCuenta: row.tipo_cuenta,
    permiteMovimiento: row.permite_movimiento,
    estado: row.estado
  };
}
function cleanPeriodo$1(periodo) {
  return periodo.replace(/\D/g, "").slice(0, 6);
}
function mapF51Row(raw) {
  return {
    cuo: String(raw.cuo ?? ""),
    correlativoLinea: Number(raw.correlativo_linea ?? 0),
    fechaOperacion: String(raw.fecha_operacion ?? ""),
    glosa: String(raw.glosa ?? ""),
    codigoLibroTabla8: String(raw.codigo_libro_tabla8 ?? "050100"),
    numeroCorrelativoSustentatorio: raw.numero_correlativo_sustentatorio ? String(raw.numero_correlativo_sustentatorio) : null,
    numeroDocumentoSustentatorio: raw.numero_documento_sustentatorio ? String(raw.numero_documento_sustentatorio) : null,
    cuentaCodigo: String(raw.cuenta_codigo ?? ""),
    cuentaDenominacion: String(raw.cuenta_denominacion ?? ""),
    debe: Number(raw.debe ?? 0),
    haber: Number(raw.haber ?? 0),
    estadoAsiento: String(raw.estado_asiento ?? "PROVISIONADO"),
    sireRegistroId: raw.sire_registro_id ? String(raw.sire_registro_id) : null
  };
}
function mapF52Row(raw) {
  const pickCols = (keys) => {
    const out = {};
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
    activo: pickCols(TABLA9_COLUMNAS.activo),
    pasivo: pickCols(TABLA9_COLUMNAS.pasivo),
    patrimonio: pickCols(TABLA9_COLUMNAS.patrimonio),
    gastos: pickCols(TABLA9_COLUMNAS.gastos),
    ingresos: pickCols(TABLA9_COLUMNAS.ingresos)
  };
}
async function fetchPlanCuentasPcge(filtroCodigo) {
  let query = db.from("plan_cuentas_pcge").select("*").eq("estado", "ACTIVO").order("codigo");
  if (filtroCodigo?.trim()) {
    const term = filtroCodigo.trim();
    query = query.or(`codigo.ilike.%${term}%,denominacion.ilike.%${term}%`);
  }
  const { data, error } = await query;
  throwIfSupabaseError(error, "Error al cargar plan de cuentas PCGE");
  return (data ?? []).map(mapCuenta);
}
async function fetchLibroDiarioFormato51(contribuyenteId, periodo) {
  const { data, error } = await db.rpc("fn_obtener_libro_diario_f51", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: cleanPeriodo$1(periodo)
  });
  throwIfSupabaseError(error, "Error al obtener Libro Diario F5.1");
  if (!data) throw new Error("Respuesta vacía del Libro Diario F5.1");
  const row = data;
  const filasRaw = row.filas ?? [];
  return {
    contribuyenteId: String(row.contribuyente_id),
    periodo: String(row.periodo),
    formato: "5.1",
    filas: filasRaw.map(mapF51Row),
    totalDebe: Number(row.total_debe ?? 0),
    totalHaber: Number(row.total_haber ?? 0),
    cuadrado: Boolean(row.cuadrado),
    generadoAt: String(row.generado_at ?? (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function fetchLibroDiarioSimplificadoFormato52(contribuyenteId, periodo) {
  const { data, error } = await db.rpc("fn_obtener_libro_diario_simplificado_f52", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: cleanPeriodo$1(periodo)
  });
  throwIfSupabaseError(error, "Error al obtener Libro Diario F5.2");
  if (!data) throw new Error("Respuesta vacía del Libro Diario F5.2");
  const row = data;
  const filasRaw = row.filas ?? [];
  const tabla9 = row.tabla9 ?? {};
  return {
    contribuyenteId: String(row.contribuyente_id),
    periodo: String(row.periodo),
    formato: "5.2",
    tabla9: {
      activo: tabla9.activo ?? [...TABLA9_COLUMNAS.activo],
      pasivo: tabla9.pasivo ?? [...TABLA9_COLUMNAS.pasivo],
      patrimonio: tabla9.patrimonio ?? [...TABLA9_COLUMNAS.patrimonio],
      gastos: tabla9.gastos ?? [...TABLA9_COLUMNAS.gastos],
      ingresos: tabla9.ingresos ?? [...TABLA9_COLUMNAS.ingresos]
    },
    filas: filasRaw.map(mapF52Row),
    generadoAt: String(row.generado_at ?? (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function crearAsientoManual(asiento) {
  const periodo = cleanPeriodo$1(asiento.periodo);
  const cuo = asiento.cuo ?? `CUO-${periodo}-${String(Date.now()).slice(-4)}`;
  const { data: contrib, error: contribErr } = await supabase.from("contribuyentes").select("ruc").eq("id", asiento.contribuyenteId).maybeSingle();
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
    ruc
  }));
  const { data, error } = await db.from("asientos_contables").insert(rows).select("id");
  throwIfSupabaseError(error, "Error al crear asiento manual");
  return {
    cuo,
    ids: (data ?? []).map((r) => r.id)
  };
}
async function fetchContribuyenteIdByRucCont(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
const contabilidadQueryKeys = {
  all: ["contabilidad-mod5"],
  pcge: (filtro) => ["contabilidad-mod5", "pcge", filtro ?? ""],
  f51: (contribuyenteId, periodo) => ["contabilidad-mod5", "f51", contribuyenteId, periodo],
  f52: (contribuyenteId, periodo) => ["contabilidad-mod5", "f52", contribuyenteId, periodo]
};
function cleanPeriodo(periodo) {
  return periodo.replace(/\D/g, "").slice(0, 6);
}
function usePlanCuentasPCGE(filtroCodigo) {
  return useQuery({
    queryKey: contabilidadQueryKeys.pcge(filtroCodigo),
    queryFn: () => fetchPlanCuentasPcge(filtroCodigo),
    staleTime: 5 * 6e4
  });
}
function useLibroDiarioF51(contribuyenteId, periodo, enabled = true) {
  const periodoClean = cleanPeriodo(periodo);
  return useQuery({
    queryKey: contabilidadQueryKeys.f51(contribuyenteId, periodoClean),
    queryFn: () => fetchLibroDiarioFormato51(contribuyenteId, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 3e4,
    refetchOnWindowFocus: true
  });
}
function useLibroDiarioSimplificadoF52(contribuyenteId, periodo, enabled = true) {
  const periodoClean = cleanPeriodo(periodo);
  return useQuery({
    queryKey: contabilidadQueryKeys.f52(contribuyenteId, periodoClean),
    queryFn: () => fetchLibroDiarioSimplificadoFormato52(contribuyenteId, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 3e4,
    refetchOnWindowFocus: true
  });
}
function useCrearAsientoManual(contribuyenteId, periodo) {
  const qc = useQueryClient();
  const periodoClean = cleanPeriodo(periodo);
  return useMutation({
    mutationFn: (asiento) => crearAsientoManual(asiento),
    onSuccess: async (result) => {
      toast.success(`Asiento manual ${result.cuo} registrado`);
      await qc.invalidateQueries({
        queryKey: contabilidadQueryKeys.f51(contribuyenteId, periodoClean)
      });
      await qc.invalidateQueries({
        queryKey: contabilidadQueryKeys.f52(contribuyenteId, periodoClean)
      });
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar asiento manual");
    }
  });
}
export {
  TABLA9_COLUMNAS as T,
  TIPO_CUENTA_COLORS as a,
  useLibroDiarioF51 as b,
  contabilidadQueryKeys as c,
  useLibroDiarioSimplificadoF52 as d,
  usePlanCuentasPCGE as e,
  fetchContribuyenteIdByRucCont as f,
  useCrearAsientoManual as u
};
