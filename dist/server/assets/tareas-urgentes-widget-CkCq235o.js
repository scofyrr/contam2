import { L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { L as Link } from "./router-BRL0s0LD.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { l as useWidgetDashboard, k as useTareasUrgentesDashboard, h as usePersonalMetrics, a as getUrgencyColor } from "./contador-dashboard-premium-BbOb-YY5.js";
import { a as DashboardSection } from "./use-admin-metrics-D4IAiCAl.js";
import { a as useAlertSystem } from "./use-alert-system-Doc335EZ.js";
import { C as ClipboardList } from "./clipboard-list-CdNQqCZk.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Do_kSTPt.js";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-a6Rlcfnu.js";
import "./useQuery-CNpr8Hir.js";
import "./triangle-alert-B4GeD7-7.js";
import "./progress-DofMlWtS.js";
import "./sparkles-Cqd5ml8U.js";
import "./refresh-cw-CZfG2mto.js";
import "./trending-up-BUgChl3g.js";
import "./trending-down-C3E-7TSV.js";
import "./auditoria-service-DMkylvh-.js";
import "./rbac-admin-service-BZuAmbPN.js";
import "./notification-dual-service-CUxPG9KW.js";
import "./notification-service-4RfXiETS.js";
import "./tareas-service-cnCEUa8P.js";
import "./contribuyentes-service-C3l05GhV.js";
import "./http-client-BNGDvc7A.js";
function UrgencyTaskRow({ task, colores }) {
  const color = getUrgencyColor(task.urgency, colores);
  const pulse = colores.pulse_en_vencidas && task.urgency === "OVERDUE";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `rounded-lg border border-white/[0.06] p-3 flex items-start justify-between gap-3 ${pulse ? "animate-pulse-red" : ""}`,
      style: { borderLeftWidth: 3, borderLeftColor: color },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-bold", style: { color }, children: [
            task.priority,
            " · ",
            task.urgency.replace("_", " ")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[#E8EDF5] truncate", children: task.title }),
          task.rucName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-0.5", children: task.rucName })
        ] }),
        task.metadata?.link && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "shrink-0 h-8 text-xs", style: { color: colores.acento }, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: task.metadata.link, children: "Ir →" }) })
      ]
    }
  );
}
function TareasUrgentesWidget() {
  const { config, colores, umbrales, refreshInterval } = useWidgetDashboard();
  const maxTareas = config.max_tareas_urgentes;
  const urgentes = useTareasUrgentesDashboard(true, refreshInterval);
  const metrics = usePersonalMetrics(true, refreshInterval);
  const { setFabDrawerOpen } = useAlertSystem();
  const filtered = (urgentes.data ?? []).slice(0, maxTareas);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DashboardSection,
    {
      title: "Tareas que requieren acción",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "size-4", style: { color: colores.urgencia_hoy } }),
      action: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-xs", style: { color: colores.acento }, onClick: () => setFabDrawerOpen(true), children: "Ver todas" }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: urgentes.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-lg bg-white/5" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] text-center py-6", children: "🎉 Sin tareas urgentes" }) : filtered.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(UrgencyTaskRow, { task: t, colores }, t.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-[#8899B4] mt-2", children: [
          "Alerta próxima: ",
          umbrales.dias_alerta_proxima,
          " días"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "w-full mt-2", style: { color: colores.acento }, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/tareas", children: [
          "Ver todas (",
          metrics.data?.tareasPendientes ?? 0,
          ") →"
        ] }) })
      ]
    }
  );
}
export {
  TareasUrgentesWidget,
  TareasUrgentesWidget as default
};
