-- =============================================================================
-- Módulo 8: CONTAM AI Copilot & Auditor Fiscal de Anomalías Tributarias
-- Idempotente — multi-tenant vía fn_user_can_access_contribuyente
-- =============================================================================

-- =============================================================================
-- 1. AI CLASIFICACIÓN LOGS (feedback loop PCGE)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ai_clasificacion_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  ruc_contraparte varchar(11),
  glosa text NOT NULL,
  cuenta_sugerida_codigo varchar(10) NOT NULL,
  confianza_score numeric(4, 3) NOT NULL CHECK (confianza_score >= 0 AND confianza_score <= 1),
  fue_aceptada boolean,
  cuenta_modificada_codigo varchar(10),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_clasificacion_logs_contribuyente_id_fkey') THEN
    ALTER TABLE public.ai_clasificacion_logs
      ADD CONSTRAINT ai_clasificacion_logs_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_clasificacion_logs_contrib
  ON public.ai_clasificacion_logs (contribuyente_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_clasificacion_logs_ruc
  ON public.ai_clasificacion_logs (contribuyente_id, ruc_contraparte);

DROP TRIGGER IF EXISTS ai_clasificacion_logs_updated ON public.ai_clasificacion_logs;
CREATE TRIGGER ai_clasificacion_logs_updated
  BEFORE UPDATE ON public.ai_clasificacion_logs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 2. AI ANOMALÍAS DETECTADAS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ai_anomalias_detectadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  periodo_id uuid,
  comprobante_ref varchar(100) NOT NULL,
  ruc_emisor varchar(11) NOT NULL,
  razon_social_emisor varchar(255),
  tipo_anomalia varchar(50) NOT NULL
    CHECK (tipo_anomalia IN (
      'INCONGRUENCIA_ACTIVIDAD_RUC',
      'DESCUADRE_IGV_MATEMATICO',
      'RIESGO_REPARO_RENTA',
      'MONTO_ANORMAL_PROMEDIO'
    )),
  nivel_riesgo varchar(20) NOT NULL DEFAULT 'MEDIO'
    CHECK (nivel_riesgo IN ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')),
  explicacion_ia text NOT NULL,
  resuelto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_anomalias_detectadas_contribuyente_id_fkey') THEN
    ALTER TABLE public.ai_anomalias_detectadas
      ADD CONSTRAINT ai_anomalias_detectadas_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_anomalias_detectadas_periodo_id_fkey') THEN
    ALTER TABLE public.ai_anomalias_detectadas
      ADD CONSTRAINT ai_anomalias_detectadas_periodo_id_fkey
      FOREIGN KEY (periodo_id) REFERENCES public.sire_periodos(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_anomalias_contrib_periodo
  ON public.ai_anomalias_detectadas (contribuyente_id, periodo_id, resuelto);

CREATE INDEX IF NOT EXISTS idx_ai_anomalias_nivel
  ON public.ai_anomalias_detectadas (contribuyente_id, nivel_riesgo, resuelto);

DROP TRIGGER IF EXISTS ai_anomalias_detectadas_updated ON public.ai_anomalias_detectadas;
CREATE TRIGGER ai_anomalias_detectadas_updated
  BEFORE UPDATE ON public.ai_anomalias_detectadas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 3. AI REGLAS PERSONALIZADAS (mapeo PCGE por RUC / palabra clave)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ai_reglas_personalizadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  ruc_patron varchar(11),
  palabra_clave varchar(100),
  cuenta_pcge_codigo varchar(10) NOT NULL,
  prioridad int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ruc_patron IS NOT NULL OR palabra_clave IS NOT NULL)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_reglas_personalizadas_contribuyente_id_fkey') THEN
    ALTER TABLE public.ai_reglas_personalizadas
      ADD CONSTRAINT ai_reglas_personalizadas_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_reglas_contrib_prioridad
  ON public.ai_reglas_personalizadas (contribuyente_id, prioridad DESC);

DROP TRIGGER IF EXISTS ai_reglas_personalizadas_updated ON public.ai_reglas_personalizadas;
CREATE TRIGGER ai_reglas_personalizadas_updated
  BEFORE UPDATE ON public.ai_reglas_personalizadas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Reglas globales de ejemplo (contribuyente NULL no permitido — seed por contribuyente vía app)
-- Cuentas PCGE frecuentes en compras
INSERT INTO public.plan_cuentas_pcge (codigo, denominacion, elemento, nivel, tipo_cuenta, permite_movimiento) VALUES
  ('6361', 'Energía eléctrica', 6, 4, 'GASTOS', true),
  ('6362', 'Agua', 6, 4, 'GASTOS', true),
  ('6363', 'Teléfono', 6, 4, 'GASTOS', true),
  ('6371', 'Alquileres', 6, 4, 'GASTOS', true),
  ('6312', 'Gratificaciones', 6, 4, 'GASTOS', true),
  ('6313', 'Vacaciones', 6, 4, 'GASTOS', true),
  ('6541', 'Seguros', 6, 4, 'GASTOS', true),
  ('6551', 'Gastos de viaje', 6, 4, 'GASTOS', true),
  ('6561', 'Gastos de representación', 6, 4, 'GASTOS', true)
ON CONFLICT (codigo) DO UPDATE SET
  denominacion = EXCLUDED.denominacion,
  updated_at = now();

-- =============================================================================
-- 4. RLS
-- =============================================================================
ALTER TABLE public.ai_clasificacion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_anomalias_detectadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reglas_personalizadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_clasificacion_logs_tenant ON public.ai_clasificacion_logs;
CREATE POLICY ai_clasificacion_logs_tenant ON public.ai_clasificacion_logs
  FOR ALL TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id))
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS ai_anomalias_detectadas_tenant ON public.ai_anomalias_detectadas;
CREATE POLICY ai_anomalias_detectadas_tenant ON public.ai_anomalias_detectadas
  FOR ALL TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id))
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS ai_reglas_personalizadas_tenant ON public.ai_reglas_personalizadas;
CREATE POLICY ai_reglas_personalizadas_tenant ON public.ai_reglas_personalizadas
  FOR ALL TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id))
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

-- =============================================================================
-- 5. RPC: Registrar feedback IA
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_registrar_feedback_ai(
  p_log_id uuid,
  p_fue_aceptada boolean,
  p_cuenta_final varchar DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contribuyente_id uuid;
  v_cuenta_sugerida varchar(10);
BEGIN
  SELECT contribuyente_id, cuenta_sugerida_codigo
  INTO v_contribuyente_id, v_cuenta_sugerida
  FROM public.ai_clasificacion_logs
  WHERE id = p_log_id;

  IF v_contribuyente_id IS NULL THEN
    RAISE EXCEPTION 'Log de clasificación no encontrado';
  END IF;

  IF NOT public.fn_user_can_access_contribuyente(v_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  UPDATE public.ai_clasificacion_logs
  SET
    fue_aceptada = p_fue_aceptada,
    cuenta_modificada_codigo = CASE
      WHEN p_fue_aceptada THEN v_cuenta_sugerida
      ELSE NULLIF(trim(p_cuenta_final), '')
    END,
    updated_at = now()
  WHERE id = p_log_id;

  -- Retroalimentar regla personalizada si el contador corrigió
  IF NOT p_fue_aceptada AND NULLIF(trim(p_cuenta_final), '') IS NOT NULL THEN
    INSERT INTO public.ai_reglas_personalizadas (
      contribuyente_id,
      ruc_patron,
      palabra_clave,
      cuenta_pcge_codigo,
      prioridad
    )
    SELECT
      l.contribuyente_id,
      l.ruc_contraparte,
      left(trim(l.glosa), 100),
      NULLIF(trim(p_cuenta_final), ''),
      5
    FROM public.ai_clasificacion_logs l
    WHERE l.id = p_log_id
      AND NOT EXISTS (
        SELECT 1 FROM public.ai_reglas_personalizadas r
        WHERE r.contribuyente_id = l.contribuyente_id
          AND r.cuenta_pcge_codigo = NULLIF(trim(p_cuenta_final), '')
          AND (
            (r.ruc_patron IS NOT NULL AND r.ruc_patron = l.ruc_contraparte)
            OR (r.palabra_clave IS NOT NULL AND lower(l.glosa) LIKE '%' || lower(r.palabra_clave) || '%')
          )
      );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'log_id', p_log_id,
    'fue_aceptada', p_fue_aceptada,
    'cuenta_final', COALESCE(
      CASE WHEN p_fue_aceptada THEN v_cuenta_sugerida ELSE NULLIF(trim(p_cuenta_final), '') END,
      v_cuenta_sugerida
    )
  );
END;
$$;

-- =============================================================================
-- 6. RPC: Resumen anomalías por periodo
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_obtener_resumen_anomalias_periodo(
  p_contribuyente_id uuid,
  p_periodo varchar
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo_id uuid;
  v_por_nivel jsonb;
  v_total int;
  v_pendientes int;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  SELECT sp.id INTO v_periodo_id
  FROM public.sire_periodos sp
  WHERE sp.contribuyente_id = p_contribuyente_id
    AND sp.periodo = p_periodo
  LIMIT 1;

  SELECT
    COALESCE(jsonb_object_agg(nivel_riesgo, cnt), '{}'::jsonb),
    COALESCE(SUM(cnt), 0)::int,
    COALESCE(SUM(CASE WHEN NOT resuelto THEN cnt ELSE 0 END), 0)::int
  INTO v_por_nivel, v_total, v_pendientes
  FROM (
    SELECT nivel_riesgo, resuelto, COUNT(*)::int AS cnt
    FROM public.ai_anomalias_detectadas a
    WHERE a.contribuyente_id = p_contribuyente_id
      AND (
        v_periodo_id IS NULL
        OR a.periodo_id = v_periodo_id
        OR a.periodo_id IS NULL
      )
    GROUP BY nivel_riesgo, resuelto
  ) sub;

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'periodo', p_periodo,
    'periodo_id', v_periodo_id,
    'total', v_total,
    'pendientes', v_pendientes,
    'por_nivel_riesgo', COALESCE((
      SELECT jsonb_object_agg(nivel_riesgo, cnt)
      FROM (
        SELECT nivel_riesgo, COUNT(*)::int AS cnt
        FROM public.ai_anomalias_detectadas a
        WHERE a.contribuyente_id = p_contribuyente_id
          AND NOT a.resuelto
          AND (v_periodo_id IS NULL OR a.periodo_id = v_periodo_id OR a.periodo_id IS NULL)
        GROUP BY nivel_riesgo
      ) x
    ), '{}'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_registrar_feedback_ai(uuid, boolean, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_registrar_feedback_ai(uuid, boolean, varchar) TO authenticated;

REVOKE ALL ON FUNCTION public.fn_obtener_resumen_anomalias_periodo(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_obtener_resumen_anomalias_periodo(uuid, varchar) TO authenticated;
