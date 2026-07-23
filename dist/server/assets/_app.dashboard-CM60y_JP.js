import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { D as DashboardAdminPremium } from "./dashboard-admin-premium-BIz69D8T.js";
import { e as useIsAdminDashboard, C as ContadorDashboardPremium } from "./contador-dashboard-premium-DdsDsuUk.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { aq as usePermissions } from "./router-B2fOVgbK.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-OKRTDzrH.js";
import "./index-CWutStw1.js";
import "./utils-8RO4xBwZ.js";
import "./progress-C9Z_U5y-.js";
import "./use-admin-metrics-DcSELLQl.js";
import "./trending-up-H7BEnUdg.js";
import "./trending-down-B-hiFKmE.js";
import "./useQuery-BWRVlDqX.js";
import "./auditoria-service-_uxRL405.js";
import "./rbac-admin-service-DF1ibFFl.js";
import "./notification-dual-service-Bq0t1Kn4.js";
import "./notification-service-C10oxyNg.js";
import "./tareas-service-Co1DUort.js";
import "./contribuyentes-service-BLWdN8Z5.js";
import "./http-client-B_ATtUrg.js";
import "./crown-CkVUdG_h.js";
import "./refresh-cw-CZupm7dT.js";
import "./download-BejVGX4c.js";
import "./users-peXVpHFd.js";
import "./generateCategoricalChart-Bx15tFyN.js";
import "./BarChart-Ddr6dQRV.js";
import "./CartesianGrid-DXjk64D3.js";
import "./ComposedChart-BPRK3NoC.js";
import "./Area-CNet8Ygk.js";
import "./Line-ClKEnyq8.js";
import "./triangle-alert-n38mPMK9.js";
import "./shield-BMvb8sMw.js";
import "./star-2CuRbMbs.js";
import "./use-estudio-config-DxZZzsuV.js";
import "./sparkles-DUxBT6bb.js";
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
