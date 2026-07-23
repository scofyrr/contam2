import { L as jsxRuntimeExports, U as reactExports } from "./server-BOhk-Jwv.js";
import { S as Skeleton } from "./skeleton-BkQkQtWf.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const LibroMayorHub = reactExports.lazy(() => import("./LibroMayorHub-W4RLkpIm.js").then((m) => ({
  default: m.LibroMayorHub
})));
function LibroMayorSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-96" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 rounded-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-2xl" })
  ] });
}
function LibroMayorPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(LibroMayorSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(LibroMayorHub, {}) });
}
export {
  LibroMayorPage as component
};
