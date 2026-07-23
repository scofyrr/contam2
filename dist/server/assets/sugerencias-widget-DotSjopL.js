import { L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { L as Link } from "./router-BRL0s0LD.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { l as useWidgetDashboard, j as useSugerenciasInteligentes } from "./contador-dashboard-premium-BbOb-YY5.js";
import { a as DashboardSection } from "./use-admin-metrics-D4IAiCAl.js";
import { S as Star } from "./star-DbHBEFyx.js";
import { L as Lightbulb } from "./lightbulb-DPp8BOs-.js";
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
