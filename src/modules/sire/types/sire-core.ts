export type SireTipoRegistro = "RVIE" | "RCE";

export type SireOrigenRegistro =
  | "SUNAT_PROPUESTA"
  | "AJUSTE_POSTERIOR"
  | "REEMPLAZO";

export type SireEstadoPeriodo =
  | "PENDIENTE"
  | "SINCRONIZADO"
  | "CON_INCONSISTENCIAS"
  | "VACIO"
  | "ERROR";

export type SireSeveridadInconsistencia = "ALERTA" | "ERROR_BLOQUEANTE";

export type SireCodigoLibro = "140400" | "130400";

/** Origen de los datos tras sincronizar con sire-sync Edge Function */
export type SireFuenteSync =
  | "SUNAT_DIRECTO"
  | "DECOLECTA"
  | "SIMULACION"
  | "ERROR_CONFIGURACION"
  | "ERROR_API_EXTERNA";

/** Modelo unificado cabecera + montos (estructura normalizada ADR-003) */
export interface SireComprobanteModel {
  id: string;
  contribuyenteId: string | null;
  periodoId: string | null;
  periodo: string;
  tipoRegistro: SireTipoRegistro;
  origen: SireOrigenRegistro;
  rucContraparte: string | null;
  razonSocialContraparte: string | null;
  tipoComprobante: string;
  serie: string | null;
  numero: string;
  fechaEmision: string;
  fechaVencimiento: string | null;
  moneda: string;
  tipoCambio: number;
  baseImponibleGravada: number;
  igvIpm: number;
  baseImponibleDgng: number;
  igvDgng: number;
  valorNoGravado: number;
  isc: number;
  icbper: number;
  otrosTributos: number;
  totalComprobante: number;
}

/** @deprecated Use SireComprobanteModel — alias retrocompatible */
export type SireComprobanteCabecera = SireComprobanteModel;

export interface SireEstadoFuentePeriodo {
  contribuyenteId: string;
  periodo: string;
  fuente: SireFuenteSync | "PENDIENTE" | "DESCONOCIDO";
  fechaSincronizacion: string | null;
  ultimoError: string | null;
  esSimulacionDetectada: boolean;
}

export interface SirePeriodo {
  id: string;
  contribuyenteId: string;
  periodo: string;
  estadoRvie: SireEstadoPeriodo;
  estadoRce: SireEstadoPeriodo;
  totalVentasSoles: number;
  totalComprasSoles: number;
  fechaSincronizacion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SireInconsistencia {
  id: string;
  periodoId: string;
  tipoRegistro: SireTipoRegistro;
  comprobanteRef: string | null;
  descripcionError: string;
  severidad: SireSeveridadInconsistencia;
  resuelto: boolean;
}

export interface SireResumenPeriodo {
  contribuyenteId: string;
  ruc: string;
  periodo: string;
  periodoId: string | null;
  rvie: {
    estado: SireEstadoPeriodo;
    cantidadComprobantes: number;
    baseImponible: number;
    igv: number;
    total: number;
  };
  rce: {
    estado: SireEstadoPeriodo;
    cantidadComprobantes: number;
    baseImponible: number;
    igv: number;
    total: number;
  };
  inconsistencias: {
    alertas: number;
    erroresBloqueantes: number;
    total: number;
  };
  fechaSincronizacion: string | null;
}

export interface SireSyncRequest {
  contribuyenteId: string;
  periodo: string;
  tipoRegistro: SireTipoRegistro;
}

export interface SireSyncResponse {
  ok: boolean;
  contribuyenteId: string;
  periodo: string;
  tipoRegistro: SireTipoRegistro;
  insertados: number;
  actualizados: number;
  inconsistencias: number;
  periodoId: string;
  fuente: SireFuenteSync;
  error?: string | null;
  httpStatus?: number | null;
  detalle?: string | null;
  advertenciaSimulacion?: string | null;
  advertenciaFallback?: string | null;
  comprobantesRecibidos?: number;
}

export class SireSyncError extends Error {
  readonly fuente: SireFuenteSync;
  readonly httpStatus?: number;
  readonly detalle?: string | null;
  readonly insertados: number;
  readonly actualizados: number;

  constructor(
    message: string,
    options: {
      fuente?: SireFuenteSync;
      httpStatus?: number;
      detalle?: string | null;
      insertados?: number;
      actualizados?: number;
    } = {},
  ) {
    super(message);
    this.name = "SireSyncError";
    this.fuente = options.fuente ?? "ERROR_API_EXTERNA";
    this.httpStatus = options.httpStatus;
    this.detalle = options.detalle ?? null;
    this.insertados = options.insertados ?? 0;
    this.actualizados = options.actualizados ?? 0;
  }

  static fromPayload(payload: Record<string, unknown>, fallbackMessage?: string): SireSyncError {
    const fuente = String(payload.fuente ?? "ERROR_API_EXTERNA") as SireFuenteSync;
    const message = String(payload.error ?? fallbackMessage ?? "Sincronización SIRE fallida");
    return new SireSyncError(message, {
      fuente,
      httpStatus: payload.httpStatus != null ? Number(payload.httpStatus) : undefined,
      detalle: payload.detalle != null ? String(payload.detalle) : null,
      insertados: Number(payload.insertados ?? 0),
      actualizados: Number(payload.actualizados ?? 0),
    });
  }
}

export interface SireTxtGenerado {
  nombreArchivo: string;
  contenido: string;
  codigoLibro: SireCodigoLibro;
  periodo: string;
  ruc: string;
  esSinMovimiento: boolean;
}

export interface SireComprobanteApiPayload {
  ruc_contraparte?: string;
  razon_social_contraparte?: string;
  tipo_comprobante?: string;
  serie?: string;
  numero?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  moneda?: string;
  tipo_cambio?: number;
  base_imponible_gravada?: number;
  igv_ipm?: number;
  base_imponible_dgng?: number;
  igv_dgng?: number;
  valor_no_gravado?: number;
  isc?: number;
  icbper?: number;
  otros_tributos?: number;
  total_comprobante?: number;
  origen?: SireOrigenRegistro;
}
