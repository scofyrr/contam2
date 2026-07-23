import { L as jsxRuntimeExports } from "./server-B74aIV_r.js";
import { S as Skeleton } from "./skeleton-BCPdwz-t.js";
import { l as useWidgetDashboard, u as useActividadPersonal } from "./contador-dashboard-premium-BKE6RJ8a.js";
import { a as DashboardSection, r as relativeTime } from "./use-admin-metrics-C2x2ge2y.js";
import { C as CircleCheck } from "./circle-check-DDSriKbc.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-DcgiDsFB.js";
import "./index-50tj4GHC.js";
import "./use-estudio-config-CTHvZg_s.js";
import "./useQuery-BketnMI0.js";
import "./router-CrYSg7RR.js";
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
