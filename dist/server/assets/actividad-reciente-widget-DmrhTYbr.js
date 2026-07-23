import { L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { l as useWidgetDashboard, u as useActividadPersonal } from "./contador-dashboard-premium-BbOb-YY5.js";
import { a as DashboardSection, r as relativeTime } from "./use-admin-metrics-D4IAiCAl.js";
import { C as CircleCheck } from "./circle-check-B2Wi3ps7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-CAvVOLL8.js";
import "./index-Do_kSTPt.js";
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
function ActividadRecienteWidget() {
  const { config, refreshInterval } = useWidgetDashboard();
  const actividad = useActividadPersonal(10, true, refreshInterval);
  if (!config.mostrar_actividad_reciente) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSection, { title: "Mi actividad reciente", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 text-[#00C897]" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: actividad.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-lg bg-white/5" }) : (actividad.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] text-center py-4", children: "Sin actividad registrada recientemente" }) : actividad.data?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[#8899B4] shrink-0", children: relativeTime(a.createdAt) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#E8EDF5]", children: a.titulo })
  ] }, a.id)) }) });
}
export {
  ActividadRecienteWidget,
  ActividadRecienteWidget as default
};
