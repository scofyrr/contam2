import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FinancialSemantic } from "@/lib/theme-system";

const TYPE_CLASS: Record<FinancialSemantic, string> = {
  gain: "text-financial-gain bg-financial-gain border-financial-gain/30",
  loss: "text-financial-loss bg-financial-loss border-financial-loss/30",
  security: "text-financial-security bg-financial-security border-financial-security/30",
  info: "text-financial-info bg-financial-info border-financial-info/30",
  warning: "text-financial-warning bg-financial-warning border-financial-warning/30",
  premium: "text-financial-premium bg-financial-premium border-financial-premium/30",
  error: "text-financial-error bg-financial-error border-financial-error/30",
  success: "text-financial-success bg-financial-success border-financial-success/30",
};

export interface FinancialBadgeProps {
  type: FinancialSemantic;
  children: ReactNode;
  className?: string;
}

export function FinancialBadge({ type, children, className }: FinancialBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        TYPE_CLASS[type],
        className,
      )}
    >
      {children}
    </span>
  );
}
