import { ac as supabase } from "./router-B2fOVgbK.js";
async function listarUsuariosAdmin(adminUserId) {
  const { data, error } = await supabase.rpc("rpc_list_users_for_admin", {
    p_admin_user_id: adminUserId
  });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    userId: r.user_id,
    email: r.email,
    nombre: r.nombre,
    createdAt: r.created_at,
    lastSignInAt: r.last_sign_in_at,
    rolesResumen: r.roles_resumen,
    rucsCount: r.rucs_count,
    activo: r.activo
  }));
}
async function listarRolesCatalogo() {
  const { data, error } = await supabase.rpc("rpc_list_roles_catalog");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    nivelJerarquico: r.nivel_jerarquico,
    esSistema: r.es_sistema,
    color: r.color,
    icono: r.icono
  }));
}
async function listarPermisosCatalogo() {
  const { data, error } = await supabase.from("permisos").select("codigo, nombre, modulo, categoria").order("modulo");
  if (error) throw error;
  return data ?? [];
}
async function asignarRolUsuario(adminUserId, targetUserId, rolNombre, rucId) {
  const { data, error } = await supabase.rpc("rpc_assign_role", {
    p_admin_user_id: adminUserId,
    p_target_user_id: targetUserId,
    p_rol_nombre: rolNombre,
    p_ruc_id: rucId ?? null
  });
  if (error) throw error;
  return data;
}
async function removerRolUsuario(adminUserId, asignacionId) {
  const { data, error } = await supabase.rpc("rpc_remove_role", {
    p_admin_user_id: adminUserId,
    p_asignacion_id: asignacionId
  });
  if (error) throw error;
  return data === true;
}
async function listarAuditoriaSeguridad(adminUserId, userId, limit = 50) {
  const { data, error } = await supabase.rpc("rpc_list_auditoria_seguridad", {
    p_admin_user_id: adminUserId,
    p_user_id: userId ?? null,
    p_limit: limit
  });
  if (error) throw error;
  return (data ?? []).map((a) => ({
    id: a.id,
    userId: a.user_id,
    accion: a.accion,
    modulo: a.modulo,
    permisoSolicitado: a.permiso_solicitado,
    rucAfectado: a.ruc_afectado,
    severidad: a.severidad,
    detalles: a.detalles,
    createdAt: a.created_at
  }));
}
async function obtenerPermisosEfectivosUsuario(userId, rucId) {
  const { data, error } = await supabase.rpc("rpc_get_user_permissions", {
    p_user_id: userId,
    p_ruc_id: null
  });
  if (error) throw error;
  return data ?? [];
}
async function obtenerRolesUsuario(userId) {
  const { data, error } = await supabase.rpc("rpc_get_user_roles", { p_user_id: userId });
  if (error) throw error;
  return data ?? [];
}
export {
  asignarRolUsuario as a,
  listarPermisosCatalogo as b,
  listarRolesCatalogo as c,
  listarUsuariosAdmin as d,
  obtenerRolesUsuario as e,
  listarAuditoriaSeguridad as l,
  obtenerPermisosEfectivosUsuario as o,
  removerRolUsuario as r
};
