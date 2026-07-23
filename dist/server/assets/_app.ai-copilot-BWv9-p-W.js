import { L as jsxRuntimeExports, U as reactExports } from "./server-BOhk-Jwv.js";
import { S as Skeleton } from "./skeleton-BkQkQtWf.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const AiCopilotWidget = reactExports.lazy(() => import("./AiCopilotWidget-Csu5H32g.js").then((m) => ({
  default: m.AiCopilotWidget
})));
function AiCopilotSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-96" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-2xl" })
  ] });
}
function AiCopilotPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(AiCopilotSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiCopilotWidget, {}) });
}
export {
  AiCopilotPage as component
};
