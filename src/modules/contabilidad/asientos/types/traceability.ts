/** Tipos del sistema de trazabilidad contable end-to-end. */

export type TraceabilityNodeType =
  | "SIRE_REGISTRO"
  | "PROVISION"
  | "MOVIMIENTO_CAJA"
  | "CANCELACION"
  | "CENTRALIZACION"
  | "REVERSION";

export type TraceabilityNodeEstado =
  | "completado"
  | "pendiente"
  | "en_proceso"
  | "revertido"
  | "error";

export type TraceabilityEdgeType =
  | "GENERA"
  | "PAGA"
  | "CANCELA"
  | "REVIERTE"
  | "AGRUPA"
  | "REFERENCIA";

export type IntegrityIssueType =
  | "PARTIDA_DOBLE"
  | "HUERFANO"
  | "MONTOS_DIVERGENTES"
  | "FECHA_INCONSISTENTE"
  | "CUENTA_INVALIDA"
  | "ESLABON_ROTO"
  | "ESTADO_INCONSISTENTE";

export type IntegritySeverity = "CRITICAL" | "ERROR" | "WARNING" | "INFO";

export interface AsientoLineaTrazabilidad {
  cuentaCodigo: string;
  cuentaDenominacion: string;
  debe: number;
  haber: number;
  naturaleza: "D" | "A";
}

export interface TraceabilityNodeMetadata {
  tipoComprobante?: string;
  serie?: string;
  numero?: string;
  rucContraparte?: string;
  nombreContraparte?: string;
  asientoId?: string;
  lineasContables?: AsientoLineaTrazabilidad[];
  cuentaPrincipal?: string;
  movimientoId?: string;
  cuentaFinanciera?: string;
  tipoMovimiento?: string;
  origenDocumento?: string;
  cantidadMovimientos?: number;
  periodoCentralizado?: string;
  linkNavegacion?: string;
}

export interface TraceabilityNode {
  id: string;
  type: TraceabilityNodeType;
  fecha: string;
  fechaFormateada: string;
  titulo: string;
  descripcion: string;
  monto: number;
  moneda: string;
  estado: TraceabilityNodeEstado;
  metadata: TraceabilityNodeMetadata;
  nodoAnterior?: string;
  nodoSiguiente?: string;
  nodosParalelos?: string[];
}

export interface TraceabilityEdge {
  from: string;
  to: string;
  type: TraceabilityEdgeType;
  label?: string;
  montoRelacionado?: number;
}

export interface IntegrityIssue {
  id: string;
  tipo: IntegrityIssueType;
  severidad: IntegritySeverity;
  descripcion: string;
  detalle: string;
  nodosAfectados: string[];
  sugerenciaCorreccion?: string;
  correccionAutomatica?: boolean;
}

export interface TraceabilityChainResumen {
  estadoActual: string;
  montoOriginal: number;
  montoProvisionado: number;
  montoPagado: number;
  montoPendiente: number;
  porcentajeCompletado: number;
  fechaCreacion: string;
  fechaProvision?: string;
  fechaPago?: string;
  diasTranscurridos: number;
  diasHastaPago?: number;
  tieneErrores: boolean;
  erroresDetectados: IntegrityIssue[];
}

export interface TraceabilityChain {
  id: string;
  ruc: string;
  periodo: string;
  nodoOrigen: TraceabilityNode;
  nodos: TraceabilityNode[];
  aristas: TraceabilityEdge[];
  resumen: TraceabilityChainResumen;
  metadata: {
    fechaConsulta: string;
    usuarioConsulta: string;
    tiempoConstruccion: number;
    fuentesConsultadas: string[];
  };
}

export interface ResumenTrazabilidad {
  sireRegistroId: string;
  comprobante: string;
  tipo: string;
  estadoActual: string;
  montoTotal: number;
  montoPendiente: number;
  diasTranscurridos: number;
  tieneErrores: boolean;
}
