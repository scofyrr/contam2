import { type ReactNode } from "react";

import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils";

export interface ClientOnlyProps {
  children: ReactNode;
  /** Contenido SSR-safe mientras no hay montaje en cliente */
  fallback?: ReactNode;
  /** Skeleton glassmorphism por defecto si no hay fallback */
  skeletonClassName?: string;
}

function DefaultFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "glass-shimmer rounded-lg min-h-[1.25rem] w-full",
        className,
      )}
      aria-hidden
    />
  );
}

/**
 * Evita renderizar hijos sensibles a hidratación hasta el montaje en cliente.
 * Útil para fechas relativas, Intl.NumberFormat, sessionStorage, PDF preview, etc.
 */
export function ClientOnly({
  children,
  fallback,
  skeletonClassName,
}: ClientOnlyProps) {
  const mounted = useIsMounted();

  if (!mounted) {
    if (fallback !== undefined) return <>{fallback}</>;
    return <DefaultFallback className={skeletonClassName} />;
  }

  return <>{children}</>;
}
