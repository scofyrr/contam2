-- Macro-tarea 15: RPCs para dashboards Admin y Contador

CREATE OR REPLACE FUNCTION public.rpc_dashboard_estudio_kpis()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_total_contadores int;
  v_contadores_activos int;
  v_total_clientes int;
  v_clientes_activos int;
  v_pendientes int;
  v_vencidas int;
  v_efectividad numeric;
  v_fact_mes numeric;
  v_fact_anual numeric;
  v_periodo text := to_char(CURRENT_DATE, 'YYYYMM');
BEGIN
  IF NOT public.rpc_check_permission(v_uid, 'dashboard.configurar', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso dashboard.configurar';
  END IF;

  SELECT COUNT(DISTINCT ur.user_id) INTO v_total_contadores
  FROM usuario_roles ur
  JOIN roles r ON r.id = ur.rol_id
  WHERE ur.activo AND r.nombre IN ('CONTADOR', 'CONTADOR_SENIOR', 'AUXILIAR_CONTABLE');

  SELECT COUNT(DISTINCT ur.user_id) INTO v_contadores_activos
  FROM usuario_roles ur
  JOIN roles r ON r.id = ur.rol_id
  WHERE ur.activo AND r.nombre IN ('CONTADOR', 'CONTADOR_SENIOR', 'AUXILIAR_CONTABLE')
    AND ur.fecha_hasta IS NULL OR ur.fecha_hasta >= CURRENT_DATE;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE estado = 'ACTIVO')
  INTO v_total_clientes, v_clientes_activos
  FROM contribuyentes;

  SELECT COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso')),
         COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso') AND plazo_vencimiento < CURRENT_DATE)
  INTO v_pendientes, v_vencidas
  FROM tareas_pendientes;

  SELECT COALESCE(
    ROUND(100.0 * COUNT(*) FILTER (WHERE estado = 'completada' AND (fecha_completada IS NULL OR plazo_vencimiento IS NULL OR fecha_completada::date <= plazo_vencimiento))
      / NULLIF(COUNT(*) FILTER (WHERE estado = 'completada'), 0), 1),
    85
  ) INTO v_efectividad
  FROM tareas_pendientes
  WHERE created_at >= date_trunc('month', CURRENT_DATE);

  SELECT COALESCE(SUM(total_monto_ventas), 0) INTO v_fact_mes
  FROM mv_dashboard_stats WHERE periodo = v_periodo;

  SELECT COALESCE(SUM(total_monto_ventas), 0) INTO v_fact_anual
  FROM mv_dashboard_stats WHERE periodo >= to_char(date_trunc('year', CURRENT_DATE), 'YYYYMM');

  RETURN jsonb_build_object(
    'totalContadores', COALESCE(v_total_contadores, 0),
    'contadoresActivos', COALESCE(v_contadores_activos, 0),
    'totalClientes', COALESCE(v_total_clientes, 0),
    'clientesActivos', COALESCE(v_clientes_activos, 0),
    'facturacionMensual', COALESCE(v_fact_mes, 0),
    'facturacionAnual', COALESCE(v_fact_anual, 0),
    'efectividadPromedio', COALESCE(v_efectividad, 85),
    'tareasPendientesEstudio', COALESCE(v_pendientes, 0),
    'tareasVencidasEstudio', COALESCE(v_vencidas, 0)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_dashboard_contador_kpis(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := COALESCE(p_user_id, auth.uid());
  v_rucs text[];
  v_clientes int;
  v_pendientes int;
  v_vencidas int;
  v_hoy int;
  v_efectividad numeric;
  v_completadas_hoy int;
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'dashboard.leer', NULL) THEN
    RAISE EXCEPTION 'No tiene permiso dashboard.leer';
  END IF;

  IF v_uid <> auth.uid()
     AND NOT public.rpc_check_permission(auth.uid(), 'dashboard.configurar', NULL) THEN
    RAISE EXCEPTION 'No puede consultar KPIs de otro usuario';
  END IF;

  SELECT ARRAY_AGG(DISTINCT ur.ruc_id) INTO v_rucs
  FROM usuario_roles ur
  WHERE ur.user_id = v_uid AND ur.activo AND ur.ruc_id IS NOT NULL;

  IF v_rucs IS NULL OR array_length(v_rucs, 1) IS NULL THEN
    SELECT COUNT(*) INTO v_clientes FROM contribuyentes WHERE estado = 'ACTIVO';
  ELSE
    SELECT COUNT(*) INTO v_clientes FROM contribuyentes WHERE ruc = ANY(v_rucs);
  END IF;

  SELECT COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso')),
         COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso') AND plazo_vencimiento < CURRENT_DATE),
         COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso') AND plazo_vencimiento = CURRENT_DATE)
  INTO v_pendientes, v_vencidas, v_hoy
  FROM tareas_pendientes t
  WHERE (v_rucs IS NULL OR t.ruc = ANY(v_rucs) OR t.usuario_id = v_uid OR t.asignado_a = v_uid::text);

  SELECT COALESCE(
    ROUND(100.0 * COUNT(*) FILTER (WHERE estado = 'completada' AND (fecha_completada IS NULL OR plazo_vencimiento IS NULL OR fecha_completada::date <= plazo_vencimiento))
      / NULLIF(COUNT(*) FILTER (WHERE estado = 'completada'), 0), 1),
    90
  ) INTO v_efectividad
  FROM tareas_pendientes t
  WHERE (v_rucs IS NULL OR t.ruc = ANY(v_rucs) OR t.usuario_id = v_uid)
    AND t.created_at >= date_trunc('month', CURRENT_DATE);

  SELECT COUNT(*) INTO v_completadas_hoy
  FROM tareas_pendientes t
  WHERE t.estado = 'completada'
    AND t.fecha_completada::date = CURRENT_DATE
    AND (v_rucs IS NULL OR t.ruc = ANY(v_rucs) OR t.usuario_id = v_uid);

  RETURN jsonb_build_object(
    'clientesAsignados', COALESCE(v_clientes, 0),
    'tareasPendientes', COALESCE(v_pendientes, 0),
    'tareasVencidas', COALESCE(v_vencidas, 0),
    'tareasHoy', COALESCE(v_hoy, 0),
    'efectividad', COALESCE(v_efectividad, 90),
    'tareasCompletadasHoy', COALESCE(v_completadas_hoy, 0),
    'comprobantesPendientes', 0,
    'asientosDelMes', 0,
    'movimientosCajaPendientes', 0,
    'cxcVencido', 0,
    'cxpVencido', 0,
    'cargaTrabajo', CASE
      WHEN COALESCE(v_vencidas, 0) > 5 OR COALESCE(v_pendientes, 0) > 40 THEN 'CRITICA'
      WHEN COALESCE(v_vencidas, 0) > 0 OR COALESCE(v_pendientes, 0) > 25 THEN 'ALTA'
      WHEN COALESCE(v_pendientes, 0) > 10 THEN 'NORMAL'
      ELSE 'BAJA'
    END,
    'rachaDiasProductivos', 0
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_dashboard_facturacion_mensual(p_meses int DEFAULT 12)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('mes', sub.periodo, 'monto', sub.monto)
      ORDER BY sub.periodo
    ),
    '[]'::jsonb
  )
  FROM (
    SELECT
      periodo,
      ROUND(SUM(total_monto_ventas)::numeric, 2) AS monto
    FROM mv_dashboard_stats
    WHERE periodo >= to_char(CURRENT_DATE - (p_meses || ' months')::interval, 'YYYYMM')
    GROUP BY periodo
  ) sub;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_dashboard_estudio_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_dashboard_contador_kpis(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_dashboard_facturacion_mensual(int) TO authenticated;
