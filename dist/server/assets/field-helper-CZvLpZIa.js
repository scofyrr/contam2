import { L as jsxRuntimeExports } from "./server-C-mhO3-H.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { C as CircleAlert } from "./circle-alert-2akrATqN.js";
import { I as Info } from "./info-DIRMoZrE.js";
function FieldHelper({ children, variant = "default", className }) {
  if (variant === "error") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("flex items-start gap-1.5 text-[0.8rem] font-medium text-destructive", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3.5 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children })
    ] });
  }
  if (variant === "info") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("flex items-start gap-1.5 text-[0.8rem] text-primary/80", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "size-3.5 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-[0.8rem] text-muted-foreground leading-relaxed", className), children });
}
export {
  FieldHelper as F
};
