import { L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { S as Skeleton } from "./skeleton-BkQkQtWf.js";
import { l as useWidgetDashboard, u as useActividadPersonal } from "./contador-dashboard-premium-CecU89id.js";
import { a as DashboardSection, r as relativeTime } from "./use-admin-metrics-ttrbnM7Y.js";
import { C as CircleCheck } from "./circle-check-s6qbrqFU.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-D82ZRVfS.js";
import "./index-CE2u8TBR.js";
import "./use-estudio-config-BguEKtAw.js";
import "./useQuery-GwWd8T8C.js";
import "./router-B2oVQHub.js";
import "./triangle-alert-C9v1hrNU.js";
import "./progress-CZqzYq6n.js";
import "./sparkles-H49z-E_d.js";
import "./refresh-cw-Yr6mvBQG.js";
import "./trending-up-CcZmLxtW.js";
import "./trending-down-BmLuyfec.js";
import "./auditoria-service-COZWF7vw.js";
import "./rbac-admin-service-Cro1Gq2-.js";
import "./notification-dual-service-DJzIwkas.js";
import "./notification-service-teXKFOTF.js";
import "./tareas-service-D-yCbpRg.js";
import "./contribuyentes-service-DhFtq9J9.js";
import "./http-client-BVL7nK2k.js";
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
