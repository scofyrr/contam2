import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { permissionService } from "@/modules/auth/services/permission-service";

export type RouteGuardContext = {
  permiso?: string;
  permisos?: string[];
  requireAll?: boolean;
  rucId?: string | null;
};

export function createPermissionGuard(permiso: string, rucId?: string | null) {
  return async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }
    const ok = await permissionService.tienePermisoAsync(permiso, session.user.id, rucId);
    if (!ok) {
      throw redirect({
        to: "/unauthorized",
        search: { permiso, from: typeof window !== "undefined" ? window.location.pathname : undefined },
      });
    }
  };
}

export function createMultiPermissionGuard(permisos: string[], requireAll = false, rucId?: string | null) {
  return async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }
    const perms = await permissionService.cargarPermisos(session.user.id, rucId);
    permissionService.setContext(session.user.id, rucId);
    const check = requireAll
      ? permisos.every((p) => permissionService.tienePermiso(p, rucId))
      : permisos.some((p) => permissionService.tienePermiso(p, rucId));
    if (!check) {
      throw redirect({
        to: "/unauthorized",
        search: { permiso: permisos.join(","), from: typeof window !== "undefined" ? window.location.pathname : undefined },
      });
    }
    return { permissions: perms };
  };
}
