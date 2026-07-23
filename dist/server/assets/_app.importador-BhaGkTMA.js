import { L as jsxRuntimeExports, U as reactExports } from "./server-Bo29azLP.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const ImportadorHub = reactExports.lazy(() => import("./ImportadorHub-g3v7j9sL.js").then((m) => ({
  default: m.ImportadorHub
})));
function ImportadorSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-80" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-2xl border-2 border-dashed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 rounded-2xl" })
  ] });
}
function ImportadorPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ImportadorSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImportadorHub, {}) });
}
export {
  ImportadorPage as component
};
