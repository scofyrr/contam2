export type TipoMovimientoCaja = "INGRESO" | "EGRESO";

export type TipoCuentaBancaria =
  | "CAJA_CHICA"
  | "CUENTA_CORRIENTE"
  | "AHORROS"
  | "DETRACCIONES_BN";

export type TipoOrigenMovimiento = "COMPRA" | "VENTA" | "LIBRE";

export type MedioPagoTabla1 =
  | "001"
  | "003"
  | "008"
  | "009"
  | "011";

export interface CuentaBancaria {
  id: string;
  contribuyenteId: string;
  nombreCuenta: string;
  banco: string;
  numeroCuenta: string;
  cci: string | null;
  moneda: string;
  tipoCuenta: TipoCuentaBancaria;
  cuentaPcgeCodigo: string;
  saldoActual: number;
  estado: "ACTIVO" | "INACTIVO";
  createdAt: string;
  updatedAt: string;
}

export interface MovimientoCaja {
  id: string;
  contribuyenteId: string;
  periodo: string | null;
  cuentaBancariaId: string | null;
  numeroCorrelativoCaja: number | null;
  fechaOperacion: string;
  tipoMovimiento: TipoMovimientoCaja | null;
  medioPagoTabla1: string;
  comprobanteOrigenId: string | null;
  tipoOrigen: TipoOrigenMovimiento | null;
  rucDniContraparte: string | null;
  razonSocialContraparte: string | null;
  glosa: string;
  montoSoles: number;
  ingreso: number;
  egreso: number;
  nombreCuenta: string | null;
  banco: string | null;
  moneda: string | null;
  asientoId: string | null;
  saldoAcumulado?: number;
  createdAt: string;
}

export interface LiquidacionPayload {
  contribuyenteId: string;
  comprobanteId: string;
  tipoComprobante: "COMPRA" | "VENTA";
  cuentaBancariaId: string;
  medioPago: MedioPagoTabla1 | string;
  fecha: string;
  glosa: string;
  monto: number;
  tipoCambio?: number;
}

export interface LiquidacionResult {
  ok: boolean;
  movimientoId: string;
  asientoId: string;
  cuo: string;
  correlativoCaja: number;
  nuevoSaldo: number;
  tipoMovimiento: TipoMovimientoCaja;
  error?: string;
  duplicado?: boolean;
}

export interface ResumenCaja {
  contribuyenteId: string;
  periodo: string;
  totalIngresos: number;
  totalEgresos: number;
  saldoNeto: number;
  cantidadMovimientos: number;
  saldoCuentas: number;
}

export interface ComprobantePendienteLiquidacion {
  id: string;
  tipo: "COMPRA" | "VENTA";
  serie: string | null;
  numero: string;
  fechaEmision: string;
  rucContraparte: string | null;
  razonSocial: string | null;
  total: number;
  estadoProvision: string;
}

export const MEDIOS_PAGO_TABLA1: { codigo: MedioPagoTabla1; label: string }[] = [
  { codigo: "001", label: "001 — Depósito en cuenta" },
  { codigo: "003", label: "003 — Transferencia de fondos" },
  { codigo: "008", label: "008 — Efectivo" },
  { codigo: "009", label: "009 — Tarjeta de crédito" },
  { codigo: "011", label: "011 — Medios de pago de comercio electrónico" },
];

export const TIPO_CUENTA_BANCARIA_LABELS: Record<TipoCuentaBancaria, string> = {
  CAJA_CHICA: "Caja Chica",
  CUENTA_CORRIENTE: "Cuenta Corriente",
  AHORROS: "Ahorros",
  DETRACCIONES_BN: "Detracciones BN",
};

export const TIPO_CUENTA_BANCARIA_COLORS: Record<TipoCuentaBancaria, string> = {
  CAJA_CHICA: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  CUENTA_CORRIENTE: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  AHORROS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  DETRACCIONES_BN: "border-violet-500/40 bg-violet-500/10 text-violet-300",
};
