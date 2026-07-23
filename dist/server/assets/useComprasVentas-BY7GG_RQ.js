import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import { u as useQuery } from "./useQuery-CNpr8Hir.js";
import { ac as supabase, ad as throwIfSupabaseError, ar as useQueryClient, aj as toast } from "./router-BRL0s0LD.js";
import { u as useMutation } from "./useMutation-DxnWSsR1.js";
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 8v8", key: "napkw2" }],
  ["path", { d: "m8 12 4 4 4-4", key: "k98ssh" }]
];
const CircleArrowDown = createLucideIcon("circle-arrow-down", __iconNode);
const FACTOR_PRORRATA_DEFAULT = 0.5;
function calcularCreditoFiscalIgv(baseImponible, igv, destino, factorProrrata = FACTOR_PRORRATA_DEFAULT) {
  const igvCalc = igv > 0 ? igv : Math.round(baseImponible * 0.18 * 100) / 100;
  let igvCreditoFiscal = 0;
  switch (destino) {
    case "DESTINO_1_GRAVADO":
      igvCreditoFiscal = igvCalc;
      break;
    case "DESTINO_2_MIXTO":
      igvCreditoFiscal = Math.round(igvCalc * factorProrrata * 100) / 100;
      break;
    case "DESTINO_3_NO_GRAVADO":
    case "SIN_CREDITO_FISCAL":
      igvCreditoFiscal = 0;
      break;
  }
  const igvCostoGasto = Math.round(Math.max(igvCalc - igvCreditoFiscal, 0) * 100) / 100;
  const porcentajeCredito = igvCalc > 0 ? Math.round(igvCreditoFiscal / igvCalc * 1e4) / 100 : 0;
  return { igvCreditoFiscal, igvCostoGasto, porcentajeCredito };
}
function inferirTipoOperacionVenta(v) {
  const hasGrav = v.baseImponibleGravada > 0;
  const hasExo = v.valorExonerado > 0;
  const hasInaf = v.valorInafecto > 0;
  const hasExp = v.exportacion > 0;
  const count = [hasGrav, hasExo, hasInaf, hasExp].filter(Boolean).length;
  if (count > 1) return "MIXTA";
  if (hasExp) return "EXPORTACION";
  if (hasExo) return "EXONERADA";
  if (hasInaf) return "INAFECTA";
  return "GRAVADA";
}
function labelTipoOperacionVenta(tipo) {
  const map = {
    GRAVADA: "Gravada",
    EXONERADA: "Exonerada",
    INAFECTA: "Inafecta",
    EXPORTACION: "Exportación",
    MIXTA: "Mixta"
  };
  return map[tipo];
}
const db = supabase;
function mapCompra(row) {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    periodoId: row.periodo_id,
    registroSireId: row.registro_sire_id,
    tipoComprobante: row.tipo_comprobante,
    serie: row.serie,
    numero: row.numero,
    fechaEmision: row.fecha_emision,
    fechaVencimiento: row.fecha_vencimiento,
    rucProveedor: row.ruc_proveedor,
    razonSocialProveedor: row.razon_social_proveedor,
    moneda: row.moneda,
    tipoCambio: Number(row.tipo_cambio),
    destinoIgv: row.destino_igv,
    baseImponible: Number(row.base_imponible),
    igv: Number(row.igv),
    igvCreditoFiscal: Number(row.igv_credito_fiscal),
    igvCostoGasto: Number(row.igv_costo_gasto),
    valorNoGravado: Number(row.valor_no_gravado),
    otrosCargos: Number(row.otros_cargos),
    total: Number(row.total),
    detraccion: {
      tieneDetraccion: row.tiene_detraccion,
      constanciaNum: row.constancia_detraccion_num,
      fechaDetraccion: row.fecha_detraccion,
      porcentaje: Number(row.porcentaje_detraccion ?? 0),
      monto: Number(row.monto_detraccion ?? 0)
    },
    retencion: {
      tieneRetencion: row.tiene_retencion,
      monto: Number(row.monto_retencion ?? 0)
    },
    percepcion: {
      tienePercepcion: row.tiene_percepcion,
      monto: Number(row.monto_percepcion ?? 0)
    },
    estadoProvision: row.estado_provision,
    comprobanteRefSerie: row.comprobante_ref_serie,
    comprobanteRefNumero: row.comprobante_ref_numero,
    comprobanteRefFecha: row.comprobante_ref_fecha,
    periodo: row.periodo,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function mapVenta(row) {
  const base = {
    baseImponibleGravada: Number(row.base_imponible_gravada),
    valorExonerado: Number(row.valor_exonerado),
    valorInafecto: Number(row.valor_inafecto),
    exportacion: Number(row.exportacion)
  };
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    periodoId: row.periodo_id,
    registroSireId: row.registro_sire_id,
    tipoComprobante: row.tipo_comprobante,
    serie: row.serie,
    numero: row.numero,
    fechaEmision: row.fecha_emision,
    rucCliente: row.ruc_cliente,
    razonSocialCliente: row.razon_social_cliente,
    moneda: row.moneda,
    tipoCambio: Number(row.tipo_cambio),
    ...base,
    igv: Number(row.igv),
    icbper: Number(row.icbper),
    total: Number(row.total),
    detraccion: {
      tieneDetraccion: row.tiene_detraccion,
      constanciaNum: null,
      fechaDetraccion: null,
      porcentaje: 0,
      monto: Number(row.monto_detraccion ?? 0)
    },
    percepcion: {
      tienePercepcion: row.tiene_percepcion,
      monto: Number(row.monto_percepcion ?? 0)
    },
    retencion: {
      tieneRetencion: row.tiene_retencion,
      monto: Number(row.monto_retencion ?? 0)
    },
    estadoProvision: row.estado_provision,
    comprobanteRefSerie: row.comprobante_ref_serie,
    comprobanteRefNumero: row.comprobante_ref_numero,
    periodo: row.periodo,
    tipoOperacion: inferirTipoOperacionVenta(base),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function aplicarFiltrosCompras(q, filtros) {
  let query = q;
  if (filtros?.destinoIgv) query = query.eq("destino_igv", filtros.destinoIgv);
  if (filtros?.estadoProvision) query = query.eq("estado_provision", filtros.estadoProvision);
  if (filtros?.soloConDetraccion) query = query.eq("tiene_detraccion", true);
  return query;
}
function filtrarBusquedaCompras(rows, busqueda) {
  if (!busqueda?.trim()) return rows;
  const term = busqueda.toLowerCase();
  return rows.filter(
    (r) => r.rucProveedor?.includes(term) || r.razonSocialProveedor?.toLowerCase().includes(term) || `${r.serie}-${r.numero}`.toLowerCase().includes(term)
  );
}
function filtrarBusquedaVentas(rows, busqueda) {
  if (!busqueda?.trim()) return rows;
  const term = busqueda.toLowerCase();
  return rows.filter(
    (r) => r.rucCliente?.includes(term) || r.razonSocialCliente?.toLowerCase().includes(term) || `${r.serie}-${r.numero}`.toLowerCase().includes(term)
  );
}
async function fetchComprasPeriodo(contribuyenteId, periodo, filtros) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  let query = db.from("compras_rce").select("*").eq("contribuyente_id", contribuyenteId).eq("periodo", periodoClean).order("fecha_emision", { ascending: false });
  query = aplicarFiltrosCompras(query, filtros);
  const { data, error } = await query;
  throwIfSupabaseError(error, "Error al cargar compras RCE");
  const mapped = (data ?? []).map(mapCompra);
  return filtrarBusquedaCompras(mapped, filtros?.busqueda);
}
async function fetchVentasPeriodo(contribuyenteId, periodo, filtros) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  let query = db.from("ventas_rvie").select("*").eq("contribuyente_id", contribuyenteId).eq("periodo", periodoClean).order("fecha_emision", { ascending: false });
  if (filtros?.estadoProvision) query = query.eq("estado_provision", filtros.estadoProvision);
  if (filtros?.soloConDetraccion) query = query.eq("tiene_detraccion", true);
  const { data, error } = await query;
  throwIfSupabaseError(error, "Error al cargar ventas RVIE");
  const mapped = (data ?? []).map(mapVenta);
  return filtrarBusquedaVentas(mapped, filtros?.busqueda);
}
async function actualizarDestinoIgvCompra(compraId, nuevoDestino, factorProrrata = 0.5) {
  const { data, error } = await db.rpc("fn_clasificar_compra_destino_igv", {
    p_compra_id: compraId,
    p_destino: nuevoDestino,
    p_factor_prorrata: factorProrrata
  });
  throwIfSupabaseError(error, "Error al clasificar destino IGV");
  if (!data) throw new Error("Sin respuesta de clasificación IGV");
  const row = data;
  return {
    ok: Boolean(row.ok),
    compraId: String(row.compra_id),
    destinoIgv: row.destino_igv,
    igvCreditoFiscal: Number(row.igv_credito_fiscal),
    igvCostoGasto: Number(row.igv_costo_gasto),
    igvOriginal: Number(row.igv_original)
  };
}
async function obtenerResumenFiscalPeriodo(contribuyenteId, periodo) {
  const { data, error } = await db.rpc("fn_obtener_resumen_fiscal_periodo", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodo.replace(/\D/g, "").slice(0, 6)
  });
  throwIfSupabaseError(error, "Error al obtener resumen fiscal");
  if (!data) throw new Error("Resumen fiscal vacío");
  const row = data;
  return {
    contribuyenteId: String(row.contribuyente_id),
    periodo: String(row.periodo),
    debitoFiscalIgvVentas: Number(row.debito_fiscal_igv_ventas ?? 0),
    creditoFiscalDestino1: Number(row.credito_fiscal_destino_1 ?? 0),
    creditoFiscalDestino2Prorrata: Number(row.credito_fiscal_destino_2_prorrata ?? 0),
    igvCostoDestino3: Number(row.igv_costo_destino_3 ?? 0),
    igvSinCreditoFiscal: Number(row.igv_sin_credito_fiscal ?? 0),
    creditoFiscalTotal: Number(row.credito_fiscal_total ?? 0),
    igvAPagarEstimado: Number(row.igv_a_pagar_estimado ?? 0),
    saldoFavorEstimado: Number(row.saldo_favor_estimado ?? 0),
    cantidadCompras: Number(row.cantidad_compras ?? 0),
    cantidadVentas: Number(row.cantidad_ventas ?? 0),
    evaluadoAt: String(row.evaluado_at ?? (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function fetchContribuyenteIdByRucCv(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
const comprasVentasQueryKeys = {
  all: ["compras-ventas"],
  compras: (contribuyenteId, periodo, filtros) => ["compras-ventas", "compras", contribuyenteId, periodo, filtros ?? {}],
  ventas: (contribuyenteId, periodo, filtros) => ["compras-ventas", "ventas", contribuyenteId, periodo, filtros ?? {}],
  resumen: (contribuyenteId, periodo) => ["compras-ventas", "resumen", contribuyenteId, periodo]
};
function cleanPeriodo(periodo) {
  return periodo.replace(/\D/g, "").slice(0, 6);
}
function useCompras(contribuyenteId, periodo, filtros, enabled = true) {
  const periodoClean = cleanPeriodo(periodo);
  return useQuery({
    queryKey: comprasVentasQueryKeys.compras(contribuyenteId, periodoClean, filtros),
    queryFn: () => fetchComprasPeriodo(contribuyenteId, periodoClean, filtros),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 3e4,
    refetchOnWindowFocus: true
  });
}
function useVentas(contribuyenteId, periodo, filtros, enabled = true) {
  const periodoClean = cleanPeriodo(periodo);
  return useQuery({
    queryKey: comprasVentasQueryKeys.ventas(contribuyenteId, periodoClean, filtros),
    queryFn: () => fetchVentasPeriodo(contribuyenteId, periodoClean, filtros),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 3e4,
    refetchOnWindowFocus: true
  });
}
function useResumenFiscalPeriodo(contribuyenteId, periodo, enabled = true) {
  const periodoClean = cleanPeriodo(periodo);
  return useQuery({
    queryKey: comprasVentasQueryKeys.resumen(contribuyenteId, periodoClean),
    queryFn: () => obtenerResumenFiscalPeriodo(contribuyenteId, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 6e4,
    refetchOnWindowFocus: true
  });
}
function useActualizarDestinoIgv(contribuyenteId, periodo) {
  const qc = useQueryClient();
  const periodoClean = cleanPeriodo(periodo);
  return useMutation({
    mutationFn: ({
      compraId,
      nuevoDestino,
      factorProrrata
    }) => actualizarDestinoIgvCompra(compraId, nuevoDestino, factorProrrata),
    onMutate: async ({ compraId, nuevoDestino, factorProrrata = 0.5 }) => {
      await qc.cancelQueries({ queryKey: comprasVentasQueryKeys.all });
      const comprasKey = comprasVentasQueryKeys.compras(contribuyenteId, periodoClean);
      const previousCompras = qc.getQueriesData({ queryKey: comprasKey });
      qc.setQueriesData(
        { queryKey: ["compras-ventas", "compras", contribuyenteId, periodoClean] },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.map((c) => {
            if (c.id !== compraId) return c;
            const calc = calcularCreditoFiscalIgv(c.baseImponible, c.igv, nuevoDestino, factorProrrata);
            return {
              ...c,
              destinoIgv: nuevoDestino,
              igvCreditoFiscal: calc.igvCreditoFiscal,
              igvCostoGasto: calc.igvCostoGasto
            };
          });
        }
      );
      return { previousCompras };
    },
    onSuccess: async () => {
      toast.success("Destino IGV actualizado");
      await qc.invalidateQueries({ queryKey: comprasVentasQueryKeys.all });
    },
    onError: (error, _vars, context) => {
      if (context?.previousCompras) {
        for (const [key, data] of context.previousCompras) {
          qc.setQueryData(key, data);
        }
      }
      toast.error(error.message || "No se pudo actualizar el destino IGV");
    }
  });
}
export {
  CircleArrowDown as C,
  useCompras as a,
  useResumenFiscalPeriodo as b,
  comprasVentasQueryKeys as c,
  useVentas as d,
  fetchContribuyenteIdByRucCv as f,
  labelTipoOperacionVenta as l,
  useActualizarDestinoIgv as u
};
