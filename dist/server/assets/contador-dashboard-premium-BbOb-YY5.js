import { U as reactExports, L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { b as useEstudioConfig } from "./use-estudio-config-a6Rlcfnu.js";
import { aq as usePermissions, as as useSession } from "./router-BRL0s0LD.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import { T as TriangleAlert } from "./triangle-alert-B4GeD7-7.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { P as Progress } from "./progress-DofMlWtS.js";
import { c as contadorDashboardService, f as formatSoles } from "./use-admin-metrics-D4IAiCAl.js";
import { u as useQuery } from "./useQuery-CNpr8Hir.js";
import { S as Sparkles } from "./sparkles-Cqd5ml8U.js";
import { R as RefreshCw } from "./refresh-cw-CZfG2mto.js";
const __iconNode$2 = [
  [
    "path",
    {
      d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",
      key: "1slcih"
    }
  ]
];
const Flame = createLucideIcon("flame", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
      key: "q8bfy3"
    }
  ],
  ["path", { d: "M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14", key: "1853fq" }],
  ["path", { d: "M8 6v8", key: "15ugcq" }]
];
const Megaphone = createLucideIcon("megaphone", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Target = createLucideIcon("target", __iconNode);
const WIDGET_REGISTRY = {
  kpis: {
    component: reactExports.lazy(() => import("./kpi-cards-widget-CPpKDckA.js")),
    nombre: "KPIs Personales",
    descripcion: "Tarjetas con métricas clave: clientes, tareas, vencidas, efectividad",
    icono: "BarChart3",
    color: "#00D4FF",
    tamano: "full",
    permisosRequeridos: ["dashboard.leer"]
  },
  tareas_urgentes: {
    component: reactExports.lazy(() => import("./tareas-urgentes-widget-CkCq235o.js")),
    nombre: "Tareas Urgentes",
    descripcion: "Lista priorizada de tareas que requieren acción inmediata",
    icono: "AlertTriangle",
    color: "#FF0000",
    tamano: "large",
    permisosRequeridos: ["tareas.leer"]
  },
  clientes: {
    component: reactExports.lazy(() => import("./clientes-grafico-widget-DKpD0PIZ.js")),
    nombre: "Mis Clientes",
    descripcion: "Gráfico de barras con actividad por cliente asignado",
    icono: "Users",
    color: "#9B87F5",
    tamano: "medium",
    permisosRequeridos: ["contribuyentes.leer"],
    scopeRuc: true
  },
  carga_trabajo: {
    component: reactExports.lazy(() => import("./carga-trabajo-widget-zhcK6BV7.js")),
    nombre: "Carga de Trabajo",
    descripcion: "Heatmap semanal y tendencia de tareas",
    icono: "Calendar",
    color: "#F0A500",
    tamano: "medium",
    permisosRequeridos: ["tareas.leer"]
  },
  sugerencias: {
    component: reactExports.lazy(() => import("./sugerencias-widget-DotSjopL.js")),
    nombre: "Sugerencias Inteligentes",
    descripcion: "Recomendaciones automáticas basadas en carga de trabajo",
    icono: "Lightbulb",
    color: "#C8A95A",
    tamano: "large",
    permisosRequeridos: ["dashboard.leer"]
  },
  logros: {
    component: reactExports.lazy(() => import("./logros-widget-BJqGaM_s.js")),
    nombre: "Logros y Rachas",
    descripcion: "Gamificación: insignias y rachas de efectividad",
    icono: "Trophy",
    color: "#C8A95A",
    tamano: "small",
    permisosRequeridos: ["dashboard.leer"]
  },
  actividad_reciente: {
    component: reactExports.lazy(() => import("./actividad-reciente-widget-DmrhTYbr.js")),
    nombre: "Actividad Reciente",
    descripcion: "Timeline con últimas acciones del contador",
    icono: "Clock",
    color: "#00C897",
    tamano: "medium",
    permisosRequeridos: ["dashboard.leer"]
  },
  meta_mensual: {
    component: reactExports.lazy(() => import("./meta-mensual-widget-D2-gOquO.js")),
    nombre: "Meta Mensual",
    descripcion: "Progreso hacia la meta de facturación mensual del estudio",
    icono: "Target",
    color: "#C8A95A",
    tamano: "medium",
    permisosRequeridos: ["dashboard.leer"]
  },
  proximos_vencimientos: {
    component: reactExports.lazy(() => import("./proximos-vencimientos-widget-BLMnlF0w.js")),
    nombre: "Próximos Vencimientos",
    descripcion: "Timeline de obligaciones por vencer",
    icono: "CalendarClock",
    color: "#F0A500",
    tamano: "medium",
    permisosRequeridos: ["tareas.leer"],
    scopeRuc: true
  },
  enlaces_rapidos: {
    component: reactExports.lazy(() => import("./enlaces-rapidos-widget-TqTTAyLx.js")),
    nombre: "Enlaces Rápidos",
    descripcion: "Accesos directos configurables por el administrador",
    icono: "Link",
    color: "#00D4FF",
    tamano: "small",
    permisosRequeridos: ["dashboard.leer"]
  }
};
const WIDGET_SIZE_CLASSES = {
  small: "col-span-12 sm:col-span-6 lg:col-span-3",
  medium: "col-span-12 sm:col-span-6 lg:col-span-4",
  large: "col-span-12 lg:col-span-6",
  full: "col-span-12"
};
const WIDGET_SKELETON_HEIGHT = {
  small: "h-36",
  medium: "h-52",
  large: "h-64",
  full: "h-28"
};
function useDashboardWidgets() {
  const { dashboard_contador: config, isFeatureActive } = useEstudioConfig();
  const { tiene } = usePermissions();
  const widgetsActivos = reactExports.useMemo(() => {
    const { activos, orden } = config.widgets;
    return orden.filter((id) => activos.includes(id)).filter((id) => WIDGET_REGISTRY[id]).filter((id) => {
      const entry = WIDGET_REGISTRY[id];
      if (!entry.permisosRequeridos?.length) return true;
      return entry.permisosRequeridos.every((p) => tiene(p));
    }).filter((id) => {
      if (id === "sugerencias") {
        return config.mostrar_sugerencias && isFeatureActive("sugerencias_inteligentes");
      }
      if (id === "logros") {
        return config.mostrar_gamificacion && isFeatureActive("gamificacion_activa");
      }
      if (id === "actividad_reciente") {
        return config.mostrar_actividad_reciente;
      }
      return true;
    }).map((id, index) => ({
      ...WIDGET_REGISTRY[id],
      id,
      visible: true,
      orden: index
    }));
  }, [config, tiene, isFeatureActive]);
  const estaVisible = reactExports.useCallback(
    (widgetId) => widgetsActivos.some((w) => w.id === widgetId),
    [widgetsActivos]
  );
  return {
    widgets: widgetsActivos,
    kpisVisibles: config.kpis_visibles,
    refreshInterval: config.intervalo_refresh_seg,
    estaVisible,
    reordenar: () => {
    },
    toggleVisibilidad: () => {
    }
  };
}
const STORAGE_KEY = "contam_anuncios_vistos";
const PRIORIDAD_RANK = {
  CRITICA: 0,
  ALTA: 1,
  MEDIA: 2,
  BAJA: 3
};
function readVistos() {
  if (typeof window === "undefined") return /* @__PURE__ */ new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function writeVistos(ids) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}
function mapAnuncios(contenido) {
  return contenido.map((a, i) => ({
    id: `anuncio-${i}-${a.titulo.slice(0, 12)}`,
    titulo: a.titulo,
    mensaje: a.mensaje,
    prioridad: a.prioridad,
    fecha_fin: a.fecha_fin
  }));
}
function useAnunciosEstudio(anunciosRaw) {
  const [vistos, setVistos] = reactExports.useState(() => readVistos());
  const [indice, setIndice] = reactExports.useState(0);
  const anuncios = reactExports.useMemo(() => {
    const ahora = /* @__PURE__ */ new Date();
    return mapAnuncios(anunciosRaw).filter((a) => !a.fecha_fin || new Date(a.fecha_fin) > ahora).filter((a) => a.prioridad === "CRITICA" || !vistos.has(a.id)).sort((a, b) => (PRIORIDAD_RANK[a.prioridad] ?? 9) - (PRIORIDAD_RANK[b.prioridad] ?? 9));
  }, [anunciosRaw, vistos]);
  const anuncioActivo = anuncios[indice % Math.max(anuncios.length, 1)] ?? null;
  reactExports.useEffect(() => {
    if (anuncios.length <= 1) return;
    const t = setInterval(() => setIndice((i) => (i + 1) % anuncios.length), 1e4);
    return () => clearInterval(t);
  }, [anuncios.length]);
  const marcarComoVisto = reactExports.useCallback((anuncioId) => {
    setVistos((prev) => {
      const next = new Set(prev);
      next.add(anuncioId);
      writeVistos(next);
      return next;
    });
    setIndice((i) => i + 1);
  }, []);
  const rotarSiguiente = reactExports.useCallback(() => {
    setIndice((i) => (i + 1) % Math.max(anuncios.length, 1));
  }, [anuncios.length]);
  return { anuncios, anuncioActivo, marcarComoVisto, rotarSiguiente };
}
const WidgetDashboardContext = reactExports.createContext(null);
function WidgetDashboardProvider({
  value,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetDashboardContext.Provider, { value, children });
}
function useWidgetDashboard() {
  const ctx = reactExports.useContext(WidgetDashboardContext);
  if (!ctx) {
    throw new Error("useWidgetDashboard debe usarse dentro de WidgetDashboardProvider");
  }
  return ctx;
}
const PRIORIDAD_STYLES = {
  CRITICA: "border-l-red-500 bg-red-500/10",
  ALTA: "border-l-orange-500 bg-orange-500/10",
  MEDIA: "border-l-amber-500 bg-amber-500/10",
  BAJA: "border-l-cyan-500 bg-cyan-500/10"
};
function AnunciosBannerPremium({ anuncio, onDismiss, canDismiss = true }) {
  const esCritica = anuncio.prioridad === "CRITICA";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "rounded-xl border border-white/[0.06] border-l-4 p-4 backdrop-blur-sm",
        "animate-in slide-in-from-top-2 fade-in duration-500",
        PRIORIDAD_STYLES[anuncio.prioridad] ?? PRIORIDAD_STYLES.MEDIA
      ),
      role: "region",
      "aria-label": "Anuncio del estudio",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "size-5 text-[#C8A95A] shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-bold tracking-wider text-[#8899B4] uppercase", children: [
              "Anuncio del estudio · ",
              anuncio.prioridad
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-[#E8EDF5] mt-0.5", children: anuncio.titulo }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] mt-1", children: anuncio.mensaje })
          ] })
        ] }),
        canDismiss && !esCritica && onDismiss && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            className: "shrink-0 border-white/10 text-xs",
            onClick: onDismiss,
            children: "Entendido"
          }
        )
      ] })
    }
  );
}
class WidgetErrorBoundary extends reactExports.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error(`Widget ${this.props.widgetName} error:`, error, info);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3 min-h-[8rem]",
          role: "alert",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-5 text-red-400 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-[#E8EDF5]", children: [
                "Error en ",
                this.props.widgetName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-0.5", children: "No se pudo cargar este widget. El resto del dashboard sigue disponible." })
            ] })
          ]
        }
      );
    }
    return this.props.children;
  }
}
function WidgetSkeleton({ tamano }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Skeleton,
    {
      className: cn("w-full rounded-xl bg-white/5", WIDGET_SKELETON_HEIGHT[tamano]),
      "aria-label": "Cargando widget"
    }
  );
}
function DashboardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 min-h-full bg-gradient-to-b from-[#060B14] to-[#080E1E]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full max-w-2xl rounded-xl bg-white/5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-4", children: [
      Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "col-span-12 sm:col-span-6 lg:col-span-2 h-28 rounded-xl bg-white/5" }, i)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "col-span-12 lg:col-span-6 h-64 rounded-xl bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "col-span-12 lg:col-span-6 h-64 rounded-xl bg-white/5" })
    ] })
  ] });
}
function useIsAdminDashboard() {
  const { tiene } = usePermissions();
  return tiene("dashboard.configurar");
}
function usePersonalMetrics(enabled = true, refreshInterval = 30) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "metrics", user?.id],
    queryFn: () => contadorDashboardService.getPersonalMetrics(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function useTareasUrgentesDashboard(enabled = true, refreshInterval = 30) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "urgentes", user?.id],
    queryFn: () => contadorDashboardService.getTareasUrgentes(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function useClientesAsignados(enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "clientes", user?.id],
    queryFn: () => contadorDashboardService.getClientesAsignados(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function useCargaTrabajo(semanas = 4, enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "carga", user?.id, semanas],
    queryFn: () => contadorDashboardService.getCargaTrabajo(user.id, semanas),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function useSugerenciasInteligentes(enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "sugerencias", user?.id],
    queryFn: () => contadorDashboardService.getSugerencias(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function useLogrosPersonales(enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "logros", user?.id],
    queryFn: () => contadorDashboardService.getLogros(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function useActividadPersonal(limit = 10, enabled = true, refreshInterval = 30) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "actividad", user?.id, limit],
    queryFn: () => contadorDashboardService.getActividadPersonal(user.id, limit),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function useFacturacionMensualPersonal(enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "facturacion-mes", user?.id],
    queryFn: () => contadorDashboardService.getFacturacionMensualPersonal(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function useProximosVencimientos(dias = 7, enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "proximos-venc", user?.id, dias],
    queryFn: () => contadorDashboardService.getProximosVencimientos(user.id, dias),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1e3 : false
  });
}
function diasRestantesMes() {
  const now = /* @__PURE__ */ new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.getDate() - now.getDate();
}
function MetaMensualHeaderBar() {
  const { contenido, umbrales, colores, refreshInterval } = useWidgetDashboard();
  const facturacion = useFacturacionMensualPersonal(true, refreshInterval);
  const meta = contenido.meta_mensual_monto;
  const actual = facturacion.data ?? 0;
  const porcentaje = meta > 0 ? Math.min(100, actual / meta * 100) : 0;
  const restante = Math.max(0, meta - actual);
  porcentaje >= umbrales.efectividad_excelente ? "#00C897" : porcentaje >= umbrales.efectividad_meta ? colores.acento : porcentaje >= 70 ? "#F0A500" : "#FF5E7A";
  if (facturacion.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full rounded-xl bg-white/5" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border border-[#C8A95A]/20 bg-[#C8A95A]/5 p-5",
      role: "region",
      "aria-label": "Meta mensual de facturación",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-4 text-[#C8A95A]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-[#E8EDF5]", children: [
            "Meta mensual: ",
            formatSoles(actual),
            " de ",
            formatSoles(meta)
          ] }),
          porcentaje >= 100 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-[#00C897] ml-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5" }),
            " ¡Meta alcanzada!"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: porcentaje, className: "h-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4] mt-2", children: [
          porcentaje.toFixed(0),
          "% · Restan ",
          formatSoles(restante),
          " · ",
          diasRestantesMes(),
          " días del mes"
        ] })
      ]
    }
  );
}
function getUrgencyColor(urgency, colores) {
  switch (urgency) {
    case "OVERDUE":
      return colores.urgencia_vencida;
    case "TODAY":
      return colores.urgencia_hoy;
    case "TOMORROW":
    case "THIS_WEEK":
      return colores.urgencia_semana;
    default:
      return colores.urgencia_normal;
  }
}
function getEfectividadColor(pct, umbrales) {
  if (pct >= umbrales.efectividad_excelente) return "#00C897";
  if (pct >= umbrales.efectividad_meta) return "#00D4FF";
  if (pct >= 70) return "#F0A500";
  return "#FF5E7A";
}
function applyContadorCssVariables(colores, reducirAnimaciones) {
  const root = document.documentElement;
  root.style.setProperty("--color-urgencia-vencida", colores.urgencia_vencida);
  root.style.setProperty("--color-urgencia-hoy", colores.urgencia_hoy);
  root.style.setProperty("--color-urgencia-semana", colores.urgencia_semana);
  root.style.setProperty("--color-urgencia-normal", colores.urgencia_normal);
  root.style.setProperty("--color-acento-contador", colores.acento);
  if (reducirAnimaciones) {
    root.setAttribute("data-reduced-motion", "true");
  } else {
    root.removeAttribute("data-reduced-motion");
  }
}
function ContadorDashboardPremium() {
  const { user } = useSession();
  const {
    dashboard_contador: config,
    umbrales,
    colores,
    contenido,
    cargando: configLoading,
    isFeatureActive,
    recargar
  } = useEstudioConfig();
  const { widgets, kpisVisibles, refreshInterval } = useDashboardWidgets();
  const { anuncioActivo, marcarComoVisto } = useAnunciosEstudio(contenido.anuncios);
  const metrics = usePersonalMetrics(widgets.some((w) => w.id === "kpis"), refreshInterval);
  const periodoActual = reactExports.useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const widgetContext = reactExports.useMemo(
    () => ({
      config,
      umbrales,
      colores,
      contenido,
      kpisVisibles,
      periodoActual,
      refreshInterval,
      isFeatureActive
    }),
    [config, umbrales, colores, contenido, kpisVisibles, periodoActual, refreshInterval, isFeatureActive]
  );
  reactExports.useEffect(() => {
    applyContadorCssVariables(colores, colores.reducir_animaciones_global);
  }, [colores]);
  const userName = user?.user_metadata?.nombre ?? user?.email?.split("@")[0] ?? "Contador";
  const m = metrics.data;
  const showMetaHeader = contenido.meta_mensual_activa && contenido.meta_mensual_monto > 0 && !widgets.some((w) => w.id === "meta_mensual");
  if (configLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSkeleton, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetDashboardProvider, { value: widgetContext, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "min-h-full bg-gradient-to-b from-[#060B14] to-[#080E1E] p-6 space-y-6",
        colores.reducir_animaciones_global && "motion-reduce:*:transition-none"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", style: { color: colores.acento }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold tracking-widest uppercase", children: "Centro de Operaciones" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-semibold text-[#E8EDF5] mt-1", children: contenido.mensaje_bienvenida || "Mi Centro de Operaciones" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[#8899B4] flex items-center gap-2 mt-1", children: [
              "Contador: ",
              userName,
              (m?.rachaDiasProductivos ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-orange-400", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "size-3.5" }),
                "Racha: ",
                m.rachaDiasProductivos,
                " días"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "rounded-xl",
              style: { borderColor: `${colores.acento}4D`, color: colores.acento },
              onClick: () => {
                void metrics.refetch();
                void recargar();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-3.5 mr-1.5" }),
                "Actualizar"
              ]
            }
          )
        ] }),
        anuncioActivo && /* @__PURE__ */ jsxRuntimeExports.jsx(
          AnunciosBannerPremium,
          {
            anuncio: anuncioActivo,
            onDismiss: () => marcarComoVisto(anuncioActivo.id),
            canDismiss: anuncioActivo.prioridad !== "CRITICA"
          }
        ),
        showMetaHeader && /* @__PURE__ */ jsxRuntimeExports.jsx(MetaMensualHeaderBar, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-12 gap-4 auto-rows-min", children: widgets.map((widget) => {
          const LazyWidget = widget.component;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: WIDGET_SIZE_CLASSES[widget.tamano], children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetErrorBoundary, { widgetName: widget.nombre, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetSkeleton, { tamano: widget.tamano }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(LazyWidget, {}) }) }) }, widget.id);
        }) }),
        widgets.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-center text-[#8899B4] py-12", children: "No hay widgets activos. El administrador puede configurarlos en Configuración del Estudio." })
      ]
    }
  ) });
}
export {
  ContadorDashboardPremium as C,
  Flame as F,
  Target as T,
  getUrgencyColor as a,
  useCargaTrabajo as b,
  useClientesAsignados as c,
  useFacturacionMensualPersonal as d,
  useIsAdminDashboard as e,
  useLogrosPersonales as f,
  getEfectividadColor as g,
  usePersonalMetrics as h,
  useProximosVencimientos as i,
  useSugerenciasInteligentes as j,
  useTareasUrgentesDashboard as k,
  useWidgetDashboard as l,
  useActividadPersonal as u
};
