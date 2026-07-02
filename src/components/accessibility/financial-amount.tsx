import { cn } from "@/lib/utils";
import type { FinancialSemantic } from "@/lib/theme-system";

export type AmountType = "income" | "expense" | "neutral" | FinancialSemantic;

const TYPE_MAP: Record<AmountType, FinancialSemantic> = {
  income: "gain",
  expense: "loss",
  neutral: "info",
  gain: "gain",
  loss: "loss",
  security: "security",
  info: "info",
  warning: "warning",
  premium: "premium",
  error: "error",
  success: "success",
};

const TEXT_CLASS: Record<FinancialSemantic, string> = {
  gain: "text-financial-gain",
  loss: "text-financial-loss",
  security: "text-financial-security",
  info: "text-muted-foreground",
  warning: "text-financial-warning",
  premium: "text-financial-premium",
  error: "text-financial-error",
  success: "text-financial-success",
};

export interface FinancialAmountProps {
  value: number;
  type?: AmountType;
  currency?: string;
  showSign?: boolean;
  className?: string;
  decimals?: number;
}

function inferType(value: number, explicit?: AmountType): FinancialSemantic {
  if (explicit && explicit !== "income" && explicit !== "expense" && explicit !== "neutral") {
    return TYPE_MAP[explicit];
  }
  if (explicit === "income") return "gain";
  if (explicit === "expense") return "loss";
  if (explicit === "neutral") return "info";
  if (value > 0) return "gain";
  if (value < 0) return "loss";
  return "info";
}

export function FinancialAmount({
  value,
  type,
  currency = "S/",
  showSign = true,
  className,
  decimals = 2,
}: FinancialAmountProps) {
  const semantic = inferType(value, type);
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";

  return (
    <span
      className={cn("font-mono tabular-nums font-medium", TEXT_CLASS[semantic], className)}
      aria-label={`${currency} ${value}`}
    >
      {showSign && sign}
      {currency} {formatted}
    </span>
  );
}
