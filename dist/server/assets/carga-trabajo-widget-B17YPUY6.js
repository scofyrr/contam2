import { L as jsxRuntimeExports } from "./server-C-mhO3-H.js";
import { B as Badge } from "./badge-CC3AGnGW.js";
import { S as Skeleton } from "./skeleton-ExOl4CqM.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { l as useWidgetDashboard, b as useCargaTrabajo, h as usePersonalMetrics, T as Target } from "./contador-dashboard-premium-BbHmdW1U.js";
import { a as DashboardSection } from "./use-admin-metrics-Cv5Qxi1L.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BCXce4eP.js";
import "./button-CL2ribwv.js";
import "./use-estudio-config-D8B-OB3s.js";
import "./useQuery-0d8p6ted.js";
import "./router-CQNpPKTf.js";
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
function WorkloadHeatmap({ days }) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const intensity = (n) => {
    if (n === 0) return "bg-white/[0.02]";
    if (n <= 2) return "bg-cyan-500/20";
    if (n <= 5) return "bg-cyan-500/40";
    if (n <= 10) return "bg-cyan-500/60";
    return "bg-amber-500/60";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: days.slice(-28).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      title: `${d.fecha}: ${d.total} tareas`,
      className: cn(
        "aspect-square rounded-sm",
        intensity(d.total),
        d.fecha === today && "ring-2 ring-[#C8A95A]"
      )
    },
    d.fecha
  )) });
}
function CargaTrabajoWidget() {
  const { umbrales, refreshInterval } = useWidgetDashboard();
  const carga = useCargaTrabajo(4, true, refreshInterval);
  const metrics = usePersonalMetrics(true, refreshInterval);
  const m = metrics.data;
  const cargaLabel = (m?.tareasPendientes ?? 0) >= umbrales.carga_critica ? "CRITICA" : (m?.tareasPendientes ?? 0) >= umbrales.carga_alta ? "ALTA" : (m?.tareasPendientes ?? 0) <= umbrales.carga_baja ? "BAJA" : "NORMAL";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSection, { title: "Mi carga de trabajo", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-4 text-[#00D4FF]" }), children: carga.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-lg bg-white/5" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WorkloadHeatmap, { days: carga.data ?? [] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4] mt-3", children: [
      "Hoy: ",
      m?.tareasHoy ?? 0,
      " tareas · Completadas hoy: ",
      m?.tareasCompletadasHoy ?? 0
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "mt-2", variant: "outline", children: [
      "Carga: ",
      cargaLabel
    ] })
  ] }) });
}
export {
  CargaTrabajoWidget,
  CargaTrabajoWidget as default
};
