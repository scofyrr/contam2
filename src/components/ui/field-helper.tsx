import { cn } from "@/lib/utils";
import { AlertCircle, Info } from "lucide-react";

type FieldHelperProps = {
  children: React.ReactNode;
  variant?: "default" | "error" | "info";
  className?: string;
};

export function FieldHelper({ children, variant = "default", className }: FieldHelperProps) {
  if (variant === "error") {
    return (
      <p className={cn("flex items-start gap-1.5 text-[0.8rem] font-medium text-destructive", className)}>
        <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
        <span>{children}</span>
      </p>
    );
  }

  if (variant === "info") {
    return (
      <p className={cn("flex items-start gap-1.5 text-[0.8rem] text-primary/80", className)}>
        <Info className="size-3.5 shrink-0 mt-0.5" />
        <span>{children}</span>
      </p>
    );
  }

  return (
    <p className={cn("text-[0.8rem] text-muted-foreground leading-relaxed", className)}>{children}</p>
  );
}
