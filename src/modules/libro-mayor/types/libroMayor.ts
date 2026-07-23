export type NaturalezaSaldo = "DEUDOR" | "ACREEDOR" | "NEUTRO";

export interface FilaLibroMayorF61 {
  fechaOperacion: string;
  cuo: string;
  correlativoLinea: number | null;
  glosa: string;
  debe: number;
  haber: number;
  saldoLinea: number;
}

export interface CuentaMayorizada {
  codigoCuenta: string;
  denominacion: string;
  saldoInicial: number;
  totalDebe: number;
  totalHaber: number;
  saldoFinal: number;
  naturalezaSaldo: NaturalezaSaldo;
  filas: FilaLibroMayorF61[];
}

export interface LibroMayorF61Response {
  contribuyenteId: string;
  ruc: string;
  razonSocial: string;
  periodo: string;
  nivelCuenta: number;
  codigoLibroTabla8: string;
  nombreLibro: string;
  totalDebeGeneral: number;
  totalHaberGeneral: number;
  cuadrado: boolean;
  cuentas: CuentaMayorizada[];
  generadoAt: string;
}

export interface FilaBalanceComprobacion {
  cuentaCodigo: string;
  cuentaDenominacion: string;
  saldoInicial: number;
  sumaDebe: number;
  sumaHaber: number;
  saldoDeudor: number;
  saldoAcreedor: number;
  saldoFinal: number;
}

export interface BalanceComprobacionResponse {
  contribuyenteId: string;
  ruc: string;
  razonSocial: string;
  periodo: string;
  filas: FilaBalanceComprobacion[];
  totalDebe: number;
  totalHaber: number;
  totalSaldoDeudor: number;
  totalSaldoAcreedor: number;
  cuadrado: boolean;
  generadoAt: string;
}

export const NIVELES_CUENTA_PCGE = [2, 3, 4, 5] as const;

export type NivelCuentaPcge = (typeof NIVELES_CUENTA_PCGE)[number];

export const NATURALEZA_SALDO_COLORS: Record<NaturalezaSaldo, string> = {
  DEUDOR: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  ACREEDOR: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  NEUTRO: "border-slate-500/40 bg-slate-500/10 text-slate-400",
};

export const NATURALEZA_SALDO_LABELS: Record<NaturalezaSaldo, string> = {
  DEUDOR: "Saldo Deudor",
  ACREEDOR: "Saldo Acreedor",
  NEUTRO: "Saldo Neutro",
};

export const CODIGO_LIBRO_MAYOR_TABLA8 = "060100";
