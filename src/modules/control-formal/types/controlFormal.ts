export type TipoLlevadoLibro =
  | "MANUAL"
  | "HOJAS_SUELTAS"
  | "HOJAS_CONTINUAS"
  | "ELECTRONICO_SIRE";

export type MotivoContingencia =
  | "PERDIDA"
  | "DESTRUCCION"
  | "SINIESTRO"
  | "ASALTO"
  | "OTRO";

export type EstadoContingenciaSunat =
  | "PENDIENTE_DENUNCIAR"
  | "DENUNCIADO_POLICIA"
  | "COMUNICADO_SUNAT"
  | "EN_RECONSTRUCCION"
  | "RECONSTRUIDO";

export type EstadoFolio = "DISPONIBLE" | "IMPRESO" | "ANULADO" | "RESERVADO";

export type SemaforoColor = "VERDE" | "AMARILLO" | "ROJO";

export interface LibroAfectado {
  codigoLibroTabla8: string;
  nombreLibro: string;
  foliosAfectados?: string;
  observaciones?: string;
}

export interface LegalizacionNotarial {
  id: string;
  contribuyenteId: string;
  codigoLibroTabla8: string;
  nombreLibro: string;
  numeroLegalizacion: string;
  notariaJuzgado: string;
  fechaLegalizacion: string;
  foliosDesde: number;
  foliosHasta: number;
  tipoLlevado: TipoLlevadoLibro;
  estado: "ACTIVO" | "CONCLUIDO" | "ANULADO";
  totalFolios: number;
  foliosUtilizados: number;
  porcentajeUtilizado: number;
  createdAt: string;
  updatedAt: string;
}

export interface ControlFolio {
  id: string;
  legalizacionId: string;
  numeroFolio: number;
  estadoFolio: EstadoFolio;
  periodoAsociado: string | null;
  fechaUso: string | null;
  createdAt: string;
}

export interface ContingenciaLibro {
  id: string;
  contribuyenteId: string;
  fechaOcurrencia: string;
  fechaDenunciaPolicial: string | null;
  numeroDenunciaPolicial: string | null;
  comisaria: string | null;
  motivo: MotivoContingencia;
  librosAfectados: LibroAfectado[];
  fechaLimiteComunicacion15d: string;
  fechaComunicacionSunat: string | null;
  numeroExpedienteSunat: string | null;
  fechaLimiteReconstruccion60d: string;
  fechaFinalizacionReconstruccion: string | null;
  prorrogaSolicitada: boolean;
  fechaSolicitudProrroga: string | null;
  estadoContingencia: EstadoContingenciaSunat;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SemaforoAlerta {
  contingenciaId: string;
  motivo: MotivoContingencia;
  estado: EstadoContingenciaSunat;
  fechaOcurrencia: string;
  fechaLimiteComunicacion: string;
  fechaLimiteReconstruccion: string;
  fechaComunicacionSunat: string | null;
  fechaFinalizacionReconstruccion: string | null;
  numeroDenunciaPolicial: string | null;
  librosAfectados: LibroAfectado[];
  diasHabilesTranscurridos: number | null;
  diasRestantesComunicacion: number | null;
  diasRestantesReconstruccion: number | null;
  semaforo: SemaforoColor;
  fechaLimite: string;
}

export interface SemaforoContingenciasResult {
  contribuyenteId: string;
  fechaEvaluacion: string;
  resumen: {
    totalActivas: number;
    rojas: number;
    amarillas: number;
    verdes: number;
  };
  alertas: SemaforoAlerta[];
}

export interface PlantillaComunicacionSunat {
  titulo: string;
  cuerpoTexto: string;
  cuerpoHtml: string;
  fechaGeneracion: string;
}

export interface RegistrarContingenciaPayload {
  contribuyenteId: string;
  fechaOcurrencia: string;
  motivo: MotivoContingencia;
  librosAfectados: LibroAfectado[];
  numeroDenunciaPolicial?: string;
  comisaria?: string;
  observaciones?: string;
}

export interface RegistrarContingenciaResult {
  ok: boolean;
  contingenciaId: string;
  fechaLimiteComunicacion15d: string;
  fechaLimiteReconstruccion60d: string;
  estadoContingencia: EstadoContingenciaSunat;
}

export const TIPO_LLEVADO_LABELS: Record<TipoLlevadoLibro, string> = {
  MANUAL: "Manual",
  HOJAS_SUELTAS: "Hojas sueltas",
  HOJAS_CONTINUAS: "Hojas continuas",
  ELECTRONICO_SIRE: "Electrónico SIRE",
};

export const MOTIVO_CONTINGENCIA_LABELS: Record<MotivoContingencia, string> = {
  PERDIDA: "Pérdida",
  DESTRUCCION: "Destrucción",
  SINIESTRO: "Siniestro",
  ASALTO: "Asalto / Robo",
  OTRO: "Otro",
};

export const ESTADO_CONTINGENCIA_LABELS: Record<EstadoContingenciaSunat, string> = {
  PENDIENTE_DENUNCIAR: "Pendiente denunciar",
  DENUNCIADO_POLICIA: "Denunciado en comisaría",
  COMUNICADO_SUNAT: "Comunicado a SUNAT",
  EN_RECONSTRUCCION: "En reconstrucción",
  RECONSTRUIDO: "Reconstruido",
};

export const SEMAFORO_COLORS: Record<SemaforoColor, string> = {
  VERDE: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
  AMARILLO: "border-amber-500/50 bg-amber-500/15 text-amber-300",
  ROJO: "border-red-500/50 bg-red-500/15 text-red-300",
};

export const LIBROS_TABLA8_COMUNES = [
  { codigo: "010100", nombre: "Libro Caja y Bancos" },
  { codigo: "050100", nombre: "Libro Diario" },
  { codigo: "050200", nombre: "Libro Diario Simplificado" },
  { codigo: "130400", nombre: "Registro de Compras" },
  { codigo: "140400", nombre: "Registro de Ventas" },
  { codigo: "080100", nombre: "Libro de Inventarios y Balances" },
];
