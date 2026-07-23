import { L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { u as useIsMounted } from "./useIsMounted-4vSd_CfI.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
function DefaultFallback({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "glass-shimmer rounded-lg min-h-[1.25rem] w-full",
        className
      ),
      "aria-hidden": true
    }
  );
}
function ClientOnly({
  children,
  fallback,
  skeletonClassName
}) {
  const mounted = useIsMounted();
  if (!mounted) {
    if (fallback !== void 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: fallback });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DefaultFallback, { className: skeletonClassName });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
export {
  ClientOnly as C
};
