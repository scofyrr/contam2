-- =============================================================================
-- Módulo 11: Workflow Wizard — Asistente de Flujo Contable Paso a Paso
-- Idempotente — multi-tenant vía fn_user_can_access_contribuyente
-- =============================================================================

-- =============================================================================
-- 1. TABLA DE SEGUIMIENTO DE CIERRE DE PERIODOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.periodos_cierre_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  periodo varchar(6) NOT NULL CHECK (periodo ~ '^\d{6}$'),
  paso_actual int NOT NULL DEFAULT 1 CHECK (paso_actual BETWEEN 1 AND 5),
  paso_1_ruc_ok boolean NOT NULL DEFAULT false,
  paso_2_sire_ok boolean NOT NULL DEFAULT false,
  paso_3_provision_ok boolean NOT NULL DEFAULT false,
  paso_4_caja_ok boolean NOT NULL DEFAULT false,
  paso_5_libros_cerrados boolean NOT NULL DEFAULT false,
  observaciones jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contribuyente_id, periodo)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'periodos_cierre_status_contribuyente_id_fkey'
  ) THEN
    ALTER TABLE public.periodos_cierre_status
      ADD CONSTRAINT periodos_cierre_status_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_periodos_cierre_status_contrib_periodo
  ON public.periodos_cierre_status (contribuyente_id, periodo DESC);

DROP TRIGGER IF EXISTS periodos_cierre_status_updated ON public.periodos_cierre_status;
CREATE TRIGGER periodos_cierre_status_updated
  BEFORE UPDATE ON public.periodos_cierre_status
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.periodos_cierre_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS periodos_cierre_status_tenant ON public.periodos_cierre_status;
CREATE POLICY periodos_cierre_status_tenant ON public.periodos_cierre_status
  FOR ALL TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id))
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

-- =============================================================================
-- 2. RPC — DIAGNÓSTICO COMPLETO DEL PERIODO
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_obtener_estado_flujo_periodo(
  p_contribuyente_id uuid,
  p_periodo varchar
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_ruc_ok boolean := false;
  v_sire_ok boolean := false;
  v_provision_ok boolean := false;
  v_caja_ok boolean := false;
  v_libros_ok boolean := false;
  v_paso_sugerido int := 1;
  v_porcentaje numeric(5, 2) := 0;
  v_diario_cuadrado boolean := true;
  v_rce_pendientes int := 0;
  v_rvie_pendientes int := 0;
  v_compras_tesoreria int := 0;
  v_ventas_tesoreria int := 0;
  v_incons_bloqueantes int := 0;
  v_incons_alertas int := 0;
  v_suma_debe numeric(16, 2) := 0;
  v_suma_haber numeric(16, 2) := 0;
  v_total_asientos int := 0;
  v_periodo_id uuid;
  v_estado_rvie public.sire_estado_periodo_enum;
  v_estado_rce public.sire_estado_periodo_enum;
  v_fecha_sync timestamptz;
  v_regimen text;
  v_razon text;
  v_direccion text;
  v_tiene_ficha boolean := false;
  v_pasos jsonb := '[]'::jsonb;
  v_alertas jsonb := '[]'::jsonb;
  v_metricas jsonb;
  v_cierre record;
  v_paso_estado text;
  v_i int;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  v_periodo := left(regexp_replace(COALESCE(p_periodo, ''), '\D', '', 'g') || '000000', 6);

  IF length(v_periodo) <> 6 THEN
    RAISE EXCEPTION 'Periodo inválido: se espera YYYYMM';
  END IF;

  -- Registro de cierre (upsert silencioso si no existe)
  INSERT INTO public.periodos_cierre_status (contribuyente_id, periodo)
  VALUES (p_contribuyente_id, v_periodo)
  ON CONFLICT (contribuyente_id, periodo) DO NOTHING;

  SELECT *
  INTO v_cierre
  FROM public.periodos_cierre_status pcs
  WHERE pcs.contribuyente_id = p_contribuyente_id
    AND pcs.periodo = v_periodo;

  -- -------------------------------------------------------------------------
  -- Paso 1 — Ficha RUC / Configuración
  -- -------------------------------------------------------------------------
  SELECT
    c.codigo_regimen::text,
    c.razon_social,
    c.direccion_fiscal
  INTO v_regimen, v_razon, v_direccion
  FROM public.contribuyentes c
  WHERE c.id = p_contribuyente_id;

  SELECT EXISTS (
    SELECT 1
    FROM public.fichas_ruc fr
    JOIN public.contribuyentes c ON c.ruc = fr.ruc
    WHERE c.id = p_contribuyente_id
  )
  INTO v_tiene_ficha;

  v_ruc_ok := COALESCE(v_cierre.paso_1_ruc_ok, false)
    OR (
      v_regimen IS NOT NULL
      AND COALESCE(trim(v_razon), '') <> ''
      AND (COALESCE(trim(v_direccion), '') <> '' OR v_tiene_ficha)
    );

  -- -------------------------------------------------------------------------
  -- Paso 2 — Sincronización SIRE
  -- -------------------------------------------------------------------------
  SELECT sp.id, sp.estado_rvie, sp.estado_rce, sp.fecha_sincronizacion
  INTO v_periodo_id, v_estado_rvie, v_estado_rce, v_fecha_sync
  FROM public.sire_periodos sp
  WHERE sp.contribuyente_id = p_contribuyente_id
    AND sp.periodo = v_periodo;

  v_sire_ok := COALESCE(v_cierre.paso_2_sire_ok, false)
    OR (
      v_periodo_id IS NOT NULL
      AND v_estado_rvie NOT IN ('PENDIENTE'::public.sire_estado_periodo_enum, 'ERROR'::public.sire_estado_periodo_enum)
      AND v_estado_rce NOT IN ('PENDIENTE'::public.sire_estado_periodo_enum, 'ERROR'::public.sire_estado_periodo_enum)
      AND (
        v_fecha_sync IS NOT NULL
        OR (v_estado_rvie = 'VACIO'::public.sire_estado_periodo_enum AND v_estado_rce = 'VACIO'::public.sire_estado_periodo_enum)
      )
    );

  IF v_periodo_id IS NOT NULL THEN
    SELECT
      COUNT(*) FILTER (WHERE si.severidad = 'ERROR_BLOQUEANTE' AND NOT si.resuelto),
      COUNT(*) FILTER (WHERE si.severidad = 'ALERTA' AND NOT si.resuelto)
    INTO v_incons_bloqueantes, v_incons_alertas
    FROM public.sire_inconsistencias si
    WHERE si.periodo_id = v_periodo_id;
  END IF;

  -- -------------------------------------------------------------------------
  -- Paso 3 — Provisión & Libro Diario
  -- -------------------------------------------------------------------------
  SELECT COUNT(*)
  INTO v_rce_pendientes
  FROM public.compras_rce cr
  WHERE cr.contribuyente_id = p_contribuyente_id
    AND cr.periodo = v_periodo
    AND cr.estado_provision = 'PENDIENTE'::public.estado_provision_enum;

  SELECT COUNT(*)
  INTO v_rvie_pendientes
  FROM public.ventas_rvie vr
  WHERE vr.contribuyente_id = p_contribuyente_id
    AND vr.periodo = v_periodo
    AND vr.estado_provision = 'PENDIENTE'::public.estado_provision_enum;

  SELECT
    COALESCE(SUM(ac.debe), 0),
    COALESCE(SUM(ac.haber), 0),
    COUNT(*)
  INTO v_suma_debe, v_suma_haber, v_total_asientos
  FROM public.asientos_contables ac
  WHERE ac.contribuyente_id = p_contribuyente_id
    AND ac.periodo = v_periodo
    AND ac.cuo IS NOT NULL
    AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL');

  v_diario_cuadrado := abs(v_suma_debe - v_suma_haber) < 0.01;

  v_provision_ok := COALESCE(v_cierre.paso_3_provision_ok, false)
    OR (
      v_rce_pendientes = 0
      AND v_rvie_pendientes = 0
      AND (v_total_asientos = 0 OR v_diario_cuadrado)
    );

  -- -------------------------------------------------------------------------
  -- Paso 4 — Tesorería
  -- -------------------------------------------------------------------------
  SELECT COUNT(*)
  INTO v_compras_tesoreria
  FROM public.compras_rce cr
  WHERE cr.contribuyente_id = p_contribuyente_id
    AND cr.periodo = v_periodo
    AND cr.estado_provision IN (
      'PROVISIONADO'::public.estado_provision_enum,
      'LIQUIDADO_PARCIAL'::public.estado_provision_enum
    );

  SELECT COUNT(*)
  INTO v_ventas_tesoreria
  FROM public.ventas_rvie vr
  WHERE vr.contribuyente_id = p_contribuyente_id
    AND vr.periodo = v_periodo
    AND vr.estado_provision IN (
      'PROVISIONADO'::public.estado_provision_enum,
      'LIQUIDADO_PARCIAL'::public.estado_provision_enum
    );

  v_caja_ok := COALESCE(v_cierre.paso_4_caja_ok, false)
    OR (v_compras_tesoreria = 0 AND v_ventas_tesoreria = 0);

  -- -------------------------------------------------------------------------
  -- Paso 5 — Libros & Cierre
  -- -------------------------------------------------------------------------
  v_libros_ok := COALESCE(v_cierre.paso_5_libros_cerrados, false)
    OR (
      v_ruc_ok
      AND v_sire_ok
      AND v_provision_ok
      AND v_caja_ok
      AND v_incons_bloqueantes = 0
      AND v_total_asientos > 0
      AND v_diario_cuadrado
    );

  -- Paso sugerido (primer paso incompleto)
  IF NOT v_ruc_ok THEN
    v_paso_sugerido := 1;
  ELSIF NOT v_sire_ok OR v_incons_bloqueantes > 0 THEN
    v_paso_sugerido := 2;
  ELSIF NOT v_provision_ok THEN
    v_paso_sugerido := 3;
  ELSIF NOT v_caja_ok THEN
    v_paso_sugerido := 4;
  ELSIF NOT v_libros_ok THEN
    v_paso_sugerido := 5;
  ELSE
    v_paso_sugerido := 5;
  END IF;

  -- Porcentaje global (20% por paso)
  v_porcentaje := (
    (CASE WHEN v_ruc_ok THEN 1 ELSE 0 END)
    + (CASE WHEN v_sire_ok AND v_incons_bloqueantes = 0 THEN 1 ELSE 0 END)
    + (CASE WHEN v_provision_ok THEN 1 ELSE 0 END)
    + (CASE WHEN v_caja_ok THEN 1 ELSE 0 END)
    + (CASE WHEN v_libros_ok THEN 1 ELSE 0 END)
  ) * 20.0;

  -- Matriz de pasos
  FOR v_i IN 1..5 LOOP
    IF v_i = 1 THEN
      v_paso_estado := CASE
        WHEN v_ruc_ok THEN 'COMPLETADO'
        WHEN v_paso_sugerido = 1 THEN 'EN_PROGRESO'
        ELSE 'PENDIENTE'
      END;
      v_pasos := v_pasos || jsonb_build_array(jsonb_build_object(
        'paso_numero', 1,
        'titulo', 'Configuración & Ficha RUC',
        'descripcion', 'Verifique régimen tributario (NRUS/RER/RMT/RG) y libros obligatorios.',
        'estado', v_paso_estado,
        'ruta_modulo', '/ficha-ruc'
      ));
    ELSIF v_i = 2 THEN
      v_paso_estado := CASE
        WHEN NOT v_ruc_ok THEN 'BLOQUEADO'
        WHEN v_sire_ok AND v_incons_bloqueantes = 0 THEN 'COMPLETADO'
        WHEN v_paso_sugerido = 2 THEN 'EN_PROGRESO'
        ELSE 'PENDIENTE'
      END;
      v_pasos := v_pasos || jsonb_build_array(jsonb_build_object(
        'paso_numero', 2,
        'titulo', 'Sincronización SIRE',
        'descripcion', 'Descarga y validación de propuestas RVIE (140400) y RCE (130400).',
        'estado', v_paso_estado,
        'ruta_modulo', '/sire-sync'
      ));
    ELSIF v_i = 3 THEN
      v_paso_estado := CASE
        WHEN NOT v_ruc_ok OR NOT v_sire_ok THEN 'BLOQUEADO'
        WHEN v_provision_ok THEN 'COMPLETADO'
        WHEN v_paso_sugerido = 3 THEN 'EN_PROGRESO'
        WHEN v_rce_pendientes > 0 OR v_rvie_pendientes > 0 OR NOT v_diario_cuadrado THEN 'PENDIENTE'
        ELSE 'PENDIENTE'
      END;
      v_pasos := v_pasos || jsonb_build_array(jsonb_build_object(
        'paso_numero', 3,
        'titulo', 'Provisión & Libro Diario',
        'descripcion', 'Conversión de comprobantes SIRE a asientos PCGE (Formatos 5.1 / 5.2).',
        'estado', v_paso_estado,
        'ruta_modulo', '/contabilidad'
      ));
    ELSIF v_i = 4 THEN
      v_paso_estado := CASE
        WHEN NOT v_provision_ok THEN 'BLOQUEADO'
        WHEN v_caja_ok THEN 'COMPLETADO'
        WHEN v_paso_sugerido = 4 THEN 'EN_PROGRESO'
        ELSE 'PENDIENTE'
      END;
      v_pasos := v_pasos || jsonb_build_array(jsonb_build_object(
        'paso_numero', 4,
        'titulo', 'Tesorería, Caja & Bancos',
        'descripcion', 'Cobros, pagos, detracciones y liquidaciones atómicas de caja.',
        'estado', v_paso_estado,
        'ruta_modulo', '/tesoreria'
      ));
    ELSE
      v_paso_estado := CASE
        WHEN NOT v_caja_ok OR NOT v_provision_ok THEN 'BLOQUEADO'
        WHEN v_libros_ok THEN 'COMPLETADO'
        WHEN v_paso_sugerido = 5 THEN 'EN_PROGRESO'
        ELSE 'PENDIENTE'
      END;
      v_pasos := v_pasos || jsonb_build_array(jsonb_build_object(
        'paso_numero', 5,
        'titulo', 'Emisión de Libros & Cierre',
        'descripcion', 'Libro Mayor F 6.1, Balance de Comprobación y cierre del periodo.',
        'estado', v_paso_estado,
        'ruta_modulo', '/libro-mayor'
      ));
    END IF;
  END LOOP;

  -- Alertas activas
  IF NOT v_ruc_ok THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'ruc-incompleto',
      'severidad', 'ADVERTENCIA',
      'mensaje', 'Complete la ficha RUC: régimen tributario y datos fiscales del contribuyente.',
      'accion_texto', 'Ir a Ficha RUC',
      'accion_ruta', '/ficha-ruc',
      'paso_relacionado', 1
    ));
  END IF;

  IF v_periodo_id IS NULL THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'sire-sin-periodo',
      'severidad', 'ADVERTENCIA',
      'mensaje', format('No hay periodo SIRE registrado para %s. Sincronice RVIE y RCE.', v_periodo),
      'accion_texto', 'Sincronizar SIRE',
      'accion_ruta', '/sire-sync',
      'paso_relacionado', 2
    ));
  ELSIF v_estado_rvie IN ('PENDIENTE', 'ERROR') OR v_estado_rce IN ('PENDIENTE', 'ERROR') THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'sire-pendiente-sync',
      'severidad', 'ADVERTENCIA',
      'mensaje', format(
        'SIRE del periodo %s requiere sincronización (RVIE: %s, RCE: %s).',
        v_periodo, COALESCE(v_estado_rvie::text, 'N/A'), COALESCE(v_estado_rce::text, 'N/A')
      ),
      'accion_texto', 'Ir a Sync SIRE',
      'accion_ruta', '/sire-sync',
      'paso_relacionado', 2
    ));
  END IF;

  IF v_incons_bloqueantes > 0 THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'sire-incons-bloqueantes',
      'severidad', 'BLOQUEANTE',
      'mensaje', format(
        'Existen %s inconsistencia(s) bloqueante(s) en el SIRE del periodo %s.',
        v_incons_bloqueantes, v_periodo
      ),
      'accion_texto', 'Revisar Registros SIRE',
      'accion_ruta', '/sire-registros',
      'paso_relacionado', 2
    ));
  END IF;

  IF v_incons_alertas > 0 AND v_incons_bloqueantes = 0 THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'sire-incons-alertas',
      'severidad', 'ADVERTENCIA',
      'mensaje', format('Hay %s alerta(s) SIRE sin resolver en el periodo %s.', v_incons_alertas, v_periodo),
      'accion_texto', 'Ver Registros SIRE',
      'accion_ruta', '/sire-registros',
      'paso_relacionado', 2
    ));
  END IF;

  IF v_rce_pendientes > 0 THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'rce-pendientes-provision',
      'severidad', CASE WHEN v_paso_sugerido >= 4 THEN 'BLOQUEANTE' ELSE 'ADVERTENCIA' END,
      'mensaje', format(
        'Tiene %s compra(s) del RCE sin provisionar en el Libro Diario.',
        v_rce_pendientes
      ),
      'accion_texto', 'Ir a Provisionar Compras',
      'accion_ruta', '/compras-ventas',
      'paso_relacionado', 3
    ));
  END IF;

  IF v_rvie_pendientes > 0 THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'rvie-pendientes-provision',
      'severidad', CASE WHEN v_paso_sugerido >= 4 THEN 'BLOQUEANTE' ELSE 'ADVERTENCIA' END,
      'mensaje', format(
        'Tiene %s venta(s) del RVIE sin provisionar en el Libro Diario.',
        v_rvie_pendientes
      ),
      'accion_texto', 'Ir a Provisionar Ventas',
      'accion_ruta', '/compras-ventas',
      'paso_relacionado', 3
    ));
  END IF;

  IF v_total_asientos > 0 AND NOT v_diario_cuadrado THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'diario-descuadrado',
      'severidad', 'BLOQUEANTE',
      'mensaje', format(
        'El Libro Diario no cuadra: Debe S/ %s ≠ Haber S/ %s.',
        to_char(v_suma_debe, 'FM999999990.00'),
        to_char(v_suma_haber, 'FM999999990.00')
      ),
      'accion_texto', 'Revisar Libro Diario',
      'accion_ruta', '/contabilidad',
      'paso_relacionado', 3
    ));
  END IF;

  IF v_compras_tesoreria + v_ventas_tesoreria > 0 THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'tesoreria-pendientes',
      'severidad', 'ADVERTENCIA',
      'mensaje', format(
        'Hay %s comprobante(s) provisionados pendientes de cobro/pago en Tesorería.',
        v_compras_tesoreria + v_ventas_tesoreria
      ),
      'accion_texto', 'Ir a Tesorería',
      'accion_ruta', '/tesoreria',
      'paso_relacionado', 4
    ));
  END IF;

  IF v_paso_sugerido = 5 AND NOT v_libros_ok AND v_provision_ok AND v_caja_ok THEN
    v_alertas := v_alertas || jsonb_build_array(jsonb_build_object(
      'id', 'listo-para-cierre',
      'severidad', 'INFO',
      'mensaje', 'Prerrequisitos completados. Puede emitir el Libro Mayor F 6.1 y cerrar el periodo.',
      'accion_texto', 'Ver Libro Mayor',
      'accion_ruta', '/libro-mayor',
      'paso_relacionado', 5
    ));
  END IF;

  v_metricas := jsonb_build_object(
    'rce_pendientes_provision', v_rce_pendientes,
    'rvie_pendientes_provision', v_rvie_pendientes,
    'compras_pendientes_tesoreria', v_compras_tesoreria,
    'ventas_pendientes_tesoreria', v_ventas_tesoreria,
    'inconsistencias_sire_bloqueantes', v_incons_bloqueantes,
    'inconsistencias_sire_alertas', v_incons_alertas,
    'total_asientos_diario', v_total_asientos,
    'suma_debe', v_suma_debe,
    'suma_haber', v_suma_haber,
    'regimen_tributario', v_regimen,
    'estado_rvie', v_estado_rvie,
    'estado_rce', v_estado_rce
  );

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'periodo', v_periodo,
    'porcentaje_avance', v_porcentaje,
    'paso_sugerido', v_paso_sugerido,
    'pasos', v_pasos,
    'alertas', v_alertas,
    'diario_cuadrado', v_diario_cuadrado,
    'metricas', v_metricas,
    'periodo_cierre', jsonb_build_object(
      'paso_actual', COALESCE(v_cierre.paso_actual, 1),
      'paso_1_ruc_ok', v_ruc_ok,
      'paso_2_sire_ok', v_sire_ok,
      'paso_3_provision_ok', v_provision_ok,
      'paso_4_caja_ok', v_caja_ok,
      'paso_5_libros_cerrados', v_libros_ok,
      'observaciones', COALESCE(v_cierre.observaciones, '{}'::jsonb)
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_obtener_estado_flujo_periodo(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_obtener_estado_flujo_periodo(uuid, varchar) TO authenticated;

-- =============================================================================
-- 3. RPC — ACTUALIZACIÓN DE PASO DEL WORKFLOW
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_avanzar_paso_workflow(
  p_contribuyente_id uuid,
  p_periodo varchar,
  p_paso int,
  p_completado boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_row public.periodos_cierre_status%ROWTYPE;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  IF p_paso IS NULL OR p_paso < 1 OR p_paso > 5 THEN
    RAISE EXCEPTION 'Paso inválido: debe estar entre 1 y 5';
  END IF;

  v_periodo := left(regexp_replace(COALESCE(p_periodo, ''), '\D', '', 'g') || '000000', 6);

  INSERT INTO public.periodos_cierre_status (contribuyente_id, periodo)
  VALUES (p_contribuyente_id, v_periodo)
  ON CONFLICT (contribuyente_id, periodo) DO NOTHING;

  UPDATE public.periodos_cierre_status pcs
  SET
    paso_1_ruc_ok = CASE WHEN p_paso = 1 THEN p_completado ELSE pcs.paso_1_ruc_ok END,
    paso_2_sire_ok = CASE WHEN p_paso = 2 THEN p_completado ELSE pcs.paso_2_sire_ok END,
    paso_3_provision_ok = CASE WHEN p_paso = 3 THEN p_completado ELSE pcs.paso_3_provision_ok END,
    paso_4_caja_ok = CASE WHEN p_paso = 4 THEN p_completado ELSE pcs.paso_4_caja_ok END,
    paso_5_libros_cerrados = CASE WHEN p_paso = 5 THEN p_completado ELSE pcs.paso_5_libros_cerrados END,
    paso_actual = CASE
      WHEN p_completado THEN GREATEST(pcs.paso_actual, LEAST(p_paso + 1, 5))
      ELSE GREATEST(1, LEAST(p_paso, pcs.paso_actual))
    END,
    updated_at = now()
  WHERE pcs.contribuyente_id = p_contribuyente_id
    AND pcs.periodo = v_periodo
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'ok', true,
    'periodo_cierre', jsonb_build_object(
      'id', v_row.id,
      'contribuyente_id', v_row.contribuyente_id,
      'periodo', v_row.periodo,
      'paso_actual', v_row.paso_actual,
      'paso_1_ruc_ok', v_row.paso_1_ruc_ok,
      'paso_2_sire_ok', v_row.paso_2_sire_ok,
      'paso_3_provision_ok', v_row.paso_3_provision_ok,
      'paso_4_caja_ok', v_row.paso_4_caja_ok,
      'paso_5_libros_cerrados', v_row.paso_5_libros_cerrados,
      'observaciones', v_row.observaciones,
      'updated_at', v_row.updated_at
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_avanzar_paso_workflow(uuid, varchar, int, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_avanzar_paso_workflow(uuid, varchar, int, boolean) TO authenticated;
