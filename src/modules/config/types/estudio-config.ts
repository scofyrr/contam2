export interface DashboardContadorConfig {
  widgets: {
    activos: string[];
    orden: string[];
  };
  kpis_visibles: string[];
  max_tareas_urgentes: number;
  max_clientes_grafico: number;
  mostrar_gamificacion: boolean;
  mostrar_sugerencias: boolean;
  mostrar_actividad_reciente: boolean;
  intervalo_refresh_seg: number;
}

export interface UmbralesConfig {
  carga_baja: number;
  carga_alta: number;
  carga_critica: number;
  vencidas_criticas: number;
  dias_alerta_proxima: number;
  efectividad_meta: number;
  efectividad_excelente: number;
  racha_minima_logro: number;
  horas_inactividad_ausente: number;
  horas_inactividad_inactivo: number;
}

export interface ColoresConfig {
  acento: string;
  urgencia_vencida: string;
  urgencia_hoy: string;
  urgencia_semana: string;
  urgencia_normal: string;
  fab_visible: boolean;
  fab_posicion_default: string;
  pulse_en_vencidas: boolean;
  reducir_animaciones_global: boolean;
}

export interface NotificacionesDefaults {
  sonidos_habilitados_default: boolean;
  solo_sonidos_criticos: boolean;
  horas_silencio: { inicio: string; fin: string };
  modulos_activos: string[];
  prioridad_minima_default: string;
  dias_retencion_notificaciones: number;
  fab_solo_vencidas_hoy: boolean;
}

export interface SidebarConfig {
  modulos: string[];
  modulo_inicio: string;
  mostrar_estadisticas_sire: boolean;
  mostrar_dashboard_estadisticas: boolean;
  mostrar_chat_ai: boolean;
  mostrar_lupa_accesibilidad: boolean;
  mostrar_cancelaciones: boolean;
}

export interface ContenidoContadorConfig {
  mensaje_bienvenida: string;
  anuncios: Array<{ titulo: string; mensaje: string; prioridad: string; fecha_fin?: string }>;
  meta_mensual_monto: number;
  meta_mensual_activa: boolean;
  enlaces_rapidos: Array<{ label: string; url: string; icono: string }>;
}

export interface TareasAutoConfig {
  reglas_activas: Record<string, boolean>;
  dias_anticipacion_vencimiento: number;
  prioridad_default_nueva: string;
  auto_asignar_por_ruc: boolean;
  permitir_snooze_horas: number[];
}

export interface FeatureFlagRow {
  codigo: string;
  nombre: string;
  activo: boolean;
  descripcion: string | null;
}

export interface EstudioConfigBundle {
  dashboard_contador: DashboardContadorConfig;
  umbrales: UmbralesConfig;
  colores: ColoresConfig;
  notificaciones: NotificacionesDefaults;
  sidebar: SidebarConfig;
  contenido: ContenidoContadorConfig;
  tareas_auto: TareasAutoConfig;
}

export const DEFAULT_ESTUDIO_CONFIG: EstudioConfigBundle = {
  dashboard_contador: {
    widgets: {
      activos: ["kpis", "tareas_urgentes", "clientes", "carga_trabajo", "sugerencias", "logros", "actividad_reciente"],
      orden: ["kpis", "tareas_urgentes", "clientes", "carga_trabajo", "sugerencias", "logros", "actividad_reciente"],
    },
    kpis_visibles: ["clientes", "tareas", "vencidas", "efectividad", "racha"],
    max_tareas_urgentes: 5,
    max_clientes_grafico: 8,
    mostrar_gamificacion: true,
    mostrar_sugerencias: true,
    mostrar_actividad_reciente: true,
    intervalo_refresh_seg: 30,
  },
  umbrales: {
    carga_baja: 10,
    carga_alta: 25,
    carga_critica: 40,
    vencidas_criticas: 5,
    dias_alerta_proxima: 3,
    efectividad_meta: 90,
    efectividad_excelente: 95,
    racha_minima_logro: 7,
    horas_inactividad_ausente: 24,
    horas_inactividad_inactivo: 72,
  },
  colores: {
    acento: "#00D4FF",
    urgencia_vencida: "#FF0000",
    urgencia_hoy: "#FF6B00",
    urgencia_semana: "#FFB800",
    urgencia_normal: "#00D4FF",
    fab_visible: true,
    fab_posicion_default: "bottom-right",
    pulse_en_vencidas: true,
    reducir_animaciones_global: false,
  },
  notificaciones: {
    sonidos_habilitados_default: false,
    solo_sonidos_criticos: true,
    horas_silencio: { inicio: "22:00", fin: "07:00" },
    modulos_activos: ["SIRE", "CAJA", "TAREAS", "DIARIO"],
    prioridad_minima_default: "MEDIA",
    dias_retencion_notificaciones: 30,
    fab_solo_vencidas_hoy: true,
  },
  sidebar: {
    modulos: [
      "/dashboard",
      "/sire-registros",
      "/libro-diario",
      "/libro-mayor",
      "/workflow",
      "/libro-caja",
      "/pcge",
      "/contribuyentes",
      "/tareas",
      "/ficha-ruc",
    ],
    modulo_inicio: "/dashboard",
    mostrar_estadisticas_sire: true,
    mostrar_dashboard_estadisticas: true,
    mostrar_chat_ai: true,
    mostrar_lupa_accesibilidad: true,
    mostrar_cancelaciones: true,
  },
  contenido: {
    mensaje_bienvenida: "Bienvenido a tu Centro de Operaciones",
    anuncios: [],
    meta_mensual_monto: 500_000,
    meta_mensual_activa: true,
    enlaces_rapidos: [
      { label: "Registrar comprobante", url: "/sire-registros", icono: "FilePlus" },
      { label: "Ver tareas pendientes", url: "/tareas", icono: "CheckSquare" },
      { label: "Libro caja", url: "/libro-caja", icono: "Wallet" },
    ],
  },
  tareas_auto: {
    reglas_activas: {
      sire_sin_provision: true,
      vencimiento_proximo: true,
      cxc_vencida: true,
      centralizar_caja: true,
      asiento_descadrado: true,
      contribuyente_inactivo: false,
      cierre_periodo: true,
    },
    dias_anticipacion_vencimiento: 5,
    prioridad_default_nueva: "MEDIA",
    auto_asignar_por_ruc: true,
    permitir_snooze_horas: [1, 4, 24, 48],
  },
};
