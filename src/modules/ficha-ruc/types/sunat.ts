export type SunatDataSource = "API_SUNAT" | "CACHE_LOCAL" | "DATOS_SIMULADOS" | "DATOS_SIRE";

export interface SunatRucResponse {
  success: boolean;
  data?: SunatRucData;
  error?: string;
  metadata: {
    timestamp: string;
    source: SunatDataSource;
    cacheAge?: number;
    consultasRestantes?: number;
  };
}

export interface SunatRucData {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoContribuyente: "PERSONA_NATURAL" | "SOCIEDAD_ANONIMA" | "SOCIEDAD_COMERCIAL" | "OTRO";
  estadoContribuyente: "ACTIVO" | "SUSPENSION_TEMPORAL" | "BAJA_DEFINITIVA" | "NO_HALLADO";
  condicionDomicilioFiscal?: string;
  fechaInscripcion: string;
  fechaInicioActividades: string;
  actividadEconomicaPrincipal: { codigo: string; descripcion: string };
  actividadesEconomicasSecundarias: Array<{ codigo: string; descripcion: string }>;
  domicilioFiscal: {
    direccion: string;
    departamento: string;
    provincia: string;
    distrito: string;
    ubigeo: string;
  };
  representantesLegales: Array<{
    nombre: string;
    cargo: string;
    fechaDesde: string;
    tipoDocumento: string;
    numeroDocumento: string;
  }>;
  tributosAfectos: Array<{ codigo: string; descripcion: string; desde: string }>;
  establecimientos: Array<{
    codigo: string;
    tipo: string;
    direccion: string;
    departamento: string;
    provincia: string;
    distrito: string;
  }>;
  comprobantesEmitidos?: Array<{
    tipo: string;
    serie: string;
    numeroInicial: string;
    numeroFinal?: string;
  }>;
  fechaActualizacion: string;
}

export interface RucValidation {
  esValido: boolean;
  ruc: string;
  digitoVerificador: number;
  digitoVerificadorCalculado: number;
  errores: string[];
  warnings: string[];
}

export interface FichaRucMeta {
  datosIncompletos?: boolean;
  fuenteDatos?: string;
  ultimaActualizacion?: string | null;
  ultimaActividad?: string | null;
  cantidadComprobantes?: number;
  totalCompras12m?: number;
  totalVentas12m?: number;
  estadoActualizacion?: string;
}

export interface ContribuyenteDashboard360 {
  ruc: string;
  periodo: string;
  comprasAnio: number;
  ventasAnio: number;
  comprobantesCompra: number;
  comprobantesVenta: number;
  ratioComercial: number;
  ratioSalud: "SALUDABLE" | "ATENCION" | "RIESGOSO";
  sparklineCompras: number[];
  sparklineVentas: number[];
  tendenciaComprasPct: number;
  tendenciaVentasPct: number;
  ultimosComprobantes: Array<{
    id: string;
    fecha: string;
    tipo: string;
    comprobante: string;
    monto: number;
    estado: string;
  }>;
  actividadMensual: Array<{ mes: string; compras: number; ventas: number }>;
  saldoCxc: number;
  saldoCxp: number;
  movimientosCajaRecientes: Array<{
    id: string;
    fecha: string;
    glosa: string;
    neto: number;
  }>;
  tareasPendientes: number;
}

export interface ContribuyenteBusqueda {
  ruc: string;
  razonSocial: string;
  estadoContribuyente: string;
  fuenteDatos?: string;
}

export interface ComparacionContribuyentes {
  ruc1: string;
  ruc2: string;
  ficha1: import("@/lib/contribuyentes-types").FichaRuc | null;
  ficha2: import("@/lib/contribuyentes-types").FichaRuc | null;
  dashboard1: ContribuyenteDashboard360 | null;
  dashboard2: ContribuyenteDashboard360 | null;
  diferencias: Array<{ campo: string; valor1: string; valor2: string }>;
}
