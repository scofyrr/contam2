export type TipoCuentaPcge =
  | "ACTIVO"
  | "PASIVO"
  | "PATRIMONIO"
  | "GASTOS"
  | "INGRESOS"
  | "ORDEN";

export type EstadoCuentaPcge = "ACTIVO" | "INACTIVO";

export type EstadoAsiento = "PROVISIONADO" | "LIQUIDADO" | "ANULADO";

export interface CuentaPcge {
  codigo: string;
  denominacion: string;
  elemento: number;
  nivel: number;
  tipoCuenta: TipoCuentaPcge;
  permiteMovimiento: boolean;
  estado: EstadoCuentaPcge;
}

export interface AsientoLinea {
  correlativoLinea: number;
  cuentaCodigo: string;
  cuentaDenominacion: string;
  glosa: string;
  debe: number;
  haber: number;
}

export interface AsientoPlano {
  contribuyenteId: string;
  periodo: string;
  cuo?: string;
  fechaOperacion: string;
  glosa: string;
  codigoLibroTabla8: string;
  numeroCorrelativoSustentatorio?: string;
  numeroDocumentoSustentatorio?: string;
  sireRegistroId?: string | null;
  estadoAsiento?: EstadoAsiento;
  tipoLibro?: "DIARIO_MANUAL" | "DIARIO_COMPRAS" | "DIARIO_VENTAS";
  tipoRegistro?: "COMPRA" | "VENTA";
  lineas: AsientoLinea[];
}

export interface Formato51Row {
  cuo: string;
  correlativoLinea: number;
  fechaOperacion: string;
  glosa: string;
  codigoLibroTabla8: string;
  numeroCorrelativoSustentatorio: string | null;
  numeroDocumentoSustentatorio: string | null;
  cuentaCodigo: string;
  cuentaDenominacion: string;
  debe: number;
  haber: number;
  estadoAsiento: string;
  sireRegistroId: string | null;
}

export interface Formato51Result {
  contribuyenteId: string;
  periodo: string;
  formato: "5.1";
  filas: Formato51Row[];
  totalDebe: number;
  totalHaber: number;
  cuadrado: boolean;
  generadoAt: string;
}

export interface Formato52MatrizRow {
  fechaOperacion: string;
  mes: string;
  activo: Record<string, number>;
  pasivo: Record<string, number>;
  patrimonio: Record<string, number>;
  gastos: Record<string, number>;
  ingresos: Record<string, number>;
}

export interface Formato52Result {
  contribuyenteId: string;
  periodo: string;
  formato: "5.2";
  tabla9: {
    activo: string[];
    pasivo: string[];
    patrimonio: string[];
    gastos: string[];
    ingresos: string[];
  };
  filas: Formato52MatrizRow[];
  generadoAt: string;
}

export interface FiltrosLibroDiario {
  cuo?: string;
  cuentaCodigo?: string;
  soloCuadrados?: boolean;
}

export interface GenerarAsientoResult {
  ok: boolean;
  cuo: string;
  contribuyenteId: string;
  comprobanteId: string;
  tipoOrigen: string;
  lineasGeneradas: number;
}

export const TABLA9_COLUMNAS = {
  activo: ["10", "12", "16", "20", "21", "33", "34", "38", "39"],
  pasivo: ["4011D", "4011C", "4017D", "4017C", "402", "42", "46"],
  patrimonio: ["50", "58", "59"],
  gastos: ["60", "61", "62", "63", "65", "66", "67", "68", "69", "96", "97"],
  ingresos: ["70", "75", "76", "77", "79"],
} as const;

export const TIPO_CUENTA_COLORS: Record<TipoCuentaPcge, string> = {
  ACTIVO: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  PASIVO: "border-red-500/40 bg-red-500/10 text-red-300",
  PATRIMONIO: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  GASTOS: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  INGRESOS: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  ORDEN: "border-slate-500/40 bg-slate-500/10 text-slate-400",
};
