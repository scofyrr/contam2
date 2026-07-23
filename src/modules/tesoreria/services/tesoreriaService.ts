import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  ComprobantePendienteLiquidacion,
  CuentaBancaria,
  LiquidacionPayload,
  LiquidacionResult,
  MovimientoCaja,
  ResumenCaja,
  TipoCuentaBancaria,
  TipoMovimientoCaja,
  TipoOrigenMovimiento,
} from "@/modules/tesoreria/types/tesoreria";

type TesDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const db = supabase as unknown as TesDb;

type CuentaRow = {
  id: string;
  contribuyente_id: string;
  nombre_cuenta: string;
  banco: string;
  numero_cuenta: string;
  cci: string | null;
  moneda: string;
  tipo_cuenta: TipoCuentaBancaria;
  cuenta_pcge_codigo: string;
  saldo_actual: number;
  estado: "ACTIVO" | "INACTIVO";
  created_at: string;
  updated_at: string;
};

type MovimientoRow = {
  id: string;
  contribuyente_id: string;
  periodo: string | null;
  cuenta_bancaria_id: string | null;
  numero_correlativo_caja: number | null;
  fecha_operacion: string;
  tipo_movimiento_enum: TipoMovimientoCaja | null;
  medio_pago_tabla1: string;
  comprobante_origen_id: string | null;
  tipo_origen: TipoOrigenMovimiento | null;
  ruc_dni_contraparte: string | null;
  razon_social_contraparte: string | null;
  glosa: string;
  monto_soles: number | null;
  ingreso?: number;
  egreso?: number;
  nombre_cuenta?: string | null;
  banco?: string | null;
  moneda?: string | null;
  asiento_id: string | null;
  debe: number;
  haber: number;
  created_at: string;
};

function mapCuenta(row: CuentaRow): CuentaBancaria {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    nombreCuenta: row.nombre_cuenta,
    banco: row.banco,
    numeroCuenta: row.numero_cuenta,
    cci: row.cci,
    moneda: row.moneda,
    tipoCuenta: row.tipo_cuenta,
    cuentaPcgeCodigo: row.cuenta_pcge_codigo,
    saldoActual: Number(row.saldo_actual),
    estado: row.estado,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMovimiento(row: MovimientoRow): MovimientoCaja {
  const monto = Number(row.monto_soles ?? Math.max(row.debe, row.haber));
  const ingreso = row.ingreso != null ? Number(row.ingreso) : row.tipo_movimiento_enum === "INGRESO" ? monto : row.debe;
  const egreso = row.egreso != null ? Number(row.egreso) : row.tipo_movimiento_enum === "EGRESO" ? monto : row.haber;

  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    periodo: row.periodo,
    cuentaBancariaId: row.cuenta_bancaria_id,
    numeroCorrelativoCaja: row.numero_correlativo_caja,
    fechaOperacion: row.fecha_operacion,
    tipoMovimiento: row.tipo_movimiento_enum,
    medioPagoTabla1: row.medio_pago_tabla1 ?? "001",
    comprobanteOrigenId: row.comprobante_origen_id,
    tipoOrigen: row.tipo_origen,
    rucDniContraparte: row.ruc_dni_contraparte,
    razonSocialContraparte: row.razon_social_contraparte,
    glosa: row.glosa,
    montoSoles: monto,
    ingreso,
    egreso,
    nombreCuenta: row.nombre_cuenta ?? null,
    banco: row.banco ?? null,
    moneda: row.moneda ?? null,
    asientoId: row.asiento_id,
    createdAt: row.created_at,
  };
}

function cleanPeriodo(periodo: string): string {
  return periodo.replace(/\D/g, "").slice(0, 6);
}

function calcularSaldoAcumulado(movimientos: MovimientoCaja[], saldoInicial = 0): MovimientoCaja[] {
  let saldo = saldoInicial;
  return movimientos.map((m) => {
    saldo = saldo + m.ingreso - m.egreso;
    return { ...m, saldoAcumulado: Math.round(saldo * 100) / 100 };
  });
}

export async function fetchCuentasBancarias(contribuyenteId: string): Promise<CuentaBancaria[]> {
  const { data, error } = await db
    .from("cuentas_bancarias")
    .select("*")
    .eq("contribuyente_id", contribuyenteId)
    .eq("estado", "ACTIVO")
    .order("tipo_cuenta")
    .order("nombre_cuenta");

  throwIfSupabaseError(error, "Error al cargar cuentas bancarias");
  return ((data ?? []) as unknown as CuentaRow[]).map(mapCuenta);
}

export async function fetchMovimientosCaja(
  contribuyenteId: string,
  periodo: string,
  cuentaId?: string,
): Promise<MovimientoCaja[]> {
  const periodoClean = cleanPeriodo(periodo);

  let query = db
    .from("v_libro_caja_010100")
    .select("*")
    .eq("contribuyente_id", contribuyenteId)
    .eq("periodo", periodoClean)
    .order("fecha_operacion", { ascending: true })
    .order("numero_correlativo_caja", { ascending: true });

  if (cuentaId) {
    query = query.eq("cuenta_bancaria_id", cuentaId);
  }

  const { data, error } = await query;
  if (error) {
    let fallback = db
      .from("movimientos_caja")
      .select("*")
      .eq("contribuyente_id", contribuyenteId)
      .eq("periodo", periodoClean)
      .order("fecha_operacion", { ascending: true });

    if (cuentaId) fallback = fallback.eq("cuenta_bancaria_id", cuentaId);

    const res = await fallback;
    throwIfSupabaseError(res.error, "Error al cargar movimientos de caja");
    const mapped = ((res.data ?? []) as unknown as MovimientoRow[]).map(mapMovimiento);
    return calcularSaldoAcumulado(mapped);
  }

  const mapped = ((data ?? []) as unknown as MovimientoRow[]).map(mapMovimiento);
  return calcularSaldoAcumulado(mapped);
}

export async function ejecutarLiquidacionAtomica(
  payload: LiquidacionPayload,
): Promise<LiquidacionResult> {
  const { data, error } = await db.rpc("rpc_liquidacion_caja_mejorada", {
    p_contribuyente_id: payload.contribuyenteId,
    p_comprobante_id: payload.comprobanteId,
    p_tipo_comprobante: payload.tipoComprobante,
    p_cuenta_bancaria_id: payload.cuentaBancariaId,
    p_medio_pago: payload.medioPago,
    p_fecha: payload.fecha,
    p_glosa: payload.glosa,
    p_monto: payload.monto,
    p_tipo_cambio: payload.tipoCambio ?? 1,
  });

  throwIfSupabaseError(error, "Error en liquidación atómica");

  if (!data) throw new Error("Sin respuesta de liquidación");

  const row = data as Record<string, unknown>;

  if (row.ok === false) {
    return {
      ok: false,
      movimientoId: "",
      asientoId: "",
      cuo: "",
      correlativoCaja: 0,
      nuevoSaldo: 0,
      tipoMovimiento: "INGRESO",
      error: String(row.error ?? "Liquidación fallida"),
      duplicado: Boolean(row.duplicado),
    };
  }

  return {
    ok: true,
    movimientoId: String(row.movimiento_id),
    asientoId: String(row.asiento_id),
    cuo: String(row.cuo ?? ""),
    correlativoCaja: Number(row.correlativo_caja ?? 0),
    nuevoSaldo: Number(row.nuevo_saldo ?? 0),
    tipoMovimiento: (row.tipo_movimiento as TipoMovimientoCaja) ?? "INGRESO",
  };
}

export async function crearCuentaBancaria(
  cuenta: Partial<CuentaBancaria> & { contribuyenteId: string; nombreCuenta: string; banco: string; numeroCuenta: string },
): Promise<CuentaBancaria> {
  const row = {
    contribuyente_id: cuenta.contribuyenteId,
    nombre_cuenta: cuenta.nombreCuenta,
    banco: cuenta.banco,
    numero_cuenta: cuenta.numeroCuenta,
    cci: cuenta.cci ?? null,
    moneda: cuenta.moneda ?? "PEN",
    tipo_cuenta: cuenta.tipoCuenta ?? "CUENTA_CORRIENTE",
    cuenta_pcge_codigo: cuenta.cuentaPcgeCodigo ?? "1041",
    saldo_actual: cuenta.saldoActual ?? 0,
    estado: "ACTIVO",
  };

  const { data, error } = await db.from("cuentas_bancarias").insert(row).select("*").single();
  throwIfSupabaseError(error, "Error al crear cuenta bancaria");
  return mapCuenta(data as unknown as CuentaRow);
}

export async function fetchComprobantesPendientesLiquidacion(
  contribuyenteId: string,
  periodo: string,
): Promise<ComprobantePendienteLiquidacion[]> {
  const periodoClean = cleanPeriodo(periodo);

  const [comprasRes, ventasRes] = await Promise.all([
    db
      .from("compras_rce")
      .select("id, serie, numero, fecha_emision, ruc_proveedor, razon_social_proveedor, total, estado_provision")
      .eq("contribuyente_id", contribuyenteId)
      .eq("periodo", periodoClean)
      .neq("estado_provision", "PAGADO")
      .neq("estado_provision", "ANULADO"),
    db
      .from("ventas_rvie")
      .select("id, serie, numero, fecha_emision, ruc_cliente, razon_social_cliente, total, estado_provision")
      .eq("contribuyente_id", contribuyenteId)
      .eq("periodo", periodoClean)
      .neq("estado_provision", "PAGADO")
      .neq("estado_provision", "ANULADO"),
  ]);

  throwIfSupabaseError(comprasRes.error, "Error al cargar compras pendientes");
  throwIfSupabaseError(ventasRes.error, "Error al cargar ventas pendientes");

  const compras: ComprobantePendienteLiquidacion[] = ((comprasRes.data ?? []) as Record<string, unknown>[]).map(
    (r) => ({
      id: String(r.id),
      tipo: "COMPRA" as const,
      serie: r.serie ? String(r.serie) : null,
      numero: String(r.numero),
      fechaEmision: String(r.fecha_emision),
      rucContraparte: r.ruc_proveedor ? String(r.ruc_proveedor) : null,
      razonSocial: r.razon_social_proveedor ? String(r.razon_social_proveedor) : null,
      total: Number(r.total),
      estadoProvision: String(r.estado_provision),
    }),
  );

  const ventas: ComprobantePendienteLiquidacion[] = ((ventasRes.data ?? []) as Record<string, unknown>[]).map(
    (r) => ({
      id: String(r.id),
      tipo: "VENTA" as const,
      serie: r.serie ? String(r.serie) : null,
      numero: String(r.numero),
      fechaEmision: String(r.fecha_emision),
      rucContraparte: r.ruc_cliente ? String(r.ruc_cliente) : null,
      razonSocial: r.razon_social_cliente ? String(r.razon_social_cliente) : null,
      total: Number(r.total),
      estadoProvision: String(r.estado_provision),
    }),
  );

  return [...compras, ...ventas].sort(
    (a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime(),
  );
}

export async function obtenerResumenCaja(
  contribuyenteId: string,
  periodo: string,
  cuentas: CuentaBancaria[],
  movimientos: MovimientoCaja[],
): Promise<ResumenCaja> {
  const totalIngresos = movimientos.reduce((s, m) => s + m.ingreso, 0);
  const totalEgresos = movimientos.reduce((s, m) => s + m.egreso, 0);

  return {
    contribuyenteId,
    periodo: cleanPeriodo(periodo),
    totalIngresos: Math.round(totalIngresos * 100) / 100,
    totalEgresos: Math.round(totalEgresos * 100) / 100,
    saldoNeto: Math.round((totalIngresos - totalEgresos) * 100) / 100,
    cantidadMovimientos: movimientos.length,
    saldoCuentas: Math.round(cuentas.reduce((s, c) => s + c.saldoActual, 0) * 100) / 100,
  };
}

export async function fetchContribuyenteIdByRucTes(ruc: string): Promise<string | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
