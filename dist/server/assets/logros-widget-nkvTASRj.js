import { L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { S as Skeleton } from "./skeleton-DUGbHj_6.js";
import { l as useWidgetDashboard, f as useLogrosPersonales } from "./contador-dashboard-premium-Bi3oSjGA.js";
import { a as DashboardSection } from "./use-admin-metrics-Bi0FrkKI.js";
import { a as createLucideIcon } from "./index-CwvZaaA2.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-CUz5JvIg.js";
import "./use-estudio-config-DAiXXr79.js";
import "./useQuery-yGnE4xdj.js";
import "./router-DdOnzL1Y.js";
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
const __iconNode = [
  ["path", { d: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978", key: "1n3hpd" }],
  ["path", { d: "M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978", key: "rfe1zi" }],
  ["path", { d: "M18 9h1.5a1 1 0 0 0 0-5H18", key: "7xy6bh" }],
  ["path", { d: "M4 22h16", key: "57wxv0" }],
  ["path", { d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z", key: "1mhfuq" }],
  ["path", { d: "M6 9H4.5a1 1 0 0 1 0-5H6", key: "tex48p" }]
];
const Trophy = createLucideIcon("trophy", __iconNode);
function LogrosWidget() {
  const { config, umbrales, isFeatureActive, refreshInterval } = useWidgetDashboard();
  const logros = useLogrosPersonales(true, refreshInterval);
  if (!config.mostrar_gamificacion || !isFeatureActive("gamificacion_activa")) {
    return null;
  }
  const desbloqueados = (logros.data ?? []).filter((l) => l.desbloqueado);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSection, { title: "Logros y rachas", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-4 text-[#C8A95A]" }), children: logros.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-lg bg-white/5" }) : desbloqueados.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[#8899B4] text-center py-4", children: [
    "Meta racha: ",
    umbrales.racha_minima_logro,
    " días"
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: desbloqueados.slice(0, 4).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-[#E8EDF5]", children: l.titulo }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-0.5", children: l.descripcion })
  ] }, l.id)) }) });
}
export {
  LogrosWidget,
  LogrosWidget as default
};
