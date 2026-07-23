import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  ClasificarDestinoResult,
  CompraRce,
  DestinoIgv,
  FiltrosTablaComprobantes,
  ResumenFiscal,
  VentaRvie,
} from "@/modules/compras-ventas/types/comprasVentas";
import { inferirTipoOperacionVenta } from "@/modules/compras-ventas/utils/taxClassifier";

type CvDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const db = supabase as unknown as CvDb;

type CompraRow = {
  id: string;
  contribuyente_id: string;
  periodo_id: string | null;
  registro_sire_id: string | null;
  tipo_comprobante: string;
  serie: string | null;
  numero: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  ruc_proveedor: string | null;
  razon_social_proveedor: string | null;
  moneda: string;
  tipo_cambio: number;
  destino_igv: DestinoIgv;
  base_imponible: number;
  igv: number;
  igv_credito_fiscal: number;
  igv_costo_gasto: number;
  valor_no_gravado: number;
  otros_cargos: number;
  total: number;
  tiene_detraccion: boolean;
  constancia_detraccion_num: string | null;
  fecha_detraccion: string | null;
  porcentaje_detraccion: number | null;
  monto_detraccion: number | null;
  tiene_retencion: boolean;
  monto_retencion: number | null;
  tiene_percepcion: boolean;
  monto_percepcion: number | null;
  estado_provision: CompraRce["estadoProvision"];
  comprobante_ref_serie: string | null;
  comprobante_ref_numero: string | null;
  comprobante_ref_fecha: string | null;
  periodo: string;
  created_at: string;
  updated_at: string;
};

type VentaRow = {
  id: string;
  contribuyente_id: string;
  periodo_id: string | null;
  registro_sire_id: string | null;
  tipo_comprobante: string;
  serie: string | null;
  numero: string;
  fecha_emision: string;
  ruc_cliente: string | null;
  razon_social_cliente: string | null;
  moneda: string;
  tipo_cambio: number;
  base_imponible_gravada: number;
  igv: number;
  valor_exonerado: number;
  valor_inafecto: number;
  exportacion: number;
  icbper: number;
  total: number;
  tiene_detraccion: boolean;
  monto_detraccion: number | null;
  tiene_percepcion: boolean;
  monto_percepcion: number | null;
  tiene_retencion: boolean;
  monto_retencion: number | null;
  estado_provision: VentaRvie["estadoProvision"];
  comprobante_ref_serie: string | null;
  comprobante_ref_numero: string | null;
  periodo: string;
  created_at: string;
  updated_at: string;
};

function mapCompra(row: CompraRow): CompraRce {
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
      monto: Number(row.monto_detraccion ?? 0),
    },
    retencion: {
      tieneRetencion: row.tiene_retencion,
      monto: Number(row.monto_retencion ?? 0),
    },
    percepcion: {
      tienePercepcion: row.tiene_percepcion,
      monto: Number(row.monto_percepcion ?? 0),
    },
    estadoProvision: row.estado_provision,
    comprobanteRefSerie: row.comprobante_ref_serie,
    comprobanteRefNumero: row.comprobante_ref_numero,
    comprobanteRefFecha: row.comprobante_ref_fecha,
    periodo: row.periodo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVenta(row: VentaRow): VentaRvie {
  const base = {
    baseImponibleGravada: Number(row.base_imponible_gravada),
    valorExonerado: Number(row.valor_exonerado),
    valorInafecto: Number(row.valor_inafecto),
    exportacion: Number(row.exportacion),
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
      monto: Number(row.monto_detraccion ?? 0),
    },
    percepcion: {
      tienePercepcion: row.tiene_percepcion,
      monto: Number(row.monto_percepcion ?? 0),
    },
    retencion: {
      tieneRetencion: row.tiene_retencion,
      monto: Number(row.monto_retencion ?? 0),
    },
    estadoProvision: row.estado_provision,
    comprobanteRefSerie: row.comprobante_ref_serie,
    comprobanteRefNumero: row.comprobante_ref_numero,
    periodo: row.periodo,
    tipoOperacion: inferirTipoOperacionVenta(base),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function aplicarFiltrosCompras(
  q: ReturnType<typeof db.from>,
  filtros?: FiltrosTablaComprobantes,
) {
  let query = q;
  if (filtros?.destinoIgv) query = query.eq("destino_igv", filtros.destinoIgv);
  if (filtros?.estadoProvision) query = query.eq("estado_provision", filtros.estadoProvision);
  if (filtros?.soloConDetraccion) query = query.eq("tiene_detraccion", true);
  return query;
}

function filtrarBusquedaCompras(rows: CompraRce[], busqueda?: string): CompraRce[] {
  if (!busqueda?.trim()) return rows;
  const term = busqueda.toLowerCase();
  return rows.filter(
    (r) =>
      r.rucProveedor?.includes(term) ||
      r.razonSocialProveedor?.toLowerCase().includes(term) ||
      `${r.serie}-${r.numero}`.toLowerCase().includes(term),
  );
}

function filtrarBusquedaVentas(rows: VentaRvie[], busqueda?: string): VentaRvie[] {
  if (!busqueda?.trim()) return rows;
  const term = busqueda.toLowerCase();
  return rows.filter(
    (r) =>
      r.rucCliente?.includes(term) ||
      r.razonSocialCliente?.toLowerCase().includes(term) ||
      `${r.serie}-${r.numero}`.toLowerCase().includes(term),
  );
}

export async function fetchComprasPeriodo(
  contribuyenteId: string,
  periodo: string,
  filtros?: FiltrosTablaComprobantes,
): Promise<CompraRce[]> {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  let query = db
    .from("compras_rce")
    .select("*")
    .eq("contribuyente_id", contribuyenteId)
    .eq("periodo", periodoClean)
    .order("fecha_emision", { ascending: false });

  query = aplicarFiltrosCompras(query, filtros);

  const { data, error } = await query;
  throwIfSupabaseError(error, "Error al cargar compras RCE");

  const mapped = ((data ?? []) as unknown as CompraRow[]).map(mapCompra);
  return filtrarBusquedaCompras(mapped, filtros?.busqueda);
}

export async function fetchVentasPeriodo(
  contribuyenteId: string,
  periodo: string,
  filtros?: FiltrosTablaComprobantes,
): Promise<VentaRvie[]> {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  let query = db
    .from("ventas_rvie")
    .select("*")
    .eq("contribuyente_id", contribuyenteId)
    .eq("periodo", periodoClean)
    .order("fecha_emision", { ascending: false });

  if (filtros?.estadoProvision) query = query.eq("estado_provision", filtros.estadoProvision);
  if (filtros?.soloConDetraccion) query = query.eq("tiene_detraccion", true);

  const { data, error } = await query;
  throwIfSupabaseError(error, "Error al cargar ventas RVIE");

  const mapped = ((data ?? []) as unknown as VentaRow[]).map(mapVenta);
  return filtrarBusquedaVentas(mapped, filtros?.busqueda);
}

export async function actualizarDestinoIgvCompra(
  compraId: string,
  nuevoDestino: DestinoIgv,
  factorProrrata = 0.5,
): Promise<ClasificarDestinoResult> {
  const { data, error } = await db.rpc("fn_clasificar_compra_destino_igv", {
    p_compra_id: compraId,
    p_destino: nuevoDestino,
    p_factor_prorrata: factorProrrata,
  });

  throwIfSupabaseError(error, "Error al clasificar destino IGV");

  if (!data) throw new Error("Sin respuesta de clasificación IGV");

  const row = data as Record<string, unknown>;
  return {
    ok: Boolean(row.ok),
    compraId: String(row.compra_id),
    destinoIgv: row.destino_igv as DestinoIgv,
    igvCreditoFiscal: Number(row.igv_credito_fiscal),
    igvCostoGasto: Number(row.igv_costo_gasto),
    igvOriginal: Number(row.igv_original),
  };
}

export async function obtenerResumenFiscalPeriodo(
  contribuyenteId: string,
  periodo: string,
): Promise<ResumenFiscal> {
  const { data, error } = await db.rpc("fn_obtener_resumen_fiscal_periodo", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodo.replace(/\D/g, "").slice(0, 6),
  });

  throwIfSupabaseError(error, "Error al obtener resumen fiscal");

  if (!data) throw new Error("Resumen fiscal vacío");

  const row = data as Record<string, unknown>;
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
    evaluadoAt: String(row.evaluado_at ?? new Date().toISOString()),
  };
}

export async function reemplazarPropuestaCompras(
  contribuyenteId: string,
  periodo: string,
  compras: Record<string, unknown>[],
): Promise<{ insertados: number; actualizados: number }> {
  const { data, error } = await db.rpc("fn_reemplazar_propuesta_compras", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodo.replace(/\D/g, "").slice(0, 6),
    p_compras_nuevas: compras,
  });

  throwIfSupabaseError(error, "Error al reemplazar propuesta de compras");

  const row = (data ?? {}) as Record<string, unknown>;
  return {
    insertados: Number(row.insertados ?? 0),
    actualizados: Number(row.actualizados ?? 0),
  };
}

export async function fetchContribuyenteIdByRucCv(ruc: string): Promise<string | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
