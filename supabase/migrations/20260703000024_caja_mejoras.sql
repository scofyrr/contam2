-- Libro Caja premium: conciliación, centralización inteligente, liquidez
-- Idempotente

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- A. Columnas movimientos_caja
-- ============================================================
ALTER TABLE public.movimientos_caja
  ADD COLUMN IF NOT EXISTS cuenta_financiera_id uuid REFERENCES public.cuentas_financieras(id),
  ADD COLUMN IF NOT EXISTS conciliado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS conciliacion_id uuid;

CREATE INDEX IF NOT EXISTS idx_mov_caja_conciliacion ON public.movimientos_caja(conciliacion_id) WHERE conciliacion_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mov_caja_cuenta_fin ON public.movimientos_caja(cuenta_financiera_id);

-- ============================================================
-- B. Tablas conciliación
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conciliaciones_bancarias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_financiera_id uuid REFERENCES public.cuentas_financieras(id),
  ruc text NOT NULL,
  periodo text NOT NULL,
  fecha_conciliacion timestamptz DEFAULT now(),
  usuario_id uuid REFERENCES auth.users(id),
  estado text DEFAULT 'EN_PROCESO' CHECK (estado IN ('EN_PROCESO', 'COMPLETADA', 'CON_DISCREPANCIAS')),
  archivo_original text,
  total_extracto numeric(14,2),
  total_sistema numeric(14,2),
  diferencia_neta numeric(14,2),
  porcentaje_conciliacion numeric(5,2),
  asiento_ajuste_id uuid,
  notas text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conciliacion_detalles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conciliacion_id uuid NOT NULL REFERENCES public.conciliaciones_bancarias(id) ON DELETE CASCADE,
  extracto_row_id text NOT NULL,
  movimiento_sistema_id uuid REFERENCES public.movimientos_caja(id),
  nivel_match text,
  score_similitud numeric(5,2),
  confirmado boolean DEFAULT false,
  diferencias jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conc_ruc_periodo ON public.conciliaciones_bancarias(ruc, periodo);
CREATE INDEX IF NOT EXISTS idx_conc_detalle ON public.conciliacion_detalles(conciliacion_id);

ALTER TABLE public.conciliaciones_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conciliacion_detalles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conc_select ON public.conciliaciones_bancarias;
CREATE POLICY conc_select ON public.conciliaciones_bancarias FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS conc_write ON public.conciliaciones_bancarias;
CREATE POLICY conc_write ON public.conciliaciones_bancarias FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS conc_det_select ON public.conciliacion_detalles;
CREATE POLICY conc_det_select ON public.conciliacion_detalles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS conc_det_write ON public.conciliacion_detalles;
CREATE POLICY conc_det_write ON public.conciliacion_detalles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- C. Trigger duplicados
-- ============================================================
CREATE OR REPLACE FUNCTION public.detectar_movimiento_duplicado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.movimientos_caja mc
    WHERE mc.cuenta_contable = NEW.cuenta_contable
      AND COALESCE(mc.fecha_operacion, mc.fecha) = COALESCE(NEW.fecha_operacion, NEW.fecha)
      AND ABS(COALESCE(mc.debe, 0) - COALESCE(NEW.debe, 0)) < 0.01
      AND ABS(COALESCE(mc.haber, 0) - COALESCE(NEW.haber, 0)) < 0.01
      AND similarity(COALESCE(mc.glosa, ''), COALESCE(NEW.glosa, '')) > 0.9
      AND mc.id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE WARNING 'Posible movimiento duplicado: fecha=%, glosa=%', NEW.fecha, NEW.glosa;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_detectar_duplicados_caja ON public.movimientos_caja;
CREATE TRIGGER trg_detectar_duplicados_caja
  BEFORE INSERT OR UPDATE ON public.movimientos_caja
  FOR EACH ROW EXECUTE FUNCTION public.detectar_movimiento_duplicado();

-- ============================================================
-- D. rpc_centralizacion_inteligente
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_centralizacion_inteligente(
  p_ruc text,
  p_periodo text,
  p_cuenta_financiera_id uuid DEFAULT NULL,
  p_agrupacion text DEFAULT 'cuenta',
  p_dry_run boolean DEFAULT true
)
RETURNS TABLE(
  grupo_nombre text,
  cuenta_contable text,
  cantidad_movimientos int,
  total_ingresos numeric,
  total_egresos numeric,
  monto_neto numeric,
  asiento_generado_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_asiento_id uuid;
  v_glosa text;
  v_fecha date;
  v_ids uuid[];
BEGIN
  FOR r IN
    SELECT
      CASE p_agrupacion
        WHEN 'tipo' THEN COALESCE(m.tipo_movimiento, 'mixto')
        WHEN 'dia' THEN COALESCE(m.fecha_operacion, m.fecha)::text
        WHEN 'origen' THEN COALESCE(m.origen_documento, m.origen, 'manual')
        ELSE m.cuenta_contable
      END AS grp,
      m.cuenta_contable AS cta,
      count(*)::int AS cnt,
      COALESCE(SUM(m.haber), 0) AS ing,
      COALESCE(SUM(m.debe), 0) AS egr,
      COALESCE(SUM(m.haber), 0) - COALESCE(SUM(m.debe), 0) AS neto,
      array_agg(m.id) AS mov_ids,
      max(COALESCE(m.fecha_operacion, m.fecha)) AS max_fecha
    FROM movimientos_caja m
    WHERE m.ruc = p_ruc
      AND m.periodo = p_periodo
      AND m.asiento_id IS NULL
      AND (p_cuenta_financiera_id IS NULL OR m.cuenta_financiera_id = p_cuenta_financiera_id)
    GROUP BY 1, 2
  LOOP
    grupo_nombre := r.grp::text;
    cuenta_contable := r.cta;
    cantidad_movimientos := r.cnt;
    total_ingresos := round(r.ing, 2);
    total_egresos := round(r.egr, 2);
    monto_neto := round(r.neto, 2);
    asiento_generado_id := NULL;

    IF NOT p_dry_run THEN
      v_glosa := format('Centralización libro caja %s — %s (%s mov.)', p_periodo, r.grp, r.cnt);
      v_fecha := r.max_fecha;

      INSERT INTO asientos_contables (
        sire_registro_id, periodo, tipo_asiento, tipo_libro, fecha_asiento,
        cuenta_contable, glosa, debe, haber, naturaleza, tipo_registro,
        ruc_contraparte
      ) VALUES (
        NULL, p_periodo, 'principal', 'CAJA_BANCOS', v_fecha,
        r.cta, v_glosa,
        CASE WHEN r.neto < 0 THEN round(abs(r.neto), 2) ELSE 0 END,
        CASE WHEN r.neto >= 0 THEN round(abs(r.neto), 2) ELSE 0 END,
        CASE WHEN r.neto >= 0 THEN 'haber' ELSE 'debe' END,
        'COMPRA', p_ruc
      ) RETURNING id INTO v_asiento_id;

      UPDATE movimientos_caja SET asiento_id = v_asiento_id
      WHERE id = ANY(r.mov_ids);

      asiento_generado_id := v_asiento_id;
    END IF;

    RETURN NEXT;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_centralizacion_inteligente(text, text, uuid, text, boolean) TO authenticated;

-- ============================================================
-- E. rpc_descentralizar_periodo
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_descentralizar_periodo(
  p_ruc text,
  p_periodo text,
  p_cuenta_financiera_id uuid DEFAULT NULL
)
RETURNS TABLE(asiento_eliminado_id uuid, movimientos_liberados int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT m.asiento_id AS aid, count(*)::int AS cnt
    FROM movimientos_caja m
    JOIN asientos_contables a ON a.id = m.asiento_id
    WHERE m.ruc = p_ruc AND m.periodo = p_periodo
      AND a.glosa LIKE 'Centralización libro caja%'
      AND (p_cuenta_financiera_id IS NULL OR m.cuenta_financiera_id = p_cuenta_financiera_id)
    GROUP BY m.asiento_id
  LOOP
    UPDATE movimientos_caja SET asiento_id = NULL WHERE asiento_id = r.aid;
    DELETE FROM asientos_contables WHERE id = r.aid;
    asiento_eliminado_id := r.aid;
    movimientos_liberados := r.cnt;
    RETURN NEXT;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_descentralizar_periodo(text, text, uuid) TO authenticated;

-- ============================================================
-- F. rpc_obtener_liquidez_global
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_obtener_liquidez_global(p_ruc text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_r RECORD;
  v_saldo numeric;
  v_cxc numeric;
  v_cxp numeric;
BEGIN
  FOR v_r IN
    SELECT c.ruc, c.razon_social
    FROM contribuyentes c
    WHERE p_ruc IS NULL OR c.ruc = p_ruc
    ORDER BY c.razon_social
    LIMIT 50
  LOOP
    SELECT COALESCE(SUM(haber - debe), 0) INTO v_saldo
    FROM movimientos_caja WHERE ruc = v_r.ruc;

    SELECT COALESCE(SUM(COALESCE(rs.mto_total_cp, rs.importe_total, 0)), 0) INTO v_cxc
    FROM registros_sire rs
    WHERE rs.ruc = v_r.ruc AND rs.tipo = 'VENTA' AND rs.estado_cobro = 'pendiente';

    SELECT COALESCE(SUM(COALESCE(rs.mto_total_cp, rs.importe_total, 0)), 0) INTO v_cxp
    FROM registros_sire rs
    WHERE rs.ruc = v_r.ruc AND rs.tipo = 'COMPRA' AND rs.estado_pago = 'pendiente';

    v_result := v_result || jsonb_build_array(jsonb_build_object(
      'ruc', v_r.ruc,
      'razon_social', v_r.razon_social,
      'saldo_disponible', round(v_saldo, 2),
      'por_cobrar', round(v_cxc, 2),
      'por_pagar', round(v_cxp, 2),
      'saldo_total', round(v_saldo + v_cxc - v_cxp, 2),
      'ratio', CASE WHEN v_cxp > 0 THEN round(v_saldo / v_cxp, 2) ELSE 0 END
    ));
  END LOOP;

  RETURN jsonb_build_object('success', true, 'data', v_result);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_obtener_liquidez_global(text) TO authenticated;
