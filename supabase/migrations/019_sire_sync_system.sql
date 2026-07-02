-- SIRE Sync System: puente legacy ↔ normalizado
-- Idempotente. Ejecutable múltiples veces.
-- Anti-bucle: session GUC app.sire_sync_guard

-- ============================================================
-- A. TABLA sire_sync_errors
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sire_sync_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  source_table text NOT NULL,
  target_table text NOT NULL,
  record_id uuid,
  error_message text NOT NULL,
  error_detail jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sire_sync_errors_unresolved
  ON public.sire_sync_errors(created_at DESC)
  WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sire_sync_errors_record
  ON public.sire_sync_errors(record_id)
  WHERE record_id IS NOT NULL;

-- Columna datos_completos en legacy (snapshot JSONB)
ALTER TABLE public.registros_sire
  ADD COLUMN IF NOT EXISTS datos_completos jsonb DEFAULT '{}'::jsonb;

-- ============================================================
-- Helpers: guard anti-bucle + logging
-- ============================================================
CREATE OR REPLACE FUNCTION public.sire_sync_is_guard(p_direction text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('app.sire_sync_guard', true), '') = p_direction;
$$;

CREATE OR REPLACE FUNCTION public.sire_sync_set_guard(p_direction text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.sire_sync_guard', p_direction, true);
END;
$$;

CREATE OR REPLACE FUNCTION public.sire_sync_clear_guard()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.sire_sync_guard', '', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_sire_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    auth.jwt() ->> 'email' = 'admin@contam.pe',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.log_sire_sync_error(
  p_operation_type text,
  p_source_table text,
  p_target_table text,
  p_record_id uuid,
  p_error_message text,
  p_error_detail jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sire_sync_errors (
    operation_type, source_table, target_table, record_id,
    error_message, error_detail
  ) VALUES (
    p_operation_type, p_source_table, p_target_table, p_record_id,
    p_error_message, COALESCE(p_error_detail, '{}'::jsonb)
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'log_sire_sync_error failed: %', SQLERRM;
END;
$$;

-- ============================================================
-- Build JSONB snapshot from normalized row
-- ============================================================
CREATE OR REPLACE FUNCTION public.build_sire_datos_completos(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'cabecera', to_jsonb(c) - 'created_at' - 'updated_at',
    'montos', to_jsonb(m) - 'created_at' - 'updated_at',
    'modificaciones', to_jsonb(mod) - 'created_at' - 'updated_at',
    'adicionales', to_jsonb(a) - 'created_at' - 'updated_at'
  )
  INTO v_result
  FROM public.registros_sire_cabecera c
  LEFT JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
  LEFT JOIN public.registros_sire_modificaciones mod ON mod.registro_sire_id = c.id
  LEFT JOIN public.registros_sire_adicionales a ON a.registro_sire_id = c.id
  WHERE c.id = p_id;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ============================================================
-- B. sync_normalized_row_to_legacy (UPSERT / DELETE)
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_normalized_row_to_legacy(
  p_id uuid,
  p_op text DEFAULT 'UPSERT'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_c public.registros_sire_cabecera%ROWTYPE;
  v_m public.registros_sire_montos%ROWTYPE;
  v_mod public.registros_sire_modificaciones%ROWTYPE;
  v_a public.registros_sire_adicionales%ROWTYPE;
  v_datos jsonb;
BEGIN
  IF p_op = 'DELETE' THEN
    DELETE FROM public.registros_sire WHERE id = p_id;
    RETURN;
  END IF;

  SELECT * INTO v_c FROM public.registros_sire_cabecera WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO v_m FROM public.registros_sire_montos WHERE registro_sire_id = p_id;
  SELECT * INTO v_mod FROM public.registros_sire_modificaciones WHERE registro_sire_id = p_id;
  SELECT * INTO v_a FROM public.registros_sire_adicionales WHERE registro_sire_id = p_id;

  v_datos := public.build_sire_datos_completos(p_id);

  INSERT INTO public.registros_sire (
    id, tipo, ruc, razon_social, periodo, car_sunat, fecha_emision, fecha_vencimiento,
    cod_tipo_cdp, serie_cdp, anio_dam_dsi, nro_cdp_inicial, nro_cdp_final,
    tipo_doc_contraparte, nro_doc_contraparte, nombre_contraparte,
    bi_grav, igv_grav, bi_grav_y_no_grav, igv_grav_y_no_grav,
    bi_no_grav, igv_no_grav, valor_no_grav, isc, icbper, otros_tributos,
    importe_total, cod_moneda, tipo_cambio,
    fecha_emision_mod, tipo_cdp_mod, serie_cdp_mod, cod_dam_dsi, nro_cdp_mod,
    clasificacion_bienes_serv, id_proyecto_operadores, pct_participacion,
    impuesto_beneficio, car_orig_indicador, campos_38_41, campos_libres,
    tipo_venta_config, observaciones,
    mto_bi_gravada, mto_igv_ipe, mto_total_cp,
    estado_validacion, estado_cobro, estado_pago,
    cuenta_pcge, finalidad_operativa, descripcion_items,
    cancelacion_asiento_id, cancelacion_mov_caja_id, cancelacion_generada_at,
    datos_completos, created_at, updated_at
  ) VALUES (
    v_c.id, v_c.tipo, v_c.ruc, v_c.razon_social, v_c.periodo, v_c.car_sunat,
    v_c.fecha_emision, v_c.fecha_vencimiento, v_c.cod_tipo_cdp, v_c.serie_cdp,
    v_c.anio_dam_dsi, v_c.nro_cdp_inicial, v_c.nro_cdp_final,
    v_c.tipo_doc_contraparte, v_c.nro_doc_contraparte, v_c.nombre_contraparte,
    COALESCE(v_m.bi_grav, 0), COALESCE(v_m.igv_grav, 0),
    COALESCE(v_m.bi_grav_y_no_grav, 0), COALESCE(v_m.igv_grav_y_no_grav, 0),
    COALESCE(v_m.bi_no_grav, 0), COALESCE(v_m.igv_no_grav, 0),
    COALESCE(v_m.valor_no_grav, 0), COALESCE(v_m.isc, 0), COALESCE(v_m.icbper, 0),
    COALESCE(v_m.otros_tributos, 0), COALESCE(v_m.importe_total, 0),
    v_c.cod_moneda, COALESCE(v_c.tipo_cambio, 1),
    v_mod.fecha_emision_mod, v_mod.tipo_cdp_mod, v_mod.serie_cdp_mod,
    v_mod.cod_dam_dsi, v_mod.nro_cdp_mod,
    v_a.clasificacion_bienes_serv, v_a.id_proyecto_operadores,
    COALESCE(v_a.pct_participacion, 0), COALESCE(v_a.impuesto_beneficio, 0),
    v_a.car_orig_indicador,
    COALESCE(v_a.campos_38_41, '{}'::jsonb), COALESCE(v_a.campos_libres, '{}'::jsonb),
    COALESCE(v_a.tipo_venta_config, '[]'::jsonb), v_a.observaciones,
    COALESCE(v_m.mto_bi_gravada, v_m.bi_grav, 0),
    COALESCE(v_m.mto_igv_ipe, v_m.igv_grav, 0),
    COALESCE(v_m.mto_total_cp, v_m.importe_total, 0),
    v_c.estado_validacion, v_c.estado_cobro, v_c.estado_pago,
    v_c.cuenta_pcge, v_c.finalidad_operativa, v_c.descripcion_items,
    v_c.cancelacion_asiento_id, v_c.cancelacion_mov_caja_id, v_c.cancelacion_generada_at,
    v_datos, v_c.created_at, v_c.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    ruc = EXCLUDED.ruc,
    razon_social = EXCLUDED.razon_social,
    periodo = EXCLUDED.periodo,
    car_sunat = EXCLUDED.car_sunat,
    fecha_emision = EXCLUDED.fecha_emision,
    fecha_vencimiento = EXCLUDED.fecha_vencimiento,
    cod_tipo_cdp = EXCLUDED.cod_tipo_cdp,
    serie_cdp = EXCLUDED.serie_cdp,
    anio_dam_dsi = EXCLUDED.anio_dam_dsi,
    nro_cdp_inicial = EXCLUDED.nro_cdp_inicial,
    nro_cdp_final = EXCLUDED.nro_cdp_final,
    tipo_doc_contraparte = EXCLUDED.tipo_doc_contraparte,
    nro_doc_contraparte = EXCLUDED.nro_doc_contraparte,
    nombre_contraparte = EXCLUDED.nombre_contraparte,
    bi_grav = EXCLUDED.bi_grav,
    igv_grav = EXCLUDED.igv_grav,
    bi_grav_y_no_grav = EXCLUDED.bi_grav_y_no_grav,
    igv_grav_y_no_grav = EXCLUDED.igv_grav_y_no_grav,
    bi_no_grav = EXCLUDED.bi_no_grav,
    igv_no_grav = EXCLUDED.igv_no_grav,
    valor_no_grav = EXCLUDED.valor_no_grav,
    isc = EXCLUDED.isc,
    icbper = EXCLUDED.icbper,
    otros_tributos = EXCLUDED.otros_tributos,
    importe_total = EXCLUDED.importe_total,
    cod_moneda = EXCLUDED.cod_moneda,
    tipo_cambio = EXCLUDED.tipo_cambio,
    fecha_emision_mod = EXCLUDED.fecha_emision_mod,
    tipo_cdp_mod = EXCLUDED.tipo_cdp_mod,
    serie_cdp_mod = EXCLUDED.serie_cdp_mod,
    cod_dam_dsi = EXCLUDED.cod_dam_dsi,
    nro_cdp_mod = EXCLUDED.nro_cdp_mod,
    clasificacion_bienes_serv = EXCLUDED.clasificacion_bienes_serv,
    id_proyecto_operadores = EXCLUDED.id_proyecto_operadores,
    pct_participacion = EXCLUDED.pct_participacion,
    impuesto_beneficio = EXCLUDED.impuesto_beneficio,
    car_orig_indicador = EXCLUDED.car_orig_indicador,
    campos_38_41 = EXCLUDED.campos_38_41,
    campos_libres = EXCLUDED.campos_libres,
    tipo_venta_config = EXCLUDED.tipo_venta_config,
    observaciones = EXCLUDED.observaciones,
    mto_bi_gravada = EXCLUDED.mto_bi_gravada,
    mto_igv_ipe = EXCLUDED.mto_igv_ipe,
    mto_total_cp = EXCLUDED.mto_total_cp,
    estado_validacion = EXCLUDED.estado_validacion,
    estado_cobro = EXCLUDED.estado_cobro,
    estado_pago = EXCLUDED.estado_pago,
    cuenta_pcge = EXCLUDED.cuenta_pcge,
    finalidad_operativa = EXCLUDED.finalidad_operativa,
    descripcion_items = EXCLUDED.descripcion_items,
    cancelacion_asiento_id = EXCLUDED.cancelacion_asiento_id,
    cancelacion_mov_caja_id = EXCLUDED.cancelacion_mov_caja_id,
    cancelacion_generada_at = EXCLUDED.cancelacion_generada_at,
    datos_completos = EXCLUDED.datos_completos,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_normalized_to_legacy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.sire_sync_is_guard('legacy_to_norm') OR public.sire_sync_is_guard('bulk_migrate') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  BEGIN
    PERFORM public.sire_sync_set_guard('norm_to_legacy');

    IF TG_OP = 'DELETE' THEN
      PERFORM public.sync_normalized_row_to_legacy(OLD.id, 'DELETE');
    ELSE
      PERFORM public.sync_normalized_row_to_legacy(NEW.id, 'UPSERT');
    END IF;

    PERFORM public.sire_sync_clear_guard();
  EXCEPTION WHEN OTHERS THEN
    PERFORM public.sire_sync_clear_guard();
    PERFORM public.log_sire_sync_error(
      TG_OP, TG_TABLE_NAME, 'registros_sire', COALESCE(NEW.id, OLD.id),
      SQLERRM, jsonb_build_object('sqlstate', SQLSTATE, 'trigger', TG_NAME)
    );
  END;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_normalized_child_to_legacy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF public.sire_sync_is_guard('legacy_to_norm') OR public.sire_sync_is_guard('bulk_migrate') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_id := COALESCE(NEW.registro_sire_id, OLD.registro_sire_id);

  BEGIN
    PERFORM public.sire_sync_set_guard('norm_to_legacy');
    PERFORM public.sync_normalized_row_to_legacy(v_id, 'UPSERT');
    PERFORM public.sire_sync_clear_guard();
  EXCEPTION WHEN OTHERS THEN
    PERFORM public.sire_sync_clear_guard();
    PERFORM public.log_sire_sync_error(
      TG_OP, TG_TABLE_NAME, 'registros_sire', v_id,
      SQLERRM, jsonb_build_object('sqlstate', SQLSTATE, 'trigger', TG_NAME)
    );
  END;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- C. sync_legacy_to_normalized
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_legacy_row_to_normalized(
  p_id uuid,
  p_op text DEFAULT 'UPSERT'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_r public.registros_sire%ROWTYPE;
  v_datos jsonb;
BEGIN
  IF p_op = 'DELETE' THEN
    DELETE FROM public.registros_sire_cabecera WHERE id = p_id;
    RETURN;
  END IF;

  SELECT * INTO v_r FROM public.registros_sire WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_datos := COALESCE(v_r.datos_completos, '{}'::jsonb);

  BEGIN
    INSERT INTO public.registros_sire_cabecera (
    id, tipo, ruc, razon_social, periodo, car_sunat, fecha_emision, fecha_vencimiento,
    cod_tipo_cdp, serie_cdp, anio_dam_dsi, nro_cdp_inicial, nro_cdp_final,
    tipo_doc_contraparte, nro_doc_contraparte, nombre_contraparte,
    cod_moneda, tipo_cambio, estado_validacion, estado_cobro, estado_pago,
    cuenta_pcge, finalidad_operativa, descripcion_items,
    cancelacion_asiento_id, cancelacion_mov_caja_id, cancelacion_generada_at,
    created_at, updated_at
  ) VALUES (
    v_r.id, v_r.tipo, v_r.ruc, v_r.razon_social, v_r.periodo, v_r.car_sunat,
    v_r.fecha_emision, v_r.fecha_vencimiento, v_r.cod_tipo_cdp, v_r.serie_cdp,
    v_r.anio_dam_dsi, v_r.nro_cdp_inicial, v_r.nro_cdp_final,
    v_r.tipo_doc_contraparte, v_r.nro_doc_contraparte, v_r.nombre_contraparte,
    v_r.cod_moneda, COALESCE(v_r.tipo_cambio, 1),
    COALESCE(v_r.estado_validacion, 'pendiente'),
    COALESCE(v_r.estado_cobro, 'pendiente'),
    COALESCE(v_r.estado_pago, 'pendiente'),
    v_r.cuenta_pcge, v_r.finalidad_operativa, v_r.descripcion_items,
    v_r.cancelacion_asiento_id, v_r.cancelacion_mov_caja_id, v_r.cancelacion_generada_at,
    v_r.created_at, v_r.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    ruc = EXCLUDED.ruc,
    razon_social = EXCLUDED.razon_social,
    periodo = EXCLUDED.periodo,
    car_sunat = EXCLUDED.car_sunat,
    fecha_emision = EXCLUDED.fecha_emision,
    fecha_vencimiento = EXCLUDED.fecha_vencimiento,
    cod_tipo_cdp = EXCLUDED.cod_tipo_cdp,
    serie_cdp = EXCLUDED.serie_cdp,
    anio_dam_dsi = EXCLUDED.anio_dam_dsi,
    nro_cdp_inicial = EXCLUDED.nro_cdp_inicial,
    nro_cdp_final = EXCLUDED.nro_cdp_final,
    tipo_doc_contraparte = EXCLUDED.tipo_doc_contraparte,
    nro_doc_contraparte = EXCLUDED.nro_doc_contraparte,
    nombre_contraparte = EXCLUDED.nombre_contraparte,
    cod_moneda = EXCLUDED.cod_moneda,
    tipo_cambio = EXCLUDED.tipo_cambio,
    estado_validacion = EXCLUDED.estado_validacion,
    estado_cobro = EXCLUDED.estado_cobro,
    estado_pago = EXCLUDED.estado_pago,
    cuenta_pcge = EXCLUDED.cuenta_pcge,
    finalidad_operativa = EXCLUDED.finalidad_operativa,
    descripcion_items = EXCLUDED.descripcion_items,
    cancelacion_asiento_id = EXCLUDED.cancelacion_asiento_id,
    cancelacion_mov_caja_id = EXCLUDED.cancelacion_mov_caja_id,
    cancelacion_generada_at = EXCLUDED.cancelacion_generada_at,
    updated_at = now();

  INSERT INTO public.registros_sire_montos (
    registro_sire_id, bi_grav, igv_grav, bi_grav_y_no_grav, igv_grav_y_no_grav,
    bi_no_grav, igv_no_grav, valor_no_grav, isc, icbper, otros_tributos,
    importe_total, mto_bi_gravada, mto_igv_ipe, mto_total_cp,
    bi_adq_grav, igv_adq_grav
  ) VALUES (
    v_r.id,
    COALESCE(v_r.bi_grav, 0), COALESCE(v_r.igv_grav, 0),
    COALESCE(v_r.bi_grav_y_no_grav, 0), COALESCE(v_r.igv_grav_y_no_grav, 0),
    COALESCE(v_r.bi_no_grav, 0), COALESCE(v_r.igv_no_grav, 0),
    COALESCE(v_r.valor_no_grav, 0), COALESCE(v_r.isc, 0), COALESCE(v_r.icbper, 0),
    COALESCE(v_r.otros_tributos, 0), COALESCE(v_r.importe_total, 0),
    COALESCE(v_r.mto_bi_gravada, v_r.bi_grav, 0),
    COALESCE(v_r.mto_igv_ipe, v_r.igv_grav, 0),
    COALESCE(v_r.mto_total_cp, v_r.importe_total, 0),
    COALESCE(v_r.bi_grav, 0), COALESCE(v_r.igv_grav, 0)
  )
  ON CONFLICT (registro_sire_id) DO UPDATE SET
    bi_grav = EXCLUDED.bi_grav,
    igv_grav = EXCLUDED.igv_grav,
    bi_grav_y_no_grav = EXCLUDED.bi_grav_y_no_grav,
    igv_grav_y_no_grav = EXCLUDED.igv_grav_y_no_grav,
    bi_no_grav = EXCLUDED.bi_no_grav,
    igv_no_grav = EXCLUDED.igv_no_grav,
    valor_no_grav = EXCLUDED.valor_no_grav,
    isc = EXCLUDED.isc,
    icbper = EXCLUDED.icbper,
    otros_tributos = EXCLUDED.otros_tributos,
    importe_total = EXCLUDED.importe_total,
    mto_bi_gravada = EXCLUDED.mto_bi_gravada,
    mto_igv_ipe = EXCLUDED.mto_igv_ipe,
    mto_total_cp = EXCLUDED.mto_total_cp,
    bi_adq_grav = EXCLUDED.bi_adq_grav,
    igv_adq_grav = EXCLUDED.igv_adq_grav,
    updated_at = now();

  INSERT INTO public.registros_sire_modificaciones (
    registro_sire_id, fecha_emision_mod, tipo_cdp_mod, serie_cdp_mod, cod_dam_dsi, nro_cdp_mod
  ) VALUES (
    v_r.id, v_r.fecha_emision_mod, v_r.tipo_cdp_mod, v_r.serie_cdp_mod,
    v_r.cod_dam_dsi, v_r.nro_cdp_mod
  )
  ON CONFLICT (registro_sire_id) DO UPDATE SET
    fecha_emision_mod = EXCLUDED.fecha_emision_mod,
    tipo_cdp_mod = EXCLUDED.tipo_cdp_mod,
    serie_cdp_mod = EXCLUDED.serie_cdp_mod,
    cod_dam_dsi = EXCLUDED.cod_dam_dsi,
    nro_cdp_mod = EXCLUDED.nro_cdp_mod,
    updated_at = now();

  INSERT INTO public.registros_sire_adicionales (
    registro_sire_id, clasificacion_bienes_serv, id_proyecto_operadores,
    pct_participacion, impuesto_beneficio, car_orig_indicador,
    campos_38_41, campos_libres, tipo_venta_config, observaciones
  ) VALUES (
    v_r.id, v_r.clasificacion_bienes_serv, v_r.id_proyecto_operadores,
    COALESCE(v_r.pct_participacion, 0), COALESCE(v_r.impuesto_beneficio, 0),
    v_r.car_orig_indicador,
    COALESCE(v_r.campos_38_41, '{}'::jsonb), COALESCE(v_r.campos_libres, '{}'::jsonb),
    COALESCE(v_r.tipo_venta_config, '[]'::jsonb), v_r.observaciones
  )
  ON CONFLICT (registro_sire_id) DO UPDATE SET
    clasificacion_bienes_serv = EXCLUDED.clasificacion_bienes_serv,
    id_proyecto_operadores = EXCLUDED.id_proyecto_operadores,
    pct_participacion = EXCLUDED.pct_participacion,
    impuesto_beneficio = EXCLUDED.impuesto_beneficio,
    car_orig_indicador = EXCLUDED.car_orig_indicador,
    campos_38_41 = EXCLUDED.campos_38_41,
    campos_libres = EXCLUDED.campos_libres,
    tipo_venta_config = EXCLUDED.tipo_venta_config,
    observaciones = EXCLUDED.observaciones,
    updated_at = now();

  EXCEPTION WHEN OTHERS THEN
    PERFORM public.log_sire_sync_error(
      p_op, 'registros_sire', 'registros_sire_cabecera', p_id,
      SQLERRM, jsonb_build_object('sqlstate', SQLSTATE, 'datos_completos', v_datos)
    );
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_legacy_to_normalized()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.sire_sync_is_guard('norm_to_legacy') OR public.sire_sync_is_guard('bulk_migrate') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  BEGIN
    PERFORM public.sire_sync_set_guard('legacy_to_norm');

    IF TG_OP = 'DELETE' THEN
      PERFORM public.sync_legacy_row_to_normalized(OLD.id, 'DELETE');
    ELSE
      PERFORM public.sync_legacy_row_to_normalized(NEW.id, 'UPSERT');
    END IF;

    PERFORM public.sire_sync_clear_guard();
  EXCEPTION WHEN OTHERS THEN
    PERFORM public.sire_sync_clear_guard();
    PERFORM public.log_sire_sync_error(
      TG_OP, TG_TABLE_NAME, 'registros_sire_cabecera', COALESCE(NEW.id, OLD.id),
      SQLERRM, jsonb_build_object('sqlstate', SQLSTATE, 'trigger', TG_NAME)
    );
  END;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- D. reconcile_sire_records
-- ============================================================
CREATE OR REPLACE FUNCTION public.reconcile_sire_records(p_dry_run boolean DEFAULT true)
RETURNS TABLE (
  discrepancy_type text,
  record_id uuid,
  legacy_exists boolean,
  normalized_exists boolean,
  detail jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS _sire_reconcile_tmp (
    discrepancy_type text,
    record_id uuid,
    legacy_exists boolean,
    normalized_exists boolean,
    detail jsonb
  ) ON COMMIT DROP;

  TRUNCATE _sire_reconcile_tmp;

  INSERT INTO _sire_reconcile_tmp
  SELECT
    'missing_in_normalized'::text,
    l.id,
    true,
    false,
    jsonb_build_object('periodo', l.periodo, 'tipo', l.tipo, 'ruc', l.ruc)
  FROM public.registros_sire l
  WHERE NOT EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = l.id);

  INSERT INTO _sire_reconcile_tmp
  SELECT
    'missing_in_legacy'::text,
    c.id,
    false,
    true,
    jsonb_build_object('periodo', c.periodo, 'tipo', c.tipo, 'ruc', c.ruc)
  FROM public.registros_sire_cabecera c
  WHERE NOT EXISTS (SELECT 1 FROM public.registros_sire l WHERE l.id = c.id);

  INSERT INTO _sire_reconcile_tmp
  SELECT
    'field_mismatch'::text,
    l.id,
    true,
    true,
    jsonb_build_object(
      'legacy_importe', l.importe_total,
      'normalized_importe', COALESCE(m.importe_total, 0),
      'legacy_estado', l.estado_validacion,
      'normalized_estado', c.estado_validacion
    )
  FROM public.registros_sire l
  INNER JOIN public.registros_sire_cabecera c ON c.id = l.id
  LEFT JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
  WHERE abs(COALESCE(l.importe_total, 0) - COALESCE(m.importe_total, 0)) > 0.05
     OR COALESCE(l.estado_validacion, 'pendiente') <> COALESCE(c.estado_validacion, 'pendiente');

  INSERT INTO _sire_reconcile_tmp
  SELECT
    'orphan_fk_asiento'::text,
    ac.sire_registro_id,
    EXISTS (SELECT 1 FROM public.registros_sire l WHERE l.id = ac.sire_registro_id),
    EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = ac.sire_registro_id),
    jsonb_build_object(
      'asiento_id', ac.id,
      'periodo', ac.periodo,
      'ruc', ac.ruc
    )
  FROM public.asientos_contables ac
  WHERE ac.sire_registro_id IS NOT NULL
    AND (
      NOT EXISTS (SELECT 1 FROM public.registros_sire l WHERE l.id = ac.sire_registro_id)
      OR NOT EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = ac.sire_registro_id)
    );

  IF NOT p_dry_run THEN
    INSERT INTO public.sire_sync_errors (
      operation_type, source_table, target_table, record_id, error_message, error_detail
    )
    SELECT
      'RECONCILE',
      CASE
        WHEN t.discrepancy_type IN ('missing_in_normalized', 'field_mismatch') THEN 'registros_sire'
        WHEN t.discrepancy_type = 'missing_in_legacy' THEN 'registros_sire_cabecera'
        ELSE 'asientos_contables'
      END,
      'reconcile_sire_records',
      t.record_id,
      t.discrepancy_type,
      t.detail
    FROM _sire_reconcile_tmp t;
  END IF;

  RETURN QUERY SELECT * FROM _sire_reconcile_tmp;
END;
$$;

-- ============================================================
-- E. migrate_all_sire_data
-- ============================================================
CREATE OR REPLACE FUNCTION public.migrate_all_sire_data(
  p_batch_size int DEFAULT 500,
  p_dry_run boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch int := GREATEST(COALESCE(p_batch_size, 500), 1);
  v_total int := 0;
  v_migrated int := 0;
  v_batch_num int := 0;
  v_rec record;
  v_errors int := 0;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM public.registros_sire l
  WHERE NOT EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = l.id);

  IF p_dry_run THEN
    RETURN jsonb_build_object(
      'dry_run', true,
      'pending', v_total,
      'batch_size', v_batch,
      'estimated_batches', CEIL(v_total::numeric / v_batch)
    );
  END IF;

  PERFORM public.sire_sync_set_guard('bulk_migrate');

  FOR v_rec IN
    SELECT l.id
    FROM public.registros_sire l
    WHERE NOT EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = l.id)
    ORDER BY l.created_at
  LOOP
    BEGIN
      PERFORM public.sync_legacy_row_to_normalized(v_rec.id, 'UPSERT');
      v_migrated := v_migrated + 1;

      IF v_migrated % v_batch = 0 THEN
        v_batch_num := v_batch_num + 1;
        RAISE NOTICE 'SIRE migrate checkpoint: lote % — % registros migrados', v_batch_num, v_migrated;
        IF v_batch_num % 5 = 0 THEN
          RAISE NOTICE 'SIRE migrate CHECKPOINT at % records', v_migrated;
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
      PERFORM public.log_sire_sync_error(
        'MIGRATE', 'registros_sire', 'registros_sire_cabecera', v_rec.id,
        SQLERRM, jsonb_build_object('sqlstate', SQLSTATE)
      );
    END;
  END LOOP;

  PERFORM public.sire_sync_clear_guard();

  RETURN jsonb_build_object(
    'dry_run', false,
    'pending_before', v_total,
    'migrated', v_migrated,
    'errors', v_errors,
    'batches', v_batch_num + CASE WHEN v_migrated % v_batch > 0 THEN 1 ELSE 0 END
  );
EXCEPTION WHEN OTHERS THEN
  PERFORM public.sire_sync_clear_guard();
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'migrated', v_migrated);
END;
$$;

-- ============================================================
-- RPCs para el frontend
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_detect_sire_structure()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'legacy_table', EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'registros_sire'
    ),
    'normalized_cabecera', EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'registros_sire_cabecera'
    ),
    'normalized_montos', EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'registros_sire_montos'
    ),
    'sync_errors_table', EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'sire_sync_errors'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_sire_consistency_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_legacy int := 0;
  v_norm int := 0;
  v_errors int := 0;
  v_discrepancies int := 0;
  v_last_legacy timestamptz;
  v_last_norm timestamptz;
  v_ventas int := 0;
  v_compras int := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registros_sire') THEN
    SELECT COUNT(*), MAX(updated_at) INTO v_legacy, v_last_legacy FROM public.registros_sire;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registros_sire_cabecera') THEN
    SELECT COUNT(*), MAX(updated_at) INTO v_norm, v_last_norm FROM public.registros_sire_cabecera;
    SELECT COUNT(*) FILTER (WHERE tipo = 'VENTA'), COUNT(*) FILTER (WHERE tipo = 'COMPRA')
    INTO v_ventas, v_compras
    FROM public.registros_sire_cabecera;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sire_sync_errors') THEN
    SELECT COUNT(*) INTO v_errors FROM public.sire_sync_errors WHERE resolved_at IS NULL;
  END IF;

  SELECT COUNT(*) INTO v_discrepancies FROM public.reconcile_sire_records(true);

  RETURN jsonb_build_object(
    'legacy_count', v_legacy,
    'normalized_count', v_norm,
    'unresolved_errors', v_errors,
    'discrepancy_count', v_discrepancies,
    'in_sync', v_discrepancies = 0 AND v_errors = 0 AND v_legacy = v_norm,
    'last_legacy_at', v_last_legacy,
    'last_normalized_at', v_last_norm,
    'tipo_distribution', jsonb_build_object('VENTA', v_ventas, 'COMPRA', v_compras)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_resolve_sire_sync_error(p_error_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_sire_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden resolver errores de sync';
  END IF;

  UPDATE public.sire_sync_errors
  SET resolved_at = now(), resolved_by = auth.uid()
  WHERE id = p_error_id AND resolved_at IS NULL;

  RETURN FOUND;
END;
$$;

-- ============================================================
-- F. TRIGGERS (IF NOT EXISTS via DROP + CREATE)
-- ============================================================
DROP TRIGGER IF EXISTS trg_sire_sync_cabecera_to_legacy ON public.registros_sire_cabecera;
CREATE TRIGGER trg_sire_sync_cabecera_to_legacy
  AFTER INSERT OR UPDATE OR DELETE ON public.registros_sire_cabecera
  FOR EACH ROW EXECUTE FUNCTION public.sync_normalized_to_legacy();

DROP TRIGGER IF EXISTS trg_sire_sync_montos_to_legacy ON public.registros_sire_montos;
CREATE TRIGGER trg_sire_sync_montos_to_legacy
  AFTER INSERT OR UPDATE OR DELETE ON public.registros_sire_montos
  FOR EACH ROW EXECUTE FUNCTION public.sync_normalized_child_to_legacy();

DROP TRIGGER IF EXISTS trg_sire_sync_modificaciones_to_legacy ON public.registros_sire_modificaciones;
CREATE TRIGGER trg_sire_sync_modificaciones_to_legacy
  AFTER INSERT OR UPDATE OR DELETE ON public.registros_sire_modificaciones
  FOR EACH ROW EXECUTE FUNCTION public.sync_normalized_child_to_legacy();

DROP TRIGGER IF EXISTS trg_sire_sync_adicionales_to_legacy ON public.registros_sire_adicionales;
CREATE TRIGGER trg_sire_sync_adicionales_to_legacy
  AFTER INSERT OR UPDATE OR DELETE ON public.registros_sire_adicionales
  FOR EACH ROW EXECUTE FUNCTION public.sync_normalized_child_to_legacy();

DROP TRIGGER IF EXISTS trg_sire_sync_legacy_to_normalized ON public.registros_sire;
CREATE TRIGGER trg_sire_sync_legacy_to_normalized
  AFTER INSERT OR UPDATE OR DELETE ON public.registros_sire
  FOR EACH ROW EXECUTE FUNCTION public.sync_legacy_to_normalized();

-- ============================================================
-- RLS sire_sync_errors
-- ============================================================
ALTER TABLE public.sire_sync_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sire_sync_errors_select ON public.sire_sync_errors;
CREATE POLICY sire_sync_errors_select ON public.sire_sync_errors
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sire_sync_errors_resolve ON public.sire_sync_errors;
CREATE POLICY sire_sync_errors_resolve ON public.sire_sync_errors
  FOR UPDATE TO authenticated
  USING (public.is_sire_admin())
  WITH CHECK (public.is_sire_admin());

GRANT SELECT ON public.sire_sync_errors TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_detect_sire_structure() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_sire_consistency_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_sire_records(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_all_sire_data(int, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_resolve_sire_sync_error(uuid) TO authenticated;
