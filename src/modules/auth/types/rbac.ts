export interface UserRole {
  id: string;
  nombre: string;
  nivelJerarquico: number;
  color: string;
  icono: string;
  rucScope?: string | null;
  fechaDesde: string;
  fechaHasta?: string | null;
  activo: boolean;
}

export interface PermisoInfo {
  codigo: string;
  nombre: string;
  modulo: string;
  categoria: string;
  otorgadoPorRol?: string;
}

export interface UserScope {
  rucId: string | null;
  permisos: string[];
}

export interface UserPermissions {
  userId: string;
  roles: UserRole[];
  permisos: string[];
  permisosMap: Map<string, PermisoInfo>;
  scopes: UserScope[];
  loadedAt: number;
  expiresAt: number;
  legacyMode: boolean;
}

export interface RolCatalogo {
  id: string;
  nombre: string;
  descripcion: string | null;
  nivelJerarquico: number;
  esSistema: boolean;
  color: string | null;
  icono: string | null;
}

export interface UsuarioAdminRow {
  userId: string;
  email: string;
  nombre: string;
  createdAt: string;
  lastSignInAt: string | null;
  rolesResumen: string;
  rucsCount: number;
  activo: boolean;
}

export interface AuditoriaSeguridadRow {
  id: string;
  userId: string | null;
  accion: string;
  modulo: string | null;
  permisoSolicitado: string | null;
  rucAfectado: string | null;
  severidad: string;
  detalles: Record<string, unknown> | null;
  createdAt: string;
}

export interface PermisoCatalogoRow {
  codigo: string;
  nombre: string;
  modulo: string;
  categoria: string;
}
