import { L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { L as Link } from "./router-DdOnzL1Y.js";
import { B as Button } from "./button-CUz5JvIg.js";
import { S as Skeleton } from "./skeleton-DUGbHj_6.js";
import { l as useWidgetDashboard, j as useSugerenciasInteligentes } from "./contador-dashboard-premium-Bi3oSjGA.js";
import { a as DashboardSection } from "./use-admin-metrics-Bi0FrkKI.js";
import { S as Star } from "./star-GWnacWC5.js";
import { L as Lightbulb } from "./lightbulb-CBWZEExG.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CwvZaaA2.js";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-DAiXXr79.js";
import "./useQuery-yGnE4xdj.js";
import "./triangle-alert-D9VCCoSc.js";
import "./progress-q5m-49Oz.js";
import "./sparkles-DaRa_-zS.js";
import "./refresh-cw-B5B5xT1n.js";
import "./trending-up-BOQWNFJ6.js";
import "./trending-down-ToZW-fxx.js";
import "./auditoria-service-CmJN9UP_.js";
import "./rbac-admin-service-DNMsvS9X.js";
import "./notification-dual-service-q2OTmUpN.js";
import "./notification-service-CO-YhtRJ.js";
import "./tareas-service-CDrwsaQ5.js";
import "./contribuyentes-service-D2dNpwbB.js";
import "./http-client-h7UKjZ8s.js";
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
