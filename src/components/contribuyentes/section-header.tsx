import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FieldHelper } from "@/components/ui/field-helper";

export function SectionHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-t-lg border border-b-0 border-blue-200/80 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-3 dark:from-blue-950/40 dark:to-slate-900/40 dark:border-blue-900/50",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-b-lg border border-t-0 border-blue-200/80 bg-card p-4 mb-6 dark:border-blue-900/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

export function Field({
  label,
  required,
  help,
  children,
  className,
  aiFieldPath,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: ReactNode;
  className?: string;
  /** Marca el contenedor para highlight del modo Composer AI */
  aiFieldPath?: string;
}) {
  return (
    <div className={className} {...(aiFieldPath ? { "data-ai-field-wrap": aiFieldPath } : {})}>
      <label className="text-xs font-medium text-foreground/80 mb-1.5 block">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {help ? <FieldHelper className="mt-1">{help}</FieldHelper> : null}
    </div>
  );
}
