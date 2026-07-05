-- RBAC: roles, permisos, asignaciones, auditoría de seguridad
-- Idempotente

-- ============================================================
-- 1. TABLA DE ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  nivel_jerarquico int NOT NULL DEFAULT 0,
  es_sistema boolean DEFAULT false,
  color text,
  icono text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. TABLA DE PERMISOS (catálogo)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  modulo text NOT NULL,
  categoria text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. TABLA DE ASIGNACIÓN ROL-PERMISOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rol_permisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rol_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permiso_id uuid NOT NULL REFERENCES public.permisos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(rol_id, permiso_id)
);

-- ============================================================
-- 4. TABLA DE ASIGNACIÓN USUARIO-ROLES (con scope por RUC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuario_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  ruc_id text,
  asignado_por uuid REFERENCES auth.users(id),
  fecha_desde date DEFAULT CURRENT_DATE,
  fecha_hasta date,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_roles_unique
  ON public.usuario_roles (user_id, rol_id, COALESCE(ruc_id, ''));

-- ============================================================
-- 5. TABLA DE AUDITORÍA DE SEGURIDAD
-- ============================================================
CREATE TABLE IF NOT EXISTS public.auditoria_seguridad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  accion text NOT NULL,
  modulo text,
  permiso_solicitado text,
  ruc_afectado text,
  ip_address text,
  user_agent text,
  detalles jsonb,
  severidad text DEFAULT 'INFO',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 6. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_usuario_roles_user ON public.usuario_roles(user_id, activo);
CREATE INDEX IF NOT EXISTS idx_usuario_roles_ruc ON public.usuario_roles(ruc_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_seguridad_user ON public.auditoria_seguridad(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_seguridad_accion ON public.auditoria_seguridad(accion, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rol_permisos_rol ON public.rol_permisos(rol_id);

-- ============================================================
-- 7. DATOS SEMILLA — ROLES
-- ============================================================
INSERT INTO public.roles (nombre, descripcion, nivel_jerarquico, es_sistema, color, icono) VALUES
  ('SUPER_ADMIN', 'Super Administrador del Sistema - Acceso total sin restricciones', 100, true, '#C8A44D', 'Crown'),
  ('ADMIN_ESTUDIO', 'Administrador del Estudio Contable - Gestiona usuarios y configuración', 80, true, '#00C8FF', 'Shield'),
  ('CONTADOR_SENIOR', 'Contador Senior - Acceso completo a módulos contables con aprobación', 60, true, '#00C897', 'BadgeCheck'),
  ('CONTADOR', 'Contador - Acceso a módulos contables operativos', 40, true, '#9B87F5', 'Briefcase'),
  ('AUXILIAR_CONTABLE', 'Auxiliar Contable - Registro de comprobantes y movimientos', 20, true, '#F0A500', 'UserCheck'),
  ('SOLO_LECTURA', 'Consulta - Solo lectura de reportes y consultas', 10, true, '#8899B4', 'Eye'),
  ('CLIENTE', 'Cliente/Contribuyente - Acceso limitado a sus propios datos', 5, true, '#FF5E7A', 'User')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- 8. DATOS SEMILLA — PERMISOS
-- ============================================================
INSERT INTO public.permisos (codigo, nombre, descripcion, modulo, categoria) VALUES
  ('sire.leer', 'Ver Registros SIRE', 'Consultar comprobantes de compra y venta', 'SIRE', 'LECTURA'),
  ('sire.crear', 'Crear Registros SIRE', 'Registrar nuevos comprobantes manualmente', 'SIRE', 'ESCRITURA'),
  ('sire.editar', 'Editar Registros SIRE', 'Modificar comprobantes existentes', 'SIRE', 'ESCRITURA'),
  ('sire.eliminar', 'Eliminar Registros SIRE', 'Eliminar comprobantes (soft delete)', 'SIRE', 'ADMINISTRACION'),
  ('sire.validar', 'Validar y Provisionar', 'Validar comprobantes y generar asientos de provisión', 'SIRE', 'APROBACION'),
  ('sire.importar', 'Importar SIRE', 'Importar comprobantes desde archivo externo', 'SIRE', 'ESCRITURA'),
  ('diario.leer', 'Ver Libro Diario', 'Consultar asientos contables', 'DIARIO', 'LECTURA'),
  ('diario.crear', 'Crear Asientos', 'Crear asientos contables manuales', 'DIARIO', 'ESCRITURA'),
  ('diario.editar', 'Editar Asientos', 'Modificar asientos no aprobados', 'DIARIO', 'ESCRITURA'),
  ('diario.aprobar', 'Aprobar Asientos', 'Aprobar asientos para cierre', 'DIARIO', 'APROBACION'),
  ('diario.anular', 'Anular Asientos', 'Anular asientos con registro de auditoría', 'DIARIO', 'ADMINISTRACION'),
  ('diario.plantillas', 'Gestionar Plantillas', 'Crear y editar plantillas de asientos', 'DIARIO', 'ADMINISTRACION'),
  ('caja.leer', 'Ver Libro Caja', 'Consultar movimientos de caja y bancos', 'CAJA', 'LECTURA'),
  ('caja.operar', 'Operar Caja', 'Registrar ingresos y egresos', 'CAJA', 'ESCRITURA'),
  ('caja.centralizar', 'Centralizar Caja', 'Ejecutar centralización de movimientos', 'CAJA', 'APROBACION'),
  ('caja.conciliar', 'Conciliar Bancos', 'Ejecutar conciliación bancaria', 'CAJA', 'APROBACION'),
  ('caja.descentralizar', 'Descentralizar', 'Revertir centralización de período', 'CAJA', 'ADMINISTRACION'),
  ('pcge.leer', 'Ver Plan Contable', 'Consultar el plan de cuentas', 'PCGE', 'LECTURA'),
  ('pcge.crear', 'Crear Cuentas', 'Agregar nuevas cuentas al plan', 'PCGE', 'ESCRITURA'),
  ('pcge.editar', 'Editar Cuentas', 'Modificar cuentas existentes', 'PCGE', 'ESCRITURA'),
  ('pcge.eliminar', 'Eliminar Cuentas', 'Eliminar cuentas no utilizadas', 'PCGE', 'ADMINISTRACION'),
  ('pcge.importar', 'Importar PCGE', 'Importar plan contable desde archivo', 'PCGE', 'ADMINISTRACION'),
  ('contribuyentes.leer', 'Ver Contribuyentes', 'Consultar lista de RUCs', 'CONTRIBUYENTES', 'LECTURA'),
  ('contribuyentes.crear', 'Crear Contribuyentes', 'Registrar nuevos RUCs', 'CONTRIBUYENTES', 'ESCRITURA'),
  ('contribuyentes.editar', 'Editar Contribuyentes', 'Modificar datos de RUCs', 'CONTRIBUYENTES', 'ESCRITURA'),
  ('contribuyentes.eliminar', 'Eliminar Contribuyentes', 'Dar de baja RUCs', 'CONTRIBUYENTES', 'ADMINISTRACION'),
  ('ficha.leer', 'Ver Ficha RUC', 'Consultar datos SUNAT', 'FICHA_RUC', 'LECTURA'),
  ('ficha.editar', 'Editar Ficha RUC', 'Modificar datos de ficha', 'FICHA_RUC', 'ESCRITURA'),
  ('ficha.consultar_sunat', 'Consultar SUNAT', 'Ejecutar consulta a SUNAT', 'FICHA_RUC', 'ESCRITURA'),
  ('tareas.leer', 'Ver Tareas', 'Consultar tareas pendientes', 'TAREAS', 'LECTURA'),
  ('tareas.crear', 'Crear Tareas', 'Crear nuevas tareas', 'TAREAS', 'ESCRITURA'),
  ('tareas.editar', 'Editar Tareas', 'Modificar tareas existentes', 'TAREAS', 'ESCRITURA'),
  ('tareas.completar', 'Completar Tareas', 'Marcar tareas como completadas', 'TAREAS', 'ESCRITURA'),
  ('tareas.eliminar', 'Eliminar Tareas', 'Eliminar tareas', 'TAREAS', 'ADMINISTRACION'),
  ('tareas.configurar', 'Configurar Reglas', 'Configurar reglas de generación automática', 'TAREAS', 'ADMINISTRACION'),
  ('reportes.leer', 'Ver Reportes', 'Acceder a reportes y dashboards', 'REPORTES', 'LECTURA'),
  ('reportes.exportar', 'Exportar Reportes', 'Exportar a PDF/Excel', 'REPORTES', 'ESCRITURA'),
  ('reportes.exportar_ple', 'Exportar PLE', 'Exportar libros electrónicos SUNAT', 'REPORTES', 'APROBACION'),
  ('dashboard.leer', 'Ver Dashboard', 'Acceder a KPIs y estadísticas', 'DASHBOARD', 'LECTURA'),
  ('dashboard.configurar', 'Configurar Dashboard', 'Personalizar widgets', 'DASHBOARD', 'ADMINISTRACION'),
  ('admin.usuarios', 'Gestionar Usuarios', 'Crear, editar, desactivar usuarios', 'ADMIN', 'ADMINISTRACION'),
  ('admin.roles', 'Gestionar Roles', 'Crear y asignar roles', 'ADMIN', 'ADMINISTRACION'),
  ('admin.permisos', 'Gestionar Permisos', 'Configurar permisos de roles', 'ADMIN', 'ADMINISTRACION'),
  ('admin.auditoria', 'Ver Auditoría', 'Acceder a registros de auditoría', 'ADMIN', 'ADMINISTRACION'),
  ('admin.configuracion', 'Configurar Sistema', 'Acceder a configuración general', 'ADMIN', 'ADMINISTRACION'),
  ('admin.feature_flags', 'Gestionar Feature Flags', 'Activar/desactivar funcionalidades', 'ADMIN', 'ADMINISTRACION')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- 9. ASIGNACIÓN DE PERMISOS A ROLES
-- ============================================================
CREATE OR REPLACE FUNCTION public.assign_permisos_to_rol(p_rol_nombre text, p_permisos text[])
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_rol_id uuid;
  v_permiso_id uuid;
  v_permiso text;
BEGIN
  SELECT id INTO v_rol_id FROM public.roles WHERE nombre = p_rol_nombre;
  IF v_rol_id IS NULL THEN
    RAISE EXCEPTION 'Rol % no encontrado', p_rol_nombre;
  END IF;

  FOREACH v_permiso IN ARRAY p_permisos
  LOOP
    SELECT id INTO v_permiso_id FROM public.permisos WHERE codigo = v_permiso;
    IF v_permiso_id IS NOT NULL THEN
      INSERT INTO public.rol_permisos (rol_id, permiso_id)
      VALUES (v_rol_id, v_permiso_id)
      ON CONFLICT (rol_id, permiso_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

SELECT public.assign_permisos_to_rol('SUPER_ADMIN', ARRAY[
  'sire.leer','sire.crear','sire.editar','sire.eliminar','sire.validar','sire.importar',
  'diario.leer','diario.crear','diario.editar','diario.aprobar','diario.anular','diario.plantillas',
  'caja.leer','caja.operar','caja.centralizar','caja.conciliar','caja.descentralizar',
  'pcge.leer','pcge.crear','pcge.editar','pcge.eliminar','pcge.importar',
  'contribuyentes.leer','contribuyentes.crear','contribuyentes.editar','contribuyentes.eliminar',
  'ficha.leer','ficha.editar','ficha.consultar_sunat',
  'tareas.leer','tareas.crear','tareas.editar','tareas.completar','tareas.eliminar','tareas.configurar',
  'reportes.leer','reportes.exportar','reportes.exportar_ple',
  'dashboard.leer','dashboard.configurar',
  'admin.usuarios','admin.roles','admin.permisos','admin.auditoria','admin.configuracion','admin.feature_flags'
]);

SELECT public.assign_permisos_to_rol('ADMIN_ESTUDIO', ARRAY[
  'sire.leer','sire.crear','sire.editar','sire.validar','sire.importar',
  'diario.leer','diario.crear','diario.editar','diario.aprobar','diario.anular','diario.plantillas',
  'caja.leer','caja.operar','caja.centralizar','caja.conciliar',
  'pcge.leer','pcge.crear','pcge.editar',
  'contribuyentes.leer','contribuyentes.crear','contribuyentes.editar',
  'ficha.leer','ficha.editar','ficha.consultar_sunat',
  'tareas.leer','tareas.crear','tareas.editar','tareas.completar','tareas.configurar',
  'reportes.leer','reportes.exportar','reportes.exportar_ple',
  'dashboard.leer','dashboard.configurar',
  'admin.usuarios','admin.roles','admin.auditoria','admin.configuracion'
]);

SELECT public.assign_permisos_to_rol('CONTADOR_SENIOR', ARRAY[
  'sire.leer','sire.crear','sire.editar','sire.validar','sire.importar',
  'diario.leer','diario.crear','diario.editar','diario.aprobar','diario.plantillas',
  'caja.leer','caja.operar','caja.centralizar','caja.conciliar',
  'pcge.leer','pcge.crear','pcge.editar',
  'contribuyentes.leer','contribuyentes.crear','contribuyentes.editar',
  'ficha.leer','ficha.editar','ficha.consultar_sunat',
  'tareas.leer','tareas.crear','tareas.editar','tareas.completar',
  'reportes.leer','reportes.exportar','reportes.exportar_ple',
  'dashboard.leer'
]);

SELECT public.assign_permisos_to_rol('CONTADOR', ARRAY[
  'sire.leer','sire.crear','sire.editar','sire.validar',
  'diario.leer','diario.crear','diario.editar',
  'caja.leer','caja.operar','caja.centralizar',
  'pcge.leer','pcge.crear',
  'contribuyentes.leer','contribuyentes.crear','contribuyentes.editar',
  'ficha.leer','ficha.editar',
  'tareas.leer','tareas.crear','tareas.editar','tareas.completar',
  'reportes.leer','reportes.exportar',
  'dashboard.leer'
]);

SELECT public.assign_permisos_to_rol('AUXILIAR_CONTABLE', ARRAY[
  'sire.leer','sire.crear',
  'diario.leer',
  'caja.leer','caja.operar',
  'pcge.leer',
  'contribuyentes.leer',
  'ficha.leer',
  'tareas.leer','tareas.crear','tareas.completar',
  'reportes.leer',
  'dashboard.leer'
]);

SELECT public.assign_permisos_to_rol('SOLO_LECTURA', ARRAY[
  'sire.leer','diario.leer','caja.leer','pcge.leer',
  'contribuyentes.leer','ficha.leer','tareas.leer',
  'reportes.leer','dashboard.leer'
]);

SELECT public.assign_permisos_to_rol('CLIENTE', ARRAY[
  'sire.leer','diario.leer','caja.leer','ficha.leer',
  'reportes.leer','dashboard.leer'
]);

-- ============================================================
-- 10. FUNCIONES RPC DE SEGURIDAD
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_check_permission(
  p_user_id uuid,
  p_permiso_codigo text,
  p_ruc_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_tiene_permiso boolean := false;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.usuario_roles ur
    JOIN public.roles r ON r.id = ur.rol_id
    WHERE ur.user_id = p_user_id
      AND r.nombre = 'SUPER_ADMIN'
      AND ur.activo = true
      AND (ur.fecha_hasta IS NULL OR ur.fecha_hasta >= CURRENT_DATE)
  ) THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.usuario_roles ur
    JOIN public.roles r ON r.id = ur.rol_id
    JOIN public.rol_permisos rp ON rp.rol_id = r.id
    JOIN public.permisos p ON p.id = rp.permiso_id
    WHERE ur.user_id = p_user_id
      AND p.codigo = p_permiso_codigo
      AND ur.activo = true
      AND (ur.fecha_hasta IS NULL OR ur.fecha_hasta >= CURRENT_DATE)
      AND (
        ur.ruc_id IS NULL
        OR ur.ruc_id = p_ruc_id
        OR p_ruc_id IS NULL
      )
  ) INTO v_tiene_permiso;

  RETURN v_tiene_permiso;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_user_permissions(
  p_user_id uuid,
  p_ruc_id text DEFAULT NULL
)
RETURNS TABLE(
  codigo text,
  nombre text,
  modulo text,
  categoria text,
  otorgado_por_rol text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.usuario_roles ur
    JOIN public.roles r ON r.id = ur.rol_id
    WHERE ur.user_id = p_user_id
      AND r.nombre = 'SUPER_ADMIN'
      AND ur.activo = true
      AND (ur.fecha_hasta IS NULL OR ur.fecha_hasta >= CURRENT_DATE)
  ) THEN
    RETURN QUERY
    SELECT p.codigo, p.nombre, p.modulo, p.categoria, 'SUPER_ADMIN'::text
    FROM public.permisos p
    ORDER BY p.modulo, p.codigo;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT DISTINCT
    p.codigo,
    p.nombre,
    p.modulo,
    p.categoria,
    r.nombre AS otorgado_por_rol
  FROM public.usuario_roles ur
  JOIN public.roles r ON r.id = ur.rol_id
  JOIN public.rol_permisos rp ON rp.rol_id = r.id
  JOIN public.permisos p ON p.id = rp.permiso_id
  WHERE ur.user_id = p_user_id
    AND ur.activo = true
    AND (ur.fecha_hasta IS NULL OR ur.fecha_hasta >= CURRENT_DATE)
    AND (
      ur.ruc_id IS NULL
      OR ur.ruc_id = p_ruc_id
      OR p_ruc_id IS NULL
    )
  ORDER BY p.modulo, p.codigo;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_user_roles(
  p_user_id uuid
)
RETURNS TABLE(
  id uuid,
  rol_id uuid,
  rol_nombre text,
  nivel_jerarquico int,
  color text,
  icono text,
  ruc_id text,
  fecha_desde date,
  fecha_hasta date,
  activo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.id,
    r.id,
    r.nombre,
    r.nivel_jerarquico,
    r.color,
    r.icono,
    ur.ruc_id,
    ur.fecha_desde,
    ur.fecha_hasta,
    ur.activo
  FROM public.usuario_roles ur
  JOIN public.roles r ON r.id = ur.rol_id
  WHERE ur.user_id = p_user_id
  ORDER BY r.nivel_jerarquico DESC, ur.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_assign_role(
  p_admin_user_id uuid,
  p_target_user_id uuid,
  p_rol_nombre text,
  p_ruc_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol_id uuid;
  v_asignacion_id uuid;
BEGIN
  IF NOT public.rpc_check_permission(p_admin_user_id, 'admin.roles', NULL) THEN
    RAISE EXCEPTION 'No tiene permisos para asignar roles';
  END IF;

  SELECT id INTO v_rol_id FROM public.roles WHERE nombre = p_rol_nombre;
  IF v_rol_id IS NULL THEN
    RAISE EXCEPTION 'Rol % no encontrado', p_rol_nombre;
  END IF;

  INSERT INTO public.usuario_roles (user_id, rol_id, ruc_id, asignado_por)
  VALUES (p_target_user_id, v_rol_id, p_ruc_id, p_admin_user_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_asignacion_id;

  IF v_asignacion_id IS NULL THEN
    SELECT ur.id INTO v_asignacion_id
    FROM public.usuario_roles ur
    WHERE ur.user_id = p_target_user_id
      AND ur.rol_id = v_rol_id
      AND COALESCE(ur.ruc_id, '') = COALESCE(p_ruc_id, '');
  END IF;

  INSERT INTO public.auditoria_seguridad (user_id, accion, detalles)
  VALUES (
    p_admin_user_id,
    'ROL_ASIGNADO',
    jsonb_build_object(
      'target_user', p_target_user_id,
      'rol', p_rol_nombre,
      'ruc', p_ruc_id,
      'asignacion_id', v_asignacion_id
    )
  );

  RETURN v_asignacion_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_remove_role(
  p_admin_user_id uuid,
  p_asignacion_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.usuario_roles%ROWTYPE;
BEGIN
  IF NOT public.rpc_check_permission(p_admin_user_id, 'admin.roles', NULL) THEN
    RAISE EXCEPTION 'No tiene permisos para remover roles';
  END IF;

  SELECT * INTO v_row FROM public.usuario_roles WHERE id = p_asignacion_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE public.usuario_roles SET activo = false, updated_at = now()
  WHERE id = p_asignacion_id;

  INSERT INTO public.auditoria_seguridad (user_id, accion, detalles)
  VALUES (
    p_admin_user_id,
    'ROL_REMOVIDO',
    jsonb_build_object(
      'target_user', v_row.user_id,
      'asignacion_id', p_asignacion_id,
      'rol_id', v_row.rol_id,
      'ruc', v_row.ruc_id
    )
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_log_security_event(
  p_user_id uuid,
  p_accion text,
  p_modulo text DEFAULT NULL,
  p_permiso text DEFAULT NULL,
  p_ruc text DEFAULT NULL,
  p_severidad text DEFAULT 'INFO',
  p_detalles jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  BEGIN
    v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
    v_ua := NULL;
  END;

  INSERT INTO public.auditoria_seguridad (
    user_id, accion, modulo, permiso_solicitado,
    ruc_afectado, severidad, detalles, ip_address, user_agent
  ) VALUES (
    p_user_id, p_accion, p_modulo, p_permiso,
    p_ruc, p_severidad, p_detalles, v_ip, v_ua
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_list_users_for_admin(p_admin_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  email text,
  nombre text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  roles_resumen text,
  rucs_count int,
  activo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.rpc_check_permission(p_admin_user_id, 'admin.usuarios', NULL) THEN
    RAISE EXCEPTION 'No tiene permisos para listar usuarios';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(u.raw_user_meta_data->>'nombre', split_part(u.email, '@', 1))::text,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(
      (
        SELECT string_agg(DISTINCT r.nombre, ', ' ORDER BY r.nombre)
        FROM public.usuario_roles ur
        JOIN public.roles r ON r.id = ur.rol_id
        WHERE ur.user_id = u.id AND ur.activo = true
      ),
      'Sin rol'
    ),
    (
      SELECT count(DISTINCT ur.ruc_id)::int
      FROM public.usuario_roles ur
      WHERE ur.user_id = u.id AND ur.activo = true AND ur.ruc_id IS NOT NULL
    ),
    COALESCE((u.banned_until IS NULL OR u.banned_until < now()), true)
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_list_auditoria_seguridad(
  p_admin_user_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_limit int DEFAULT 50
)
RETURNS SETOF public.auditoria_seguridad
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.rpc_check_permission(p_admin_user_id, 'admin.auditoria', NULL) THEN
    RAISE EXCEPTION 'No tiene permisos para ver auditoría';
  END IF;

  RETURN QUERY
  SELECT a.*
  FROM public.auditoria_seguridad a
  WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
  ORDER BY a.created_at DESC
  LIMIT LEAST(p_limit, 200);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_list_roles_catalog()
RETURNS SETOF public.roles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.roles ORDER BY nivel_jerarquico DESC;
$$;

CREATE OR REPLACE FUNCTION public.rpc_rbac_bootstrap_needed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.usuario_roles LIMIT 1);
$$;

-- ============================================================
-- 11. RLS
-- ============================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rol_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_seguridad ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS roles_select ON public.roles;
CREATE POLICY roles_select ON public.roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS permisos_select ON public.permisos;
CREATE POLICY permisos_select ON public.permisos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rol_permisos_select ON public.rol_permisos;
CREATE POLICY rol_permisos_select ON public.rol_permisos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS usuario_roles_select_own ON public.usuario_roles;
CREATE POLICY usuario_roles_select_own ON public.usuario_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.rpc_check_permission(auth.uid(), 'admin.roles', NULL));

DROP POLICY IF EXISTS usuario_roles_admin ON public.usuario_roles;
CREATE POLICY usuario_roles_admin ON public.usuario_roles
  FOR ALL TO authenticated
  USING (public.rpc_check_permission(auth.uid(), 'admin.roles', NULL))
  WITH CHECK (public.rpc_check_permission(auth.uid(), 'admin.roles', NULL));

DROP POLICY IF EXISTS auditoria_select ON public.auditoria_seguridad;
CREATE POLICY auditoria_select ON public.auditoria_seguridad
  FOR SELECT TO authenticated
  USING (public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL));

DROP POLICY IF EXISTS auditoria_insert ON public.auditoria_seguridad;
CREATE POLICY auditoria_insert ON public.auditoria_seguridad
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 12. GRANTS
-- ============================================================
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.permisos TO authenticated;
GRANT SELECT ON public.rol_permisos TO authenticated;
GRANT SELECT ON public.usuario_roles TO authenticated;
GRANT SELECT ON public.auditoria_seguridad TO authenticated;

GRANT EXECUTE ON FUNCTION public.rpc_check_permission(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_user_permissions(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_user_roles(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_assign_role(uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_remove_role(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_log_security_event(uuid, text, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_list_users_for_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_list_auditoria_seguridad(uuid, uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_list_roles_catalog() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_rbac_bootstrap_needed() TO authenticated;
