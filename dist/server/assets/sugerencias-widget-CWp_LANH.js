import { L as jsxRuntimeExports } from "./server-B74aIV_r.js";
import { L as Link } from "./router-CrYSg7RR.js";
import { B as Button } from "./button-DcgiDsFB.js";
import { S as Skeleton } from "./skeleton-BCPdwz-t.js";
import { l as useWidgetDashboard, j as useSugerenciasInteligentes } from "./contador-dashboard-premium-BKE6RJ8a.js";
import { a as DashboardSection } from "./use-admin-metrics-C2x2ge2y.js";
import { S as Star } from "./star-Bsfsjf65.js";
import { L as Lightbulb } from "./lightbulb-zGJm-iQK.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-50tj4GHC.js";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-CTHvZg_s.js";
import "./useQuery-BketnMI0.js";
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
