import { u as useQuery } from "./useQuery-yGnE4xdj.js";
import { ab as supabase, aq as useQueryClient, ar as useSession } from "./router-DdOnzL1Y.js";
import { U as reactExports, L as jsxRuntimeExports } from "./server-BtEtmoed.js";
const DEFAULT_ESTUDIO_CONFIG = {
  dashboard_contador: {
    widgets: {
      activos: ["kpis", "tareas_urgentes", "clientes", "carga_trabajo", "sugerencias", "logros", "actividad_reciente"],
      orden: ["kpis", "tareas_urgentes", "clientes", "carga_trabajo", "sugerencias", "logros", "actividad_reciente"]
    },
    kpis_visibles: ["clientes", "tareas", "vencidas", "efectividad", "racha"],
    max_tareas_urgentes: 5,
    max_clientes_grafico: 8,
    mostrar_gamificacion: true,
    mostrar_sugerencias: true,
    mostrar_actividad_reciente: true,
    intervalo_refresh_seg: 30
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
    horas_inactividad_inactivo: 72
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
    reducir_animaciones_global: false
  },
  notificaciones: {
    sonidos_habilitados_default: false,
    solo_sonidos_criticos: true,
    horas_silencio: { inicio: "22:00", fin: "07:00" },
    modulos_activos: ["SIRE", "CAJA", "TAREAS", "DIARIO"],
    prioridad_minima_default: "MEDIA",
    dias_retencion_notificaciones: 30,
    fab_solo_vencidas_hoy: true
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
      "/ficha-ruc"
    ],
    modulo_inicio: "/dashboard",
    mostrar_estadisticas_sire: true,
    mostrar_dashboard_estadisticas: true,
    mostrar_chat_ai: true,
    mostrar_lupa_accesibilidad: true,
    mostrar_cancelaciones: true
  },
  contenido: {
    mensaje_bienvenida: "Bienvenido a tu Centro de Operaciones",
    anuncios: [],
    meta_mensual_monto: 5e5,
    meta_mensual_activa: true,
    enlaces_rapidos: [
      { label: "Registrar comprobante", url: "/sire-registros", icono: "FilePlus" },
      { label: "Ver tareas pendientes", url: "/tareas", icono: "CheckSquare" },
      { label: "Libro caja", url: "/libro-caja", icono: "Wallet" }
    ]
  },
  tareas_auto: {
    reglas_activas: {
      sire_sin_provision: true,
      vencimiento_proximo: true,
      cxc_vencida: true,
      centralizar_caja: true,
      asiento_descadrado: true,
      contribuyente_inactivo: false,
      cierre_periodo: true
    },
    dias_anticipacion_vencimiento: 5,
    prioridad_default_nueva: "MEDIA",
    auto_asignar_por_ruc: true,
    permitir_snooze_horas: [1, 4, 24, 48]
  }
};
const CLAVES = [
  "dashboard_contador",
  "umbrales_contador",
  "colores_contador",
  "notificaciones_default",
  "sidebar_contador",
  "contenido_contador",
  "tareas_auto"
];
function mergeConfig(defaults, partial) {
  if (!partial || typeof partial !== "object") return defaults;
  return { ...defaults, ...partial };
}
async function fetchClave(clave) {
  const { data, error } = await supabase.rpc("rpc_get_config_estudio", { p_clave: clave });
  if (error) {
    const { data: row } = await supabase.from("config_estudio").select("valor").eq("clave", clave).maybeSingle();
    return row?.valor ?? null;
  }
  return data;
}
async function loadEstudioConfig() {
  try {
    const results = await Promise.all(CLAVES.map((k) => fetchClave(k)));
    const d = DEFAULT_ESTUDIO_CONFIG;
    return {
      dashboard_contador: mergeConfig(d.dashboard_contador, results[0]),
      umbrales: mergeConfig(d.umbrales, results[1]),
      colores: mergeConfig(d.colores, results[2]),
      notificaciones: mergeConfig(d.notificaciones, results[3]),
      sidebar: mergeConfig(d.sidebar, results[4]),
      contenido: mergeConfig(d.contenido, results[5]),
      tareas_auto: mergeConfig(d.tareas_auto, results[6])
    };
  } catch {
    return DEFAULT_ESTUDIO_CONFIG;
  }
}
async function loadFeatureFlags() {
  try {
    const { data, error } = await supabase.rpc("rpc_get_feature_flags", { p_scope: "global" });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [
      { codigo: "gamificacion_activa", nombre: "Gamificación", activo: true, descripcion: null },
      { codigo: "fab_alertas_dual", nombre: "FAB Alertas", activo: true, descripcion: null },
      { codigo: "mv_dashboard_stats", nombre: "MV Stats", activo: true, descripcion: null },
      { codigo: "chat_ia_contador", nombre: "Chat IA", activo: true, descripcion: null }
    ];
  }
}
function isFeatureActive(flags, codigo) {
  return flags.find((f) => f.codigo === codigo)?.activo ?? false;
}
async function updateConfigClave(clave, valor, descripcion) {
  const { data, error } = await supabase.rpc("rpc_update_config_estudio", {
    p_clave: clave,
    p_valor: valor,
    p_descripcion: null
  });
  if (error) throw error;
  return data === true;
}
async function toggleFeatureFlag(codigo, activo) {
  const { data, error } = await supabase.rpc("rpc_toggle_feature_flag", {
    p_codigo: codigo,
    p_activo: activo
  });
  if (error) throw error;
  return data === true;
}
const EstudioConfigOverrideContext = reactExports.createContext(null);
function EstudioConfigOverrideProvider({
  bundle,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EstudioConfigOverrideContext.Provider, { value: bundle, children });
}
function useEstudioConfigOverride() {
  return reactExports.useContext(EstudioConfigOverrideContext);
}
function useEstudioConfig() {
  const qc = useQueryClient();
  const override = useEstudioConfigOverride();
  const { user } = useSession();
  const query = useQuery({
    queryKey: ["estudio", "config"],
    queryFn: loadEstudioConfig,
    staleTime: 5 * 6e4,
    gcTime: 10 * 6e4,
    enabled: !!user?.id
  });
  const flagsQuery = useQuery({
    queryKey: ["estudio", "feature-flags"],
    queryFn: loadFeatureFlags,
    staleTime: 5 * 6e4,
    enabled: !!user?.id
  });
  const cfg = override ?? query.data ?? DEFAULT_ESTUDIO_CONFIG;
  const recargar = async () => {
    await qc.invalidateQueries({ queryKey: ["estudio"] });
  };
  return {
    dashboard_contador: cfg.dashboard_contador,
    umbrales: cfg.umbrales,
    colores: cfg.colores,
    notificaciones: cfg.notificaciones,
    sidebar: cfg.sidebar,
    contenido: cfg.contenido,
    tareas_auto: cfg.tareas_auto,
    featureFlags: flagsQuery.data ?? [],
    cargando: query.isLoading || flagsQuery.isLoading,
    error: query.error ? String(query.error) : flagsQuery.error ? String(flagsQuery.error) : null,
    recargar,
    isFeatureActive: (codigo) => isFeatureActive(flagsQuery.data ?? [], codigo)
  };
}
export {
  DEFAULT_ESTUDIO_CONFIG as D,
  EstudioConfigOverrideProvider as E,
  loadFeatureFlags as a,
  useEstudioConfig as b,
  loadEstudioConfig as l,
  toggleFeatureFlag as t,
  updateConfigClave as u
};
