export type NotificacionTipo =
  | "TAREA_ASIGNADA"
  | "TAREA_VENCIDA"
  | "VENCIMIENTO_PROXIMO"
  | "CIERRE_PERIODO"
  | "ALERTA_SISTEMA"
  | "MENSAJE_ADMIN";

export interface NotificacionCorreo {
  id: string;
  user_id: string;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  metadata: {
    tareaId?: string;
    ruc?: string;
    periodo?: string;
    modulo?: string;
    linkNavegacion?: string;
    prioridad?: string;
  };
}

export interface PreferenciasNotificacion {
  userId: string;
  notificacionesInApp: boolean;
  notificacionesCorreo: boolean;
  frecuenciaCorreo: "instantaneo" | "diario" | "semanal";
  horasSilencio: { inicio: string; fin: string } | null;
  modulosActivos: string[];
  prioridadMinima: "CRITICA" | "ALTA" | "MEDIA" | "BAJA";
}

export const DEFAULT_PREFERENCIAS: Omit<PreferenciasNotificacion, "userId"> = {
  notificacionesInApp: true,
  notificacionesCorreo: false,
  frecuenciaCorreo: "diario",
  horasSilencio: null,
  modulosActivos: ["SIRE", "DIARIO", "CAJA", "TAREAS"],
  prioridadMinima: "MEDIA",
};
