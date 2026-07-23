import { L as jsxRuntimeExports, U as reactExports } from "./server-C-mhO3-H.js";
import { S as Skeleton } from "./skeleton-ExOl4CqM.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const LibroMayorHub = reactExports.lazy(() => import("./LibroMayorHub-h090wjrb.js").then((m) => ({
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
