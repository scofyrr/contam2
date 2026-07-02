-- Auditoría enriquecida, alertas, vistas y RPCs de consulta
-- Idempotente — compatible con columnas legacy (tabla_nombre, usuario_id, operacion)

-- ============================================================
-- A. COLUMNAS ENRIQUECIDAS en auditoria_cambios
-- ============================================================
ALTER TABLE public.auditoria_cambios
  ADD COLUMN IF NOT EXISTS modulo_afectado text,
  ADD COLUMN IF NOT EXISTS ruc_afectado text,
  ADD COLUMN IF NOT EXISTS periodo_afectado text,
  ADD COLUMN IF NOT EXISTS accion text,
  ADD COLUMN IF NOT EXISTS detalle_jsonb jsonb,
  ADD COLUMN IF NOT EXISTS diff_jsonb jsonb,
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS severity text DEFAULT 'INFO';

CREATE INDEX IF NOT EXISTS idx_auditoria_modulo ON public.auditoria_cambios(modulo_afectado, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_ruc ON public.auditoria_cambios(ruc_afectado, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_periodo ON public.auditoria_cambios(periodo_afectado);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON public.auditoria_cambios(accion, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_severity ON public.auditoria_cambios(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_user_date ON public.auditoria_cambios(usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_created ON public.auditoria_cambios(created_at DESC);

-- ============================================================
-- B. TRIGGER ENRIQUECIDO
-- ============================================================
CREATE OR REPLACE FUNCTION public.auditar_cambios_enriched()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_modulo text;
  v_ruc text;
  v_periodo text;
  v_accion text;
  v_operacion text;
  v_diff jsonb;
  v_old_json jsonb;
  v_new_json jsonb;
  v_ip text;
  v_ua text;
  v_severity text;
  v_registro_id text;
BEGIN
  v_modulo := CASE
    WHEN TG_TABLE_NAME LIKE 'registros_sire%' THEN 'SIRE'
    WHEN TG_TABLE_NAME = 'asientos_contables' THEN 'DIARIO'
    WHEN TG_TABLE_NAME IN ('movimientos_caja', 'cuentas_financieras') THEN 'CAJA'
    WHEN TG_TABLE_NAME IN ('plan_contable_pcge', 'tabla_pcge') THEN 'PCGE'
    WHEN TG_TABLE_NAME IN ('contribuyentes', 'fichas_ruc') THEN 'CONTRIBUYENTES'
    WHEN TG_TABLE_NAME = 'tareas_pendientes' THEN 'TAREAS'
    WHEN TG_TABLE_NAME = 'config_contable' THEN 'CONFIGURACION'
    WHEN TG_TABLE_NAME IN ('usuario_roles', 'roles', 'permisos', 'rol_permisos') THEN 'SEGURIDAD'
    ELSE 'OTRO'
  END;

  v_accion := CASE
    WHEN TG_OP = 'INSERT' THEN 'CREAR'
    WHEN TG_OP = 'UPDATE' THEN 'MODIFICAR'
    WHEN TG_OP = 'DELETE' THEN 'ELIMINAR'
  END;
  v_operacion := TG_OP;

  IF TG_OP = 'DELETE' THEN
    v_old_json := to_jsonb(OLD);
    v_new_json := NULL;
    v_registro_id := OLD.id::text;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_json := NULL;
    v_new_json := to_jsonb(NEW);
    v_registro_id := NEW.id::text;
  ELSE
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
    v_registro_id := NEW.id::text;
  END IF;

  v_ruc := COALESCE(
    v_new_json->>'ruc',
    v_old_json->>'ruc',
    v_new_json->>'ruc_contraparte',
    v_old_json->>'ruc_contraparte',
    v_new_json->'datos_completos'->>'ruc',
    v_old_json->'datos_completos'->>'ruc'
  );

  v_periodo := COALESCE(
    v_new_json->>'periodo',
    v_old_json->>'periodo',
    v_new_json->'datos_completos'->>'periodo',
    v_old_json->'datos_completos'->>'periodo'
  );

  IF TG_OP = 'UPDATE' AND v_old_json IS NOT NULL AND v_new_json IS NOT NULL THEN
    SELECT COALESCE(jsonb_object_agg(key, jsonb_build_object('old', old_val, 'new', new_val)), '{}'::jsonb)
    INTO v_diff
    FROM (
      SELECT key,
             v_old_json->key AS old_val,
             v_new_json->key AS new_val
      FROM jsonb_object_keys(v_old_json) AS key
      WHERE v_old_json->key IS DISTINCT FROM v_new_json->key
    ) sub;
  END IF;

  BEGIN
    v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
    v_ua := NULL;
  END;

  v_severity := CASE
    WHEN TG_TABLE_NAME IN ('config_contable', 'usuario_roles', 'roles', 'permisos', 'rol_permisos') THEN 'CRITICAL'
    WHEN TG_OP = 'DELETE' THEN 'WARNING'
    ELSE 'INFO'
  END;

  INSERT INTO public.auditoria_cambios (
    tabla_nombre, registro_id, operacion,
    datos_anteriores, datos_nuevos, usuario_id,
    modulo_afectado, ruc_afectado, periodo_afectado, accion,
    detalle_jsonb, diff_jsonb, ip_address, user_agent, severity, created_at
  ) VALUES (
    TG_TABLE_NAME,
    v_registro_id,
    v_operacion,
    v_old_json,
    v_new_json,
    auth.uid(),
    v_modulo,
    v_ruc,
    v_periodo,
    v_accion,
    COALESCE(v_new_json, v_old_json),
    v_diff,
    v_ip,
    v_ua,
    v_severity,
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- C. APLICAR TRIGGERS (solo tablas existentes)
-- ============================================================
DO $$
DECLARE
  tablas text[] := ARRAY[
    'contribuyentes', 'fichas_ruc',
    'registros_sire', 'registros_sire_cabecera', 'registros_sire_montos',
    'registros_sire_modificaciones', 'registros_sire_adicionales',
    'asientos_contables', 'movimientos_caja', 'cuentas_financieras',
    'plan_contable_pcge', 'tabla_pcge', 'config_contable',
    'tareas_pendientes',
    'usuario_roles', 'roles', 'rol_permisos', 'permisos'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tablas
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trigger_auditoria_%s ON public.%I', t, t);
      EXECUTE format('DROP TRIGGER IF EXISTS trg_auditar_%s ON public.%I', t, t);
      EXECUTE format('DROP TRIGGER IF EXISTS trg_auditar_enriched_%s ON public.%I', t, t);
      EXECUTE format(
        'CREATE TRIGGER trg_auditar_enriched_%s
         AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios_enriched()',
        t, t
      );
    END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- D. TABLA ALERTAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alertas_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  severidad text NOT NULL DEFAULT 'WARNING',
  titulo text NOT NULL,
  descripcion text,
  modulo_afectado text,
  user_id uuid REFERENCES auth.users(id),
  ruc_afectado text,
  detalles jsonb,
  resuelta boolean DEFAULT false,
  resuelta_por uuid REFERENCES auth.users(id),
  resuelta_en timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alertas_auditoria_activas
  ON public.alertas_auditoria(created_at DESC) WHERE resuelta = false;

ALTER TABLE public.alertas_auditoria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS alertas_auditoria_select ON public.alertas_auditoria;
CREATE POLICY alertas_auditoria_select ON public.alertas_auditoria
  FOR SELECT TO authenticated
  USING (public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL));

DROP POLICY IF EXISTS alertas_auditoria_write ON public.alertas_auditoria;
CREATE POLICY alertas_auditoria_write ON public.alertas_auditoria
  FOR ALL TO authenticated
  USING (public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL))
  WITH CHECK (public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL));

GRANT SELECT, INSERT, UPDATE ON public.alertas_auditoria TO authenticated;

-- RLS auditoria_cambios (lectura admin)
ALTER TABLE public.auditoria_cambios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auditoria_cambios_select ON public.auditoria_cambios;
CREATE POLICY auditoria_cambios_select ON public.auditoria_cambios
  FOR SELECT TO authenticated
  USING (public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL));

DROP POLICY IF EXISTS auditoria_cambios_insert ON public.auditoria_cambios;
CREATE POLICY auditoria_cambios_insert ON public.auditoria_cambios
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- E. VISTAS
-- ============================================================
CREATE OR REPLACE VIEW public.v_auditoria_resumen AS
SELECT
  usuario_id AS user_id,
  DATE(created_at) AS fecha,
  modulo_afectado,
  accion,
  COUNT(*) AS cantidad,
  COUNT(DISTINCT ruc_afectado) AS rucs_afectados,
  MIN(created_at) AS primera_accion,
  MAX(created_at) AS ultima_accion
FROM public.auditoria_cambios
GROUP BY usuario_id, DATE(created_at), modulo_afectado, accion
ORDER BY fecha DESC, cantidad DESC;

CREATE OR REPLACE VIEW public.v_cambios_sensibles AS
SELECT
  ac.*,
  u.email AS usuario_email,
  COALESCE(u.raw_user_meta_data->>'nombre', u.raw_user_meta_data->>'full_name') AS usuario_nombre
FROM public.auditoria_cambios ac
LEFT JOIN auth.users u ON u.id = ac.usuario_id
WHERE
  ac.accion = 'ELIMINAR'
  OR ac.modulo_afectado IN ('CONFIGURACION', 'SEGURIDAD')
  OR ac.severity = 'CRITICAL'
  OR (ac.modulo_afectado = 'DIARIO' AND ac.accion IN ('MODIFICAR', 'ELIMINAR'))
ORDER BY ac.created_at DESC;

CREATE OR REPLACE VIEW public.v_actividad_reciente AS
SELECT
  modulo_afectado,
  accion,
  COUNT(*) AS total,
  COUNT(DISTINCT usuario_id) AS usuarios_unicos,
  COUNT(DISTINCT ruc_afectado) AS rucs_unicos,
  MAX(created_at) AS ultima_actividad
FROM public.auditoria_cambios
WHERE created_at > now() - INTERVAL '24 hours'
GROUP BY modulo_afectado, accion
ORDER BY total DESC;

GRANT SELECT ON public.v_auditoria_resumen TO authenticated;
GRANT SELECT ON public.v_cambios_sensibles TO authenticated;
GRANT SELECT ON public.v_actividad_reciente TO authenticated;

-- ============================================================
-- F. DETECCIÓN DE PATRONES ANÓMALOS
-- ============================================================
CREATE OR REPLACE FUNCTION public.detectar_patrones_anomalos()
RETURNS TABLE(
  tipo_alerta text,
  severidad text,
  titulo text,
  descripcion text,
  user_id uuid,
  detalles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    'MODIFICACION_MASIVA'::text,
    'WARNING'::text,
    'Actividad inusualmente alta'::text,
    ('El usuario ha realizado ' || COUNT(*)::text || ' modificaciones en la última hora')::text,
    ac.usuario_id,
    jsonb_build_object('cantidad_modificaciones', COUNT(*), 'modulo', ac.modulo_afectado, 'periodo', 'última hora')
  FROM public.auditoria_cambios ac
  WHERE ac.created_at > now() - INTERVAL '1 hour'
    AND ac.accion IN ('MODIFICAR', 'ELIMINAR')
  GROUP BY ac.usuario_id, ac.modulo_afectado
  HAVING COUNT(*) > 50;

  RETURN QUERY
  SELECT DISTINCT ON (ac.usuario_id, ac.modulo_afectado, date_trunc('hour', ac.created_at))
    'ACCESO_FUERA_HORARIO'::text,
    'INFO'::text,
    'Acceso fuera del horario habitual'::text,
    ('Usuario activo a las ' || TO_CHAR(ac.created_at, 'HH24:MI') || ' horas')::text,
    ac.usuario_id,
    jsonb_build_object('hora', TO_CHAR(ac.created_at, 'HH24:MI'), 'modulo', ac.modulo_afectado, 'accion', ac.accion)
  FROM public.auditoria_cambios ac
  WHERE ac.created_at > now() - INTERVAL '24 hours'
    AND EXTRACT(HOUR FROM ac.created_at AT TIME ZONE 'America/Lima') NOT BETWEEN 6 AND 22;

  RETURN QUERY
  SELECT
    'ELIMINACION_CRITICA'::text,
    'ERROR'::text,
    ('Eliminación en módulo crítico: ' || ac.modulo_afectado)::text,
    ('Se eliminó un registro en ' || ac.tabla_nombre || ' (ID: ' || ac.registro_id || ')')::text,
    ac.usuario_id,
    jsonb_build_object('tabla', ac.tabla_nombre, 'registro_id', ac.registro_id, 'ruc', ac.ruc_afectado, 'periodo', ac.periodo_afectado)
  FROM public.auditoria_cambios ac
  WHERE ac.accion = 'ELIMINAR'
    AND ac.modulo_afectado IN ('DIARIO', 'SIRE', 'CONFIGURACION', 'SEGURIDAD')
    AND ac.created_at > now() - INTERVAL '1 hour';

  RETURN QUERY
  SELECT
    'PATRON_ANOMALO'::text,
    'WARNING'::text,
    'Múltiples contribuyentes modificados'::text,
    ('El usuario modificó ' || COUNT(DISTINCT ac.ruc_afectado)::text || ' RUCs diferentes en 30 minutos')::text,
    ac.usuario_id,
    jsonb_build_object('rucs_afectados', COUNT(DISTINCT ac.ruc_afectado), 'periodo', 'últimos 30 minutos')
  FROM public.auditoria_cambios ac
  WHERE ac.created_at > now() - INTERVAL '30 minutes'
    AND ac.ruc_afectado IS NOT NULL
  GROUP BY ac.usuario_id
  HAVING COUNT(DISTINCT ac.ruc_afectado) > 10;
END;
$$;

-- ============================================================
-- G. RPCs DE CONSULTA Y GESTIÓN
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_buscar_auditoria(
  p_modulo text DEFAULT NULL,
  p_accion text DEFAULT NULL,
  p_ruc text DEFAULT NULL,
  p_periodo text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_severity text DEFAULT NULL,
  p_fecha_desde timestamptz DEFAULT NULL,
  p_fecha_hasta timestamptz DEFAULT NULL,
  p_busqueda text DEFAULT NULL,
  p_pagina int DEFAULT 1,
  p_limit int DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  usuario_id uuid,
  usuario_email text,
  tabla_nombre text,
  registro_id text,
  modulo_afectado text,
  ruc_afectado text,
  periodo_afectado text,
  accion text,
  operacion text,
  detalle_jsonb jsonb,
  diff_jsonb jsonb,
  ip_address text,
  user_agent text,
  severity text,
  created_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_offset int;
  v_total bigint;
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso admin.auditoria';
  END IF;

  v_offset := GREATEST((p_pagina - 1) * p_limit, 0);
  p_limit := LEAST(GREATEST(p_limit, 1), 200);

  SELECT COUNT(*) INTO v_total
  FROM public.auditoria_cambios ac
  WHERE (p_modulo IS NULL OR ac.modulo_afectado = p_modulo)
    AND (p_accion IS NULL OR ac.accion = p_accion)
    AND (p_ruc IS NULL OR ac.ruc_afectado = p_ruc)
    AND (p_periodo IS NULL OR ac.periodo_afectado = p_periodo)
    AND (p_user_id IS NULL OR ac.usuario_id = p_user_id)
    AND (p_severity IS NULL OR ac.severity = p_severity)
    AND (p_fecha_desde IS NULL OR ac.created_at >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR ac.created_at <= p_fecha_hasta)
    AND (
      p_busqueda IS NULL OR p_busqueda = ''
      OR ac.detalle_jsonb::text ILIKE ('%' || p_busqueda || '%')
      OR ac.tabla_nombre ILIKE ('%' || p_busqueda || '%')
      OR ac.registro_id ILIKE ('%' || p_busqueda || '%')
    );

  RETURN QUERY
  SELECT
    ac.id,
    ac.usuario_id,
    u.email::text,
    ac.tabla_nombre,
    ac.registro_id,
    ac.modulo_afectado,
    ac.ruc_afectado,
    ac.periodo_afectado,
    ac.accion,
    ac.operacion,
    ac.detalle_jsonb,
    ac.diff_jsonb,
    ac.ip_address,
    ac.user_agent,
    ac.severity,
    ac.created_at,
    v_total
  FROM public.auditoria_cambios ac
  LEFT JOIN auth.users u ON u.id = ac.usuario_id
  WHERE (p_modulo IS NULL OR ac.modulo_afectado = p_modulo)
    AND (p_accion IS NULL OR ac.accion = p_accion)
    AND (p_ruc IS NULL OR ac.ruc_afectado = p_ruc)
    AND (p_periodo IS NULL OR ac.periodo_afectado = p_periodo)
    AND (p_user_id IS NULL OR ac.usuario_id = p_user_id)
    AND (p_severity IS NULL OR ac.severity = p_severity)
    AND (p_fecha_desde IS NULL OR ac.created_at >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR ac.created_at <= p_fecha_hasta)
    AND (
      p_busqueda IS NULL OR p_busqueda = ''
      OR ac.detalle_jsonb::text ILIKE ('%' || p_busqueda || '%')
      OR ac.tabla_nombre ILIKE ('%' || p_busqueda || '%')
      OR ac.registro_id ILIKE ('%' || p_busqueda || '%')
    )
  ORDER BY ac.created_at DESC
  LIMIT p_limit OFFSET v_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_auditoria_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso admin.auditoria';
  END IF;

  SELECT jsonb_build_object(
    'acciones_hoy', (SELECT COUNT(*) FROM public.auditoria_cambios WHERE created_at > now() - INTERVAL '24 hours'),
    'usuarios_activos', (SELECT COUNT(DISTINCT usuario_id) FROM public.auditoria_cambios WHERE created_at > now() - INTERVAL '24 hours'),
    'alertas_activas', (SELECT COUNT(*) FROM public.alertas_auditoria WHERE resuelta = false),
    'modulos_activos', (SELECT COUNT(DISTINCT modulo_afectado) FROM public.auditoria_cambios WHERE created_at > now() - INTERVAL '1 hour'),
    'estado_sistema', CASE
      WHEN (SELECT COUNT(*) FROM public.alertas_auditoria WHERE resuelta = false AND severidad IN ('ERROR', 'CRITICAL')) > 0 THEN 'CRITICO'
      WHEN (SELECT COUNT(*) FROM public.alertas_auditoria WHERE resuelta = false) > 0 THEN 'ATENCION'
      ELSE 'NORMAL'
    END
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_ejecutar_deteccion_patrones()
RETURNS SETOF public.alertas_auditoria
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_id uuid;
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso admin.auditoria';
  END IF;

  FOR r IN SELECT * FROM public.detectar_patrones_anomalos()
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.alertas_auditoria a
      WHERE a.tipo = r.tipo_alerta
        AND a.user_id IS NOT DISTINCT FROM r.user_id
        AND a.resuelta = false
        AND a.created_at > now() - INTERVAL '2 hours'
    ) THEN
      INSERT INTO public.alertas_auditoria (tipo, severidad, titulo, descripcion, user_id, detalles, modulo_afectado)
      VALUES (
        r.tipo_alerta,
        r.severidad,
        r.titulo,
        r.descripcion,
        r.user_id,
        r.detalles,
        r.detalles->>'modulo'
      )
      RETURNING id INTO v_id;

      RETURN QUERY SELECT * FROM public.alertas_auditoria WHERE id = v_id;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_resolver_alerta(p_alerta_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso admin.auditoria';
  END IF;

  UPDATE public.alertas_auditoria
  SET resuelta = true, resuelta_por = auth.uid(), resuelta_en = now()
  WHERE id = p_alerta_id AND resuelta = false;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_actividad_usuario_auditoria(
  p_user_id uuid,
  p_dias int DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_desde timestamptz;
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.auditoria', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso admin.auditoria';
  END IF;

  v_desde := now() - (GREATEST(p_dias, 1) || ' days')::interval;

  RETURN jsonb_build_object(
    'total', (SELECT COUNT(*) FROM public.auditoria_cambios WHERE usuario_id = p_user_id AND created_at >= v_desde),
    'por_modulo', COALESCE((
      SELECT jsonb_object_agg(modulo_afectado, cnt)
      FROM (
        SELECT modulo_afectado, COUNT(*) AS cnt
        FROM public.auditoria_cambios
        WHERE usuario_id = p_user_id AND created_at >= v_desde AND modulo_afectado IS NOT NULL
        GROUP BY modulo_afectado
      ) s
    ), '{}'::jsonb),
    'por_accion', COALESCE((
      SELECT jsonb_object_agg(accion, cnt)
      FROM (
        SELECT accion, COUNT(*) AS cnt
        FROM public.auditoria_cambios
        WHERE usuario_id = p_user_id AND created_at >= v_desde AND accion IS NOT NULL
        GROUP BY accion
      ) s
    ), '{}'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.detectar_patrones_anomalos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_buscar_auditoria(text, text, text, text, uuid, text, timestamptz, timestamptz, text, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_auditoria_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_ejecutar_deteccion_patrones() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_resolver_alerta(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_actividad_usuario_auditoria(uuid, int) TO authenticated;
