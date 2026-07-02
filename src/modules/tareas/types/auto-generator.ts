import type { TareaModuloOrigen, TareaPrioridad } from "@/types/tareas";

export type ReglaModulo = "SIRE" | "DIARIO" | "CAJA" | "CXC_CXP" | "GENERAL";
export type ReglaPrioridad = "CRITICA" | "ALTA" | "MEDIA" | "BAJA";

export interface SireResumen {
  id: string;
  ruc: string;
  razonSocial: string;
  periodo: string;
  tipo: string;
  codTipoCdp: string;
  serie: string;
  numero: string;
  fechaEmision: string;
  fechaVencimiento: string | null;
  montoTotal: number;
  tieneProvision: boolean;
  estadoCobro: string;
  estadoPago: string;
  diasDesdeEmision: number;
}

export interface AsientoPendiente {
  sireRegistroId: string | null;
  asientoIds: string[];
  debe: number;
  haber: number;
  descuadrado: boolean;
}

export interface MovimientoCajaResumen {
  ruc: string;
  periodo: string;
  cantidad: number;
  total: number;
}

export interface SaldoPendienteResumen {
  sireRegistroId: string;
  ruc: string;
  nombreContraparte: string;
  comprobante: string;
  tipo: "VENTA" | "COMPRA";
  saldoPendiente: number;
  diasAntiguedad: number;
}

export interface TareaExistente {
  id: string;
  hashDeduplicacion: string | null;
  estado: string;
  prioridad: TareaPrioridad;
  plazoVencimiento: string | null;
  titulo: string;
  vencida: boolean;
}

export interface SistemaContexto {
  fechaActual: Date;
  registrosSIRE: SireResumen[];
  asientosPendientes: AsientoPendiente[];
  movimientosCaja: MovimientoCajaResumen[];
  cxcCxp: SaldoPendienteResumen[];
  tareasExistentes: TareaExistente[];
  contribuyentesInactivos: { ruc: string; razonSocial: string; ultimaActividad: string | null }[];
  asientosDescuadrados: { asientoId: string; diff: number; ruc: string; periodo: string }[];
}

export interface NuevaTareaSugerida {
  titulo: string;
  descripcion: string;
  modulo: ReglaModulo;
  prioridad: ReglaPrioridad;
  ruc: string;
  periodo: string;
  fechaVencimiento: string;
  metadata: Record<string, unknown>;
  hashDeduplicacion: string;
  entidad: string;
  tramite: string;
  critica: boolean;
  moduloOrigen: TareaModuloOrigen;
  referenciaId?: string;
  reglaGeneradora: string;
}

export interface TareaGenerada {
  id: string;
  sugerida: NuevaTareaSugerida;
  accion: "creada" | "actualizada" | "omitida";
}

export interface EstadisticasGeneracion {
  periodo: string;
  totalGeneradas: number;
  totalAceptadas: number;
  totalRechazadas: number;
  porRegla: Record<string, number>;
  tasaFalsosPositivos: number;
}

export interface TareaRule {
  id: string;
  nombre: string;
  descripcion: string;
  modulo: ReglaModulo;
  prioridad: ReglaPrioridad;
  condicion: (contexto: SistemaContexto) => Promise<boolean> | boolean;
  generarTareas: (contexto: SistemaContexto) => NuevaTareaSugerida[];
  intervaloReevaluacion: number;
  activa: boolean;
}

export function reglaPrioridadToDb(p: ReglaPrioridad): TareaPrioridad {
  const map: Record<ReglaPrioridad, TareaPrioridad> = {
    CRITICA: "urgente",
    ALTA: "alta",
    MEDIA: "media",
    BAJA: "baja",
  };
  return map[p];
}

export function reglaModuloToDb(m: ReglaModulo): TareaModuloOrigen {
  const map: Record<ReglaModulo, TareaModuloOrigen> = {
    SIRE: "sire",
    DIARIO: "asientos",
    CAJA: "caja",
    CXC_CXP: "general",
    GENERAL: "general",
  };
  return map[m];
}

export function addBusinessDays(from: Date, days: number): string {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d.toISOString().slice(0, 10);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}
