-- =============================================================================
-- Módulo 6: Tesorería, Libro Caja y Bancos (010100) & Liquidación Atómica RPC
-- Idempotente — extiende movimientos_caja + cuentas_bancarias multi-tenant
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_movimiento_caja_enum') THEN
    CREATE TYPE public.tipo_movimiento_caja_enum AS ENUM ('INGRESO', 'EGRESO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_cuenta_bancaria_enum') THEN
    CREATE TYPE public.tipo_cuenta_bancaria_enum AS ENUM (
      'CAJA_CHICA',
      'CUENTA_CORRIENTE',
      'AHORROS',
      'DETRACCIONES_BN'
    );
  END IF;
END $$;

-- =============================================================================
-- 1. CUENTAS BANCARIAS (por contribuyente)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cuentas_bancarias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  nombre_cuenta varchar(100) NOT NULL,
  banco varchar(100) NOT NULL,
  numero_cuenta varchar(50) NOT NULL,
  cci varchar(50),
  moneda varchar(3) NOT NULL DEFAULT 'PEN',
  tipo_cuenta public.tipo_cuenta_bancaria_enum NOT NULL DEFAULT 'CUENTA_CORRIENTE',
  cuenta_pcge_codigo varchar(10) NOT NULL DEFAULT '1041',
  saldo_actual numeric(14, 2) NOT NULL DEFAULT 0.00,
  estado varchar(20) NOT NULL DEFAULT 'ACTIVO'
    CHECK (estado IN ('ACTIVO', 'INACTIVO')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contribuyente_id, banco, numero_cuenta)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cuentas_bancarias_contribuyente_id_fkey') THEN
    ALTER TABLE public.cuentas_bancarias
      ADD CONSTRAINT cuentas_bancarias_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cuentas_bancarias_contrib
  ON public.cuentas_bancarias (contribuyente_id) WHERE estado = 'ACTIVO';

DROP TRIGGER IF EXISTS cuentas_bancarias_updated ON public.cuentas_bancarias;
CREATE TRIGGER cuentas_bancarias_updated
  BEFORE UPDATE ON public.cuentas_bancarias
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Migrar desde cuentas_financieras legacy (por RUC → contribuyente_id)
INSERT INTO public.cuentas_bancarias (
  contribuyente_id, nombre_cuenta, banco, numero_cuenta, moneda,
  tipo_cuenta, cuenta_pcge_codigo, saldo_actual, estado
)
SELECT
  c.id,
  cf.nombre,
  COALESCE(cf.banco, 'Sin banco'),
  COALESCE(cf.numero_cuenta, cf.cuenta_contable, '000000'),
  'PEN',
  CASE cf.tipo
    WHEN 'CAJA_CHICA' THEN 'CAJA_CHICA'::public.tipo_cuenta_bancaria_enum
    ELSE 'CUENTA_CORRIENTE'::public.tipo_cuenta_bancaria_enum
  END,
  COALESCE(cf.cuenta_contable, '1041'),
  0,
  CASE WHEN cf.activo THEN 'ACTIVO' ELSE 'INACTIVO' END
FROM public.cuentas_financieras cf
JOIN public.contribuyentes c ON c.ruc = cf.ruc
ON CONFLICT (contribuyente_id, banco, numero_cuenta) DO NOTHING;

-- Cuentas semilla por contribuyente sin cuentas
INSERT INTO public.cuentas_bancarias (
  contribuyente_id, nombre_cuenta, banco, numero_cuenta, moneda,
  tipo_cuenta, cuenta_pcge_codigo, saldo_actual
)
SELECT
  c.id,
  'Caja Chica Principal',
  'CAJA INTERNA',
  'CAJA-001',
  'PEN',
  'CAJA_CHICA'::public.tipo_cuenta_bancaria_enum,
  '101',
  0
FROM public.contribuyentes c
WHERE NOT EXISTS (
  SELECT 1 FROM public.cuentas_bancarias cb WHERE cb.contribuyente_id = c.id
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 2. EXTENSIÓN movimientos_caja — Formato 010100
-- =============================================================================
ALTER TABLE public.movimientos_caja
  ADD COLUMN IF NOT EXISTS contribuyente_id uuid,
  ADD COLUMN IF NOT EXISTS periodo_id uuid,
  ADD COLUMN IF NOT EXISTS cuenta_bancaria_id uuid,
  ADD COLUMN IF NOT EXISTS numero_correlativo_caja int,
  ADD COLUMN IF NOT EXISTS tipo_movimiento_enum public.tipo_movimiento_caja_enum,
  ADD COLUMN IF NOT EXISTS medio_pago_tabla1 varchar(10) DEFAULT '001',
  ADD COLUMN IF NOT EXISTS comprobante_origen_id uuid,
  ADD COLUMN IF NOT EXISTS tipo_origen varchar(20),
  ADD COLUMN IF NOT EXISTS ruc_dni_contraparte varchar(15),
  ADD COLUMN IF NOT EXISTS razon_social_contraparte varchar(255),
  ADD COLUMN IF NOT EXISTS monto_soles numeric(14, 2),
  ADD COLUMN IF NOT EXISTS monto_origen numeric(14, 2),
  ADD COLUMN IF NOT EXISTS tipo_cambio numeric(6, 3) DEFAULT 1.000;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movimientos_caja_contribuyente_id_fkey') THEN
    ALTER TABLE public.movimientos_caja
      ADD CONSTRAINT movimientos_caja_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movimientos_caja_periodo_id_fkey') THEN
    ALTER TABLE public.movimientos_caja
      ADD CONSTRAINT movimientos_caja_periodo_id_fkey
      FOREIGN KEY (periodo_id) REFERENCES public.sire_periodos(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movimientos_caja_cuenta_bancaria_id_fkey') THEN
    ALTER TABLE public.movimientos_caja
      ADD CONSTRAINT movimientos_caja_cuenta_bancaria_id_fkey
      FOREIGN KEY (cuenta_bancaria_id) REFERENCES public.cuentas_bancarias(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movimientos_caja_tipo_origen_check') THEN
    ALTER TABLE public.movimientos_caja
      ADD CONSTRAINT movimientos_caja_tipo_origen_check
      CHECK (tipo_origen IS NULL OR tipo_origen IN ('COMPRA', 'VENTA', 'LIBRE'));
  END IF;
END $$;

UPDATE public.movimientos_caja mc
SET contribuyente_id = c.id
FROM public.contribuyentes c
WHERE mc.contribuyente_id IS NULL AND mc.ruc IS NOT NULL AND c.ruc = mc.ruc;

UPDATE public.movimientos_caja
SET tipo_movimiento_enum = CASE
  WHEN lower(COALESCE(tipo_movimiento, '')) IN ('egreso', 'salida') THEN 'EGRESO'::public.tipo_movimiento_caja_enum
  ELSE 'INGRESO'::public.tipo_movimiento_caja_enum
END
WHERE tipo_movimiento_enum IS NULL;

UPDATE public.movimientos_caja
SET
  monto_soles = COALESCE(monto_soles, GREATEST(debe, haber)),
  monto_origen = COALESCE(monto_origen, GREATEST(debe, haber)),
  medio_pago_tabla1 = COALESCE(medio_pago_tabla1, '001')
WHERE monto_soles IS NULL;

CREATE INDEX IF NOT EXISTS idx_mov_caja_contrib_periodo
  ON public.movimientos_caja (contribuyente_id, periodo, fecha_operacion);

CREATE INDEX IF NOT EXISTS idx_mov_caja_cuenta_bancaria
  ON public.movimientos_caja (cuenta_bancaria_id, fecha_operacion);

-- =============================================================================
-- 3. RLS
-- =============================================================================
ALTER TABLE public.cuentas_bancarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cuentas_bancarias_tenant_select ON public.cuentas_bancarias;
CREATE POLICY cuentas_bancarias_tenant_select ON public.cuentas_bancarias
  FOR SELECT TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS cuentas_bancarias_tenant_write ON public.cuentas_bancarias;
CREATE POLICY cuentas_bancarias_tenant_write ON public.cuentas_bancarias
  FOR ALL TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id))
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS movimientos_caja_tenant_select ON public.movimientos_caja;
CREATE POLICY movimientos_caja_tenant_select ON public.movimientos_caja
  FOR SELECT TO authenticated
  USING (
    contribuyente_id IS NULL
    OR public.fn_user_can_access_contribuyente(contribuyente_id)
  );

DROP POLICY IF EXISTS movimientos_caja_tenant_insert ON public.movimientos_caja;
CREATE POLICY movimientos_caja_tenant_insert ON public.movimientos_caja
  FOR INSERT TO authenticated
  WITH CHECK (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

DROP POLICY IF EXISTS movimientos_caja_tenant_update ON public.movimientos_caja;
CREATE POLICY movimientos_caja_tenant_update ON public.movimientos_caja
  FOR UPDATE TO authenticated
  USING (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  )
  WITH CHECK (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

-- =============================================================================
-- 4. HELPERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_next_correlativo_caja(
  p_contribuyente_id uuid,
  p_fecha date
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next int;
BEGIN
  SELECT COALESCE(MAX(numero_correlativo_caja), 0) + 1
  INTO v_next
  FROM public.movimientos_caja
  WHERE contribuyente_id = p_contribuyente_id
    AND fecha_operacion = p_fecha;

  RETURN v_next;
END;
$$;

-- =============================================================================
-- 5. RPC LIQUIDACIÓN ATÓMICA (Módulo 6 — compras_rce / ventas_rvie)
-- Sobrecarga distinta a rpc_liquidacion_caja_mejorada(registro_sire_id, ...)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.rpc_liquidacion_caja_mejorada(
  p_contribuyente_id uuid,
  p_comprobante_id uuid,
  p_tipo_comprobante varchar,
  p_cuenta_bancaria_id uuid,
  p_medio_pago varchar,
  p_fecha date,
  p_glosa text,
  p_monto numeric,
  p_tipo_cambio numeric DEFAULT 1.000
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo varchar := upper(trim(COALESCE(p_tipo_comprobante, '')));
  v_cuenta record;
  v_contrib record;
  v_periodo char(6);
  v_periodo_id uuid;
  v_mov_id uuid;
  v_asiento_id uuid;
  v_cuo varchar;
  v_corr int;
  v_monto numeric(14,2);
  v_tc numeric(6,3);
  v_tipo_mov public.tipo_movimiento_caja_enum;
  v_cuenta_pcge varchar(10);
  v_cuenta_comercial varchar(10);
  v_ruc_contra varchar(15);
  v_razon_contra varchar(255);
  v_sire_id uuid;
  v_glosa text;
  v_nuevo_saldo numeric(14,2);
  v_estado_actual text;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  v_monto := round(COALESCE(p_monto, 0), 2);
  v_tc := round(COALESCE(p_tipo_cambio, 1), 3);
  IF v_monto <= 0 THEN
    RAISE EXCEPTION 'El monto debe ser mayor a cero';
  END IF;

  SELECT * INTO v_contrib FROM public.contribuyentes WHERE id = p_contribuyente_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contribuyente no encontrado';
  END IF;

  SELECT * INTO v_cuenta
  FROM public.cuentas_bancarias
  WHERE id = p_cuenta_bancaria_id
    AND contribuyente_id = p_contribuyente_id
    AND estado = 'ACTIVO'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cuenta bancaria no encontrada o inactiva';
  END IF;

  v_cuenta_pcge := v_cuenta.cuenta_pcge_codigo;
  v_glosa := COALESCE(NULLIF(trim(p_glosa), ''), 'Liquidación de comprobante');

  IF v_tipo IN ('COMPRA', 'RCE', 'COMPRAS') THEN
    DECLARE
      v_compra record;
    BEGIN
      SELECT * INTO v_compra
      FROM public.compras_rce
      WHERE id = p_comprobante_id AND contribuyente_id = p_contribuyente_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Compra RCE no encontrada';
      END IF;

      IF v_compra.estado_provision = 'PAGADO' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Compra ya liquidada', 'duplicado', true);
      END IF;

      IF abs(v_compra.total - v_monto) > 0.02 THEN
        RAISE EXCEPTION 'Monto (%) no coincide con total comprobante (%)', v_monto, v_compra.total;
      END IF;

      v_periodo := v_compra.periodo;
      v_periodo_id := v_compra.periodo_id;
      v_sire_id := v_compra.registro_sire_id;
      v_tipo_mov := 'EGRESO';
      v_cuenta_comercial := '4212';
      v_ruc_contra := v_compra.ruc_proveedor;
      v_razon_contra := v_compra.razon_social_proveedor;
      v_estado_actual := v_compra.estado_provision::text;
    END;

  ELSIF v_tipo IN ('VENTA', 'RVIE', 'VENTAS') THEN
    DECLARE
      v_venta record;
    BEGIN
      SELECT * INTO v_venta
      FROM public.ventas_rvie
      WHERE id = p_comprobante_id AND contribuyente_id = p_contribuyente_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Venta RVIE no encontrada';
      END IF;

      IF v_venta.estado_provision = 'PAGADO' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Venta ya cobrada', 'duplicado', true);
      END IF;

      IF abs(v_venta.total - v_monto) > 0.02 THEN
        RAISE EXCEPTION 'Monto (%) no coincide con total comprobante (%)', v_monto, v_venta.total;
      END IF;

      v_periodo := v_venta.periodo;
      v_periodo_id := v_venta.periodo_id;
      v_sire_id := v_venta.registro_sire_id;
      v_tipo_mov := 'INGRESO';
      v_cuenta_comercial := '1212';
      v_ruc_contra := v_venta.ruc_cliente;
      v_razon_contra := v_venta.razon_social_cliente;
      v_estado_actual := v_venta.estado_provision::text;
    END;
  ELSE
    RAISE EXCEPTION 'Tipo comprobante inválido: %', p_tipo_comprobante;
  END IF;

  v_corr := public.fn_next_correlativo_caja(p_contribuyente_id, p_fecha);
  v_cuo := public.fn_next_cuo_asiento(p_contribuyente_id, v_periodo);

  -- 1. Movimiento caja
  INSERT INTO public.movimientos_caja (
    contribuyente_id, periodo_id, cuenta_bancaria_id, cuenta_financiera_id,
    numero_correlativo_caja, fecha_operacion, fecha, tipo_movimiento_enum, tipo_movimiento,
    medio_pago_tabla1, comprobante_origen_id, tipo_origen,
    ruc_dni_contraparte, razon_social_contraparte, ruc, ruc_contribuyente, periodo,
    glosa, monto_soles, monto_origen, tipo_cambio,
    cuenta_contable, debe, haber, origen, origen_documento, registro_sire_id
  ) VALUES (
    p_contribuyente_id, v_periodo_id, p_cuenta_bancaria_id, NULL,
    v_corr, p_fecha, p_fecha, v_tipo_mov,
    CASE WHEN v_tipo_mov = 'INGRESO' THEN 'ingreso' ELSE 'egreso' END,
    COALESCE(NULLIF(trim(p_medio_pago), ''), '001'),
    p_comprobante_id,
    CASE WHEN v_tipo IN ('COMPRA', 'RCE', 'COMPRAS') THEN 'COMPRA' ELSE 'VENTA' END,
    v_ruc_contra, v_razon_contra, v_contrib.ruc, v_contrib.ruc, v_periodo,
    v_glosa, v_monto, round(v_monto / NULLIF(v_tc, 0), 2), v_tc,
    v_cuenta_pcge,
    CASE WHEN v_tipo_mov = 'INGRESO' THEN v_monto ELSE 0 END,
    CASE WHEN v_tipo_mov = 'EGRESO' THEN v_monto ELSE 0 END,
    'liquidacion', 'compras_ventas', v_sire_id
  ) RETURNING id INTO v_mov_id;

  -- 2. Actualizar saldo cuenta bancaria
  IF v_tipo_mov = 'INGRESO' THEN
    UPDATE public.cuentas_bancarias
    SET saldo_actual = saldo_actual + v_monto, updated_at = now()
    WHERE id = p_cuenta_bancaria_id
    RETURNING saldo_actual INTO v_nuevo_saldo;
  ELSE
    UPDATE public.cuentas_bancarias
    SET saldo_actual = saldo_actual - v_monto, updated_at = now()
    WHERE id = p_cuenta_bancaria_id
    RETURNING saldo_actual INTO v_nuevo_saldo;
  END IF;

  -- 3. Asiento cancelación con CUO (Formato 5.1)
  IF v_tipo_mov = 'INGRESO' THEN
    INSERT INTO public.asientos_contables (
      contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
      fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
      cuenta_codigo, cuenta_contable, cuenta_denominacion,
      debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
      sire_registro_id, estado_asiento, ruc
    ) VALUES
    (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, 1,
      p_fecha, p_fecha, v_glosa, '010100',
      v_cuenta_pcge, v_cuenta_pcge, public.fn_pcge_denominacion(v_cuenta_pcge),
      v_monto, 0, 'debe', 'cancelacion_caja', 'CAJA_BANCOS', 'VENTA',
      v_sire_id, 'LIQUIDADO', v_contrib.ruc
    ),
    (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, 2,
      p_fecha, p_fecha, v_glosa, '010100',
      v_cuenta_comercial, v_cuenta_comercial, public.fn_pcge_denominacion(v_cuenta_comercial),
      0, v_monto, 'haber', 'cancelacion_caja', 'CAJA_BANCOS', 'VENTA',
      v_sire_id, 'LIQUIDADO', v_contrib.ruc
    )
    RETURNING id INTO v_asiento_id;
  ELSE
    INSERT INTO public.asientos_contables (
      contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
      fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
      cuenta_codigo, cuenta_contable, cuenta_denominacion,
      debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
      sire_registro_id, estado_asiento, ruc
    ) VALUES
    (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, 1,
      p_fecha, p_fecha, v_glosa, '010100',
      v_cuenta_comercial, v_cuenta_comercial, public.fn_pcge_denominacion(v_cuenta_comercial),
      v_monto, 0, 'debe', 'cancelacion_caja', 'CAJA_BANCOS', 'COMPRA',
      v_sire_id, 'LIQUIDADO', v_contrib.ruc
    ),
    (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, 2,
      p_fecha, p_fecha, v_glosa, '010100',
      v_cuenta_pcge, v_cuenta_pcge, public.fn_pcge_denominacion(v_cuenta_pcge),
      0, v_monto, 'haber', 'cancelacion_caja', 'CAJA_BANCOS', 'COMPRA',
      v_sire_id, 'LIQUIDADO', v_contrib.ruc
    )
    RETURNING id INTO v_asiento_id;
  END IF;

  UPDATE public.movimientos_caja SET asiento_id = v_asiento_id WHERE id = v_mov_id;

  -- 4. Actualizar estado comprobante
  IF v_tipo IN ('COMPRA', 'RCE', 'COMPRAS') THEN
    UPDATE public.compras_rce
    SET estado_provision = 'PAGADO', updated_at = now()
    WHERE id = p_comprobante_id;
  ELSE
    UPDATE public.ventas_rvie
    SET estado_provision = 'PAGADO', updated_at = now()
    WHERE id = p_comprobante_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'movimiento_id', v_mov_id,
    'asiento_id', v_asiento_id,
    'cuo', v_cuo,
    'correlativo_caja', v_corr,
    'nuevo_saldo', v_nuevo_saldo,
    'tipo_movimiento', v_tipo_mov::text,
    'estado_anterior', v_estado_actual
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_next_correlativo_caja(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_liquidacion_caja_mejorada(uuid, uuid, varchar, uuid, varchar, date, text, numeric, numeric) TO authenticated;

-- Vista resumen libro caja 010100
CREATE OR REPLACE VIEW public.v_libro_caja_010100 AS
SELECT
  mc.id,
  mc.contribuyente_id,
  mc.periodo,
  mc.numero_correlativo_caja,
  mc.fecha_operacion,
  mc.tipo_movimiento_enum,
  mc.medio_pago_tabla1,
  mc.ruc_dni_contraparte,
  mc.razon_social_contraparte,
  mc.glosa,
  mc.monto_soles,
  CASE WHEN mc.tipo_movimiento_enum = 'INGRESO' THEN mc.monto_soles ELSE 0 END AS ingreso,
  CASE WHEN mc.tipo_movimiento_enum = 'EGRESO' THEN mc.monto_soles ELSE 0 END AS egreso,
  mc.cuenta_bancaria_id,
  cb.nombre_cuenta,
  cb.banco,
  cb.moneda,
  mc.asiento_id,
  mc.comprobante_origen_id,
  mc.tipo_origen,
  mc.created_at
FROM public.movimientos_caja mc
LEFT JOIN public.cuentas_bancarias cb ON cb.id = mc.cuenta_bancaria_id;

GRANT SELECT ON public.v_libro_caja_010100 TO authenticated;
