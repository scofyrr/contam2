import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { L as Link } from "./router-B2fOVgbK.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { l as useWidgetDashboard, j as useSugerenciasInteligentes } from "./contador-dashboard-premium-DdsDsuUk.js";
import { a as DashboardSection } from "./use-admin-metrics-DcSELLQl.js";
import { S as Star } from "./star-2CuRbMbs.js";
import { L as Lightbulb } from "./lightbulb-DCt4cX9W.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CWutStw1.js";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-DxZZzsuV.js";
import "./useQuery-BWRVlDqX.js";
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
function SugerenciasWidget() {
  const { config, colores, isFeatureActive, refreshInterval } = useWidgetDashboard();
  const sugerencias = useSugerenciasInteligentes(true, refreshInterval);
  if (!config.mostrar_sugerencias || !isFeatureActive("sugerencias_inteligentes")) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSection, { title: "Sugerencias inteligentes", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "size-4 text-[#F0A500]" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sugerencias.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-lg bg-white/5" }) : (sugerencias.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] text-center py-4", children: "Sin sugerencias por ahora" }) : (sugerencias.data ?? []).slice(0, 4).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/[0.06] p-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-[#E8EDF5] flex items-center gap-1", children: [
      s.tipo === "LOGRO" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3 text-amber-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "size-3 text-cyan-400" }),
      s.titulo
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-0.5", children: s.descripcion }),
    s.accion.link && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", className: "h-auto p-0 mt-1", style: { color: colores.acento }, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: s.accion.link, children: [
      s.accion.label,
      " →"
    ] }) })
  ] }, s.id)) }) });
}
export {
  SugerenciasWidget,
  SugerenciasWidget as default
};
