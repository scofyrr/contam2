-- Módulo Tareas Pendientes — extensión y vista con JOINs
-- Idempotente

ALTER TABLE public.tareas_pendientes
  ADD COLUMN IF NOT EXISTS titulo text,
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS prioridad text NOT NULL DEFAULT 'media'
    CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  ADD COLUMN IF NOT EXISTS modulo_origen text DEFAULT 'general'
    CHECK (modulo_origen IN ('general', 'sire', 'asientos', 'caja', 'pcge', 'contribuyentes')),
  ADD COLUMN IF NOT EXISTS referencia_id text,
  ADD COLUMN IF NOT EXISTS usuario_id uuid,
  ADD COLUMN IF NOT EXISTS asignado_a text,
  ADD COLUMN IF NOT EXISTS fecha_completada timestamptz;

UPDATE public.tareas_pendientes
SET titulo = COALESCE(titulo, tramite)
WHERE titulo IS NULL;

UPDATE public.tareas_pendientes
SET estado = 'pendiente'
WHERE estado IS NULL OR estado NOT IN ('pendiente', 'en_progreso', 'completada', 'cancelada');

ALTER TABLE public.tareas_pendientes
  DROP CONSTRAINT IF EXISTS tareas_pendientes_estado_check;

ALTER TABLE public.tareas_pendientes
  ADD CONSTRAINT tareas_pendientes_estado_check
  CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada'));

CREATE INDEX IF NOT EXISTS idx_tareas_ruc ON public.tareas_pendientes(ruc);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON public.tareas_pendientes(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_plazo ON public.tareas_pendientes(plazo_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_modulo ON public.tareas_pendientes(modulo_origen);
CREATE INDEX IF NOT EXISTS idx_tareas_critica ON public.tareas_pendientes(critica) WHERE critica = true;

-- ============================================================
-- VISTA CON JOIN CONTRIBUYENTE
-- ============================================================
CREATE OR REPLACE VIEW public.v_tareas_pendientes AS
SELECT
  t.id,
  t.ruc,
  c.razon_social,
  t.entidad,
  t.tramite,
  COALESCE(t.titulo, t.tramite) AS titulo,
  t.descripcion,
  t.fecha_tramitar,
  t.problema,
  t.plazo_vencimiento,
  t.critica,
  t.estado,
  t.prioridad,
  t.modulo_origen,
  t.referencia_id,
  t.usuario_id,
  t.asignado_a,
  t.fecha_completada,
  t.created_at,
  t.updated_at,
  CASE
    WHEN t.estado IN ('completada', 'cancelada') THEN false
    WHEN t.plazo_vencimiento IS NOT NULL AND t.plazo_vencimiento < CURRENT_DATE THEN true
    ELSE false
  END AS vencida,
  CASE
    WHEN t.plazo_vencimiento IS NULL THEN NULL
    ELSE (t.plazo_vencimiento - CURRENT_DATE)
  END AS dias_restantes
FROM public.tareas_pendientes t
LEFT JOIN public.contribuyentes c ON c.ruc = t.ruc;

-- ============================================================
-- ESTADÍSTICAS RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_estadisticas_tareas(p_ruc text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', count(*),
    'pendientes', count(*) FILTER (WHERE estado = 'pendiente'),
    'en_progreso', count(*) FILTER (WHERE estado = 'en_progreso'),
    'completadas', count(*) FILTER (WHERE estado = 'completada'),
    'canceladas', count(*) FILTER (WHERE estado = 'cancelada'),
    'criticas', count(*) FILTER (WHERE critica AND estado NOT IN ('completada', 'cancelada')),
    'vencidas', count(*) FILTER (
      WHERE estado NOT IN ('completada', 'cancelada')
        AND plazo_vencimiento IS NOT NULL
        AND plazo_vencimiento < CURRENT_DATE
    ),
    'por_modulo', COALESCE(
      (SELECT jsonb_object_agg(modulo_origen, cnt)
       FROM (
         SELECT modulo_origen, count(*)::int AS cnt
         FROM tareas_pendientes
         WHERE (p_ruc IS NULL OR ruc = p_ruc)
           AND estado NOT IN ('completada', 'cancelada')
         GROUP BY modulo_origen
       ) s),
      '{}'::jsonb
    )
  ) INTO v
  FROM tareas_pendientes
  WHERE p_ruc IS NULL OR ruc = p_ruc;

  RETURN jsonb_build_object('success', true, 'data', v);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT SELECT ON public.v_tareas_pendientes TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_estadisticas_tareas(text) TO authenticated;

ALTER TABLE public.tareas_pendientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth select tareas" ON public.tareas_pendientes;
DROP POLICY IF EXISTS "auth insert tareas" ON public.tareas_pendientes;
DROP POLICY IF EXISTS "auth update tareas" ON public.tareas_pendientes;
DROP POLICY IF EXISTS "auth delete tareas" ON public.tareas_pendientes;

CREATE POLICY "auth select tareas" ON public.tareas_pendientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert tareas" ON public.tareas_pendientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update tareas" ON public.tareas_pendientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete tareas" ON public.tareas_pendientes FOR DELETE TO authenticated USING (true);
