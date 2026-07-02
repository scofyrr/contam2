import type { ReactNode } from "react";
import { usePermission, usePermissions } from "@/hooks/use-permissions";

type Props = {
  permiso?: string;
  rucId?: string | null;
  permisos?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

export function RequirePermission({
  permiso,
  rucId,
  permisos,
  requireAll = false,
  fallback = null,
  children,
}: Props) {
  const { tieneAlguno, tieneTodos, loading } = usePermissions();
  const singleOk = usePermission(permiso ?? "", rucId);

  if (loading) return null;

  if (permisos && permisos.length > 0) {
    const ok = requireAll ? tieneTodos(permisos, rucId) : tieneAlguno(permisos, rucId);
    if (!ok) return <>{fallback}</>;
    return <>{children}</>;
  }

  if (!permiso || !singleOk) return <>{fallback}</>;
  return <>{children}</>;
}
