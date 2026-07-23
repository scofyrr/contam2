-- =============================================================================
-- Módulo 10: Libro Mayor Formato 6.1 (060100) & Balance de Comprobación
-- Idempotente — consulta asientos_contables multi-tenant
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_obtener_libro_mayor_f61(
  p_contribuyente_id uuid,
  p_periodo varchar,
  p_nivel_cuenta int DEFAULT 4,
  p_cuenta_filtro varchar DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_nivel int;
  v_anio char(4);
  v_ruc varchar(11);
  v_razon text;
  v_cuentas jsonb;
  v_total_debe numeric(14, 2);
  v_total_haber numeric(14, 2);
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  v_periodo := left(regexp_replace(COALESCE(p_periodo, ''), '\D', '', 'g') || '000000', 6);
  v_nivel := GREATEST(2, LEAST(COALESCE(p_nivel_cuenta, 4), 5));
  v_anio := left(v_periodo, 4);

  SELECT c.ruc, c.razon_social
  INTO v_ruc, v_razon
  FROM public.contribuyentes c
  WHERE c.id = p_contribuyente_id;

  SELECT COALESCE(SUM(ac.debe), 0), COALESCE(SUM(ac.haber), 0)
  INTO v_total_debe, v_total_haber
  FROM public.asientos_contables ac
  WHERE ac.contribuyente_id = p_contribuyente_id
    AND ac.periodo = v_periodo
    AND ac.cuo IS NOT NULL
    AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL');

  WITH saldos_iniciales AS (
    SELECT
      left(COALESCE(ac.cuenta_codigo, ac.cuenta_contable), v_nivel) AS codigo_cuenta,
      COALESCE(SUM(ac.debe - ac.haber), 0)::numeric(14, 2) AS saldo_inicial
    FROM public.asientos_contables ac
    WHERE ac.contribuyente_id = p_contribuyente_id
      AND ac.cuo IS NOT NULL
      AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL')
      AND ac.periodo >= v_anio || '01'
      AND ac.periodo < v_periodo
      AND COALESCE(ac.cuenta_codigo, ac.cuenta_contable) IS NOT NULL
      AND length(trim(COALESCE(ac.cuenta_codigo, ac.cuenta_contable))) >= v_nivel
    GROUP BY 1
  ),
  lineas_periodo AS (
    SELECT
      left(COALESCE(ac.cuenta_codigo, ac.cuenta_contable), v_nivel) AS codigo_cuenta,
      ac.fecha_operacion,
      ac.cuo,
      ac.correlativo_linea,
      ac.glosa,
      ac.debe,
      ac.haber,
      ac.id AS linea_id
    FROM public.asientos_contables ac
    WHERE ac.contribuyente_id = p_contribuyente_id
      AND ac.periodo = v_periodo
      AND ac.cuo IS NOT NULL
      AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL')
      AND COALESCE(ac.cuenta_codigo, ac.cuenta_contable) IS NOT NULL
      AND length(trim(COALESCE(ac.cuenta_codigo, ac.cuenta_contable))) >= v_nivel
      AND (
        p_cuenta_filtro IS NULL
        OR trim(p_cuenta_filtro) = ''
        OR left(COALESCE(ac.cuenta_codigo, ac.cuenta_contable), v_nivel) LIKE left(trim(p_cuenta_filtro), v_nivel) || '%'
      )
  ),
  lineas_con_saldo AS (
    SELECT
      lp.codigo_cuenta,
      lp.fecha_operacion,
      lp.cuo,
      lp.correlativo_linea,
      lp.glosa,
      lp.debe,
      lp.haber,
      (
        COALESCE(si.saldo_inicial, 0)
        + SUM(lp.debe - lp.haber) OVER (
          PARTITION BY lp.codigo_cuenta
          ORDER BY lp.fecha_operacion, lp.cuo, lp.correlativo_linea NULLS LAST, lp.linea_id
          ROWS UNBOUNDED PRECEDING
        )
      )::numeric(14, 2) AS saldo_linea
    FROM lineas_periodo lp
    LEFT JOIN saldos_iniciales si ON si.codigo_cuenta = lp.codigo_cuenta
  ),
  resumen_cuentas AS (
    SELECT
      COALESCE(lp.codigo_cuenta, si.codigo_cuenta) AS codigo_cuenta,
      COALESCE(si.saldo_inicial, 0)::numeric(14, 2) AS saldo_inicial,
      COALESCE(SUM(lp.debe), 0)::numeric(14, 2) AS total_debe,
      COALESCE(SUM(lp.haber), 0)::numeric(14, 2) AS total_haber
    FROM lineas_periodo lp
    FULL OUTER JOIN saldos_iniciales si ON si.codigo_cuenta = lp.codigo_cuenta
    GROUP BY COALESCE(lp.codigo_cuenta, si.codigo_cuenta), si.saldo_inicial
  ),
  cuentas_agg AS (
    SELECT
      rc.codigo_cuenta,
      COALESCE(
        (SELECT p.denominacion FROM public.plan_cuentas_pcge p WHERE p.codigo = rc.codigo_cuenta LIMIT 1),
        public.fn_pcge_denominacion(rc.codigo_cuenta),
        rc.codigo_cuenta
      ) AS denominacion,
      rc.saldo_inicial,
      rc.total_debe,
      rc.total_haber,
      (rc.saldo_inicial + rc.total_debe - rc.total_haber)::numeric(14, 2) AS saldo_final,
      CASE
        WHEN abs(rc.saldo_inicial + rc.total_debe - rc.total_haber) < 0.01 THEN 'NEUTRO'
        WHEN (rc.saldo_inicial + rc.total_debe - rc.total_haber) > 0 THEN 'DEUDOR'
        ELSE 'ACREEDOR'
      END AS naturaleza_saldo,
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'fecha_operacion', lcs.fecha_operacion,
              'cuo', lcs.cuo,
              'correlativo_linea', lcs.correlativo_linea,
              'glosa', lcs.glosa,
              'debe', lcs.debe,
              'haber', lcs.haber,
              'saldo_linea', lcs.saldo_linea
            )
            ORDER BY lcs.fecha_operacion, lcs.cuo, lcs.correlativo_linea NULLS LAST
          )
          FROM lineas_con_saldo lcs
          WHERE lcs.codigo_cuenta = rc.codigo_cuenta
        ),
        '[]'::jsonb
      ) AS filas
    FROM resumen_cuentas rc
    WHERE (rc.total_debe <> 0 OR rc.total_haber <> 0 OR rc.saldo_inicial <> 0)
      AND (
        p_cuenta_filtro IS NULL
        OR trim(p_cuenta_filtro) = ''
        OR rc.codigo_cuenta LIKE left(trim(p_cuenta_filtro), v_nivel) || '%'
      )
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'codigo_cuenta', ca.codigo_cuenta,
      'denominacion', ca.denominacion,
      'saldo_inicial', ca.saldo_inicial,
      'total_debe', ca.total_debe,
      'total_haber', ca.total_haber,
      'saldo_final', ca.saldo_final,
      'naturaleza_saldo', ca.naturaleza_saldo,
      'filas', ca.filas
    )
    ORDER BY ca.codigo_cuenta
  ), '[]'::jsonb)
  INTO v_cuentas
  FROM cuentas_agg ca;

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'ruc', v_ruc,
    'razon_social', v_razon,
    'periodo', v_periodo,
    'nivel_cuenta', v_nivel,
    'codigo_libro_tabla8', '060100',
    'nombre_libro', 'Libro Mayor',
    'total_debe_general', v_total_debe,
    'total_haber_general', v_total_haber,
    'cuadrado', abs(v_total_debe - v_total_haber) < 0.01,
    'cuentas', v_cuentas,
    'generado_at', now()
  );
END;
$$;

-- =============================================================================
-- Balance de Comprobación
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_obtener_balance_comprobacion(
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
  v_anio char(4);
  v_ruc varchar(11);
  v_razon text;
  v_filas jsonb;
  v_total_debe numeric(14, 2);
  v_total_haber numeric(14, 2);
  v_cuadrado boolean;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  v_periodo := left(regexp_replace(COALESCE(p_periodo, ''), '\D', '', 'g') || '000000', 6);
  v_anio := left(v_periodo, 4);

  SELECT c.ruc, c.razon_social
  INTO v_ruc, v_razon
  FROM public.contribuyentes c
  WHERE c.id = p_contribuyente_id;

  WITH saldos_iniciales AS (
    SELECT
      trim(COALESCE(ac.cuenta_codigo, ac.cuenta_contable)) AS cuenta_codigo,
      COALESCE(SUM(ac.debe - ac.haber), 0)::numeric(14, 2) AS saldo_inicial
    FROM public.asientos_contables ac
    WHERE ac.contribuyente_id = p_contribuyente_id
      AND ac.cuo IS NOT NULL
      AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL')
      AND ac.periodo >= v_anio || '01'
      AND ac.periodo < v_periodo
      AND COALESCE(ac.cuenta_codigo, ac.cuenta_contable) IS NOT NULL
    GROUP BY 1
  ),
  movimientos_periodo AS (
    SELECT
      trim(COALESCE(ac.cuenta_codigo, ac.cuenta_contable)) AS cuenta_codigo,
      COALESCE(SUM(ac.debe), 0)::numeric(14, 2) AS suma_debe,
      COALESCE(SUM(ac.haber), 0)::numeric(14, 2) AS suma_haber,
      MAX(COALESCE(ac.cuenta_denominacion, public.fn_pcge_denominacion(ac.cuenta_contable))) AS cuenta_denominacion
    FROM public.asientos_contables ac
    WHERE ac.contribuyente_id = p_contribuyente_id
      AND ac.periodo = v_periodo
      AND ac.cuo IS NOT NULL
      AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL')
      AND COALESCE(ac.cuenta_codigo, ac.cuenta_contable) IS NOT NULL
    GROUP BY 1
  ),
  consolidado AS (
    SELECT
      COALESCE(mp.cuenta_codigo, si.cuenta_codigo) AS cuenta_codigo,
      COALESCE(
        mp.cuenta_denominacion,
        (SELECT p.denominacion FROM public.plan_cuentas_pcge p WHERE p.codigo = COALESCE(mp.cuenta_codigo, si.cuenta_codigo) LIMIT 1),
        public.fn_pcge_denominacion(COALESCE(mp.cuenta_codigo, si.cuenta_codigo))
      ) AS cuenta_denominacion,
      COALESCE(si.saldo_inicial, 0)::numeric(14, 2) AS saldo_inicial,
      COALESCE(mp.suma_debe, 0)::numeric(14, 2) AS suma_debe,
      COALESCE(mp.suma_haber, 0)::numeric(14, 2) AS suma_haber,
      (COALESCE(si.saldo_inicial, 0) + COALESCE(mp.suma_debe, 0) - COALESCE(mp.suma_haber, 0))::numeric(14, 2) AS saldo_final
    FROM movimientos_periodo mp
    FULL OUTER JOIN saldos_iniciales si ON si.cuenta_codigo = mp.cuenta_codigo
    WHERE COALESCE(mp.suma_debe, 0) <> 0
       OR COALESCE(mp.suma_haber, 0) <> 0
       OR COALESCE(si.saldo_inicial, 0) <> 0
  )
  SELECT
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'cuenta_codigo', c.cuenta_codigo,
        'cuenta_denominacion', c.cuenta_denominacion,
        'saldo_inicial', c.saldo_inicial,
        'suma_debe', c.suma_debe,
        'suma_haber', c.suma_haber,
        'saldo_deudor', CASE WHEN c.saldo_final >= 0.01 THEN c.saldo_final ELSE 0 END,
        'saldo_acreedor', CASE WHEN c.saldo_final <= -0.01 THEN abs(c.saldo_final) ELSE 0 END,
        'saldo_final', c.saldo_final
      )
      ORDER BY c.cuenta_codigo
    ), '[]'::jsonb),
    COALESCE(SUM(c.suma_debe), 0),
    COALESCE(SUM(c.suma_haber), 0)
  INTO v_filas, v_total_debe, v_total_haber
  FROM consolidado c;

  v_cuadrado := abs(v_total_debe - v_total_haber) < 0.01;

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'ruc', v_ruc,
    'razon_social', v_razon,
    'periodo', v_periodo,
    'filas', v_filas,
    'total_debe', v_total_debe,
    'total_haber', v_total_haber,
    'total_saldo_deudor', COALESCE((
      SELECT SUM((f->>'saldo_deudor')::numeric) FROM jsonb_array_elements(v_filas) f
    ), 0),
    'total_saldo_acreedor', COALESCE((
      SELECT SUM((f->>'saldo_acreedor')::numeric) FROM jsonb_array_elements(v_filas) f
    ), 0),
    'cuadrado', v_cuadrado,
    'generado_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_obtener_libro_mayor_f61(uuid, varchar, int, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_obtener_libro_mayor_f61(uuid, varchar, int, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_obtener_libro_mayor_f61(uuid, varchar, int, varchar) TO service_role;

REVOKE ALL ON FUNCTION public.fn_obtener_balance_comprobacion(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_obtener_balance_comprobacion(uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_obtener_balance_comprobacion(uuid, varchar) TO service_role;
