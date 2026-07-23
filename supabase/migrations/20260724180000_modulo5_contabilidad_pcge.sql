-- =============================================================================
-- Módulo 5: Contabilidad General, PCGE & Libros Oficiales SUNAT (F5.1 / F5.2)
-- Idempotente — extiende asientos_contables plano + catálogo plan_cuentas_pcge
-- =============================================================================

-- =============================================================================
-- 1. PLAN CUENTAS PCGE (catálogo SUNAT)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_cuentas_pcge (
  codigo varchar(10) PRIMARY KEY,
  denominacion varchar(255) NOT NULL,
  elemento int NOT NULL CHECK (elemento BETWEEN 1 AND 9),
  nivel int NOT NULL CHECK (nivel BETWEEN 2 AND 5),
  tipo_cuenta varchar(20) NOT NULL
    CHECK (tipo_cuenta IN ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'GASTOS', 'INGRESOS', 'ORDEN')),
  permite_movimiento boolean NOT NULL DEFAULT true,
  estado varchar(20) NOT NULL DEFAULT 'ACTIVO'
    CHECK (estado IN ('ACTIVO', 'INACTIVO')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS plan_cuentas_pcge_updated ON public.plan_cuentas_pcge;
CREATE TRIGGER plan_cuentas_pcge_updated
  BEFORE UPDATE ON public.plan_cuentas_pcge
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.plan_cuentas_pcge (codigo, denominacion, elemento, nivel, tipo_cuenta, permite_movimiento) VALUES
  ('101', 'Caja', 1, 3, 'ACTIVO', true),
  ('1041', 'Cuentas corrientes operativas', 1, 4, 'ACTIVO', false),
  ('1212', 'Facturas, boletas y otros comprobantes por cobrar', 1, 4, 'ACTIVO', true),
  ('1611', 'Terrenos', 1, 4, 'ACTIVO', true),
  ('2011', 'Mercaderías', 2, 4, 'ACTIVO', true),
  ('3331', 'Bienes en arrendamiento financiero', 3, 4, 'ACTIVO', true),
  ('40111', 'IGV - Cuenta propia', 4, 5, 'PASIVO', true),
  ('4212', 'Facturas, boletas y otros comprobantes por pagar', 4, 4, 'PASIVO', true),
  ('4699', 'Otras cuentas por pagar diversas', 4, 4, 'PASIVO', true),
  ('5011', 'Capital', 5, 4, 'PATRIMONIO', false),
  ('6011', 'Mercaderías', 6, 4, 'GASTOS', true),
  ('6032', 'Combustibles y lubricantes', 6, 4, 'GASTOS', true),
  ('6311', 'Gastos de personal - remuneraciones', 6, 4, 'GASTOS', true),
  ('6511', 'Gastos de administración', 6, 4, 'GASTOS', true),
  ('6911', 'Costo de ventas - mercaderías', 6, 4, 'GASTOS', true),
  ('7011', 'Ventas de mercaderías', 7, 4, 'INGRESOS', true),
  ('7511', 'Ingresos financieros', 7, 4, 'INGRESOS', true),
  ('7911', 'Cargas imputables a cuentas de costos y gastos', 7, 4, 'INGRESOS', true),
  ('9411', 'Activos dados en arrendamiento operativo', 9, 4, 'ORDEN', true),
  ('9511', 'Activos en leasing', 9, 4, 'ORDEN', true)
ON CONFLICT (codigo) DO UPDATE SET
  denominacion = EXCLUDED.denominacion,
  elemento = EXCLUDED.elemento,
  nivel = EXCLUDED.nivel,
  tipo_cuenta = EXCLUDED.tipo_cuenta,
  permite_movimiento = EXCLUDED.permite_movimiento,
  updated_at = now();

-- Sincronizar desde plan_contable_pcge legacy si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'plan_contable_pcge'
  ) THEN
    INSERT INTO public.plan_cuentas_pcge (codigo, denominacion, elemento, nivel, tipo_cuenta, permite_movimiento, estado)
    SELECT
      p.codigo_cuenta,
      p.nombre_cuenta,
      CASE LEFT(p.codigo_cuenta, 1)::int
        WHEN 1 THEN 1 WHEN 2 THEN 2 WHEN 3 THEN 3 WHEN 4 THEN 4
        WHEN 5 THEN 5 WHEN 6 THEN 6 WHEN 7 THEN 7 WHEN 8 THEN 8 ELSE 9
      END,
      GREATEST(COALESCE(p.nivel, 2), 2),
      CASE
        WHEN LEFT(p.codigo_cuenta, 1) IN ('1','2','3') THEN 'ACTIVO'
        WHEN LEFT(p.codigo_cuenta, 1) = '4' THEN 'PASIVO'
        WHEN LEFT(p.codigo_cuenta, 1) = '5' THEN 'PATRIMONIO'
        WHEN LEFT(p.codigo_cuenta, 1) = '6' THEN 'GASTOS'
        WHEN LEFT(p.codigo_cuenta, 1) = '7' THEN 'INGRESOS'
        ELSE 'ORDEN'
      END,
      COALESCE(p.activo, true),
      CASE WHEN COALESCE(p.activo, true) THEN 'ACTIVO' ELSE 'INACTIVO' END
    FROM public.plan_contable_pcge p
    ON CONFLICT (codigo) DO NOTHING;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_plan_cuentas_pcge_elemento ON public.plan_cuentas_pcge (elemento);
CREATE INDEX IF NOT EXISTS idx_plan_cuentas_pcge_tipo ON public.plan_cuentas_pcge (tipo_cuenta);

-- =============================================================================
-- 2. EXTENSIÓN asientos_contables — campos Formato 5.1 SUNAT
-- =============================================================================
ALTER TABLE public.asientos_contables
  ADD COLUMN IF NOT EXISTS contribuyente_id uuid,
  ADD COLUMN IF NOT EXISTS periodo_id uuid,
  ADD COLUMN IF NOT EXISTS cuo varchar(40),
  ADD COLUMN IF NOT EXISTS correlativo_linea int,
  ADD COLUMN IF NOT EXISTS fecha_operacion date,
  ADD COLUMN IF NOT EXISTS codigo_libro_tabla8 varchar(10) DEFAULT '050100',
  ADD COLUMN IF NOT EXISTS numero_correlativo_sustentatorio varchar(50),
  ADD COLUMN IF NOT EXISTS numero_documento_sustentatorio varchar(50),
  ADD COLUMN IF NOT EXISTS cuenta_codigo varchar(10),
  ADD COLUMN IF NOT EXISTS cuenta_denominacion varchar(255),
  ADD COLUMN IF NOT EXISTS estado_asiento varchar(20) DEFAULT 'PROVISIONADO';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asientos_contables_contribuyente_id_fkey') THEN
    ALTER TABLE public.asientos_contables
      ADD CONSTRAINT asientos_contables_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asientos_contables_periodo_id_fkey') THEN
    ALTER TABLE public.asientos_contables
      ADD CONSTRAINT asientos_contables_periodo_id_fkey
      FOREIGN KEY (periodo_id) REFERENCES public.sire_periodos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Backfill columnas F5.1 desde modelo plano existente
UPDATE public.asientos_contables ac
SET
  fecha_operacion = COALESCE(ac.fecha_operacion, ac.fecha_asiento),
  cuenta_codigo = COALESCE(ac.cuenta_codigo, ac.cuenta_contable),
  cuenta_denominacion = COALESCE(
    ac.cuenta_denominacion,
    (SELECT p.denominacion FROM public.plan_cuentas_pcge p WHERE p.codigo = ac.cuenta_contable LIMIT 1),
    (SELECT p.nombre_cuenta FROM public.plan_contable_pcge p WHERE p.codigo_cuenta = ac.cuenta_contable LIMIT 1),
    ac.cuenta_contable
  ),
  codigo_libro_tabla8 = COALESCE(ac.codigo_libro_tabla8, '050100'),
  numero_documento_sustentatorio = COALESCE(
    ac.numero_documento_sustentatorio,
    NULLIF(trim(COALESCE(ac.serie_cdp, '') || '-' || COALESCE(ac.nro_cdp_inicial, '')), '-')
  ),
  estado_asiento = COALESCE(ac.estado_asiento, 'PROVISIONADO')
WHERE ac.fecha_operacion IS NULL OR ac.cuenta_codigo IS NULL;

UPDATE public.asientos_contables ac
SET contribuyente_id = c.id
FROM public.contribuyentes c
WHERE ac.contribuyente_id IS NULL
  AND ac.ruc IS NOT NULL
  AND c.ruc = ac.ruc;

UPDATE public.asientos_contables ac
SET contribuyente_id = cr.contribuyente_id
FROM public.compras_rce cr
WHERE ac.contribuyente_id IS NULL
  AND ac.sire_registro_id IS NOT NULL
  AND cr.registro_sire_id = ac.sire_registro_id;

UPDATE public.asientos_contables ac
SET contribuyente_id = vr.contribuyente_id
FROM public.ventas_rvie vr
WHERE ac.contribuyente_id IS NULL
  AND ac.sire_registro_id IS NOT NULL
  AND vr.registro_sire_id = ac.sire_registro_id;

-- Asignar CUO a asientos legacy sin código único
DO $$
DECLARE
  r RECORD;
  v_cuo varchar;
  v_corr int;
BEGIN
  FOR r IN
    SELECT DISTINCT ac.contribuyente_id, ac.periodo, ac.sire_registro_id,
           MIN(ac.fecha_asiento) AS fecha_ref
    FROM public.asientos_contables ac
    WHERE ac.cuo IS NULL
      AND ac.contribuyente_id IS NOT NULL
      AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL')
    GROUP BY ac.contribuyente_id, ac.periodo, ac.sire_registro_id, ac.fecha_asiento, ac.glosa
  LOOP
    v_cuo := public.fn_next_cuo_asiento(r.contribuyente_id, r.periodo);
    v_corr := 0;
    UPDATE public.asientos_contables ac
    SET
      cuo = v_cuo,
      correlativo_linea = sub.rn,
      fecha_operacion = COALESCE(ac.fecha_operacion, ac.fecha_asiento),
      cuenta_codigo = COALESCE(ac.cuenta_codigo, ac.cuenta_contable),
      codigo_libro_tabla8 = COALESCE(ac.codigo_libro_tabla8, '050100')
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
      FROM public.asientos_contables
      WHERE contribuyente_id = r.contribuyente_id
        AND periodo = r.periodo
        AND cuo IS NULL
        AND (
          (sire_registro_id IS NOT DISTINCT FROM r.sire_registro_id)
          OR (r.sire_registro_id IS NULL AND sire_registro_id IS NULL)
        )
    ) sub
    WHERE ac.id = sub.id;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_asientos_contrib_periodo_cuo
  ON public.asientos_contables (contribuyente_id, periodo, cuo, correlativo_linea);

CREATE INDEX IF NOT EXISTS idx_asientos_cuo
  ON public.asientos_contables (contribuyente_id, cuo);

-- =============================================================================
-- 3. RLS
-- =============================================================================
ALTER TABLE public.plan_cuentas_pcge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_cuentas_pcge_select ON public.plan_cuentas_pcge;
CREATE POLICY plan_cuentas_pcge_select ON public.plan_cuentas_pcge
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS plan_cuentas_pcge_write ON public.plan_cuentas_pcge;
CREATE POLICY plan_cuentas_pcge_write ON public.plan_cuentas_pcge
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS asientos_contables_tenant_select ON public.asientos_contables;
CREATE POLICY asientos_contables_tenant_select ON public.asientos_contables
  FOR SELECT TO authenticated
  USING (
    contribuyente_id IS NULL
    OR public.fn_user_can_access_contribuyente(contribuyente_id)
  );

DROP POLICY IF EXISTS asientos_contables_tenant_insert ON public.asientos_contables;
CREATE POLICY asientos_contables_tenant_insert ON public.asientos_contables
  FOR INSERT TO authenticated
  WITH CHECK (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

DROP POLICY IF EXISTS asientos_contables_tenant_update ON public.asientos_contables;
CREATE POLICY asientos_contables_tenant_update ON public.asientos_contables
  FOR UPDATE TO authenticated
  USING (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  )
  WITH CHECK (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

DROP POLICY IF EXISTS asientos_contables_tenant_delete ON public.asientos_contables;
CREATE POLICY asientos_contables_tenant_delete ON public.asientos_contables
  FOR DELETE TO authenticated
  USING (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

-- =============================================================================
-- 4. HELPERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_pcge_denominacion(p_codigo varchar)
RETURNS varchar
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT denominacion FROM public.plan_cuentas_pcge WHERE codigo = p_codigo),
    (SELECT nombre_cuenta FROM public.plan_contable_pcge WHERE codigo_cuenta = p_codigo),
    p_codigo
  );
$$;

CREATE OR REPLACE FUNCTION public.fn_next_cuo_asiento(
  p_contribuyente_id uuid,
  p_periodo varchar
)
RETURNS varchar
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_seq int;
BEGIN
  v_periodo := regexp_replace(COALESCE(p_periodo, ''), '\D', '', 'g');
  v_periodo := left(v_periodo || '000000', 6);

  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(split_part(cuo, '-', 3), '\D', '', 'g'), '')::int
  ), 0) + 1
  INTO v_seq
  FROM public.asientos_contables
  WHERE contribuyente_id = p_contribuyente_id
    AND periodo = v_periodo
    AND cuo LIKE 'CUO-' || v_periodo || '-%';

  RETURN 'CUO-' || v_periodo || '-' || lpad(v_seq::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_map_cuenta_tabla9_f52(p_cuenta varchar, p_debe numeric, p_haber numeric)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_col text;
  v_result jsonb := '{}'::jsonb;
  v_c varchar := left(regexp_replace(COALESCE(p_cuenta, ''), '\D', '', 'g'), 6);
BEGIN
  IF v_c LIKE '4011%' OR v_c LIKE '40111%' THEN
    IF p_debe > 0 THEN v_result := v_result || jsonb_build_object('4011D', p_debe); END IF;
    IF p_haber > 0 THEN v_result := v_result || jsonb_build_object('4011C', p_haber); END IF;
    RETURN v_result;
  END IF;
  IF v_c LIKE '4017%' THEN
    IF p_debe > 0 THEN v_result := v_result || jsonb_build_object('4017D', p_debe); END IF;
    IF p_haber > 0 THEN v_result := v_result || jsonb_build_object('4017C', p_haber); END IF;
    RETURN v_result;
  END IF;

  v_col := CASE
    WHEN v_c LIKE '10%' THEN '10'
    WHEN v_c LIKE '12%' THEN '12'
    WHEN v_c LIKE '16%' THEN '16'
    WHEN v_c LIKE '20%' THEN '20'
    WHEN v_c LIKE '21%' THEN '21'
    WHEN v_c LIKE '33%' THEN '33'
    WHEN v_c LIKE '34%' THEN '34'
    WHEN v_c LIKE '38%' THEN '38'
    WHEN v_c LIKE '39%' THEN '39'
    WHEN v_c LIKE '402%' THEN '402'
    WHEN v_c LIKE '42%' THEN '42'
    WHEN v_c LIKE '46%' THEN '46'
    WHEN v_c LIKE '50%' THEN '50'
    WHEN v_c LIKE '58%' THEN '58'
    WHEN v_c LIKE '59%' THEN '59'
    WHEN v_c LIKE '60%' THEN '60'
    WHEN v_c LIKE '61%' THEN '61'
    WHEN v_c LIKE '62%' THEN '62'
    WHEN v_c LIKE '63%' THEN '63'
    WHEN v_c LIKE '65%' THEN '65'
    WHEN v_c LIKE '66%' THEN '66'
    WHEN v_c LIKE '67%' THEN '67'
    WHEN v_c LIKE '68%' THEN '68'
    WHEN v_c LIKE '69%' THEN '69'
    WHEN v_c LIKE '96%' THEN '96'
    WHEN v_c LIKE '97%' THEN '97'
    WHEN v_c LIKE '70%' THEN '70'
    WHEN v_c LIKE '75%' THEN '75'
    WHEN v_c LIKE '76%' THEN '76'
    WHEN v_c LIKE '77%' THEN '77'
    WHEN v_c LIKE '79%' THEN '79'
    ELSE NULL
  END;

  IF v_col IS NOT NULL THEN
    v_result := jsonb_build_object(v_col, round(COALESCE(p_debe, 0) - COALESCE(p_haber, 0), 2));
  END IF;
  RETURN v_result;
END;
$$;

-- =============================================================================
-- 5. RPC: Generar asiento desde compra RCE o venta RVIE
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_generar_asiento_comprobante(
  p_contribuyente_id uuid,
  p_comprobante_id uuid,
  p_tipo_origen varchar
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_origen varchar := upper(trim(COALESCE(p_tipo_origen, '')));
  v_cuo varchar;
  v_periodo char(6);
  v_periodo_id uuid;
  v_fecha date;
  v_glosa text;
  v_cod_libro varchar(10);
  v_corr_sust varchar(50);
  v_doc_sust varchar(50);
  v_sire_id uuid;
  v_linea int := 0;
  v_base numeric(14,2);
  v_igv numeric(14,2);
  v_igv_cf numeric(14,2);
  v_igv_costo numeric(14,2);
  v_total numeric(14,2);
  v_destino text;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  IF v_origen IN ('COMPRA', 'RCE', 'COMPRAS') THEN
    SELECT
      cr.periodo, cr.periodo_id, cr.fecha_emision,
      'Por compra ' || cr.tipo_comprobante || ' ' || COALESCE(cr.serie, '') || '-' || cr.numero,
      CASE cr.tipo_comprobante WHEN '07' THEN '050300' WHEN '08' THEN '050400' ELSE '050100' END,
      COALESCE(cr.serie, '') || '-' || cr.numero,
      cr.tipo_comprobante || '-' || COALESCE(cr.serie, '') || '-' || cr.numero,
      cr.registro_sire_id,
      cr.base_imponible, cr.igv, cr.igv_credito_fiscal, cr.igv_costo_gasto, cr.total,
      cr.destino_igv::text
    INTO v_periodo, v_periodo_id, v_fecha, v_glosa, v_cod_libro, v_corr_sust, v_doc_sust,
         v_sire_id, v_base, v_igv, v_igv_cf, v_igv_costo, v_total, v_destino
    FROM public.compras_rce cr
    WHERE cr.id = p_comprobante_id AND cr.contribuyente_id = p_contribuyente_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Compra RCE no encontrada';
    END IF;

    v_cuo := public.fn_next_cuo_asiento(p_contribuyente_id, v_periodo);

    -- Línea 1: Gasto / costo (60)
    v_linea := v_linea + 1;
    INSERT INTO public.asientos_contables (
      contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
      fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
      numero_correlativo_sustentatorio, numero_documento_sustentatorio,
      cuenta_codigo, cuenta_contable, cuenta_denominacion,
      debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
      sire_registro_id, estado_asiento, ruc
    ) VALUES (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, v_linea,
      v_fecha, v_fecha, v_glosa, v_cod_libro,
      v_corr_sust, v_doc_sust,
      '6011', '6011', public.fn_pcge_denominacion('6011'),
      v_base + v_igv_costo, 0, 'debe', 'principal', 'DIARIO_COMPRAS', 'COMPRA',
      v_sire_id, 'PROVISIONADO',
      (SELECT ruc FROM public.contribuyentes WHERE id = p_contribuyente_id)
    );

    -- Línea 2: IGV crédito fiscal
    IF v_igv_cf > 0 THEN
      v_linea := v_linea + 1;
      INSERT INTO public.asientos_contables (
        contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
        fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
        numero_correlativo_sustentatorio, numero_documento_sustentatorio,
        cuenta_codigo, cuenta_contable, cuenta_denominacion,
        debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
        sire_registro_id, estado_asiento, ruc
      ) VALUES (
        p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, v_linea,
        v_fecha, v_fecha, 'IGV crédito fiscal ' || v_doc_sust, v_cod_libro,
        v_corr_sust, v_doc_sust,
        '40111', '40111', public.fn_pcge_denominacion('40111'),
        v_igv_cf, 0, 'debe', 'principal', 'DIARIO_COMPRAS', 'COMPRA',
        v_sire_id, 'PROVISIONADO',
        (SELECT ruc FROM public.contribuyentes WHERE id = p_contribuyente_id)
      );
    END IF;

    -- Línea 3: Proveedores
    v_linea := v_linea + 1;
    INSERT INTO public.asientos_contables (
      contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
      fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
      numero_correlativo_sustentatorio, numero_documento_sustentatorio,
      cuenta_codigo, cuenta_contable, cuenta_denominacion,
      debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
      sire_registro_id, estado_asiento, ruc
    ) VALUES (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, v_linea,
      v_fecha, v_fecha, 'Obligación con proveedor ' || v_doc_sust, v_cod_libro,
      v_corr_sust, v_doc_sust,
      '4212', '4212', public.fn_pcge_denominacion('4212'),
      0, v_total, 'haber', 'principal', 'DIARIO_COMPRAS', 'COMPRA',
      v_sire_id, 'PROVISIONADO',
      (SELECT ruc FROM public.contribuyentes WHERE id = p_contribuyente_id)
    );

    -- Asiento destino IGV no gravado / sin crédito
    IF v_destino IN ('DESTINO_3_NO_GRAVADO', 'SIN_CREDITO_FISCAL') AND v_igv_costo > 0 THEN
      v_cuo := public.fn_next_cuo_asiento(p_contribuyente_id, v_periodo);
      v_linea := 1;
      INSERT INTO public.asientos_contables (
        contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
        fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
        numero_correlativo_sustentatorio, numero_documento_sustentatorio,
        cuenta_codigo, cuenta_contable, cuenta_denominacion,
        debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
        sire_registro_id, estado_asiento, ruc
      ) VALUES
      (
        p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, 1,
        v_fecha, v_fecha, 'Destino IGV no gravado ' || v_doc_sust, v_cod_libro,
        v_corr_sust, v_doc_sust,
        '2011', '2011', public.fn_pcge_denominacion('2011'),
        v_igv_costo, 0, 'debe', 'principal', 'DIARIO_COMPRAS', 'COMPRA',
        v_sire_id, 'PROVISIONADO',
        (SELECT ruc FROM public.contribuyentes WHERE id = p_contribuyente_id)
      ),
      (
        p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, 2,
        v_fecha, v_fecha, 'Carga imputable destino IGV ' || v_doc_sust, v_cod_libro,
        v_corr_sust, v_doc_sust,
        '7911', '7911', public.fn_pcge_denominacion('7911'),
        0, v_igv_costo, 'haber', 'principal', 'DIARIO_COMPRAS', 'COMPRA',
        v_sire_id, 'PROVISIONADO',
        (SELECT ruc FROM public.contribuyentes WHERE id = p_contribuyente_id)
      );
    END IF;

  ELSIF v_origen IN ('VENTA', 'RVIE', 'VENTAS') THEN
    SELECT
      vr.periodo, vr.periodo_id, vr.fecha_emision,
      'Por venta ' || vr.tipo_comprobante || ' ' || COALESCE(vr.serie, '') || '-' || vr.numero,
      CASE vr.tipo_comprobante WHEN '07' THEN '140300' WHEN '08' THEN '140400' ELSE '140100' END,
      COALESCE(vr.serie, '') || '-' || vr.numero,
      vr.tipo_comprobante || '-' || COALESCE(vr.serie, '') || '-' || vr.numero,
      vr.registro_sire_id,
      vr.base_imponible_gravada, vr.igv, vr.total
    INTO v_periodo, v_periodo_id, v_fecha, v_glosa, v_cod_libro, v_corr_sust, v_doc_sust,
         v_sire_id, v_base, v_igv, v_total
    FROM public.ventas_rvie vr
    WHERE vr.id = p_comprobante_id AND vr.contribuyente_id = p_contribuyente_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Venta RVIE no encontrada';
    END IF;

    v_cuo := public.fn_next_cuo_asiento(p_contribuyente_id, v_periodo);

    v_linea := 1;
    INSERT INTO public.asientos_contables (
      contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
      fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
      numero_correlativo_sustentatorio, numero_documento_sustentatorio,
      cuenta_codigo, cuenta_contable, cuenta_denominacion,
      debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
      sire_registro_id, estado_asiento, ruc
    ) VALUES (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, v_linea,
      v_fecha, v_fecha, 'Factura por cobrar ' || v_doc_sust, v_cod_libro,
      v_corr_sust, v_doc_sust,
      '1212', '1212', public.fn_pcge_denominacion('1212'),
      v_total, 0, 'debe', 'principal', 'DIARIO_VENTAS', 'VENTA',
      v_sire_id, 'PROVISIONADO',
      (SELECT ruc FROM public.contribuyentes WHERE id = p_contribuyente_id)
    );

    v_linea := 2;
    INSERT INTO public.asientos_contables (
      contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
      fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
      numero_correlativo_sustentatorio, numero_documento_sustentatorio,
      cuenta_codigo, cuenta_contable, cuenta_denominacion,
      debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
      sire_registro_id, estado_asiento, ruc
    ) VALUES (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, v_linea,
      v_fecha, v_fecha, 'IGV por pagar ' || v_doc_sust, v_cod_libro,
      v_corr_sust, v_doc_sust,
      '40111', '40111', public.fn_pcge_denominacion('40111'),
      0, v_igv, 'haber', 'principal', 'DIARIO_VENTAS', 'VENTA',
      v_sire_id, 'PROVISIONADO',
      (SELECT ruc FROM public.contribuyentes WHERE id = p_contribuyente_id)
    );

    v_linea := 3;
    INSERT INTO public.asientos_contables (
      contribuyente_id, periodo_id, periodo, cuo, correlativo_linea,
      fecha_operacion, fecha_asiento, glosa, codigo_libro_tabla8,
      numero_correlativo_sustentatorio, numero_documento_sustentatorio,
      cuenta_codigo, cuenta_contable, cuenta_denominacion,
      debe, haber, naturaleza, tipo_asiento, tipo_libro, tipo_registro,
      sire_registro_id, estado_asiento, ruc
    ) VALUES (
      p_contribuyente_id, v_periodo_id, v_periodo, v_cuo, v_linea,
      v_fecha, v_fecha, 'Venta mercaderías ' || v_doc_sust, v_cod_libro,
      v_corr_sust, v_doc_sust,
      '7011', '7011', public.fn_pcge_denominacion('7011'),
      0, v_base, 'haber', 'principal', 'DIARIO_VENTAS', 'VENTA',
      v_sire_id, 'PROVISIONADO',
      (SELECT ruc FROM public.contribuyentes WHERE id = p_contribuyente_id)
    );
  ELSE
    RAISE EXCEPTION 'Tipo origen inválido: %', p_tipo_origen;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'cuo', v_cuo,
    'contribuyente_id', p_contribuyente_id,
    'comprobante_id', p_comprobante_id,
    'tipo_origen', v_origen,
    'lineas_generadas', v_linea
  );
END;
$$;

-- =============================================================================
-- 6. RPC: Libro Diario Formato 5.1
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_obtener_libro_diario_f51(
  p_contribuyente_id uuid,
  p_periodo varchar
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_rows jsonb;
  v_total_debe numeric(14,2);
  v_total_haber numeric(14,2);
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  v_periodo := left(regexp_replace(COALESCE(p_periodo, ''), '\D', '', 'g') || '000000', 6);

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.cuo, t.correlativo_linea), '[]'::jsonb)
  INTO v_rows
  FROM (
    SELECT
      ac.cuo,
      ac.correlativo_linea,
      ac.fecha_operacion,
      ac.glosa,
      ac.codigo_libro_tabla8,
      ac.numero_correlativo_sustentatorio,
      ac.numero_documento_sustentatorio,
      COALESCE(ac.cuenta_codigo, ac.cuenta_contable) AS cuenta_codigo,
      COALESCE(ac.cuenta_denominacion, public.fn_pcge_denominacion(ac.cuenta_contable)) AS cuenta_denominacion,
      ac.debe,
      ac.haber,
      ac.estado_asiento,
      ac.sire_registro_id
    FROM public.asientos_contables ac
    WHERE ac.contribuyente_id = p_contribuyente_id
      AND ac.periodo = v_periodo
      AND ac.cuo IS NOT NULL
      AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL')
    ORDER BY ac.cuo, ac.correlativo_linea NULLS LAST, ac.fecha_operacion, ac.id
  ) t;

  SELECT COALESCE(SUM(debe), 0), COALESCE(SUM(haber), 0)
  INTO v_total_debe, v_total_haber
  FROM public.asientos_contables
  WHERE contribuyente_id = p_contribuyente_id
    AND periodo = v_periodo
    AND cuo IS NOT NULL
    AND tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL');

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'periodo', v_periodo,
    'formato', '5.1',
    'filas', v_rows,
    'total_debe', v_total_debe,
    'total_haber', v_total_haber,
    'cuadrado', abs(v_total_debe - v_total_haber) < 0.01,
    'generado_at', now()
  );
END;
$$;

-- =============================================================================
-- 7. RPC: Libro Diario Simplificado Formato 5.2 (Tabla 9)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_obtener_libro_diario_simplificado_f52(
  p_contribuyente_id uuid,
  p_periodo varchar
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_rows jsonb;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  v_periodo := left(regexp_replace(COALESCE(p_periodo, ''), '\D', '', 'g') || '000000', 6);

  SELECT COALESCE(jsonb_agg(row_to_json(g)::jsonb ORDER BY g.fecha_operacion), '[]'::jsonb)
  INTO v_rows
  FROM (
    SELECT
      ac.fecha_operacion,
      to_char(ac.fecha_operacion, 'YYYY-MM') AS mes,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'10' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'10')::numeric ELSE 0 END) AS col_10,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'12' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'12')::numeric ELSE 0 END) AS col_12,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'16' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'16')::numeric ELSE 0 END) AS col_16,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'20' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'20')::numeric ELSE 0 END) AS col_20,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'21' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'21')::numeric ELSE 0 END) AS col_21,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'33' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'33')::numeric ELSE 0 END) AS col_33,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'34' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'34')::numeric ELSE 0 END) AS col_34,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'38' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'38')::numeric ELSE 0 END) AS col_38,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'39' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'39')::numeric ELSE 0 END) AS col_39,
      SUM(COALESCE((fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'4011D')::numeric, 0)) AS col_4011D,
      SUM(COALESCE((fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'4011C')::numeric, 0)) AS col_4011C,
      SUM(COALESCE((fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'4017D')::numeric, 0)) AS col_4017D,
      SUM(COALESCE((fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'4017C')::numeric, 0)) AS col_4017C,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'402' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'402')::numeric ELSE 0 END) AS col_402,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'42' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'42')::numeric ELSE 0 END) AS col_42,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'46' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'46')::numeric ELSE 0 END) AS col_46,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'50' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'50')::numeric ELSE 0 END) AS col_50,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'58' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'58')::numeric ELSE 0 END) AS col_58,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'59' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'59')::numeric ELSE 0 END) AS col_59,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'60' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'60')::numeric ELSE 0 END) AS col_60,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'61' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'61')::numeric ELSE 0 END) AS col_61,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'62' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'62')::numeric ELSE 0 END) AS col_62,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'63' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'63')::numeric ELSE 0 END) AS col_63,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'65' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'65')::numeric ELSE 0 END) AS col_65,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'66' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'66')::numeric ELSE 0 END) AS col_66,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'67' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'67')::numeric ELSE 0 END) AS col_67,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'68' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'68')::numeric ELSE 0 END) AS col_68,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'69' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'69')::numeric ELSE 0 END) AS col_69,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'96' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'96')::numeric ELSE 0 END) AS col_96,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'97' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'97')::numeric ELSE 0 END) AS col_97,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'70' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'70')::numeric ELSE 0 END) AS col_70,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'75' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'75')::numeric ELSE 0 END) AS col_75,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'76' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'76')::numeric ELSE 0 END) AS col_76,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'77' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'77')::numeric ELSE 0 END) AS col_77,
      SUM(CASE WHEN fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'79' IS NOT NULL
        THEN (fn_map_cuenta_tabla9_f52(ac.cuenta_codigo, ac.debe, ac.haber)->>'79')::numeric ELSE 0 END) AS col_79
    FROM public.asientos_contables ac
    WHERE ac.contribuyente_id = p_contribuyente_id
      AND ac.periodo = v_periodo
      AND ac.tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'DIARIO_MANUAL')
    GROUP BY ac.fecha_operacion
  ) g;

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'periodo', v_periodo,
    'formato', '5.2',
    'tabla9', jsonb_build_object(
      'activo', ARRAY['10','12','16','20','21','33','34','38','39'],
      'pasivo', ARRAY['4011D','4011C','4017D','4017C','402','42','46'],
      'patrimonio', ARRAY['50','58','59'],
      'gastos', ARRAY['60','61','62','63','65','66','67','68','69','96','97'],
      'ingresos', ARRAY['70','75','76','77','79']
    ),
    'filas', v_rows,
    'generado_at', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_pcge_denominacion(varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_next_cuo_asiento(uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_generar_asiento_comprobante(uuid, uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_obtener_libro_diario_f51(uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_obtener_libro_diario_simplificado_f52(uuid, varchar) TO authenticated;
