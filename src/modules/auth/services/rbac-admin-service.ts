import { supabase } from "@/integrations/supabase/client";
import type {
  AuditoriaSeguridadRow,
  PermisoCatalogoRow,
  RolCatalogo,
  UsuarioAdminRow,
} from "@/modules/auth/types/rbac";

type RpcUserRow = {
  user_id: string;
  email: string;
  nombre: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles_resumen: string;
  rucs_count: number;
  activo: boolean;
};

type DbRol = {
  id: string;
  nombre: string;
  descripcion: string | null;
  nivel_jerarquico: number;
  es_sistema: boolean;
  color: string | null;
  icono: string | null;
};

type DbAuditoria = {
  id: string;
  user_id: string | null;
  accion: string;
  modulo: string | null;
  permiso_solicitado: string | null;
  ruc_afectado: string | null;
  severidad: string;
  detalles: Record<string, unknown> | null;
  created_at: string;
};

export async function listarUsuariosAdmin(adminUserId: string): Promise<UsuarioAdminRow[]> {
  const { data, error } = await supabase.rpc("rpc_list_users_for_admin", {
    p_admin_user_id: adminUserId,
  });
  if (error) throw error;
  return ((data ?? []) as RpcUserRow[]).map((r) => ({
    userId: r.user_id,
    email: r.email,
    nombre: r.nombre,
    createdAt: r.created_at,
    lastSignInAt: r.last_sign_in_at,
    rolesResumen: r.roles_resumen,
    rucsCount: r.rucs_count,
    activo: r.activo,
  }));
}

export async function listarRolesCatalogo(): Promise<RolCatalogo[]> {
  const { data, error } = await supabase.rpc("rpc_list_roles_catalog");
  if (error) throw error;
  return ((data ?? []) as DbRol[]).map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    nivelJerarquico: r.nivel_jerarquico,
    esSistema: r.es_sistema,
    color: r.color,
    icono: r.icono,
  }));
}

export async function listarPermisosCatalogo(): Promise<PermisoCatalogoRow[]> {
  const { data, error } = await supabase.from("permisos").select("codigo, nombre, modulo, categoria").order("modulo");
  if (error) throw error;
  return (data ?? []) as PermisoCatalogoRow[];
}

export async function asignarRolUsuario(
  adminUserId: string,
  targetUserId: string,
  rolNombre: string,
  rucId?: string | null,
): Promise<string> {
  const { data, error } = await supabase.rpc("rpc_assign_role", {
    p_admin_user_id: adminUserId,
    p_target_user_id: targetUserId,
    p_rol_nombre: rolNombre,
    p_ruc_id: rucId ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function removerRolUsuario(adminUserId: string, asignacionId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("rpc_remove_role", {
    p_admin_user_id: adminUserId,
    p_asignacion_id: asignacionId,
  });
  if (error) throw error;
  return data === true;
}

export async function listarAuditoriaSeguridad(
  adminUserId: string,
  userId?: string | null,
  limit = 50,
): Promise<AuditoriaSeguridadRow[]> {
  const { data, error } = await supabase.rpc("rpc_list_auditoria_seguridad", {
    p_admin_user_id: adminUserId,
    p_user_id: userId ?? null,
    p_limit: limit,
  });
  if (error) throw error;
  return ((data ?? []) as DbAuditoria[]).map((a) => ({
    id: a.id,
    userId: a.user_id,
    accion: a.accion,
    modulo: a.modulo,
    permisoSolicitado: a.permiso_solicitado,
    rucAfectado: a.ruc_afectado,
    severidad: a.severidad,
    detalles: a.detalles,
    createdAt: a.created_at,
  }));
}

export async function obtenerPermisosEfectivosUsuario(userId: string, rucId?: string | null) {
  const { data, error } = await supabase.rpc("rpc_get_user_permissions", {
    p_user_id: userId,
    p_ruc_id: rucId ?? null,
  });
  if (error) throw error;
  return (data ?? []) as Array<{
    codigo: string;
    nombre: string;
    modulo: string;
    categoria: string;
    otorgado_por_rol: string;
  }>;
}

export async function obtenerRolesUsuario(userId: string) {
  const { data, error } = await supabase.rpc("rpc_get_user_roles", { p_user_id: userId });
  if (error) throw error;
  return (data ?? []) as Array<{
    id: string;
    rol_id: string;
    rol_nombre: string;
    nivel_jerarquico: number;
    color: string;
    icono: string;
    ruc_id: string | null;
    fecha_desde: string;
    fecha_hasta: string | null;
    activo: boolean;
  }>;
}
