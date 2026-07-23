import { L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { l as useWidgetDashboard, f as useLogrosPersonales } from "./contador-dashboard-premium-BbOb-YY5.js";
import { a as DashboardSection } from "./use-admin-metrics-D4IAiCAl.js";
import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-CAvVOLL8.js";
import "./use-estudio-config-a6Rlcfnu.js";
import "./useQuery-CNpr8Hir.js";
import "./router-BRL0s0LD.js";
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
