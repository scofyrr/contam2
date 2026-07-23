import { L as jsxRuntimeExports, U as reactExports } from "./server-BtEtmoed.js";
import { S as Skeleton } from "./skeleton-DUGbHj_6.js";
import { c as Route } from "./router-DdOnzL1Y.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const SireDashboardHub = reactExports.lazy(() => import("./SireDashboardHub-CaoS9DqM.js").then((m) => ({
  default: m.SireDashboardHub
})));
const SireSyncDashboardPremium = reactExports.lazy(() => import("./sire-sync-dashboard-premium-CX3qBDsv.js"));
function HubSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-96" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-2xl" }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 rounded-2xl" })
  ] });
}
function SireSyncPage() {
  const {
    tab
  } = Route.useSearch();
  if (tab === "legacy") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(HubSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SireSyncDashboardPremium, {}) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(HubSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SireDashboardHub, {}) });
}
export {
  SireSyncPage as component
};
