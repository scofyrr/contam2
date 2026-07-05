-- Tareas + Notificaciones: motor automático y preferencias
-- Idempotente

-- ============================================================
-- A. Mejoras tareas_pendientes
-- ============================================================
ALTER TABLE public.tareas_pendientes
  ADD COLUMN IF NOT EXISTS hash_deduplicacion text,
  ADD COLUMN IF NOT EXISTS generada_automaticamente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS regla_generadora text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

DROP INDEX IF EXISTS idx_tareas_hash;
CREATE UNIQUE INDEX idx_tareas_hash ON public.tareas_pendientes(hash_deduplicacion)
  WHERE hash_deduplicacion IS NOT NULL AND estado NOT IN ('completada', 'cancelada');

-- Ampliar módulos permitidos
ALTER TABLE public.tareas_pendientes DROP CONSTRAINT IF EXISTS tareas_pendientes_modulo_origen_check;
ALTER TABLE public.tareas_pendientes
  ADD CONSTRAINT tareas_pendientes_modulo_origen_check
  CHECK (modulo_origen IN ('general', 'sire', 'asientos', 'caja', 'pcge', 'contribuyentes', 'cxc_cxp'));

CREATE OR REPLACE VIEW public.v_tareas_pendientes AS
SELECT
  t.id, t.ruc, c.razon_social, t.entidad, t.tramite,
  COALESCE(t.titulo, t.tramite) AS titulo, t.descripcion,
  t.fecha_tramitar, t.problema, t.plazo_vencimiento, t.critica, t.estado,
  t.prioridad, t.modulo_origen, t.referencia_id, t.usuario_id, t.asignado_a,
  t.fecha_completada, t.created_at, t.updated_at,
  t.hash_deduplicacion, t.generada_automaticamente, t.regla_generadora, t.metadata,
  CASE
    WHEN t.estado IN ('completada', 'cancelada') THEN false
    WHEN t.plazo_vencimiento IS NOT NULL AND t.plazo_vencimiento < CURRENT_DATE THEN true
    ELSE false
  END AS vencida,
  CASE WHEN t.plazo_vencimiento IS NULL THEN NULL
       ELSE (t.plazo_vencimiento - CURRENT_DATE) END AS dias_restantes
FROM public.tareas_pendientes t
LEFT JOIN public.contribuyentes c ON c.ruc = t.ruc;

-- ============================================================
-- B. notificaciones_correo extendida
-- ============================================================
ALTER TABLE public.notificaciones_correo
  ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'ALERTA_SISTEMA',
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_notif_user_leida ON public.notificaciones_correo(usuario_id, leido, created_at DESC);

ALTER TABLE public.notificaciones_correo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notif_select_own ON public.notificaciones_correo;
CREATE POLICY notif_select_own ON public.notificaciones_correo
  FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR usuario_id IS NULL);

DROP POLICY IF EXISTS notif_insert_own ON public.notificaciones_correo;
CREATE POLICY notif_insert_own ON public.notificaciones_correo
  FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid() OR usuario_id IS NULL);

DROP POLICY IF EXISTS notif_update_own ON public.notificaciones_correo;
CREATE POLICY notif_update_own ON public.notificaciones_correo
  FOR UPDATE TO authenticated USING (usuario_id = auth.uid() OR usuario_id IS NULL);

-- ============================================================
-- C. preferencias_notificaciones
-- ============================================================
CREATE TABLE IF NOT EXISTS public.preferencias_notificaciones (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notificaciones_in_app boolean NOT NULL DEFAULT true,
  notificaciones_correo boolean NOT NULL DEFAULT false,
  frecuencia_correo text NOT NULL DEFAULT 'diario'
    CHECK (frecuencia_correo IN ('instantaneo', 'diario', 'semanal')),
  horas_silencio jsonb,
  modulos_activos text[] NOT NULL DEFAULT '{SIRE,DIARIO,CAJA,TAREAS}',
  prioridad_minima text NOT NULL DEFAULT 'MEDIA'
    CHECK (prioridad_minima IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.preferencias_notificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prefs_select_own ON public.preferencias_notificaciones;
CREATE POLICY prefs_select_own ON public.preferencias_notificaciones
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS prefs_upsert_own ON public.preferencias_notificaciones;
CREATE POLICY prefs_upsert_own ON public.preferencias_notificaciones
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- D. rpc_generar_notificaciones_desde_tareas
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_generar_notificaciones_desde_tareas(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_count int := 0;
  v_uid uuid := COALESCE(p_user_id, auth.uid());
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario no autenticado');
  END IF;

  -- Tareas nuevas últimas 24h
  FOR r IN
    SELECT t.id, t.titulo, t.tramite, t.ruc, t.plazo_vencimiento, t.prioridad, t.modulo_origen
    FROM tareas_pendientes t
    WHERE t.created_at >= now() - interval '24 hours'
      AND t.estado IN ('pendiente', 'en_progreso')
      AND NOT EXISTS (
        SELECT 1 FROM notificaciones_correo n
        WHERE n.usuario_id = v_uid
          AND n.metadata->>'tareaId' = t.id::text
          AND n.tipo = 'TAREA_ASIGNADA'
      )
  LOOP
    INSERT INTO notificaciones_correo (usuario_id, correo_destino, remitente, asunto, cuerpo, tipo, metadata)
    VALUES (
      v_uid, '', 'CONTAM Sistema', 'Nueva tarea: ' || COALESCE(r.titulo, r.tramite),
      'Se registró una nueva tarea pendiente.',
      'TAREA_ASIGNADA',
      jsonb_build_object('tareaId', r.id, 'ruc', r.ruc, 'prioridad', r.prioridad, 'modulo', r.modulo_origen, 'linkNavegacion', '/tareas')
    );
    v_count := v_count + 1;
  END LOOP;

  -- Próximas a vencer (48h)
  FOR r IN
    SELECT t.id, t.titulo, t.tramite, t.ruc, t.plazo_vencimiento
    FROM tareas_pendientes t
    WHERE t.estado IN ('pendiente', 'en_progreso')
      AND t.plazo_vencimiento IS NOT NULL
      AND t.plazo_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 2
      AND NOT EXISTS (
        SELECT 1 FROM notificaciones_correo n
        WHERE n.usuario_id = v_uid AND n.metadata->>'tareaId' = t.id::text AND n.tipo = 'VENCIMIENTO_PROXIMO'
          AND n.created_at >= CURRENT_DATE
      )
  LOOP
    INSERT INTO notificaciones_correo (usuario_id, correo_destino, remitente, asunto, cuerpo, tipo, metadata)
    VALUES (
      v_uid, '', 'CONTAM Sistema', 'Próximo vencimiento: ' || COALESCE(r.titulo, r.tramite),
      'La tarea vence el ' || r.plazo_vencimiento::text,
      'VENCIMIENTO_PROXIMO',
      jsonb_build_object('tareaId', r.id, 'ruc', r.ruc, 'linkNavegacion', '/tareas')
    );
    v_count := v_count + 1;
  END LOOP;

  -- Vencidas
  FOR r IN
    SELECT t.id, t.titulo, t.tramite, t.ruc, t.plazo_vencimiento
    FROM tareas_pendientes t
    WHERE t.estado IN ('pendiente', 'en_progreso')
      AND t.plazo_vencimiento < CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM notificaciones_correo n
        WHERE n.usuario_id = v_uid AND n.metadata->>'tareaId' = t.id::text AND n.tipo = 'TAREA_VENCIDA'
          AND n.created_at >= CURRENT_DATE
      )
  LOOP
    INSERT INTO notificaciones_correo (usuario_id, correo_destino, remitente, asunto, cuerpo, tipo, metadata)
    VALUES (
      v_uid, '', 'CONTAM Sistema', 'TAREA VENCIDA: ' || COALESCE(r.titulo, r.tramite),
      'Venció el ' || r.plazo_vencimiento::text,
      'TAREA_VENCIDA',
      jsonb_build_object('tareaId', r.id, 'ruc', r.ruc, 'linkNavegacion', '/tareas')
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'generadas', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_generar_notificaciones_desde_tareas(uuid) TO authenticated;

-- ============================================================
-- E. rpc_estadisticas_tareas_mejorada
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_estadisticas_tareas_mejorada(
  p_ruc text DEFAULT NULL,
  p_periodo text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base jsonb;
  v_por_dia jsonb;
  v_por_mes jsonb;
  v_efectividad numeric;
  v_promedio_dias numeric;
  v_proyeccion numeric;
BEGIN
  SELECT rpc_estadisticas_tareas(p_ruc)->'data' INTO v_base;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('fecha', d, 'count', cnt) ORDER BY d), '[]'::jsonb)
  INTO v_por_dia
  FROM (
    SELECT plazo_vencimiento::text AS d, count(*)::int AS cnt
    FROM tareas_pendientes
    WHERE (p_ruc IS NULL OR ruc = p_ruc)
      AND (p_periodo IS NULL OR plazo_vencimiento::text LIKE p_periodo || '%' OR created_at::date::text LIKE p_periodo || '%')
      AND estado NOT IN ('completada', 'cancelada')
    GROUP BY plazo_vencimiento
  ) s;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('mes', m, 'generadas', gen, 'completadas', comp) ORDER BY m), '[]'::jsonb)
  INTO v_por_mes
  FROM (
    SELECT to_char(created_at, 'YYYY-MM') AS m,
      count(*) FILTER (WHERE generada_automaticamente)::int AS gen,
      count(*) FILTER (WHERE estado = 'completada')::int AS comp
    FROM tareas_pendientes
    WHERE created_at >= date_trunc('month', CURRENT_DATE) - interval '5 months'
      AND (p_ruc IS NULL OR ruc = p_ruc)
    GROUP BY 1
  ) s;

  SELECT
    CASE WHEN count(*) = 0 THEN 100
         ELSE round(100.0 * count(*) FILTER (
           WHERE estado = 'completada' AND fecha_completada IS NOT NULL
             AND (plazo_vencimiento IS NULL OR fecha_completada::date <= plazo_vencimiento)
         ) / count(*), 1) END,
    COALESCE(avg(EXTRACT(EPOCH FROM (fecha_completada - created_at)) / 86400) FILTER (WHERE estado = 'completada'), 0)
  INTO v_efectividad, v_promedio_dias
  FROM tareas_pendientes
  WHERE created_at >= CURRENT_DATE - 30
    AND (p_ruc IS NULL OR ruc = p_ruc);

  SELECT COALESCE(avg(cnt), 0) INTO v_proyeccion
  FROM (
    SELECT count(*)::numeric AS cnt
    FROM tareas_pendientes
    WHERE created_at >= date_trunc('month', CURRENT_DATE) - interval '3 months'
      AND (p_ruc IS NULL OR ruc = p_ruc)
    GROUP BY date_trunc('month', created_at)
  ) t;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_base || jsonb_build_object(
      'por_dia', v_por_dia,
      'por_mes', v_por_mes,
      'efectividad_pct', v_efectividad,
      'promedio_dias_resolucion', v_promedio_dias,
      'proyeccion_proximo_mes', round(v_proyeccion)
    )
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_estadisticas_tareas_mejorada(text, text) TO authenticated;
