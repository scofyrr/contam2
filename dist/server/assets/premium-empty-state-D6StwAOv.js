import { L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
function PremiumEmptyState({ icon: Icon, title, description, action, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 fade-in",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "svg",
            {
              className: "absolute inset-0 -m-8 size-32 opacity-40",
              viewBox: "0 0 128 128",
              "aria-hidden": true,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "empty-grad", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#C8A95A", stopOpacity: "0.35" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "#00D4FF", stopOpacity: "0.2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#00C897", stopOpacity: "0.15" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "64", cy: "64", r: "56", fill: "url(#empty-grad)" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-16 rounded-2xl glass-surface shadow-premium-medium grid place-items-center pulse-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-8 text-premium-gold", strokeWidth: 1.5 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-semibold text-foreground mb-2", children: title }),
        description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm leading-relaxed", children: description }) : null,
        action ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: action }) : null
      ]
    }
  );
}
export {
  PremiumEmptyState as P
};
