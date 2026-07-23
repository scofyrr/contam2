import { L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { d as cva } from "./index-CwvZaaA2.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-premium-subtle",
        secondary: "badge-premium text-foreground",
        destructive: "border-transparent bg-destructive/90 text-destructive-foreground shadow-premium-subtle",
        outline: "glass-surface text-foreground border-border/60",
        success: "badge-premium-success",
        warning: "badge-premium-warning"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
export {
  Badge as B
};
