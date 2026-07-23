import { L as jsxRuntimeExports } from "./server-C-mhO3-H.js";
import { S as Skeleton } from "./skeleton-ExOl4CqM.js";
import { l as useWidgetDashboard, u as useActividadPersonal } from "./contador-dashboard-premium-BbHmdW1U.js";
import { a as DashboardSection, r as relativeTime } from "./use-admin-metrics-Cv5Qxi1L.js";
import { C as CircleCheck } from "./circle-check-Dtnm8Yzb.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-CL2ribwv.js";
import "./index-BCXce4eP.js";
import "./use-estudio-config-D8B-OB3s.js";
import "./useQuery-0d8p6ted.js";
import "./router-CQNpPKTf.js";
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
