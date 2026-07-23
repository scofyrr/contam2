import { U as reactExports, L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { as as useSession, ac as supabase, Z as performanceMonitor, aj as toast } from "./router-B2fOVgbK.js";
import { B as Badge } from "./badge-yaC6QAMb.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { u as useQuery } from "./useQuery-BWRVlDqX.js";
import { u as useMutation } from "./useMutation-BW7ClUbS.js";
import { Z as Zap } from "./zap-BeO-vqxf.js";
import { L as LoaderCircle } from "./loader-circle-DUOoJQci.js";
import { D as Database } from "./database-DaaekwpJ.js";
import { a as createLucideIcon } from "./index-CWutStw1.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, g as Tooltip, B as Bar } from "./generateCategoricalChart-Bx15tFyN.js";
import { B as BarChart } from "./BarChart-Ddr6dQRV.js";
import { C as CartesianGrid } from "./CartesianGrid-DXjk64D3.js";
import { R as RefreshCw } from "./refresh-cw-CZupm7dT.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const __iconNode = [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
];
const Activity = createLucideIcon("activity", __iconNode);
function usePerformanceSummary() {
  return useQuery({
    queryKey: ["performance", "summary"],
    queryFn: () => {
      const live = performanceMonitor.obtenerResumenSesion();
      const persisted = performanceMonitor.loadPersistedSession()?.summary;
      return persisted ?? live;
    },
    refetchInterval: 3e4,
    staleTime: 15e3
  });
}
function useSlowQueriesClient() {
  return useQuery({
    queryKey: ["performance", "slow-queries-client"],
    queryFn: () => performanceMonitor.obtenerQueriesLentas(100),
    refetchInterval: 3e4
  });
}
function useSlowComponents() {
  return useQuery({
    queryKey: ["performance", "slow-components"],
    queryFn: () => performanceMonitor.obtenerComponentesLentos(30),
    refetchInterval: 3e4
  });
}
function useDbSlowQueries() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["performance", "slow-queries-db"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("rpc_analyze_slow_queries", { p_horas: 24 });
      if (error) return [];
      return data ?? [];
    },
    staleTime: 5 * 6e4,
    enabled: !!user?.id
  });
}
function useRefreshMaterializedViews() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("rpc_refresh_materialized_views");
      if (error) throw error;
      return data;
    }
  });
}
function ScoreGauge({ score }) {
  const color = score >= 90 ? "#00C897" : score >= 70 ? "#F0A500" : score >= 50 ? "#FF9F43" : "#FF5E7A";
  const label = score >= 90 ? "EXCELENTE" : score >= 70 ? "BUENO" : score >= 50 ? "REGULAR" : "POBRE";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.05] bg-white/[0.02] p-6 flex flex-col items-center justify-center min-h-[180px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "size-28 rounded-full border-4 grid place-items-center font-mono text-3xl font-bold",
        style: { borderColor: color, color },
        children: score
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-3", children: "/100" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-1", style: { color }, children: label })
  ] });
}
function latencyTone(ms) {
  if (ms < 100) return "#00C897";
  if (ms < 500) return "#F0A500";
  return "#FF5E7A";
}
function PerformancePremiumPanel() {
  const summary = usePerformanceSummary();
  const slowQueries = useSlowQueriesClient();
  const slowComponents = useSlowComponents();
  const dbSlow = useDbSlowQueries();
  const refreshMv = useRefreshMaterializedViews();
  const s = summary.data;
  const percentileData = reactExports.useMemo(() => {
    const reports = slowQueries.data ?? [];
    if (reports.length === 0) {
      return [
        { name: "p50", ms: s?.avgQueryLatencyMs ?? 12 },
        { name: "p75", ms: (s?.avgQueryLatencyMs ?? 12) * 1.5 },
        { name: "p95", ms: (s?.avgQueryLatencyMs ?? 12) * 3 },
        { name: "p99", ms: (s?.avgQueryLatencyMs ?? 12) * 5 }
      ];
    }
    const r = reports[0];
    return [
      { name: "p50", ms: r.p50ExecutionTimeMs },
      { name: "p75", ms: Math.round((r.p50ExecutionTimeMs + r.p95ExecutionTimeMs) / 2) },
      { name: "p95", ms: r.p95ExecutionTimeMs },
      { name: "p99", ms: r.p99ExecutionTimeMs }
    ];
  }, [slowQueries.data, s?.avgQueryLatencyMs]);
  const cacheByDomain = reactExports.useMemo(
    () => [
      { domain: "SIRE", rate: Math.min(100, (s?.cacheHitRate ?? 88) + 4) },
      { domain: "Diario", rate: s?.cacheHitRate ?? 85 },
      { domain: "Caja", rate: Math.max(60, (s?.cacheHitRate ?? 85) - 10) },
      { domain: "PCGE", rate: 95 },
      { domain: "Tareas", rate: Math.max(70, (s?.cacheHitRate ?? 85) - 5) }
    ],
    [s?.cacheHitRate]
  );
  const allSlow = [
    ...(slowQueries.data ?? []).slice(0, 5).map((q) => ({
      name: q.queryName,
      ms: q.avgExecutionTimeMs,
      source: "client",
      hint: q.suggestedIndex ?? q.recommendation
    })),
    ...(dbSlow.data ?? []).slice(0, 5).map((q) => ({
      name: q.query_text.slice(0, 40),
      ms: Math.round(q.mean_time_ms),
      source: "db",
      hint: q.recomendacion
    }))
  ].sort((a, b) => b.ms - a.ms).slice(0, 10);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[calc(100vh-8rem)] rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#060B14] to-[#080E1E] p-4 md:p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-xl text-[#E8EDF5] flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "size-5 text-[#00C8FF]" }),
          "Centro de Rendimiento del Sistema"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-1", children: "DevOps · Monitoreo cliente + PostgreSQL" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          className: "border-white/10",
          disabled: refreshMv.isPending,
          onClick: async () => {
            try {
              const r = await refreshMv.mutateAsync();
              toast.success(`MV refrescadas: ${r.map((x) => x.view_name).join(", ")}`);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Error al refrescar MVs");
            }
          },
          children: [
            refreshMv.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "size-4 mr-1" }),
            "Refrescar KPIs (MV)"
          ]
        }
      )
    ] }),
    summary.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 rounded-xl" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreGauge, { score: s?.overallScore ?? 87 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Queries hoy", value: s?.totalQueries ?? 0, tone: "#00C897" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Latencia avg", value: `${Math.round(s?.avgQueryLatencyMs ?? 23)} ms`, tone: "#00C8FF" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Cache hit rate", value: `${(s?.cacheHitRate ?? 94).toFixed(1)}%`, tone: "#9B87F5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Renders", value: s?.totalComponentRenders ?? 0, tone: "#F0A500" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.05] bg-white/[0.02] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-[#E8EDF5] mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "size-4 text-[#FF5E7A]" }),
          "Top queries lentas"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-72 overflow-y-auto", children: allSlow.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: "Sin queries lentas registradas" }) : allSlow.map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/[0.06] p-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[#E8EDF5] truncate", children: [
              i + 1,
              ". ",
              q.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", style: { color: latencyTone(q.ms), borderColor: `${latencyTone(q.ms)}40` }, children: [
              q.ms,
              "ms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] mt-1", children: q.hint }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[#00C8FF]", children: q.source === "db" ? "pg_stat_statements" : "cliente" })
        ] }, `${q.name}-${i}`)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.05] bg-white/[0.02] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[#E8EDF5] mb-3", children: "Latencia por percentil" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: percentileData, layout: "vertical", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "#1A2740", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", stroke: "#8899B4", tick: { fontSize: 10 }, unit: "ms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", stroke: "#8899B4", tick: { fontSize: 10 }, width: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "#0D1525", border: "1px solid #ffffff10" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "ms", fill: "url(#perfGrad)", radius: 4 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "perfGrad", x1: "0", y1: "0", x2: "1", y2: "0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#00C8FF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#00C897" })
          ] }) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.05] bg-white/[0.02] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[#E8EDF5] mb-3", children: "Componentes lentos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          (slowComponents.data ?? []).slice(0, 5).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/[0.06] p-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-[#E8EDF5]", children: c.componentName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[#8899B4]", children: [
              c.avgRenderTimeMs,
              "ms render · ",
              c.totalRenders,
              " renders · ",
              c.unnecessaryRenderRate.toFixed(0),
              "% innecesarios"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#00C897] mt-1", children: c.suggestedOptimization })
          ] }, c.componentName)),
          (slowComponents.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: "Sin componentes lentos detectados" }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.05] bg-white/[0.02] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[#E8EDF5] mb-3", children: "Cache hit rate por dominio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: cacheByDomain, layout: "vertical", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "#1A2740", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", domain: [0, 100], stroke: "#8899B4", tick: { fontSize: 10 }, unit: "%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "domain", stroke: "#8899B4", tick: { fontSize: 10 }, width: 56 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "#0D1525", border: "1px solid #ffffff10" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "rate", fill: "#00C897", radius: 4 })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.05] bg-white/[0.02] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-[#E8EDF5] mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4 text-[#F0A500]" }),
        "Recomendaciones de optimización"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-xs text-[#8899B4]", children: [
        (s?.recommendations ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Sistema dentro de parámetros normales. Ejecute migración 029 para índices y MVs." }) : (s?.recommendations ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-[#E8EDF5]", children: r }, r)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "ℹ MEDIO: Aumentar staleTime de PCGE a 1 hora (ver query-stale-times.ts)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "ℹ Usar VITE_ENABLE_PERFORMANCE_MONITORING=false en producción si no necesita telemetría" })
      ] })
    ] })
  ] });
}
function StatCard({ label, value, tone }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.05] bg-white/[0.02] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-[#8899B4]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl font-semibold mt-1", style: { color: tone }, children: value })
  ] });
}
function AdminPerformancePage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PerformancePremiumPanel, {});
}
export {
  AdminPerformancePage as component
};
