import { L as jsxRuntimeExports, U as reactExports } from "./server-C-mhO3-H.js";
import { S as Skeleton } from "./skeleton-ExOl4CqM.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const ControlFormalHub = reactExports.lazy(() => import("./ControlFormalHub-B1izPrUd.js").then((m) => ({
  default: m.ControlFormalHub
})));
function ControlFormalSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-96" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-2xl" })
  ] });
}
function ControlFormalPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ControlFormalSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ControlFormalHub, {}) });
}
export {
  ControlFormalPage as component
};
