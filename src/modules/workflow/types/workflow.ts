export type PasoEstado = "COMPLETADO" | "EN_PROGRESO" | "PENDIENTE" | "BLOQUEADO";

export type AlertaSeveridad = "INFO" | "ADVERTENCIA" | "BLOQUEANTE";

export interface PasoStatus {
  pasoNumero: number;
  titulo: string;
  descripcion: string;
  estado: PasoEstado;
  rutaModulo: string;
}

export interface AlertaFlujo {
  id: string;
  severidad: AlertaSeveridad;
  mensaje: string;
  accionTexto: string;
  accionRuta: string;
  pasoRelacionado: number;
}

export interface MetricasFlujoPeriodo {
  rcePendientesProvision: number;
  rviePendientesProvision: number;
  comprasPendientesTesoreria: number;
  ventasPendientesTesoreria: number;
  inconsistenciasSireBloqueantes: number;
  inconsistenciasSireAlertas: number;
  totalAsientosDiario: number;
  sumaDebe: number;
  sumaHaber: number;
  regimenTributario: string | null;
  estadoRvie: string | null;
  estadoRce: string | null;
}

export interface PeriodoCierreStatus {
  pasoActual: number;
  paso1RucOk: boolean;
  paso2SireOk: boolean;
  paso3ProvisionOk: boolean;
  paso4CajaOk: boolean;
  paso5LibrosCerrados: boolean;
  observaciones: Record<string, unknown>;
}

export interface EstadoFlujoPeriodoResponse {
  contribuyenteId: string;
  periodo: string;
  porcentajeAvance: number;
  pasoSugerido: number;
  pasos: PasoStatus[];
  alertas: AlertaFlujo[];
  diarioCuadrado: boolean;
  metricas: MetricasFlujoPeriodo;
  periodoCierre: PeriodoCierreStatus;
}

export type VistaFlujoGuard =
  | "libro-mayor"
  | "libro-diario"
  | "contabilidad"
  | "tesoreria"
  | "workflow";

export const WORKFLOW_PASOS_META: ReadonlyArray<{
  pasoNumero: number;
  titulo: string;
  descripcion: string;
  rutaModulo: string;
}> = [
  {
    pasoNumero: 1,
    titulo: "Configuración & Ficha RUC",
    descripcion: "Verifique régimen tributario y libros obligatorios.",
    rutaModulo: "/ficha-ruc",
  },
  {
    pasoNumero: 2,
    titulo: "Sincronización SIRE",
    descripcion: "Descarga RVIE (140400) y RCE (130400).",
    rutaModulo: "/sire-sync",
  },
  {
    pasoNumero: 3,
    titulo: "Provisión & Libro Diario",
    descripcion: "Asientos PCGE Formatos 5.1 / 5.2.",
    rutaModulo: "/contabilidad",
  },
  {
    pasoNumero: 4,
    titulo: "Tesorería, Caja & Bancos",
    descripcion: "Cobros, pagos y detracciones.",
    rutaModulo: "/tesoreria",
  },
  {
    pasoNumero: 5,
    titulo: "Emisión de Libros & Cierre",
    descripcion: "Libro Mayor F 6.1 y Balance de Comprobación.",
    rutaModulo: "/libro-mayor",
  },
] as const;

export const PASO_ESTADO_COLORS: Record<PasoEstado, string> = {
  COMPLETADO: "border-emerald-500/60 bg-emerald-500/15 text-emerald-300",
  EN_PROGRESO: "border-yellow-400/70 bg-yellow-400/10 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.25)]",
  PENDIENTE: "border-slate-600/60 bg-slate-800/40 text-slate-400",
  BLOQUEADO: "border-slate-700/80 bg-slate-950/60 text-slate-500",
};

export const ALERTA_SEVERIDAD_COLORS: Record<AlertaSeveridad, string> = {
  INFO: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  ADVERTENCIA: "border-amber-500/50 bg-amber-500/10 text-amber-200",
  BLOQUEANTE: "border-red-500/60 bg-red-950/40 text-red-200",
};
