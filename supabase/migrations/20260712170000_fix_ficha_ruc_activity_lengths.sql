-- Fix column length constraints by altering restricted varchar columns to text and add missing enrichment columns in public.fichas_ruc

-- 1. Alter public.fichas_ruc columns to text
ALTER TABLE public.fichas_ruc 
  ALTER COLUMN razon_social TYPE text,
  ALTER COLUMN nombre_comercial TYPE text,
  ALTER COLUMN tipo_contribuyente TYPE text,
  ALTER COLUMN estado_contribuyente TYPE text,
  ALTER COLUMN condicion_domicilio_fiscal TYPE text,
  ALTER COLUMN dependencia_sunat TYPE text,
  ALTER COLUMN tipo_representacion TYPE text,
  ALTER COLUMN sistema_emision_comprobantes TYPE text,
  ALTER COLUMN sistema_contabilidad TYPE text,
  ALTER COLUMN actividad_comercio_exterior TYPE text,
  ALTER COLUMN actividad_economica_principal TYPE text,
  ALTER COLUMN actividad_economica_secundaria1 TYPE text,
  ALTER COLUMN actividad_economica_secundaria2 TYPE text,
  ALTER COLUMN actividad_economica TYPE text,
  ALTER COLUMN codigo_profesion_oficio TYPE text,
  ALTER COLUMN departamento TYPE text,
  ALTER COLUMN provincia TYPE text,
  ALTER COLUMN distrito TYPE text,
  ALTER COLUMN tipo_zona TYPE text,
  ALTER COLUMN nombre_zona TYPE text,
  ALTER COLUMN tipo_via TYPE text,
  ALTER COLUMN nombre_via TYPE text,
  ALTER COLUMN numero TYPE text,
  ALTER COLUMN km TYPE text,
  ALTER COLUMN manzana TYPE text,
  ALTER COLUMN lote TYPE text,
  ALTER COLUMN departamento_interno TYPE text,
  ALTER COLUMN interior TYPE text,
  ALTER COLUMN condicion_inmueble TYPE text,
  ALTER COLUMN licencia_municipal TYPE text,
  ALTER COLUMN documento_identidad TYPE text,
  ALTER COLUMN sexo TYPE text,
  ALTER COLUMN nacionalidad TYPE text,
  ALTER COLUMN cond_domiciliado TYPE text,
  ALTER COLUMN pasaporte TYPE text,
  ALTER COLUMN pais_procedencia TYPE text,
  ALTER COLUMN tomo_ficha_folio_asiento TYPE text,
  ALTER COLUMN pais_origen_capital TYPE text,
  ALTER COLUMN numero_partida_registral TYPE text,
  ALTER COLUMN origen_capital TYPE text,
  ALTER COLUMN telefono_fijo1 TYPE text,
  ALTER COLUMN telefono_fijo2 TYPE text,
  ALTER COLUMN telefono_movil1 TYPE text,
  ALTER COLUMN telefono_movil2 TYPE text,
  ALTER COLUMN correo_electronico1 TYPE text,
  ALTER COLUMN correo_electronico2 TYPE text;

-- 2. Alter public.representantes_legales columns to text
ALTER TABLE public.representantes_legales
  ALTER COLUMN tipo_documento TYPE text,
  ALTER COLUMN numero_documento TYPE text,
  ALTER COLUMN apellidos_nombres TYPE text,
  ALTER COLUMN cargo TYPE text,
  ALTER COLUMN numero_orden_representacion TYPE text;

-- 3. Alter public.tributos_afectos columns to text
ALTER TABLE public.tributos_afectos
  ALTER COLUMN tributo TYPE text,
  ALTER COLUMN modificacion TYPE text;

-- 4. Alter public.establecimientos_anexos columns to text
ALTER TABLE public.establecimientos_anexos
  ALTER COLUMN codigo TYPE text,
  ALTER COLUMN tipo TYPE text,
  ALTER COLUMN denominacion TYPE text,
  ALTER COLUMN ubigeo TYPE text,
  ALTER COLUMN condicion_legal TYPE text,
  ALTER COLUMN licencia_municipal TYPE text,
  ALTER COLUMN actividad_economica TYPE text;

-- 5. Add missing enrichment and sync metadata columns
ALTER TABLE public.fichas_ruc
  ADD COLUMN IF NOT EXISTS datos_incompletos boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fuente_datos text DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS ultima_actualizacion timestamptz,
  ADD COLUMN IF NOT EXISTS ultima_actividad timestamptz,
  ADD COLUMN IF NOT EXISTS cantidad_comprobantes int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_compras_12m numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_ventas_12m numeric(14,2) DEFAULT 0;


-- 6. Fix process_audit_log() trigger function to support tables without 'id' column (like fichas_ruc or tabla_pcge)
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ruc text;
  v_periodo text;
  v_modulo text;
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
    v_registro_id := COALESCE(v_old_json->>'id', v_old_json->>'ruc', v_old_json->>'codigo', 'S/N');
  ELSIF TG_OP = 'INSERT' THEN
    v_old_json := NULL;
    v_new_json := to_jsonb(NEW);
    v_registro_id := COALESCE(v_new_json->>'id', v_new_json->>'ruc', v_new_json->>'codigo', 'S/N');
  ELSE
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
    v_registro_id := COALESCE(v_new_json->>'id', v_new_json->>'ruc', v_new_json->>'codigo', 'S/N');
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
      SELECT key, old_val, new_val
      FROM (
        SELECT COALESCE(o.key, n.key) AS key, o.value AS old_val, n.value AS new_val
        FROM jsonb_each(v_old_json) o
        FULL JOIN jsonb_each(v_new_json) n ON o.key = n.key
      ) s
      WHERE old_val IS DISTINCT FROM new_val
        AND key NOT IN ('created_at', 'updated_at', 'last_sync_at')
    ) diff;
  ELSE
    v_diff := '{}'::jsonb;
  END IF;

  BEGIN
    v_ip := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
    v_ua := current_setting('request.headers', true)::jsonb->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
    v_ua := NULL;
  END;

  v_severity := CASE
    WHEN v_modulo = 'SEGURIDAD' OR (v_modulo = 'CONFIGURACION' AND v_accion = 'ELIMINAR') THEN 'ALTA'
    WHEN v_accion = 'ELIMINAR' THEN 'MEDIA'
    ELSE 'BAJA'
  END;

  INSERT INTO public.auditoria_logs (
    ruc, periodo, modulo, accion, operacion, tabla_afectada,
    registro_id, valor_anterior, valor_nuevo, diferencias,
    ip_address, user_agent, severity, realizado_por
  ) VALUES (
    v_ruc,
    v_periodo,
    v_modulo,
    v_accion,
    v_operacion,
    TG_TABLE_NAME,
    v_registro_id,
    v_old_json,
    v_new_json,
    v_diff,
    v_ip,
    v_ua,
    v_severity,
    auth.uid()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;


-- 7. Fix auditar_cambios_enriched() trigger function to support tables without 'id' column (like fichas_ruc or tabla_pcge)
CREATE OR REPLACE FUNCTION public.auditar_cambios_enriched()
RETURNS TRIGGER
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
    v_registro_id := COALESCE(v_old_json->>'id', v_old_json->>'ruc', v_old_json->>'codigo', 'S/N');
  ELSIF TG_OP = 'INSERT' THEN
    v_old_json := NULL;
    v_new_json := to_jsonb(NEW);
    v_registro_id := COALESCE(v_new_json->>'id', v_new_json->>'ruc', v_new_json->>'codigo', 'S/N');
  ELSE
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
    v_registro_id := COALESCE(v_new_json->>'id', v_new_json->>'ruc', v_new_json->>'codigo', 'S/N');
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
