-- Refactor arquitectónico: plan_contable_pcge, contribuyentes, columnas SUNAT mto_*, RPC liquidación caja

-- ============================================================
-- 1. PLAN CONTABLE OFICIAL (plan_contable_pcge)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plan_contable_pcge (
  codigo_cuenta varchar(10) PRIMARY KEY,
  nombre_cuenta text NOT NULL,
  nivel smallint NOT NULL DEFAULT 1,
  activo boolean NOT NULL DEFAULT true,
  naturaleza varchar(20),
  padre_codigo varchar(10),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migrar datos desde tabla_pcge si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tabla_pcge'
  ) THEN
    INSERT INTO public.plan_contable_pcge (codigo_cuenta, nombre_cuenta, nivel, activo, naturaleza, padre_codigo, created_at, updated_at)
    SELECT
      codigo,
      descripcion,
      nivel,
      COALESCE(activo, true),
      naturaleza,
      padre_codigo,
      COALESCE(created_at, now()),
      COALESCE(updated_at, now())
    FROM public.tabla_pcge
    ON CONFLICT (codigo_cuenta) DO UPDATE SET
      nombre_cuenta = EXCLUDED.nombre_cuenta,
      nivel = EXCLUDED.nivel,
      activo = EXCLUDED.activo,
      naturaleza = EXCLUDED.naturaleza,
      padre_codigo = EXCLUDED.padre_codigo,
      updated_at = now();
  END IF;
END $$;

INSERT INTO public.plan_contable_pcge (codigo_cuenta, nombre_cuenta, nivel) VALUES
  ('10', 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', 1),
  ('101', 'CAJA', 2),
  ('121201', 'FACTURAS POR COBRAR', 4),
  ('40111', 'IGV POR PAGAR', 3),
  ('421201', 'FACTURAS POR PAGAR', 4),
  ('601101', 'MERCADERIAS', 4),
  ('701111', 'VENTAS DE MERCADERIAS', 4)
ON CONFLICT (codigo_cuenta) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_plan_pcge_activo ON public.plan_contable_pcge(activo);
CREATE INDEX IF NOT EXISTS idx_plan_pcge_padre ON public.plan_contable_pcge(padre_codigo);

DROP TRIGGER IF EXISTS plan_contable_pcge_updated ON public.plan_contable_pcge;
CREATE TRIGGER plan_contable_pcge_updated
  BEFORE UPDATE ON public.plan_contable_pcge
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.plan_contable_pcge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth select plan_pcge" ON public.plan_contable_pcge;
DROP POLICY IF EXISTS "auth insert plan_pcge" ON public.plan_contable_pcge;
DROP POLICY IF EXISTS "auth update plan_pcge" ON public.plan_contable_pcge;
DROP POLICY IF EXISTS "auth delete plan_pcge" ON public.plan_contable_pcge;

CREATE POLICY "auth select plan_pcge" ON public.plan_contable_pcge FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert plan_pcge" ON public.plan_contable_pcge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update plan_pcge" ON public.plan_contable_pcge FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete plan_pcge" ON public.plan_contable_pcge FOR DELETE TO authenticated USING (true);

-- Re-apuntar FK de movimientos_caja
ALTER TABLE public.movimientos_caja DROP CONSTRAINT IF EXISTS movimientos_caja_cuenta_pcge_fkey;
ALTER TABLE public.movimientos_caja
  ADD CONSTRAINT movimientos_caja_cuenta_pcge_fkey
  FOREIGN KEY (cuenta_pcge) REFERENCES public.plan_contable_pcge(codigo_cuenta);

-- ============================================================
-- 2. CONTRIBUYENTES (tabla maestra por RUC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contribuyentes (
  ruc char(11) PRIMARY KEY,
  razon_social text NOT NULL,
  otros text NOT NULL DEFAULT '',
  categorias jsonb NOT NULL DEFAULT '{}'::jsonb,
  fecha_vencimiento_declaracion date,
  estado text NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','INACTIVO','DE_BAJA')),
  clave_sol jsonb NOT NULL DEFAULT '{"usuario":"","clave":""}'::jsonb,
  afp_net jsonb NOT NULL DEFAULT '{"usuario":"","clave":""}'::jsonb,
  validez_cpe jsonb NOT NULL DEFAULT '{"usuario":"","clave":""}'::jsonb,
  claves_sire jsonb NOT NULL DEFAULT '{"usuario":"","clave":""}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contribuyentes_razon ON public.contribuyentes USING gin (to_tsvector('spanish', razon_social));

DROP TRIGGER IF EXISTS contribuyentes_updated ON public.contribuyentes;
CREATE TRIGGER contribuyentes_updated
  BEFORE UPDATE ON public.contribuyentes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.contribuyentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth select contribuyentes" ON public.contribuyentes;
DROP POLICY IF EXISTS "auth insert contribuyentes" ON public.contribuyentes;
DROP POLICY IF EXISTS "auth update contribuyentes" ON public.contribuyentes;
DROP POLICY IF EXISTS "auth delete contribuyentes" ON public.contribuyentes;

CREATE POLICY "auth select contribuyentes" ON public.contribuyentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert contribuyentes" ON public.contribuyentes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update contribuyentes" ON public.contribuyentes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete contribuyentes" ON public.contribuyentes FOR DELETE TO authenticated USING (true);

-- FK opcional fichas_ruc → contribuyentes (no bloquea si falta ficha)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fichas_ruc_ruc_contribuyente_fkey'
  ) THEN
    ALTER TABLE public.fichas_ruc
      ADD CONSTRAINT fichas_ruc_ruc_contribuyente_fkey
      FOREIGN KEY (ruc) REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ============================================================
-- 3. COLUMNAS SUNAT mto_* en registros_sire
-- ============================================================
ALTER TABLE public.registros_sire
  ADD COLUMN IF NOT EXISTS mto_bi_gravada numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mto_igv_ipe numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mto_total_cp numeric(14,2) DEFAULT 0;

-- Sincronizar columnas legacy → mto_*
UPDATE public.registros_sire SET
  mto_bi_gravada = COALESCE(mto_bi_gravada, bi_grav, 0),
  mto_igv_ipe = COALESCE(NULLIF(mto_igv_ipe, 0), igv_grav, 0),
  mto_total_cp = COALESCE(NULLIF(mto_total_cp, 0), importe_total, 0)
WHERE mto_bi_gravada = 0 OR mto_igv_ipe = 0 OR mto_total_cp = 0;

-- Función: total exacto del comprobante (sin montos fantasma)
CREATE OR REPLACE FUNCTION public.calc_mto_total_cp(
  p_bi numeric, p_igv numeric,
  p_bi_gng numeric, p_igv_gng numeric,
  p_bi_ng numeric, p_igv_ng numeric,
  p_valor_ng numeric, p_isc numeric, p_icbper numeric, p_otros numeric
) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT round(
    COALESCE(p_bi,0) + COALESCE(p_igv,0) +
    COALESCE(p_bi_gng,0) + COALESCE(p_igv_gng,0) +
    COALESCE(p_bi_ng,0) + COALESCE(p_igv_ng,0) +
    COALESCE(p_valor_ng,0) + COALESCE(p_isc,0) + COALESCE(p_icbper,0) + COALESCE(p_otros,0)
  , 2);
$$;

CREATE OR REPLACE FUNCTION public.sync_registro_sire_montos()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.mto_bi_gravada := COALESCE(NEW.mto_bi_gravada, NEW.bi_grav, 0);
  NEW.mto_igv_ipe := COALESCE(NEW.mto_igv_ipe, NEW.igv_grav, 0);
  NEW.bi_grav := NEW.mto_bi_gravada;
  NEW.igv_grav := NEW.mto_igv_ipe;

  NEW.mto_total_cp := public.calc_mto_total_cp(
    NEW.mto_bi_gravada, NEW.mto_igv_ipe,
    NEW.bi_grav_y_no_grav, NEW.igv_grav_y_no_grav,
    NEW.bi_no_grav, NEW.igv_no_grav,
    NEW.valor_no_grav, NEW.isc, NEW.icbper, NEW.otros_tributos
  );
  NEW.importe_total := NEW.mto_total_cp;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_registro_sire_montos ON public.registros_sire;
CREATE TRIGGER trg_sync_registro_sire_montos
  BEFORE INSERT OR UPDATE ON public.registros_sire
  FOR EACH ROW EXECUTE FUNCTION public.sync_registro_sire_montos();

-- ============================================================
-- 4. ruc_contribuyente en movimientos_caja
-- ============================================================
ALTER TABLE public.movimientos_caja
  ADD COLUMN IF NOT EXISTS ruc_contribuyente varchar(11);

UPDATE public.movimientos_caja SET ruc_contribuyente = ruc WHERE ruc_contribuyente IS NULL AND ruc IS NOT NULL;

-- ============================================================
-- 5. RPC liquidación atómica (caja + asiento + estado SIRE)
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_liquidacion_caja(p_registro_sire_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg record;
  v_cfg record;
  v_asiento_id uuid;
  v_mov_id uuid;
  v_importe numeric(14,2);
  v_cuenta_caja varchar(10);
  v_cuenta_comercial varchar(10);
  v_glosa text;
BEGIN
  SELECT * INTO v_reg FROM registros_sire WHERE id = p_registro_sire_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro SIRE no encontrado';
  END IF;

  IF v_reg.cancelacion_asiento_id IS NOT NULL AND v_reg.cancelacion_mov_caja_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'asiento_id', v_reg.cancelacion_asiento_id,
      'movimiento_caja_id', v_reg.cancelacion_mov_caja_id,
      'duplicado', true
    );
  END IF;

  SELECT * INTO v_cfg FROM config_contable WHERE id = 1;
  v_importe := round(COALESCE(v_reg.mto_total_cp, v_reg.importe_total, 0), 2);
  v_cuenta_caja := COALESCE(v_cfg.cuenta_caja_default, '101');
  v_cuenta_comercial := CASE
    WHEN v_reg.tipo = 'VENTA' THEN COALESCE(v_cfg.cuenta_cxc_default, '121201')
    ELSE COALESCE(v_cfg.cuenta_cxp_default, '421201')
  END;
  v_glosa := CASE
    WHEN v_reg.tipo = 'VENTA' THEN 'Cobro de venta ' || v_reg.id::text
    ELSE 'Pago de compra ' || v_reg.id::text
  END;

  INSERT INTO asientos_contables (
    periodo, fecha, origen, comprobante_venta_id, comprobante_compra_id,
    registro_sire_id, tipo_asiento, glosa, moneda, tipo_cambio, total_debe, total_haber
  ) VALUES (
    v_reg.periodo, v_reg.fecha_emision,
    CASE WHEN v_reg.tipo = 'VENTA' THEN 'VENTAS'::origen_libro ELSE 'COMPRAS'::origen_libro END,
    NULL, NULL, v_reg.id, 'cancelacion_caja', v_glosa, 'PEN', 1, v_importe, v_importe
  ) RETURNING id INTO v_asiento_id;

  IF v_reg.tipo = 'VENTA' THEN
    INSERT INTO lineas_asiento (asiento_id, orden, cuenta, glosa, debe, haber) VALUES
      (v_asiento_id, 1, v_cuenta_caja, 'Ingreso a caja/bancos', v_importe, 0),
      (v_asiento_id, 2, v_cuenta_comercial, 'Cancelación cuentas por cobrar', 0, v_importe);
  ELSE
    INSERT INTO lineas_asiento (asiento_id, orden, cuenta, glosa, debe, haber) VALUES
      (v_asiento_id, 1, v_cuenta_comercial, 'Cancelación cuentas por pagar', v_importe, 0),
      (v_asiento_id, 2, v_cuenta_caja, 'Salida de caja/bancos', 0, v_importe);
  END IF;

  BEGIN
    INSERT INTO movimientos_caja (
      ruc, ruc_contribuyente, periodo, fecha_operacion, glosa, cuenta_pcge,
      debe, haber, origen, registro_sire_id, asiento_id
    ) VALUES (
      v_reg.ruc, v_reg.ruc, v_reg.periodo, v_reg.fecha_emision, v_glosa, v_cuenta_caja,
      CASE WHEN v_reg.tipo = 'VENTA' THEN v_importe ELSE 0 END,
      CASE WHEN v_reg.tipo = 'COMPRA' THEN v_importe ELSE 0 END,
      'sire', v_reg.id, v_asiento_id
    )
    RETURNING id INTO v_mov_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_mov_id FROM movimientos_caja
    WHERE registro_sire_id = v_reg.id AND origen = 'sire' LIMIT 1;
  END;

  UPDATE registros_sire SET
    cancelacion_asiento_id = v_asiento_id,
    cancelacion_mov_caja_id = v_mov_id,
    cancelacion_generada_at = now(),
    estado_cobro = CASE WHEN v_reg.tipo = 'VENTA' THEN 'cobrado' ELSE estado_cobro END,
    estado_pago = CASE WHEN v_reg.tipo = 'COMPRA' THEN 'pagado' ELSE estado_pago END
  WHERE id = v_reg.id;

  RETURN jsonb_build_object(
    'asiento_id', v_asiento_id,
    'movimiento_caja_id', v_mov_id,
    'duplicado', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_liquidacion_caja(uuid) TO authenticated;
