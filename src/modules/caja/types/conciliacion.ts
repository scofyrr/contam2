export type BankFormat =
  | "BCP"
  | "BBVA"
  | "INTERBANK"
  | "SCOTIABANK"
  | "BANCO_NACION"
  | "GENERICO_SUNAT";

export interface BankStatementRow {
  id: string;
  fecha: string;
  fechaFormateada: string;
  descripcion: string;
  referencia: string;
  montoDebe: number;
  montoHaber: number;
  montoNeto: number;
  saldo: number;
  tipoOperacion: string;
  sucursal: string;
  moneda: string;
  rawData: Record<string, string>;
}

export interface MovimientoCajaConciliable {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  tipoMovimiento: "INGRESO" | "EGRESO";
  origenDocumento: string;
  numeroDocumento: string;
  cuentaFinancieraId: string;
  cuentaFinancieraNombre: string;
  cuentaContable: string;
  sireRegistroId?: string;
  asientoId?: string;
  conciliado: boolean;
}

export type NivelMatch = "EXACTO" | "PROBABLE" | "SUGERIDO" | "MANUAL";

export interface MatchedPair {
  id: string;
  extractoRow: BankStatementRow;
  movimientoSistema: MovimientoCajaConciliable;
  nivelMatch: NivelMatch;
  scoreSimilitud: number;
  diferencias: {
    monto?: number;
    fecha?: number;
    descripcion?: string;
  };
  confirmado: boolean;
  fechaMatch: string;
}

export interface ConciliacionResult {
  id: string;
  cuentaFinancieraId: string;
  cuentaFinancieraNombre: string;
  ruc: string;
  periodo: string;
  fechaConciliacion: string;
  estado: "EN_PROCESO" | "COMPLETADA" | "CON_DISCREPANCIAS";
  partidasConciliadas: MatchedPair[];
  partidasSugeridas: MatchedPair[];
  partidasSoloExtracto: BankStatementRow[];
  partidasSoloSistema: MovimientoCajaConciliable[];
  resumen: {
    totalExtractoIngresos: number;
    totalExtractoEgresos: number;
    totalExtractoNeto: number;
    totalSistemaIngresos: number;
    totalSistemaEgresos: number;
    totalSistemaNeto: number;
    diferenciaNeta: number;
    porcentajeConciliacion: number;
    partidasPendientes: number;
    montoPendienteConciliar: number;
  };
  metadata: {
    usuario: string;
    archivoOriginal: string;
    tiempoProcesamiento: number;
    totalFilasExtracto: number;
  };
}

export interface ConciliacionConfig {
  toleranciaMonto: number;
  toleranciaDiasExacto: number;
  toleranciaDiasProbable: number;
  toleranciaDiasSugerido: number;
  umbralSimilitudDescripcion: number;
  considerarFinesDeSemana: boolean;
  considerarFeriados: boolean;
  autoConfirmarExactos: boolean;
}

export const DEFAULT_CONCILIACION_CONFIG: ConciliacionConfig = {
  toleranciaMonto: 0.01,
  toleranciaDiasExacto: 1,
  toleranciaDiasProbable: 3,
  toleranciaDiasSugerido: 7,
  umbralSimilitudDescripcion: 0.8,
  considerarFinesDeSemana: true,
  considerarFeriados: false,
  autoConfirmarExactos: true,
};

export interface Anomalia {
  id: string;
  tipo: "DUPLICADO" | "MONTO_INUSUAL" | "SECUENCIA_SOSPECHOSA" | "HORARIO_NO_LABORAL" | "BENEFICIARIO_REPETIDO";
  severidad: "ALTA" | "MEDIA" | "BAJA";
  descripcion: string;
  movimientoIds: string[];
}

export interface ConciliacionResumen {
  id: string;
  fechaConciliacion: string;
  estado: string;
  porcentajeConciliacion: number;
  diferenciaNeta: number;
}

export interface LiquidezEmpresa {
  ruc: string;
  razonSocial: string;
  saldoTotal: number;
  saldoDisponible: number;
  porCobrar: number;
  porPagar: number;
  ratio: number;
  estadoSalud: "SALUDABLE" | "ATENCION" | "CRITICO";
  variacionMes: number;
  cuentas: { id: string; nombre: string; saldo: number; tipo: string }[];
  sparkline: number[];
}

export type AgrupacionCentralizacion = "cuenta" | "tipo" | "dia" | "origen";

export interface CentralizacionGrupo {
  grupoNombre: string;
  cuentaContable: string;
  cantidadMovimientos: number;
  totalIngresos: number;
  totalEgresos: number;
  montoNeto: number;
  asientoGeneradoId?: string | null;
}
