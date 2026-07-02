/** Tipos del módulo Tareas Pendientes. */

export type TareaEstado = "pendiente" | "en_progreso" | "completada" | "cancelada";
export type TareaPrioridad = "baja" | "media" | "alta" | "urgente";
export type TareaModuloOrigen =
  | "general"
  | "sire"
  | "asientos"
  | "caja"
  | "pcge"
  | "contribuyentes";

export type TareaPendiente = {
  id: string;
  ruc?: string | null;
  razon_social?: string | null;
  entidad: string;
  tramite: string;
  titulo?: string | null;
  descripcion?: string | null;
  fecha_tramitar?: string | null;
  problema?: string | null;
  plazo_vencimiento?: string | null;
  critica: boolean;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  modulo_origen: TareaModuloOrigen;
  referencia_id?: string | null;
  usuario_id?: string | null;
  asignado_a?: string | null;
  fecha_completada?: string | null;
  vencida?: boolean;
  dias_restantes?: number | null;
  hash_deduplicacion?: string | null;
  generada_automaticamente?: boolean;
  regla_generadora?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export type CrearTareaDTO = {
  ruc?: string | null;
  entidad: string;
  tramite: string;
  titulo?: string | null;
  descripcion?: string | null;
  fecha_tramitar?: string | null;
  problema?: string | null;
  plazo_vencimiento?: string | null;
  critica?: boolean;
  prioridad?: TareaPrioridad;
  modulo_origen?: TareaModuloOrigen;
  referencia_id?: string | null;
  asignado_a?: string | null;
  hash_deduplicacion?: string | null;
  generada_automaticamente?: boolean;
  regla_generadora?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ActualizarTareaDTO = Partial<CrearTareaDTO> & {
  estado?: TareaEstado;
};

export type TareasEstadisticas = {
  total: number;
  pendientes: number;
  en_progreso: number;
  completadas: number;
  canceladas: number;
  criticas: number;
  vencidas: number;
  por_modulo: Record<string, number>;
};

export type TareasFiltros = {
  ruc?: string | null;
  estado?: TareaEstado | "todos";
  prioridad?: TareaPrioridad | "todos";
  modulo_origen?: TareaModuloOrigen | "todos";
  critica?: boolean | null;
  busqueda?: string | null;
  orden?: "plazo" | "prioridad" | "reciente";
};
