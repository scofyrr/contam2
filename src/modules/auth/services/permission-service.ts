import { supabase } from "@/integrations/supabase/client";
import type {
  PermisoInfo,
  UserPermissions,
  UserRole,
  UserScope,
} from "@/modules/auth/types/rbac";

const CACHE_TTL_MS = 5 * 60 * 1000;

/** Permisos legacy cuando RBAC aún no está desplegado o sin asignaciones */
const LEGACY_PERMISOS = [
  "sire.leer", "sire.crear", "sire.editar", "sire.eliminar", "sire.validar", "sire.importar",
  "diario.leer", "diario.crear", "diario.editar", "diario.aprobar", "diario.anular", "diario.plantillas",
  "caja.leer", "caja.operar", "caja.centralizar", "caja.conciliar", "caja.descentralizar",
  "pcge.leer", "pcge.crear", "pcge.editar", "pcge.eliminar", "pcge.importar",
  "contribuyentes.leer", "contribuyentes.crear", "contribuyentes.editar", "contribuyentes.eliminar",
  "ficha.leer", "ficha.editar", "ficha.consultar_sunat",
  "tareas.leer", "tareas.crear", "tareas.editar", "tareas.completar", "tareas.eliminar", "tareas.configurar",
  "reportes.leer", "reportes.exportar", "reportes.exportar_ple",
  "dashboard.leer", "dashboard.configurar",
  "admin.usuarios", "admin.roles", "admin.permisos", "admin.auditoria", "admin.configuracion", "admin.feature_flags",
];

type RpcPermRow = {
  codigo: string;
  nombre: string;
  modulo: string;
  categoria: string;
  otorgado_por_rol: string;
};

type RpcRoleRow = {
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
};

function buildScopes(roles: UserRole[], permisos: string[]): UserScope[] {
  const globalRoles = roles.filter((r) => r.activo && !r.rucScope);
  const scopedRoles = roles.filter((r) => r.activo && r.rucScope);

  const scopes: UserScope[] = [];
  if (globalRoles.length > 0) {
    scopes.push({ rucId: null, permisos: [...permisos] });
  }
  for (const r of scopedRoles) {
    scopes.push({ rucId: r.rucScope ?? null, permisos: [...permisos] });
  }
  return scopes;
}

function legacyPermissions(userId: string): UserPermissions {
  const permisosMap = new Map<string, PermisoInfo>();
  for (const codigo of LEGACY_PERMISOS) {
    const [modulo] = codigo.split(".");
    permisosMap.set(codigo, {
      codigo,
      nombre: codigo,
      modulo: modulo.toUpperCase(),
      categoria: "LEGACY",
      otorgadoPorRol: "LEGACY",
    });
  }
  const now = Date.now();
  return {
    userId,
    roles: [{
      id: "legacy",
      nombre: "LEGACY_FULL",
      nivelJerarquico: 999,
      color: "#8899B4",
      icono: "Unlock",
      fechaDesde: new Date().toISOString().slice(0, 10),
      activo: true,
    }],
    permisos: [...LEGACY_PERMISOS],
    permisosMap,
    scopes: [{ rucId: null, permisos: [...LEGACY_PERMISOS] }],
    loadedAt: now,
    expiresAt: now + CACHE_TTL_MS,
    legacyMode: true,
  };
}

class PermissionService {
  private cache = new Map<string, UserPermissions>();
  private currentUserId: string | null = null;
  private currentRucId: string | null = null;

  setContext(userId: string | null, rucId?: string | null) {
    this.currentUserId = userId;
    this.currentRucId = rucId ?? null;
  }

  invalidarCache(userId?: string) {
    if (userId) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${userId}:`)) this.cache.delete(key);
      }
      return;
    }
    this.cache.clear();
  }

  private cacheKey(userId: string, rucId?: string | null) {
    return `${userId}:${rucId ?? "*"}`;
  }

  async cargarPermisos(userId: string, rucId?: string | null): Promise<UserPermissions> {
    const key = this.cacheKey(userId, rucId);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached;
    }

    try {
      const [permRes, rolesRes, bootstrapRes] = await Promise.all([
        supabase.rpc("rpc_get_user_permissions", {
          p_user_id: userId,
          p_ruc_id: rucId ?? null,
        }),
        supabase.rpc("rpc_get_user_roles", { p_user_id: userId }),
        supabase.rpc("rpc_rbac_bootstrap_needed"),
      ]);

      if (permRes.error) throw permRes.error;

      const permRows = (permRes.data ?? []) as RpcPermRow[];
      const roleRows = (rolesRes.error ? [] : (rolesRes.data ?? [])) as RpcRoleRow[];
      const bootstrapNeeded = bootstrapRes.data === true;

      if (permRows.length === 0 && bootstrapNeeded) {
        const legacy = legacyPermissions(userId);
        this.cache.set(key, legacy);
        return legacy;
      }

      const permisosMap = new Map<string, PermisoInfo>();
      const permisos: string[] = [];
      for (const row of permRows) {
        if (!permisosMap.has(row.codigo)) {
          permisos.push(row.codigo);
          permisosMap.set(row.codigo, {
            codigo: row.codigo,
            nombre: row.nombre,
            modulo: row.modulo,
            categoria: row.categoria,
            otorgadoPorRol: row.otorgado_por_rol,
          });
        }
      }

      const roles: UserRole[] = roleRows.map((r) => ({
        id: r.id,
        nombre: r.rol_nombre,
        nivelJerarquico: r.nivel_jerarquico,
        color: r.color ?? "#8899B4",
        icono: r.icono ?? "User",
        rucScope: r.ruc_id,
        fechaDesde: r.fecha_desde,
        fechaHasta: r.fecha_hasta,
        activo: r.activo,
      }));

      const now = Date.now();
      const result: UserPermissions = {
        userId,
        roles,
        permisos,
        permisosMap,
        scopes: buildScopes(roles, permisos),
        loadedAt: now,
        expiresAt: now + CACHE_TTL_MS,
        legacyMode: false,
      };
      this.cache.set(key, result);
      return result;
    } catch {
      const legacy = legacyPermissions(userId);
      this.cache.set(key, legacy);
      return legacy;
    }
  }

  private getCached(): UserPermissions | null {
    if (!this.currentUserId) return null;
    const key = this.cacheKey(this.currentUserId, this.currentRucId);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached;
    return null;
  }

  tienePermiso(permisoCodigo: string, rucId?: string | null): boolean {
    const cached = this.getCached();
    if (!cached) return false;

    if (cached.legacyMode) return cached.permisos.includes(permisoCodigo);
    if (cached.permisos.includes(permisoCodigo)) {
      if (rucId == null) return true;
      const hasGlobal = cached.roles.some((r) => r.activo && !r.rucScope);
      if (hasGlobal) return true;
      return cached.roles.some((r) => r.activo && r.rucScope === rucId);
    }
    return false;
  }

  async tienePermisoAsync(permisoCodigo: string, userId: string, rucId?: string | null): Promise<boolean> {
    const perms = await this.cargarPermisos(userId, rucId);
    this.setContext(userId, rucId);
    if (perms.legacyMode) return perms.permisos.includes(permisoCodigo);
    if (!perms.permisos.includes(permisoCodigo)) {
      void this.registrarIntentoAcceso(permisoCodigo, false, userId);
      return false;
    }
    if (rucId == null) return true;
    const hasGlobal = perms.roles.some((r) => r.activo && !r.rucScope);
    if (hasGlobal) return true;
    return perms.roles.some((r) => r.activo && r.rucScope === rucId);
  }

  tieneAlgunPermiso(permisos: string[], rucId?: string | null): boolean {
    return permisos.some((p) => this.tienePermiso(p, rucId));
  }

  tieneTodosPermisos(permisos: string[], rucId?: string | null): boolean {
    return permisos.every((p) => this.tienePermiso(p, rucId));
  }

  getRucsPermitidos(): string[] {
    const cached = this.getCached();
    if (!cached) return [];
    if (cached.legacyMode) return [];
    const hasGlobal = cached.roles.some((r) => r.activo && !r.rucScope);
    if (hasGlobal) return [];
    return [...new Set(
      cached.roles.filter((r) => r.activo && r.rucScope).map((r) => r.rucScope as string),
    )];
  }

  async registrarIntentoAcceso(permiso: string, concedido: boolean, userId?: string): Promise<void> {
    if (concedido) return;
    const uid = userId ?? this.currentUserId;
    if (!uid) return;
    try {
      await supabase.rpc("rpc_log_security_event", {
        p_user_id: uid,
        p_accion: "PERMISO_DENEGADO",
        p_modulo: permiso.split(".")[0]?.toUpperCase() ?? null,
        p_permiso: permiso,
        p_severidad: "WARNING",
        p_detalles: { permiso, concedido: false },
      });
    } catch {
      /* noop — auditoría opcional */
    }
  }
}

export const permissionService = new PermissionService();
