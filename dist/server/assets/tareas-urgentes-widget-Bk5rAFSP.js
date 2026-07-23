import { L as jsxRuntimeExports } from "./server-C-mhO3-H.js";
import { L as Link } from "./router-CQNpPKTf.js";
import { B as Button } from "./button-CL2ribwv.js";
import { S as Skeleton } from "./skeleton-ExOl4CqM.js";
import { l as useWidgetDashboard, k as useTareasUrgentesDashboard, h as usePersonalMetrics, a as getUrgencyColor } from "./contador-dashboard-premium-BbHmdW1U.js";
import { a as DashboardSection } from "./use-admin-metrics-Cv5Qxi1L.js";
import { a as useAlertSystem } from "./use-alert-system-D8a5dvHQ.js";
import { C as ClipboardList } from "./clipboard-list-DxraUa1U.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BCXce4eP.js";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-D8B-OB3s.js";
import "./useQuery-0d8p6ted.js";
import "./triangle-alert-DNyNSMGi.js";
import "./progress-o_Jb0X7-.js";
import "./sparkles-DHOkbk18.js";
import "./refresh-cw-C-qHpEi1.js";
import "./trending-up-JMPGpX1r.js";
import "./trending-down-BLjRsFkz.js";
import "./auditoria-service-CznQI1q3.js";
import "./rbac-admin-service-CYBRI7Jm.js";
import "./notification-dual-service-Dg5qjcgN.js";
import "./notification-service-D0rUP-wd.js";
import "./tareas-service-YuWHZuEd.js";
import "./contribuyentes-service-ZRfErUKW.js";
import "./http-client-BAKcXjQw.js";
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
