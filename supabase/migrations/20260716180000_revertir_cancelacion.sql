-- ============================================================
-- Reversión de cancelaciones + limpieza de duplicados
-- Idempotente
-- ============================================================

-- ============================================================
-- A. rpc_revertir_cancelacion
--    Deshace atómicamente el pago/cobro de un comprobante SIRE:
--    1. Elimina asientos de cancelacion_caja
--    2. Elimina movimiento de caja
--    3. Resetea estado del registro SIRE a 'pendiente'
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_revertir_cancelacion(
  p_registro_sire_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registro     RECORD;
  v_asientos_del int := 0;
  v_movs_del     int := 0;
BEGIN
  -- 1. Leer el registro
  SELECT cancelacion_asiento_id, cancelacion_mov_caja_id,
         estado_cobro, estado_pago, tipo
  INTO v_registro
  FROM registros_sire
  WHERE id = p_registro_sire_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registro SIRE no encontrado');
  END IF;

  -- 2. Eliminar TODOS los asientos cancelacion_caja ligados a este registro
  --    (cubre duplicados históricos)
  DELETE FROM asientos_contables
  WHERE sire_registro_id = p_registro_sire_id
    AND tipo_asiento = 'cancelacion_caja';
  GET DIAGNOSTICS v_asientos_del = ROW_COUNT;

  -- 3. Eliminar movimiento de caja principal (por FK o por registro_sire_id)
  IF v_registro.cancelacion_mov_caja_id IS NOT NULL THEN
    DELETE FROM movimientos_caja WHERE id = v_registro.cancelacion_mov_caja_id;
    GET DIAGNOSTICS v_movs_del = ROW_COUNT;
  END IF;

  -- También limpiar cualquier otro movimiento huérfano ligado al registro SIRE
  DELETE FROM movimientos_caja
  WHERE registro_sire_id = p_registro_sire_id
    AND origen = 'sire';
  GET DIAGNOSTICS v_movs_del = v_movs_del + ROW_COUNT;

  -- 4. Resetear estado del registro SIRE
  UPDATE registros_sire SET
    cancelacion_asiento_id   = NULL,
    cancelacion_mov_caja_id  = NULL,
    cancelacion_generada_at  = NULL,
    estado_cobro = CASE WHEN tipo = 'VENTA'  THEN 'pendiente' ELSE estado_cobro END,
    estado_pago  = CASE WHEN tipo = 'COMPRA' THEN 'pendiente' ELSE estado_pago  END
  WHERE id = p_registro_sire_id;

  RETURN jsonb_build_object(
    'success',        true,
    'asientos_del',   v_asientos_del,
    'movimientos_del', v_movs_del
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_revertir_cancelacion(uuid) TO authenticated;

-- ============================================================
-- B. rpc_limpiar_duplicados_cancelacion
--    Limpieza de emergencia: conserva el asiento MÁS RECIENTE
--    por registro_sire_id y elimina los extras.
--    Luego resetea el estado del SIRE para que quede consistente.
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_limpiar_duplicados_cancelacion(
  p_ruc    text DEFAULT NULL,
  p_periodo text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_del int := 0;
  v_cnt       int;
BEGIN
  -- Eliminar asientos duplicados: conservar solo el de created_at más reciente
  WITH ranked AS (
    SELECT ac.id,
           ROW_NUMBER() OVER (
             PARTITION BY ac.sire_registro_id
             ORDER BY ac.created_at DESC
           ) AS rn
    FROM asientos_contables ac
    JOIN registros_sire rs ON rs.id = ac.sire_registro_id
    WHERE ac.tipo_asiento = 'cancelacion_caja'
      AND ac.sire_registro_id IS NOT NULL
      AND (p_ruc IS NULL    OR rs.ruc    = p_ruc)
      AND (p_periodo IS NULL OR rs.periodo = p_periodo)
  )
  DELETE FROM asientos_contables
  WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
  GET DIAGNOSTICS v_cnt = ROW_COUNT;
  v_total_del := v_total_del + v_cnt;

  -- Eliminar movimientos_caja duplicados por registro_sire_id (origen='sire')
  WITH ranked_mov AS (
    SELECT mc.id,
           ROW_NUMBER() OVER (
             PARTITION BY mc.registro_sire_id
             ORDER BY mc.created_at DESC
           ) AS rn
    FROM movimientos_caja mc
    JOIN registros_sire rs ON rs.id = mc.registro_sire_id
    WHERE mc.origen = 'sire'
      AND mc.registro_sire_id IS NOT NULL
      AND (p_ruc IS NULL    OR rs.ruc    = p_ruc)
      AND (p_periodo IS NULL OR rs.periodo = p_periodo)
  )
  DELETE FROM movimientos_caja
  WHERE id IN (SELECT id FROM ranked_mov WHERE rn > 1);
  GET DIAGNOSTICS v_cnt = ROW_COUNT;
  v_total_del := v_total_del + v_cnt;

  -- Reparar punteros cancelacion_asiento_id / cancelacion_mov_caja_id
  -- para que apunten al asiento/movimiento sobreviviente
  UPDATE registros_sire rs SET
    cancelacion_asiento_id = (
      SELECT ac.id FROM asientos_contables ac
      WHERE ac.sire_registro_id = rs.id
        AND ac.tipo_asiento = 'cancelacion_caja'
      ORDER BY ac.created_at DESC
      LIMIT 1
    ),
    cancelacion_mov_caja_id = (
      SELECT mc.id FROM movimientos_caja mc
      WHERE mc.registro_sire_id = rs.id
        AND mc.origen = 'sire'
      ORDER BY mc.created_at DESC
      LIMIT 1
    )
  WHERE (p_ruc IS NULL OR rs.ruc = p_ruc)
    AND (p_periodo IS NULL OR rs.periodo = p_periodo)
    AND rs.cancelacion_asiento_id IS NOT NULL;

  RETURN jsonb_build_object(
    'success',    true,
    'registros_eliminados', v_total_del
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_limpiar_duplicados_cancelacion(text, text) TO authenticated;

-- ============================================================
-- C. Reforzar unique index cancelacion_caja por registro
--    (ya existe, pero lo recreamos CONCURRENTLY si falta)
-- ============================================================
DROP INDEX IF EXISTS public.idx_asientos_unico_por_registro_sire_y_tipo;
CREATE UNIQUE INDEX IF NOT EXISTS idx_asientos_unico_cancelacion_caja
  ON public.asientos_contables(sire_registro_id, tipo_asiento)
  WHERE sire_registro_id IS NOT NULL AND tipo_asiento = 'cancelacion_caja';
