import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/hooks/use-session";
import { permissionService } from "@/modules/auth/services/permission-service";
import type { UserPermissions, UserRole } from "@/modules/auth/types/rbac";

type PermissionsCtx = {
  loading: boolean;
  permissions: UserPermissions | null;
  tiene: (codigo: string, rucId?: string | null) => boolean;
  tieneAlguno: (codigos: string[], rucId?: string | null) => boolean;
  tieneTodos: (codigos: string[], rucId?: string | null) => boolean;
  permisos: string[];
  roles: UserRole[];
  legacyMode: boolean;
  recargar: () => Promise<void>;
};

const PermissionsContext = createContext<PermissionsCtx | null>(null);

export function PermissionsProvider({
  children,
  rucId,
}: {
  children: ReactNode;
  rucId?: string | null;
}) {
  const { user, loading: sessionLoading } = useSession();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) {
      setPermissions(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    permissionService.setContext(user.id, rucId);
    const perms = await permissionService.cargarPermisos(user.id, rucId);
    setPermissions(perms);
    setLoading(false);
  }, [user?.id, rucId]);

  useEffect(() => {
    if (sessionLoading) return;
    void load();
  }, [sessionLoading, load]);

  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      void load();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id, load]);

  const value = useMemo<PermissionsCtx>(() => ({
    loading: sessionLoading || loading,
    permissions,
    tiene: (codigo, scopeRuc) => {
      if (!permissions) return false;
      permissionService.setContext(user?.id ?? "", scopeRuc ?? rucId);
      return permissionService.tienePermiso(codigo, scopeRuc ?? rucId);
    },
    tieneAlguno: (codigos, scopeRuc) =>
      codigos.some((c) => permissionService.tienePermiso(c, scopeRuc ?? rucId)),
    tieneTodos: (codigos, scopeRuc) =>
      codigos.every((c) => permissionService.tienePermiso(c, scopeRuc ?? rucId)),
    permisos: permissions?.permisos ?? [],
    roles: permissions?.roles ?? [],
    legacyMode: permissions?.legacyMode ?? false,
    recargar: async () => {
      if (user?.id) permissionService.invalidarCache(user.id);
      await load();
    },
  }), [sessionLoading, loading, permissions, user?.id, rucId, load]);

  return (
    <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions debe usarse dentro de PermissionsProvider");
  }
  return ctx;
}

export function usePermission(codigo: string, rucId?: string | null): boolean {
  const { tiene, loading } = usePermissions();
  if (loading) return false;
  return tiene(codigo, rucId);
}
