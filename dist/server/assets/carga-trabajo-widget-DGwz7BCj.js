import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { B as Badge } from "./badge-yaC6QAMb.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { l as useWidgetDashboard, b as useCargaTrabajo, h as usePersonalMetrics, T as Target } from "./contador-dashboard-premium-DdsDsuUk.js";
import { a as DashboardSection } from "./use-admin-metrics-DcSELLQl.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CWutStw1.js";
import "./button-OKRTDzrH.js";
import "./use-estudio-config-DxZZzsuV.js";
import "./useQuery-BWRVlDqX.js";
import "./router-B2fOVgbK.js";
import "./triangle-alert-n38mPMK9.js";
import "./progress-C9Z_U5y-.js";
import "./sparkles-DUxBT6bb.js";
import "./refresh-cw-CZupm7dT.js";
import "./trending-up-H7BEnUdg.js";
import "./trending-down-B-hiFKmE.js";
import "./auditoria-service-_uxRL405.js";
import "./rbac-admin-service-DF1ibFFl.js";
import "./notification-dual-service-Bq0t1Kn4.js";
import "./notification-service-C10oxyNg.js";
import "./tareas-service-Co1DUort.js";
import "./contribuyentes-service-BLWdN8Z5.js";
import "./http-client-B_ATtUrg.js";
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
