import { L as jsxRuntimeExports, U as reactExports } from "./server-BOhk-Jwv.js";
import { S as Skeleton } from "./skeleton-BkQkQtWf.js";
import { g as Route } from "./router-B2oVQHub.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const AsientoTraceabilityViewerPremium = reactExports.lazy(() => import("./asiento-traceability-viewer-premium-vsAQaE5o.js"));
function TraceSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full bg-[#070C1B] p-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-64 bg-white/10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-xl bg-white/5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-xl bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-xl bg-white/5" })
    ] })
  ] });
}
function TrazabilidadPage() {
  const {
    sireRegistroId
  } = Route.useParams();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(TraceSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(AsientoTraceabilityViewerPremium, { sireRegistroId }) });
}
export {
  TrazabilidadPage as component
};
