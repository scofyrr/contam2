-- Trazabilidad contable: validación de integridad y errores persistentes
-- Idempotente · complementa asiento-traceability-service.ts

DO $$ BEGIN
  CREATE TYPE public.integrity_severity AS ENUM ('CRITICAL', 'ERROR', 'WARNING', 'INFO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.integrity_check_type AS ENUM (
    'PARTIDA_DOBLE',
    'HUERFANO',
    'MONTOS_DIVERGENTES',
    'FECHA_INCONSISTENTE',
    'CUENTA_INVALIDA',
    'ESLABON_ROTO',
    'ESTADO_INCONSISTENTE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.accounting_integrity_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc text NOT NULL,
  periodo text,
  check_type public.integrity_check_type NOT NULL,
  severidad public.integrity_severity NOT NULL DEFAULT 'WARNING',
  descripcion text NOT NULL,
  detalle jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_aie_ruc_periodo ON public.accounting_integrity_errors(ruc, periodo);
CREATE INDEX IF NOT EXISTS idx_aie_severidad ON public.accounting_integrity_errors(severidad) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_aie_created ON public.accounting_integrity_errors(created_at DESC);

ALTER TABLE public.accounting_integrity_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aie_select_authenticated ON public.accounting_integrity_errors;
CREATE POLICY aie_select_authenticated ON public.accounting_integrity_errors
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS aie_insert_service ON public.accounting_integrity_errors;
CREATE POLICY aie_insert_service ON public.accounting_integrity_errors
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS aie_update_authenticated ON public.accounting_integrity_errors;
CREATE POLICY aie_update_authenticated ON public.accounting_integrity_errors
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- rpc_validate_accounting_integrity
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_validate_accounting_integrity(
  p_ruc text DEFAULT NULL,
  p_periodo text DEFAULT NULL
)
RETURNS SETOF public.accounting_integrity_errors
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_id uuid;
BEGIN
  -- 1. Partida doble descuadrada (tolerancia 0.001)
  FOR r IN
    SELECT
      a.ruc_contraparte AS ruc,
      a.periodo,
      a.sire_registro_id,
      SUM(a.debe) AS total_debe,
      SUM(a.haber) AS total_haber
    FROM public.asientos_contables a
    WHERE (p_ruc IS NULL OR a.ruc_contraparte = p_ruc OR EXISTS (
      SELECT 1 FROM public.registros_sire rs WHERE rs.id = a.sire_registro_id AND rs.ruc = p_ruc
    ))
      AND (p_periodo IS NULL OR a.periodo = p_periodo)
    GROUP BY a.sire_registro_id, a.periodo, a.tipo_asiento, a.tipo_libro, a.fecha_asiento, a.ruc_contraparte
    HAVING ABS(SUM(a.debe) - SUM(a.haber)) > 0.001
  LOOP
    INSERT INTO public.accounting_integrity_errors (ruc, periodo, check_type, severidad, descripcion, detalle)
    VALUES (
      COALESCE(p_ruc, r.ruc, '00000000000'),
      r.periodo,
      'PARTIDA_DOBLE',
      'CRITICAL',
      'Asiento descuadrado',
      jsonb_build_object(
        'sire_registro_id', r.sire_registro_id,
        'debe', r.total_debe,
        'haber', r.total_haber,
        'diff', ABS(r.total_debe - r.total_haber)
      )
    )
    RETURNING id INTO v_id;
    RETURN QUERY SELECT * FROM public.accounting_integrity_errors WHERE id = v_id;
  END LOOP;

  -- 2. Asientos con sire_registro_id huérfano
  FOR r IN
    SELECT a.id, a.sire_registro_id, a.periodo,
      COALESCE(rs.ruc, a.ruc_contraparte, p_ruc, '00000000000') AS ruc
    FROM public.asientos_contables a
    LEFT JOIN public.registros_sire rs ON rs.id = a.sire_registro_id
    LEFT JOIN public.registros_sire_cabecera c ON c.id = a.sire_registro_id
    WHERE a.sire_registro_id IS NOT NULL
      AND rs.id IS NULL AND c.id IS NULL
      AND (p_ruc IS NULL OR a.ruc_contraparte = p_ruc)
      AND (p_periodo IS NULL OR a.periodo = p_periodo)
    LIMIT 200
  LOOP
    INSERT INTO public.accounting_integrity_errors (ruc, periodo, check_type, severidad, descripcion, detalle)
    VALUES (
      r.ruc, r.periodo, 'HUERFANO', 'ERROR',
      'Asiento sin comprobante SIRE',
      jsonb_build_object('asiento_id', r.id, 'sire_registro_id', r.sire_registro_id)
    )
    RETURNING id INTO v_id;
    RETURN QUERY SELECT * FROM public.accounting_integrity_errors WHERE id = v_id;
  END LOOP;

  -- 3. Movimientos caja SIRE sin asiento de cancelación vinculado
  FOR r IN
    SELECT m.id, m.registro_sire_id, m.periodo, m.ruc
    FROM public.movimientos_caja m
    JOIN public.registros_sire rs ON rs.id = m.registro_sire_id
    WHERE m.registro_sire_id IS NOT NULL
      AND m.asiento_id IS NULL
      AND rs.cancelacion_asiento_id IS NULL
      AND (p_ruc IS NULL OR m.ruc = p_ruc OR rs.ruc = p_ruc)
      AND (p_periodo IS NULL OR m.periodo = p_periodo)
    LIMIT 200
  LOOP
    INSERT INTO public.accounting_integrity_errors (ruc, periodo, check_type, severidad, descripcion, detalle)
    VALUES (
      COALESCE(r.ruc, p_ruc, '00000000000'), r.periodo, 'ESLABON_ROTO', 'WARNING',
      'Movimiento caja sin asiento de centralización/cancelación',
      jsonb_build_object('movimiento_id', r.id, 'registro_sire_id', r.registro_sire_id)
    )
    RETURNING id INTO v_id;
    RETURN QUERY SELECT * FROM public.accounting_integrity_errors WHERE id = v_id;
  END LOOP;

  -- 4. Montos SIRE vs suma asientos principal
  FOR r IN
    SELECT
      rs.id AS sire_id,
      rs.ruc,
      rs.periodo,
      COALESCE(rs.mto_total_cp, rs.importe_total, 0) AS mto_sire,
      COALESCE(SUM(a.debe), 0) AS mto_asiento
    FROM public.registros_sire rs
    LEFT JOIN public.asientos_contables a
      ON a.sire_registro_id = rs.id AND a.tipo_asiento = 'principal'
    WHERE (p_ruc IS NULL OR rs.ruc = p_ruc)
      AND (p_periodo IS NULL OR rs.periodo = p_periodo)
    GROUP BY rs.id, rs.ruc, rs.periodo, rs.mto_total_cp, rs.importe_total
    HAVING COALESCE(SUM(a.debe), 0) > 0
      AND ABS(COALESCE(rs.mto_total_cp, rs.importe_total, 0) - COALESCE(SUM(a.debe), 0)) > 0.05
    LIMIT 200
  LOOP
    INSERT INTO public.accounting_integrity_errors (ruc, periodo, check_type, severidad, descripcion, detalle)
    VALUES (
      r.ruc, r.periodo, 'MONTOS_DIVERGENTES', 'ERROR',
      'Monto SIRE difiere de provisión',
      jsonb_build_object('sire_id', r.sire_id, 'mto_sire', r.mto_sire, 'mto_asiento', r.mto_asiento)
    )
    RETURNING id INTO v_id;
    RETURN QUERY SELECT * FROM public.accounting_integrity_errors WHERE id = v_id;
  END LOOP;

  -- 5. Fechas asiento anteriores a emisión comprobante
  FOR r IN
    SELECT a.id, a.sire_registro_id, rs.ruc, a.periodo, a.fecha_asiento, rs.fecha_emision
    FROM public.asientos_contables a
    JOIN public.registros_sire rs ON rs.id = a.sire_registro_id
    WHERE a.fecha_asiento::date < rs.fecha_emision::date
      AND (p_ruc IS NULL OR rs.ruc = p_ruc)
      AND (p_periodo IS NULL OR a.periodo = p_periodo)
    LIMIT 200
  LOOP
    INSERT INTO public.accounting_integrity_errors (ruc, periodo, check_type, severidad, descripcion, detalle)
    VALUES (
      r.ruc, r.periodo, 'FECHA_INCONSISTENTE', 'WARNING',
      'Asiento anterior a fecha de emisión del comprobante',
      jsonb_build_object('asiento_id', r.id, 'fecha_asiento', r.fecha_asiento, 'fecha_emision', r.fecha_emision)
    )
    RETURNING id INTO v_id;
    RETURN QUERY SELECT * FROM public.accounting_integrity_errors WHERE id = v_id;
  END LOOP;

  -- 6. Cuentas inválidas en PCGE
  FOR r IN
    SELECT DISTINCT a.cuenta_contable, a.periodo,
      COALESCE(a.ruc_contraparte, p_ruc, '00000000000') AS ruc
    FROM public.asientos_contables a
    LEFT JOIN public.plan_contable_pcge p ON p.codigo_cuenta = a.cuenta_contable
    WHERE p.codigo_cuenta IS NULL
      AND (p_ruc IS NULL OR a.ruc_contraparte = p_ruc)
      AND (p_periodo IS NULL OR a.periodo = p_periodo)
    LIMIT 200
  LOOP
    INSERT INTO public.accounting_integrity_errors (ruc, periodo, check_type, severidad, descripcion, detalle)
    VALUES (
      r.ruc, r.periodo, 'CUENTA_INVALIDA', 'ERROR',
      'Cuenta contable no existe en PCGE',
      jsonb_build_object('cuenta_contable', r.cuenta_contable)
    )
    RETURNING id INTO v_id;
    RETURN QUERY SELECT * FROM public.accounting_integrity_errors WHERE id = v_id;
  END LOOP;

  -- 7. Estados contradictorios
  FOR r IN
    SELECT rs.id, rs.ruc, rs.periodo, rs.tipo, rs.estado_cobro, rs.estado_pago, rs.cancelacion_asiento_id
    FROM public.registros_sire rs
    WHERE (
      (rs.tipo = 'VENTA' AND rs.estado_cobro = 'cobrado' AND rs.cancelacion_asiento_id IS NULL)
      OR (rs.tipo = 'COMPRA' AND rs.estado_pago = 'pagado' AND rs.cancelacion_asiento_id IS NULL)
      OR (rs.cancelacion_asiento_id IS NOT NULL AND rs.tipo = 'VENTA' AND rs.estado_cobro = 'pendiente')
      OR (rs.cancelacion_asiento_id IS NOT NULL AND rs.tipo = 'COMPRA' AND rs.estado_pago = 'pendiente')
    )
      AND (p_ruc IS NULL OR rs.ruc = p_ruc)
      AND (p_periodo IS NULL OR rs.periodo = p_periodo)
    LIMIT 200
  LOOP
    INSERT INTO public.accounting_integrity_errors (ruc, periodo, check_type, severidad, descripcion, detalle)
    VALUES (
      r.ruc, r.periodo, 'ESTADO_INCONSISTENTE', 'ERROR',
      'Estado SIRE inconsistente con cancelación contable',
      jsonb_build_object(
        'sire_id', r.id,
        'tipo', r.tipo,
        'estado_cobro', r.estado_cobro,
        'estado_pago', r.estado_pago,
        'cancelacion_asiento_id', r.cancelacion_asiento_id
      )
    )
    RETURNING id INTO v_id;
    RETURN QUERY SELECT * FROM public.accounting_integrity_errors WHERE id = v_id;
  END LOOP;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_validate_accounting_integrity(text, text) TO authenticated;

-- ============================================================
-- rpc_fix_common_integrity_issues
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_fix_common_integrity_issues(p_dry_run boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_fixed int := 0;
  v_suggested int := 0;
  v_diff numeric;
BEGIN
  -- Ajuste centavos en partida doble (línea de mayor monto)
  FOR r IN
    SELECT
      sire_registro_id,
      periodo,
      tipo_asiento,
      tipo_libro,
      fecha_asiento,
      SUM(debe) AS td,
      SUM(haber) AS th
    FROM public.asientos_contables
    GROUP BY sire_registro_id, periodo, tipo_asiento, tipo_libro, fecha_asiento
    HAVING ABS(SUM(debe) - SUM(haber)) BETWEEN 0.001 AND 0.05
  LOOP
    v_diff := r.td - r.th;
    IF p_dry_run THEN
      v_suggested := v_suggested + 1;
    ELSE
      UPDATE public.asientos_contables ac
      SET haber = haber + CASE WHEN v_diff > 0 THEN v_diff ELSE 0 END,
          debe = debe + CASE WHEN v_diff < 0 THEN ABS(v_diff) ELSE 0 END
      WHERE ac.sire_registro_id IS NOT DISTINCT FROM r.sire_registro_id
        AND ac.periodo = r.periodo
        AND ac.tipo_asiento = r.tipo_asiento
        AND ac.tipo_libro = r.tipo_libro
        AND ac.fecha_asiento = r.fecha_asiento
        AND ac.id = (
          SELECT id FROM public.asientos_contables ac2
          WHERE ac2.sire_registro_id IS NOT DISTINCT FROM r.sire_registro_id
            AND ac2.periodo = r.periodo
            AND ac2.tipo_asiento = r.tipo_asiento
            AND ac2.tipo_libro = r.tipo_libro
            AND ac2.fecha_asiento = r.fecha_asiento
          ORDER BY GREATEST(debe, haber) DESC
          LIMIT 1
        );
      v_fixed := v_fixed + 1;
    END IF;
  END LOOP;

  -- Fuzzy match huérfanos por monto + fecha (solo sugerencia en dry_run)
  FOR r IN
    SELECT a.id AS asiento_id, a.sire_registro_id, a.debe, a.fecha_asiento
    FROM public.asientos_contables a
    LEFT JOIN public.registros_sire rs ON rs.id = a.sire_registro_id
    WHERE a.sire_registro_id IS NOT NULL AND rs.id IS NULL
    LIMIT 50
  LOOP
    IF p_dry_run THEN
      v_suggested := v_suggested + 1;
    ELSE
      UPDATE public.asientos_contables a
      SET sire_registro_id = sub.match_id
      FROM (
        SELECT rs.id AS match_id
        FROM public.registros_sire rs
        WHERE ABS(COALESCE(rs.mto_total_cp, rs.importe_total, 0) - r.debe) < 0.05
          AND rs.fecha_emision::date = r.fecha_asiento::date
        ORDER BY ABS(COALESCE(rs.mto_total_cp, rs.importe_total, 0) - r.debe)
        LIMIT 1
      ) sub
      WHERE a.id = r.asiento_id AND sub.match_id IS NOT NULL;
      IF FOUND THEN v_fixed := v_fixed + 1; END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'dry_run', p_dry_run,
    'fixed', v_fixed,
    'suggested', v_suggested
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_fix_common_integrity_issues(boolean) TO authenticated;

-- ============================================================
-- Vista errores pendientes
-- ============================================================
CREATE OR REPLACE VIEW public.v_integrity_errors_pendientes AS
SELECT
  e.id,
  e.ruc,
  e.periodo,
  e.check_type,
  e.severidad,
  e.descripcion,
  e.detalle,
  e.created_at,
  c.razon_social
FROM public.accounting_integrity_errors e
LEFT JOIN public.contribuyentes c ON c.ruc = e.ruc
WHERE e.resolved_at IS NULL
ORDER BY
  CASE e.severidad
    WHEN 'CRITICAL' THEN 1
    WHEN 'ERROR' THEN 2
    WHEN 'WARNING' THEN 3
    ELSE 4
  END,
  e.created_at DESC;

GRANT SELECT ON public.v_integrity_errors_pendientes TO authenticated;
