import { L as jsxRuntimeExports, U as reactExports } from "./server-BIroHbvu.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const ContabilidadHub = reactExports.lazy(() => import("./ContabilidadHub-NEVcwe-8.js").then((m) => ({
  default: m.ContabilidadHub
})));
function ContabilidadSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-96" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 rounded-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-2xl" })
  ] });
}
function ContabilidadPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ContabilidadSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContabilidadHub, {}) });
}
export {
  ContabilidadPage as component
};
