-- Performance: índices optimizados, materialized views, RPCs de análisis
-- Idempotente — columnas alineadas al schema real del proyecto

-- ============================================================
-- ASIENTOS_CONTABLES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_asientos_ruc_contraparte_periodo
  ON public.asientos_contables(ruc_contraparte, periodo)
  WHERE ruc_contraparte IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_asientos_sire_registro
  ON public.asientos_contables(sire_registro_id)
  WHERE sire_registro_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_asientos_tipo_fecha
  ON public.asientos_contables(tipo_libro, fecha_asiento DESC);

CREATE INDEX IF NOT EXISTS idx_asientos_cuenta_fecha
  ON public.asientos_contables(cuenta_contable, fecha_asiento DESC);

CREATE INDEX IF NOT EXISTS idx_asientos_periodo_tipo
  ON public.asientos_contables(periodo, tipo_libro);

CREATE INDEX IF NOT EXISTS idx_asientos_ruc_empresa_periodo
  ON public.asientos_contables(ruc, periodo)
  WHERE ruc IS NOT NULL;

-- ============================================================
-- MOVIMIENTOS_CAJA
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_movimientos_sin_asiento
  ON public.movimientos_caja(cuenta_financiera_id, fecha_operacion)
  WHERE asiento_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_movimientos_conciliacion
  ON public.movimientos_caja(cuenta_financiera_id, fecha_operacion, debe, haber);

CREATE INDEX IF NOT EXISTS idx_movimientos_sire
  ON public.movimientos_caja(registro_sire_id)
  WHERE registro_sire_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_movimientos_ruc_periodo_fecha
  ON public.movimientos_caja(ruc, periodo, fecha_operacion DESC);

-- ============================================================
-- REGISTROS_SIRE (legacy)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sire_ruc_periodo
  ON public.registros_sire(ruc, periodo);

CREATE INDEX IF NOT EXISTS idx_sire_tipo_fecha
  ON public.registros_sire(tipo, fecha_emision DESC);

CREATE INDEX IF NOT EXISTS idx_sire_estado_ruc
  ON public.registros_sire(estado, ruc)
  WHERE estado IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sire_serie_numero
  ON public.registros_sire(serie_cdp, nro_cdp_inicial);

CREATE INDEX IF NOT EXISTS idx_sire_vencimiento
  ON public.registros_sire(fecha_vencimiento)
  WHERE fecha_vencimiento IS NOT NULL;

-- ============================================================
-- REGISTROS_SIRE_CABECERA
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sire_cab_ruc_periodo
  ON public.registros_sire_cabecera(ruc, periodo);

CREATE INDEX IF NOT EXISTS idx_sire_cab_estado_validacion
  ON public.registros_sire_cabecera(estado_validacion, ruc);

CREATE INDEX IF NOT EXISTS idx_sire_cab_fecha
  ON public.registros_sire_cabecera(fecha_emision DESC);

-- ============================================================
-- TAREAS_PENDIENTES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tareas_estado_prioridad
  ON public.tareas_pendientes(estado, prioridad, plazo_vencimiento);

CREATE INDEX IF NOT EXISTS idx_tareas_ruc_estado
  ON public.tareas_pendientes(ruc, estado);

CREATE INDEX IF NOT EXISTS idx_tareas_vencidas
  ON public.tareas_pendientes(plazo_vencimiento, estado)
  WHERE estado NOT IN ('completada', 'cancelada');

-- ============================================================
-- PLAN_CONTABLE_PCGE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pcge_codigo_texto
  ON public.plan_contable_pcge(codigo_cuenta);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'plan_contable_pcge' AND column_name = 'nombre_cuenta'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_pcge_nombre_fts ON public.plan_contable_pcge USING gin(to_tsvector(''spanish'', nombre_cuenta))';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pcge_operativas
  ON public.plan_contable_pcge(codigo_cuenta)
  WHERE activo = true;

-- ============================================================
-- FICHAS_RUC
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_fichas_ruc_estado
  ON public.fichas_ruc(estado_contribuyente);

CREATE INDEX IF NOT EXISTS idx_fichas_ruc_actualizacion
  ON public.fichas_ruc(ultima_actualizacion DESC);

-- ============================================================
-- TABLAS HIJAS FICHA RUC
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tributos_ruc ON public.tributos_afectos(ruc);
CREATE INDEX IF NOT EXISTS idx_representantes_ruc ON public.representantes_legales(ruc);
CREATE INDEX IF NOT EXISTS idx_establecimientos_ruc ON public.establecimientos_anexos(ruc);

-- ============================================================
-- MATERIALIZED VIEWS KPI
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_dashboard_stats;
CREATE MATERIALIZED VIEW public.mv_dashboard_stats AS
SELECT
  COALESCE(ac.ruc, ac.ruc_contraparte) AS ruc,
  ac.periodo,
  COUNT(DISTINCT CASE WHEN ac.tipo_libro = 'DIARIO_COMPRAS' THEN ac.sire_registro_id END) AS total_compras,
  COUNT(DISTINCT CASE WHEN ac.tipo_libro = 'DIARIO_VENTAS' THEN ac.sire_registro_id END) AS total_ventas,
  COALESCE(SUM(CASE WHEN ac.tipo_libro = 'DIARIO_COMPRAS' THEN ac.debe ELSE 0 END), 0) AS total_monto_compras,
  COALESCE(SUM(CASE WHEN ac.tipo_libro = 'DIARIO_VENTAS' THEN ac.haber ELSE 0 END), 0) AS total_monto_ventas,
  COUNT(DISTINCT ac.cuenta_contable) AS cuentas_utilizadas,
  COUNT(*) AS total_lineas,
  MIN(ac.fecha_asiento) AS primera_fecha,
  MAX(ac.fecha_asiento) AS ultima_fecha
FROM public.asientos_contables ac
WHERE ac.sire_registro_id IS NOT NULL
GROUP BY COALESCE(ac.ruc, ac.ruc_contraparte), ac.periodo;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_ruc_periodo
  ON public.mv_dashboard_stats(ruc, periodo);

DROP MATERIALIZED VIEW IF EXISTS public.mv_saldos_cxc_cxp;
CREATE MATERIALIZED VIEW public.mv_saldos_cxc_cxp AS
SELECT
  ac.sire_registro_id,
  COALESCE(ac.ruc_contraparte, ac.ruc) AS ruc,
  ac.periodo,
  ac.tipo_libro,
  SUM(ac.debe) - SUM(ac.haber) AS saldo_pendiente,
  COUNT(*) AS lineas_pendientes,
  MAX(ac.fecha_asiento) AS ultima_actualizacion
FROM public.asientos_contables ac
WHERE ac.sire_registro_id IS NOT NULL
GROUP BY ac.sire_registro_id, COALESCE(ac.ruc_contraparte, ac.ruc), ac.periodo, ac.tipo_libro
HAVING SUM(ac.debe) - SUM(ac.haber) <> 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_saldos_sire
  ON public.mv_saldos_cxc_cxp(sire_registro_id, periodo, tipo_libro);

GRANT SELECT ON public.mv_dashboard_stats TO authenticated;
GRANT SELECT ON public.mv_saldos_cxc_cxp TO authenticated;

-- ============================================================
-- REFRESCAR MATERIALIZED VIEWS
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_refresh_materialized_views()
RETURNS TABLE(view_name text, refreshed_at timestamptz, duration_ms int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start timestamptz;
  v_duration int;
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.configuracion', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso admin.configuracion';
  END IF;

  v_start := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_dashboard_stats;
  v_duration := (EXTRACT(EPOCH FROM (clock_timestamp() - v_start)) * 1000)::int;
  view_name := 'mv_dashboard_stats';
  refreshed_at := now();
  duration_ms := v_duration;
  RETURN NEXT;

  v_start := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_saldos_cxc_cxp;
  v_duration := (EXTRACT(EPOCH FROM (clock_timestamp() - v_start)) * 1000)::int;
  view_name := 'mv_saldos_cxc_cxp';
  refreshed_at := now();
  duration_ms := v_duration;
  RETURN NEXT;
END;
$$;

-- ============================================================
-- ANÁLISIS QUERIES LENTAS (pg_stat_statements)
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_analyze_slow_queries(p_horas int DEFAULT 24)
RETURNS TABLE(
  query_text text,
  calls bigint,
  total_time_ms double precision,
  mean_time_ms double precision,
  max_time_ms double precision,
  rows_avg double precision,
  cache_hit_ratio double precision,
  recomendacion text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.configuracion', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso admin.configuracion';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
    RETURN QUERY
    SELECT
      pss.query::text,
      pss.calls,
      pss.total_exec_time,
      pss.mean_exec_time,
      pss.max_exec_time,
      pss.rows::double precision / GREATEST(pss.calls, 1)::double precision,
      COALESCE(
        pss.shared_blks_hit::double precision
          / GREATEST(pss.shared_blks_hit + pss.shared_blks_read, 1)::double precision,
        1
      ),
      CASE
        WHEN pss.mean_exec_time > 1000 THEN 'CRÍTICO: Agregar índice o revisar query plan'
        WHEN pss.mean_exec_time > 500 THEN 'ALTO: Considerar optimización'
        WHEN pss.mean_exec_time > 100 THEN 'MEDIO: Monitorear'
        WHEN pss.calls > 1000 AND pss.mean_exec_time > 10 THEN 'ALTO VOLUMEN: Evaluar caching'
        ELSE 'OK'
      END
    FROM pg_stat_statements pss
    WHERE pss.query !~* 'pg_stat'
    ORDER BY pss.total_exec_time DESC
    LIMIT 20;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_mv_dashboard_stats(p_ruc text, p_periodo text)
RETURNS SETOF public.mv_dashboard_stats
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.mv_dashboard_stats
  WHERE ruc = p_ruc AND periodo = p_periodo;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_refresh_materialized_views() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_analyze_slow_queries(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_mv_dashboard_stats(text, text) TO authenticated;
