export type AccionAuditoria =
  | "CREAR"
  | "MODIFICAR"
  | "ELIMINAR"
  | "APROBAR"
  | "ANULAR"
  | "EXPORTAR";

export type SeveridadAuditoria = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface DiffCampo {
  old: unknown;
  new: unknown;
}

export interface AuditoriaRegistro {
  id: string;
  userId: string | null;
  usuarioEmail?: string;
  usuarioNombre?: string;
  tablaAfectada: string;
  registroId: string;
  modulo: string;
  rucAfectado?: string;
  periodoAfectado?: string;
  accion: AccionAuditoria | string;
  operacion?: string;
  detalleJsonb?: Record<string, unknown>;
  diffJsonb?: Record<string, DiffCampo>;
  ipAddress?: string;
  userAgent?: string;
  severity: SeveridadAuditoria | string;
  createdAt: string;
}

export interface AuditoriaFilters {
  modulo?: string;
  accion?: string;
  ruc?: string;
  periodo?: string;
  userId?: string;
  severity?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  pagina?: number;
  limit?: number;
}

export interface ActividadResumen {
  modulo: string;
  accion: string;
  totalOperaciones: number;
  usuariosUnicos: number;
  rucsUnicos: number;
  ultimaActividad: string;
}

export interface AuditoriaDashboardStats {
  accionesHoy: number;
  usuariosActivos: number;
  alertasActivas: number;
  modulosActivos: number;
  estadoSistema: "NORMAL" | "ATENCION" | "CRITICO";
}

export interface AlertaAuditoria {
  id: string;
  tipo: string;
  severidad: string;
  titulo: string;
  descripcion: string;
  modulo?: string;
  userId?: string;
  usuarioNombre?: string;
  rucAfectado?: string;
  detalles?: Record<string, unknown>;
  resuelta: boolean;
  createdAt: string;
}

export interface AuditoriaResumenUsuario {
  total: number;
  porModulo: Record<string, number>;
  porAccion: Record<string, number>;
}

export interface DistribucionAcciones {
  CREAR: number;
  MODIFICAR: number;
  ELIMINAR: number;
  APROBAR: number;
  ANULAR: number;
  EXPORTAR: number;
}
