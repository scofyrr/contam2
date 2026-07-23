import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { l as useWidgetDashboard, u as useActividadPersonal } from "./contador-dashboard-premium-DdsDsuUk.js";
import { a as DashboardSection, r as relativeTime } from "./use-admin-metrics-DcSELLQl.js";
import { C as CircleCheck } from "./circle-check-Qf-bppF0.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-OKRTDzrH.js";
import "./index-CWutStw1.js";
import "./use-estudio-config-DxZZzsuV.js";
import "./useQuery-BWRVlDqX.js";
import "./router-B2fOVgbK.js";
import "./triangle-alert-n38mPMK9.js";
import "./progress-C9Z_U5y-.js";
import "./sparkles-DUxBT6bb.js";
import "./refresh-cw-CZupm7dT.js";
import "./trending-up-H7BEnUdg.js";
import "./trending-down-B-hiFKmE.js";
import "./auditoria-service-_uxRL405.js";
import "./rbac-admin-service-DF1ibFFl.js";
import "./notification-dual-service-Bq0t1Kn4.js";
import "./notification-service-C10oxyNg.js";
import "./tareas-service-Co1DUort.js";
import "./contribuyentes-service-BLWdN8Z5.js";
import "./http-client-B_ATtUrg.js";
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
