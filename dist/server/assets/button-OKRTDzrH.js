import { U as reactExports, L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { S as Slot, d as cva } from "./index-CWutStw1.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-lift",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-premium-subtle hover:shadow-premium-medium border border-primary/20",
        destructive: "bg-destructive text-destructive-foreground shadow-premium-subtle hover:bg-destructive/90",
        outline: "border border-border/80 glass-surface shadow-premium-subtle hover:border-primary/30 hover:text-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-premium-subtle hover:bg-secondary/80",
        ghost: "hover:bg-muted/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:scale-100"
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
export {
  Button as B,
  buttonVariants as b
};
