import { L as jsxRuntimeExports, U as reactExports } from "./server-BIroHbvu.js";
import { as as useSession, L as Link } from "./router-BRL0s0LD.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { P as Progress } from "./progress-DofMlWtS.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { e as useAdminKPIs, g as useRendimientoContadores, d as useAdminGraficos, b as useAdminAlertas, u as useAdminActividad, D as DashboardKpiCard, f as formatSoles, a as DashboardSection, r as relativeTime } from "./use-admin-metrics-D4IAiCAl.js";
import { C as Crown } from "./crown-CfsLpoLq.js";
import { S as Settings } from "./notification-dual-service-CUxPG9KW.js";
import { R as RefreshCw } from "./refresh-cw-CZfG2mto.js";
import { D as Download } from "./download-BBwbUiAc.js";
import { U as Users } from "./users-BtKe7stZ.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, g as Tooltip, B as Bar } from "./generateCategoricalChart-BQLb8jz6.js";
import { B as BarChart } from "./BarChart-C45DkUjM.js";
import { C as CartesianGrid } from "./CartesianGrid-B1uIivQk.js";
import { C as ComposedChart } from "./ComposedChart-DzzHx8vi.js";
import { L as Line } from "./Line-S-B0SzCb.js";
import { T as TrendingUp } from "./trending-up-BUgChl3g.js";
import { T as TriangleAlert } from "./triangle-alert-B4GeD7-7.js";
import { S as Shield } from "./shield-_EHuUdR-.js";
import { S as Star } from "./star-DbHBEFyx.js";
const TYPE_MAP = {
  income: "gain",
  expense: "loss",
  neutral: "info",
  gain: "gain",
  loss: "loss",
  security: "security",
  info: "info",
  warning: "warning",
  premium: "premium",
  error: "error",
  success: "success"
};
const TEXT_CLASS = {
  gain: "text-financial-gain",
  loss: "text-financial-loss",
  security: "text-financial-security",
  info: "text-muted-foreground",
  warning: "text-financial-warning",
  premium: "text-financial-premium",
  error: "text-financial-error",
  success: "text-financial-success"
};
function inferType(value, explicit) {
  if (explicit && explicit !== "income" && explicit !== "expense" && explicit !== "neutral") {
    return TYPE_MAP[explicit];
  }
  if (explicit === "income") return "gain";
  if (explicit === "expense") return "loss";
  if (explicit === "neutral") return "info";
  if (value > 0) return "gain";
  if (value < 0) return "loss";
  return "info";
}
function FinancialAmount({
  value,
  type,
  currency = "S/",
  showSign = true,
  className,
  decimals = 2
}) {
  const semantic = inferType(value, type);
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn("font-mono tabular-nums font-medium", TEXT_CLASS[semantic], className),
      "aria-label": `${currency} ${value}`,
      children: [
        showSign && sign,
        currency,
        " ",
        formatted
      ]
    }
  );
}
const ESTADO_ICON = {
  ACTIVO: "🟢",
  AUSENTE: "🟡",
  INACTIVO: "🔴"
};
function efectividadColor(pct, meta = 90) {
  if (pct >= meta) return "#00C897";
  if (pct >= 70) return "#F0A500";
  return "#FF5E7A";
}
function ContadorRow({
  c,
  isTop
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "tr",
    {
      className: cn(
        "border-b border-white/[0.04] text-sm transition-colors",
        isTop && "ring-1 ring-[#C8A95A]/40 bg-[#C8A95A]/5",
        c.cargaTrabajo === "CRITICA" && "bg-red-500/5",
        c.cargaTrabajo === "ALTA" && !isTop && "bg-amber-500/5"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          isTop && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3.5 text-[#C8A95A] shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-[#E8EDF5]", children: c.nombre }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[#8899B4]", children: c.rol })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-center tabular-nums", children: c.clientesAsignados }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-center tabular-nums", children: c.tareasPendientes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-center tabular-nums", children: c.tareasCompletadas }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-[100px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: c.efectividad, className: "h-1.5 flex-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs tabular-nums", style: { color: efectividadColor(c.efectividad) }, children: [
            c.efectividad,
            "%"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: cn("py-2.5 px-2 text-center tabular-nums", c.tareasVencidas > 0 && "text-red-400 font-semibold"), children: c.tareasVencidas > 0 ? `${c.tareasVencidas} 🔴` : "0 🟢" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { title: c.estado, children: [
          ESTADO_ICON[c.estado] ?? "○",
          " ",
          c.estado === "ACTIVO" && c.efectividad >= 90 ? "⭐" : ""
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 pl-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs text-[#C8A95A]", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/usuarios", children: "Ver detalle" }) }) })
      ]
    }
  );
}
function DashboardAdminPremium() {
  const { user } = useSession();
  const kpis = useAdminKPIs();
  const contadores = useRendimientoContadores();
  const graficos = useAdminGraficos();
  const alertas = useAdminAlertas();
  const actividad = useAdminActividad(10);
  const [sortKey, setSortKey] = reactExports.useState("efectividad");
  const [sortAsc, setSortAsc] = reactExports.useState(false);
  const [filtroEstado, setFiltroEstado] = reactExports.useState("todos");
  const adminName = user?.user_metadata?.nombre ?? user?.email?.split("@")[0] ?? "Admin";
  const m = kpis.data;
  const sortedContadores = reactExports.useMemo(() => {
    let rows = [...contadores.data ?? []];
    if (filtroEstado !== "todos") {
      rows = rows.filter((c) => c.estado === filtroEstado);
    }
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return rows;
  }, [contadores.data, sortKey, sortAsc, filtroEstado]);
  const topEfectividadId = reactExports.useMemo(() => {
    const rows = contadores.data ?? [];
    if (!rows.length) return null;
    return [...rows].sort((a, b) => b.efectividad - a.efectividad)[0]?.userId ?? null;
  }, [contadores.data]);
  const chartFact = reactExports.useMemo(
    () => (graficos.data?.facturacionMensual ?? []).map((f) => ({
      mes: f.mes.length >= 6 ? `${f.mes.slice(4, 6)}/${f.mes.slice(2, 4)}` : f.mes,
      monto: f.monto
    })),
    [graficos.data]
  );
  const chartClientes = graficos.data?.clientesPorContador ?? [];
  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };
  const estadoSistema = m?.estadoSistema ?? "NORMAL";
  const estadoLabel = estadoSistema === "CRITICO" ? "🔴 Crítico" : estadoSistema === "ATENCION" ? "🟡 Atención" : "🟢 Normal";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full bg-gradient-to-b from-[#060B14] to-[#080E1E] p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[#C8A95A]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold tracking-widest uppercase", children: "Centro de Control" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-semibold text-[#E8EDF5] mt-1", children: "Estudio Contable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[#8899B4] mt-1", children: [
          "Admin: ",
          adminName,
          " · ",
          (/* @__PURE__ */ new Date()).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "rounded-xl border-[#C8A95A]/30 text-[#C8A95A]", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/performance", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "size-3.5 mr-1.5" }),
          "Configuración"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "rounded-xl",
            onClick: () => void kpis.refetch(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-3.5 mr-1.5" }),
              "Actualizar"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "rounded-xl", disabled: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-3.5 mr-1.5" }),
          "Exportar"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DashboardKpiCard,
        {
          label: "Contadores activos",
          value: m?.contadoresActivos ?? "—",
          sublabel: `de ${m?.totalContadores ?? 0} total`,
          trend: 2,
          accentColor: "#C8A95A",
          loading: kpis.isLoading
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DashboardKpiCard,
        {
          label: "Clientes activos",
          value: m?.clientesActivos ?? "—",
          sublabel: `de ${m?.totalClientes ?? 0} RUCs`,
          trend: 5,
          accentColor: "#60A5FA",
          loading: kpis.isLoading
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DashboardKpiCard,
        {
          label: "Facturación mensual",
          value: m ? formatSoles(m.facturacionMensual) : "—",
          trend: 12,
          accentColor: "#C8A95A",
          loading: kpis.isLoading
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DashboardKpiCard,
        {
          label: "Efectividad estudio",
          value: m ? `${m.efectividadPromedio}%` : "—",
          trend: 2,
          accentColor: "#00C897",
          loading: kpis.isLoading
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DashboardKpiCard,
        {
          label: "Estado del sistema",
          value: estadoLabel,
          sublabel: m ? `${m.alertasSeguridad} alertas · ${m.contadoresInactivos} inactivos` : void 0,
          accentColor: estadoSistema === "CRITICO" ? "#FF5E7A" : estadoSistema === "ATENCION" ? "#F0A500" : "#00C897",
          loading: kpis.isLoading,
          pulse: estadoSistema === "CRITICO"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DashboardSection,
      {
        title: "Rendimiento por contador",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 text-[#C8A95A]" }),
        action: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["todos", "ACTIVO", "AUSENTE", "INACTIVO"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: filtroEstado === f ? "secondary" : "ghost",
            size: "sm",
            className: "h-7 text-[10px]",
            onClick: () => setFiltroEstado(f),
            children: f === "todos" ? "Todos" : f
          },
          f
        )) }),
        children: contadores.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-lg bg-white/5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[800px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[10px] text-[#8899B4] uppercase tracking-wide", children: [
            [
              ["nombre", "Contador"],
              ["clientesAsignados", "Clientes"],
              ["tareasPendientes", "Tareas"],
              ["tareasCompletadas", "Complet."],
              ["efectividad", "Efect."],
              ["tareasVencidas", "Vencidas"]
            ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "pb-2 text-left cursor-pointer hover:text-[#E8EDF5]", onClick: () => toggleSort(key), children: [
              label,
              " ",
              sortKey === key ? sortAsc ? "↑" : "↓" : ""
            ] }, key)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Estado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Acciones" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedContadores.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(ContadorRow, { c, isTop: c.userId === topEfectividadId }, c.userId)) })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSection, { title: "Clientes por contador", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 text-[#C8A95A]" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartClientes, layout: "vertical", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A2740" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fill: "#8899B4", fontSize: 10 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "nombre", width: 72, tick: { fill: "#8899B4", fontSize: 10 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "#0D1525", border: "1px solid #1A2740" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "clientes", fill: "#C8A95A", radius: [0, 4, 4, 0] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DashboardSection, { title: "Facturación del estudio", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4 text-[#C8A95A]" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartFact, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A2740" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes", tick: { fill: "#8899B4", fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fill: "#8899B4", fontSize: 10 }, tickFormatter: (v) => `${(v / 1e3).toFixed(0)}K` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "#0D1525", border: "1px solid #1A2740" }, formatter: (v) => [formatSoles(v), "Monto"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "monto", fill: "#C8A95A", radius: [4, 4, 0, 0], opacity: 0.85 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "monto", stroke: "#9B87F5", dot: false, strokeWidth: 2 })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4] mt-2", children: [
          "Total anual: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(FinancialAmount, { value: m?.facturacionAnual ?? 0, className: "inline text-[#C8A95A]" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSection, { title: "Alertas y actividad reciente", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-4 text-[#FF5E7A]" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-[#8899B4] uppercase", children: "Alertas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[#E8EDF5]", children: [
            "🚨 ",
            m?.alertasSeguridad ?? 0,
            " alertas de seguridad"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-red-400 mt-1", children: [
            "🔴 ",
            m?.tareasVencidasEstudio ?? 0,
            " tareas vencidas (estudio)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-400 mt-1", children: [
            "🟡 ",
            m?.contadoresInactivos ?? 0,
            " contadores inactivos"
          ] })
        ] }),
        (alertas.data ?? []).slice(0, 4).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/[0.06] px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#E8EDF5]", children: a.titulo }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4]", children: a.descripcion })
        ] }, a.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-[#C8A95A]", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/auditoria", children: "Ver todas las alertas →" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-[#8899B4] uppercase", children: "Últimas acciones" }),
        actividad.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-lg bg-white/5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-[220px] overflow-y-auto", children: actividad.data?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-sm border-b border-white/[0.04] pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[#8899B4] shrink-0 w-16", children: relativeTime(a.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[#E8EDF5]", children: [
            a.usuarioNombre ? `${a.usuarioNombre}: ` : "",
            a.titulo
          ] })
        ] }, a.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-[#00D4FF]", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/auditoria", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3 mr-1" }),
          "Ver auditoría completa →"
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  DashboardAdminPremium as D
};
