import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  asignarRolUsuario,
  listarAuditoriaSeguridad,
  listarPermisosCatalogo,
  listarRolesCatalogo,
  listarUsuariosAdmin,
  obtenerPermisosEfectivosUsuario,
  obtenerRolesUsuario,
  removerRolUsuario,
} from "@/modules/auth/services/rbac-admin-service";
import { permissionService } from "@/modules/auth/services/permission-service";
import { useSession } from "@/hooks/use-session";

export function useUsuariosAdmin(adminUserId: string | null) {
  return useQuery({
    queryKey: ["rbac", "usuarios", adminUserId],
    queryFn: () => listarUsuariosAdmin(adminUserId!),
    enabled: !!adminUserId,
    staleTime: 30_000,
  });
}

export function useRolesCatalogo() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["rbac", "roles-catalogo"],
    queryFn: listarRolesCatalogo,
    staleTime: 5 * 60_000,
    enabled: !!user?.id,
  });
}

export function usePermisosCatalogo() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["rbac", "permisos-catalogo"],
    queryFn: listarPermisosCatalogo,
    staleTime: 5 * 60_000,
    enabled: !!user?.id,
  });
}

export function useUsuarioRoles(userId: string | null) {
  return useQuery({
    queryKey: ["rbac", "usuario-roles", userId],
    queryFn: () => obtenerRolesUsuario(userId!),
    enabled: !!userId,
  });
}

export function useUsuarioPermisosEfectivos(userId: string | null) {
  return useQuery({
    queryKey: ["rbac", "usuario-permisos", userId],
    queryFn: () => obtenerPermisosEfectivosUsuario(userId!),
    enabled: !!userId,
  });
}

export function useAuditoriaSeguridad(adminUserId: string | null, filterUserId?: string | null) {
  return useQuery({
    queryKey: ["rbac", "auditoria", adminUserId, filterUserId],
    queryFn: () => listarAuditoriaSeguridad(adminUserId!, filterUserId),
    enabled: !!adminUserId,
    staleTime: 15_000,
  });
}

export function useAsignarRol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      adminUserId,
      targetUserId,
      rolNombre,
      rucId,
    }: {
      adminUserId: string;
      targetUserId: string;
      rolNombre: string;
      rucId?: string | null;
    }) => asignarRolUsuario(adminUserId, targetUserId, rolNombre, rucId),
    onSuccess: async (_, vars) => {
      permissionService.invalidarCache(vars.targetUserId);
      await qc.invalidateQueries({ queryKey: ["rbac"] });
    },
  });
}

export function useRemoverRol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adminUserId, asignacionId }: { adminUserId: string; asignacionId: string }) =>
      removerRolUsuario(adminUserId, asignacionId),
    onSuccess: async () => {
      permissionService.invalidarCache();
      await qc.invalidateQueries({ queryKey: ["rbac"] });
    },
  });
}
