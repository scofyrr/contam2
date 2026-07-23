import { L as jsxRuntimeExports } from "./server-C-mhO3-H.js";
import { L as Link } from "./router-CQNpPKTf.js";
import { B as Button } from "./button-CL2ribwv.js";
import { S as Skeleton } from "./skeleton-ExOl4CqM.js";
import { l as useWidgetDashboard, j as useSugerenciasInteligentes } from "./contador-dashboard-premium-BbHmdW1U.js";
import { a as DashboardSection } from "./use-admin-metrics-Cv5Qxi1L.js";
import { S as Star } from "./star-TI-gxstM.js";
import { L as Lightbulb } from "./lightbulb-qf7Vi5pe.js";
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
