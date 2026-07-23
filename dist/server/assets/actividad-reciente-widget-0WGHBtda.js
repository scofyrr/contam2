import { L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { S as Skeleton } from "./skeleton-DUGbHj_6.js";
import { l as useWidgetDashboard, u as useActividadPersonal } from "./contador-dashboard-premium-Bi3oSjGA.js";
import { a as DashboardSection, r as relativeTime } from "./use-admin-metrics-Bi0FrkKI.js";
import { C as CircleCheck } from "./circle-check-Rtmq9BuI.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-CUz5JvIg.js";
import "./index-CwvZaaA2.js";
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
