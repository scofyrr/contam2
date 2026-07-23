import { L as jsxRuntimeExports } from "./server-B74aIV_r.js";
import { D as DashboardAdminPremium } from "./dashboard-admin-premium-DYizOi0v.js";
import { e as useIsAdminDashboard, C as ContadorDashboardPremium } from "./contador-dashboard-premium-BKE6RJ8a.js";
import { S as Skeleton } from "./skeleton-BCPdwz-t.js";
import { aq as usePermissions } from "./router-CrYSg7RR.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-DcgiDsFB.js";
import "./index-50tj4GHC.js";
import "./utils-8RO4xBwZ.js";
import "./progress-BgqTlH6N.js";
import "./use-admin-metrics-C2x2ge2y.js";
import "./trending-up-BeTy1HU5.js";
import "./trending-down-CXAeYcRI.js";
import "./useQuery-BketnMI0.js";
import "./auditoria-service-B0t2KH0O.js";
import "./rbac-admin-service-BrIYuoJa.js";
import "./notification-dual-service-C572NNAf.js";
import "./notification-service-DZ9Ax7yo.js";
import "./tareas-service-DWgOEbIt.js";
import "./contribuyentes-service-DF9FvpdK.js";
import "./http-client-i97I_bRM.js";
import "./crown-Kj8YT-vl.js";
import "./refresh-cw-CQGTOcHK.js";
import "./download-CIXSmXIN.js";
import "./users-4fhfoyOh.js";
import "./generateCategoricalChart-BOTMLdl4.js";
import "./BarChart-4S7YLFuO.js";
import "./CartesianGrid-Cw3gvvnx.js";
import "./ComposedChart-CZMrgJMw.js";
import "./Area-BRnndsVR.js";
import "./Line-CjMs4gKv.js";
import "./triangle-alert-DsyoFUlL.js";
import "./shield-B9hQHCl8.js";
import "./star-Bsfsjf65.js";
import "./use-estudio-config-CTHvZg_s.js";
import "./sparkles-BG2_2TAg.js";
function DashboardRouterPage() {
  const {
    loading
  } = usePermissions();
  const isAdmin = useIsAdminDashboard();
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-64 bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-4", children: Array.from({
        length: 5
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-xl bg-white/5" }, i)) })
    ] });
  }
  if (isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardAdminPremium, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ContadorDashboardPremium, {});
}
export {
  DashboardRouterPage as component
};
