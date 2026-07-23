import { L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { D as DashboardAdminPremium } from "./dashboard-admin-premium-DC2nvrfU.js";
import { e as useIsAdminDashboard, C as ContadorDashboardPremium } from "./contador-dashboard-premium-BbOb-YY5.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { aq as usePermissions } from "./router-BRL0s0LD.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-CAvVOLL8.js";
import "./index-Do_kSTPt.js";
import "./utils-8RO4xBwZ.js";
import "./progress-DofMlWtS.js";
import "./use-admin-metrics-D4IAiCAl.js";
import "./trending-up-BUgChl3g.js";
import "./trending-down-C3E-7TSV.js";
import "./useQuery-CNpr8Hir.js";
import "./auditoria-service-DMkylvh-.js";
import "./rbac-admin-service-BZuAmbPN.js";
import "./notification-dual-service-CUxPG9KW.js";
import "./notification-service-4RfXiETS.js";
import "./tareas-service-cnCEUa8P.js";
import "./contribuyentes-service-C3l05GhV.js";
import "./http-client-BNGDvc7A.js";
import "./crown-CfsLpoLq.js";
import "./refresh-cw-CZfG2mto.js";
import "./download-BBwbUiAc.js";
import "./users-BtKe7stZ.js";
import "./generateCategoricalChart-BQLb8jz6.js";
import "./BarChart-C45DkUjM.js";
import "./CartesianGrid-B1uIivQk.js";
import "./ComposedChart-DzzHx8vi.js";
import "./Area-Cz3hqHMc.js";
import "./Line-S-B0SzCb.js";
import "./triangle-alert-B4GeD7-7.js";
import "./shield-_EHuUdR-.js";
import "./star-DbHBEFyx.js";
import "./use-estudio-config-a6Rlcfnu.js";
import "./sparkles-Cqd5ml8U.js";
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
