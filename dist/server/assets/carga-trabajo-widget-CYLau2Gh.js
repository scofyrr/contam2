import { L as jsxRuntimeExports } from "./server-B74aIV_r.js";
import { B as Badge } from "./badge-InzkuTfa.js";
import { S as Skeleton } from "./skeleton-BCPdwz-t.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { l as useWidgetDashboard, b as useCargaTrabajo, h as usePersonalMetrics, T as Target } from "./contador-dashboard-premium-BKE6RJ8a.js";
import { a as DashboardSection } from "./use-admin-metrics-C2x2ge2y.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-50tj4GHC.js";
import "./button-DcgiDsFB.js";
import "./use-estudio-config-CTHvZg_s.js";
import "./useQuery-BketnMI0.js";
import "./router-CrYSg7RR.js";
import "./triangle-alert-DsyoFUlL.js";
import "./progress-BgqTlH6N.js";
import "./sparkles-BG2_2TAg.js";
import "./refresh-cw-CQGTOcHK.js";
import "./trending-up-BeTy1HU5.js";
import "./trending-down-CXAeYcRI.js";
import "./auditoria-service-B0t2KH0O.js";
import "./rbac-admin-service-BrIYuoJa.js";
import "./notification-dual-service-C572NNAf.js";
import "./notification-service-DZ9Ax7yo.js";
import "./tareas-service-DWgOEbIt.js";
import "./contribuyentes-service-DF9FvpdK.js";
import "./http-client-i97I_bRM.js";
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
