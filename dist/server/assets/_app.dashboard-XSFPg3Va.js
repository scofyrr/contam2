import { L as jsxRuntimeExports } from "./server-C-mhO3-H.js";
import { D as DashboardAdminPremium } from "./dashboard-admin-premium-Drib42b5.js";
import { e as useIsAdminDashboard, C as ContadorDashboardPremium } from "./contador-dashboard-premium-BbHmdW1U.js";
import { S as Skeleton } from "./skeleton-ExOl4CqM.js";
import { aq as usePermissions } from "./router-CQNpPKTf.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-CL2ribwv.js";
import "./index-BCXce4eP.js";
import "./utils-8RO4xBwZ.js";
import "./progress-o_Jb0X7-.js";
import "./use-admin-metrics-Cv5Qxi1L.js";
import "./trending-up-JMPGpX1r.js";
import "./trending-down-BLjRsFkz.js";
import "./useQuery-0d8p6ted.js";
import "./auditoria-service-CznQI1q3.js";
import "./rbac-admin-service-CYBRI7Jm.js";
import "./notification-dual-service-Dg5qjcgN.js";
import "./notification-service-D0rUP-wd.js";
import "./tareas-service-YuWHZuEd.js";
import "./contribuyentes-service-ZRfErUKW.js";
import "./http-client-BAKcXjQw.js";
import "./crown-4bPM4ZEk.js";
import "./refresh-cw-C-qHpEi1.js";
import "./download-C2e4ds-t.js";
import "./users-BxqnXtc_.js";
import "./generateCategoricalChart-CUeTZzKU.js";
import "./BarChart-BEBUw3hA.js";
import "./CartesianGrid-BkZIdLq9.js";
import "./ComposedChart-CbgBZcd5.js";
import "./Area-Du2dbxDA.js";
import "./Line-D_re0xjE.js";
import "./triangle-alert-DNyNSMGi.js";
import "./shield-5qqZO4k4.js";
import "./star-TI-gxstM.js";
import "./use-estudio-config-D8B-OB3s.js";
import "./sparkles-DHOkbk18.js";
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
