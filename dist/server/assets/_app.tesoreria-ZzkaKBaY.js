import { L as jsxRuntimeExports, U as reactExports } from "./server-BtEtmoed.js";
import { S as Skeleton } from "./skeleton-DUGbHj_6.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
const TesoreriaHub = reactExports.lazy(() => import("./TesoreriaHub-DH7jqk-z.js").then((m) => ({
  default: m.TesoreriaHub
})));
function TesoreriaSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-80" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-2xl" })
  ] });
}
function TesoreriaPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(TesoreriaSkeleton, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TesoreriaHub, {}) });
}
export {
  TesoreriaPage as component
};
