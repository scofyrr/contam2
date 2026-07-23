-- =============================================================================
-- Módulo 4: Compras RCE (130400) & Ventas RVIE (140400) — Clasificación Fiscal IGV
-- Idempotente — integrado con registros_sire_cabecera + sire_periodos
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'destino_igv_enum') THEN
    CREATE TYPE public.destino_igv_enum AS ENUM (
      'DESTINO_1_GRAVADO',
      'DESTINO_2_MIXTO',
      'DESTINO_3_NO_GRAVADO',
      'SIN_CREDITO_FISCAL'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_provision_enum') THEN
    CREATE TYPE public.estado_provision_enum AS ENUM (
      'PENDIENTE',
      'PROVISIONADO',
      'LIQUIDADO_PARCIAL',
      'PAGADO',
      'ANULADO'
    );
  END IF;
END $$;

-- =============================================================================
-- 1. COMPRAS RCE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.compras_rce (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  periodo_id uuid,
  registro_sire_id uuid,
  tipo_comprobante char(2) NOT NULL DEFAULT '01',
  serie varchar(20),
  numero varchar(20) NOT NULL,
  fecha_emision date NOT NULL,
  fecha_vencimiento date,
  ruc_proveedor char(11),
  razon_social_proveedor text,
  moneda char(3) NOT NULL DEFAULT 'PEN',
  tipo_cambio numeric(10, 4) NOT NULL DEFAULT 1.0000,
  destino_igv public.destino_igv_enum NOT NULL DEFAULT 'DESTINO_1_GRAVADO',
  base_imponible numeric(14, 2) NOT NULL DEFAULT 0,
  igv numeric(14, 2) NOT NULL DEFAULT 0,
  igv_credito_fiscal numeric(14, 2) NOT NULL DEFAULT 0,
  igv_costo_gasto numeric(14, 2) NOT NULL DEFAULT 0,
  valor_no_gravado numeric(14, 2) NOT NULL DEFAULT 0,
  otros_cargos numeric(14, 2) NOT NULL DEFAULT 0,
  total numeric(14, 2) NOT NULL DEFAULT 0,
  tiene_detraccion boolean NOT NULL DEFAULT false,
  constancia_detraccion_num varchar(30),
  fecha_detraccion date,
  porcentaje_detraccion numeric(5, 2) DEFAULT 0,
  monto_detraccion numeric(14, 2) DEFAULT 0,
  tiene_retencion boolean NOT NULL DEFAULT false,
  monto_retencion numeric(14, 2) DEFAULT 0,
  tiene_percepcion boolean NOT NULL DEFAULT false,
  monto_percepcion numeric(14, 2) DEFAULT 0,
  estado_provision public.estado_provision_enum NOT NULL DEFAULT 'PENDIENTE',
  comprobante_ref_serie varchar(20),
  comprobante_ref_numero varchar(20),
  comprobante_ref_fecha date,
  periodo char(6) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contribuyente_id, periodo, tipo_comprobante, serie, numero)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'compras_rce_contribuyente_id_fkey') THEN
    ALTER TABLE public.compras_rce
      ADD CONSTRAINT compras_rce_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'compras_rce_periodo_id_fkey') THEN
    ALTER TABLE public.compras_rce
      ADD CONSTRAINT compras_rce_periodo_id_fkey
      FOREIGN KEY (periodo_id) REFERENCES public.sire_periodos(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'compras_rce_registro_sire_id_fkey') THEN
    ALTER TABLE public.compras_rce
      ADD CONSTRAINT compras_rce_registro_sire_id_fkey
      FOREIGN KEY (registro_sire_id) REFERENCES public.registros_sire_cabecera(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_compras_rce_contrib_periodo
  ON public.compras_rce (contribuyente_id, periodo);

CREATE INDEX IF NOT EXISTS idx_compras_rce_destino
  ON public.compras_rce (contribuyente_id, destino_igv);

DROP TRIGGER IF EXISTS compras_rce_updated ON public.compras_rce;
CREATE TRIGGER compras_rce_updated
  BEFORE UPDATE ON public.compras_rce
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 2. VENTAS RVIE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ventas_rvie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  periodo_id uuid,
  registro_sire_id uuid,
  tipo_comprobante char(2) NOT NULL DEFAULT '01',
  serie varchar(20),
  numero varchar(20) NOT NULL,
  fecha_emision date NOT NULL,
  ruc_cliente char(11),
  razon_social_cliente text,
  moneda char(3) NOT NULL DEFAULT 'PEN',
  tipo_cambio numeric(10, 4) NOT NULL DEFAULT 1.0000,
  base_imponible_gravada numeric(14, 2) NOT NULL DEFAULT 0,
  igv numeric(14, 2) NOT NULL DEFAULT 0,
  valor_exonerado numeric(14, 2) NOT NULL DEFAULT 0,
  valor_inafecto numeric(14, 2) NOT NULL DEFAULT 0,
  exportacion numeric(14, 2) NOT NULL DEFAULT 0,
  icbper numeric(14, 2) NOT NULL DEFAULT 0,
  total numeric(14, 2) NOT NULL DEFAULT 0,
  tiene_detraccion boolean NOT NULL DEFAULT false,
  monto_detraccion numeric(14, 2) DEFAULT 0,
  tiene_percepcion boolean NOT NULL DEFAULT false,
  monto_percepcion numeric(14, 2) DEFAULT 0,
  tiene_retencion boolean NOT NULL DEFAULT false,
  monto_retencion numeric(14, 2) DEFAULT 0,
  estado_provision public.estado_provision_enum NOT NULL DEFAULT 'PENDIENTE',
  comprobante_ref_serie varchar(20),
  comprobante_ref_numero varchar(20),
  periodo char(6) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contribuyente_id, periodo, tipo_comprobante, serie, numero)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ventas_rvie_contribuyente_id_fkey') THEN
    ALTER TABLE public.ventas_rvie
      ADD CONSTRAINT ventas_rvie_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ventas_rvie_periodo_id_fkey') THEN
    ALTER TABLE public.ventas_rvie
      ADD CONSTRAINT ventas_rvie_periodo_id_fkey
      FOREIGN KEY (periodo_id) REFERENCES public.sire_periodos(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ventas_rvie_registro_sire_id_fkey') THEN
    ALTER TABLE public.ventas_rvie
      ADD CONSTRAINT ventas_rvie_registro_sire_id_fkey
      FOREIGN KEY (registro_sire_id) REFERENCES public.registros_sire_cabecera(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ventas_rvie_contrib_periodo
  ON public.ventas_rvie (contribuyente_id, periodo);

DROP TRIGGER IF EXISTS ventas_rvie_updated ON public.ventas_rvie;
CREATE TRIGGER ventas_rvie_updated
  BEFORE UPDATE ON public.ventas_rvie
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 3. HELPER: calcular crédito fiscal según destino IGV
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_calcular_credito_fiscal_igv(
  p_igv numeric,
  p_destino public.destino_igv_enum,
  p_factor_prorrata numeric DEFAULT 0.5
)
RETURNS TABLE(igv_credito numeric, igv_costo numeric)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_credito numeric;
BEGIN
  CASE p_destino
    WHEN 'DESTINO_1_GRAVADO' THEN v_credito := p_igv;
    WHEN 'DESTINO_2_MIXTO' THEN v_credito := round(p_igv * COALESCE(p_factor_prorrata, 0.5), 2);
    WHEN 'DESTINO_3_NO_GRAVADO', 'SIN_CREDITO_FISCAL' THEN v_credito := 0;
    ELSE v_credito := p_igv;
  END CASE;
  RETURN QUERY SELECT v_credito, round(GREATEST(p_igv - v_credito, 0), 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_map_estado_provision_sire(
  p_estado_validacion text,
  p_estado_pago text
)
RETURNS public.estado_provision_enum
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_estado_pago = 'pagado' THEN 'PAGADO'::public.estado_provision_enum
    WHEN p_estado_pago = 'parcial' THEN 'LIQUIDADO_PARCIAL'::public.estado_provision_enum
    WHEN p_estado_validacion = 'validado' THEN 'PROVISIONADO'::public.estado_provision_enum
    WHEN p_estado_validacion = 'anulado' THEN 'ANULADO'::public.estado_provision_enum
    ELSE 'PENDIENTE'::public.estado_provision_enum
  END;
$$;

-- =============================================================================
-- 4. SYNC desde registros_sire_cabecera (backfill)
-- =============================================================================
INSERT INTO public.compras_rce (
  contribuyente_id, periodo_id, registro_sire_id, tipo_comprobante, serie, numero,
  fecha_emision, fecha_vencimiento, ruc_proveedor, razon_social_proveedor,
  moneda, tipo_cambio, base_imponible, igv, igv_credito_fiscal, igv_costo_gasto,
  valor_no_gravado, total, estado_provision, periodo
)
SELECT
  c.contribuyente_id, c.periodo_id, c.id, c.cod_tipo_cdp, c.serie_cdp, c.nro_cdp_inicial,
  c.fecha_emision, c.fecha_vencimiento,
  left(regexp_replace(COALESCE(c.nro_doc_contraparte, ''), '\D', '', 'g'), 11),
  c.nombre_contraparte,
  c.cod_moneda, c.tipo_cambio,
  COALESCE(m.base_imponible_gravada, m.bi_adq_grav, m.bi_grav, 0),
  COALESCE(m.igv_ipm, m.igv_adq_grav, m.igv_grav, 0),
  (SELECT igv_credito FROM public.fn_calcular_credito_fiscal_igv(
    COALESCE(m.igv_ipm, m.igv_adq_grav, m.igv_grav, 0), 'DESTINO_1_GRAVADO'::public.destino_igv_enum
  )),
  (SELECT igv_costo FROM public.fn_calcular_credito_fiscal_igv(
    COALESCE(m.igv_ipm, m.igv_adq_grav, m.igv_grav, 0), 'DESTINO_1_GRAVADO'::public.destino_igv_enum
  )),
  COALESCE(m.valor_no_gravado, m.valor_no_grav, 0),
  COALESCE(m.total_comprobante, m.importe_total, 0),
  public.fn_map_estado_provision_sire(c.estado_validacion, c.estado_pago),
  c.periodo
FROM public.registros_sire_cabecera c
INNER JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
WHERE c.contribuyente_id IS NOT NULL
  AND (c.tipo_registro = 'RCE' OR c.tipo = 'COMPRA')
ON CONFLICT (contribuyente_id, periodo, tipo_comprobante, serie, numero) DO NOTHING;

INSERT INTO public.ventas_rvie (
  contribuyente_id, periodo_id, registro_sire_id, tipo_comprobante, serie, numero,
  fecha_emision, ruc_cliente, razon_social_cliente,
  moneda, tipo_cambio, base_imponible_gravada, igv, valor_inafecto, total,
  estado_provision, periodo
)
SELECT
  c.contribuyente_id, c.periodo_id, c.id, c.cod_tipo_cdp, c.serie_cdp, c.nro_cdp_inicial,
  c.fecha_emision,
  left(regexp_replace(COALESCE(c.nro_doc_contraparte, ''), '\D', '', 'g'), 11),
  c.nombre_contraparte,
  c.cod_moneda, c.tipo_cambio,
  COALESCE(m.base_imponible_gravada, m.bi_grav, 0),
  COALESCE(m.igv_ipm, m.igv_grav, 0),
  COALESCE(m.valor_no_gravado, m.valor_no_grav, 0),
  COALESCE(m.total_comprobante, m.importe_total, 0),
  public.fn_map_estado_provision_sire(c.estado_validacion, c.estado_cobro),
  c.periodo
FROM public.registros_sire_cabecera c
INNER JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
WHERE c.contribuyente_id IS NOT NULL
  AND (c.tipo_registro = 'RVIE' OR c.tipo = 'VENTA')
ON CONFLICT (contribuyente_id, periodo, tipo_comprobante, serie, numero) DO NOTHING;

-- =============================================================================
-- 5. RLS
-- =============================================================================
ALTER TABLE public.compras_rce ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas_rvie ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compras_rce select" ON public.compras_rce;
DROP POLICY IF EXISTS "compras_rce insert" ON public.compras_rce;
DROP POLICY IF EXISTS "compras_rce update" ON public.compras_rce;
DROP POLICY IF EXISTS "compras_rce delete" ON public.compras_rce;

CREATE POLICY "compras_rce select" ON public.compras_rce
  FOR SELECT TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "compras_rce insert" ON public.compras_rce
  FOR INSERT TO authenticated WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "compras_rce update" ON public.compras_rce
  FOR UPDATE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "compras_rce delete" ON public.compras_rce
  FOR DELETE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS "ventas_rvie select" ON public.ventas_rvie;
DROP POLICY IF EXISTS "ventas_rvie insert" ON public.ventas_rvie;
DROP POLICY IF EXISTS "ventas_rvie update" ON public.ventas_rvie;
DROP POLICY IF EXISTS "ventas_rvie delete" ON public.ventas_rvie;

CREATE POLICY "ventas_rvie select" ON public.ventas_rvie
  FOR SELECT TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "ventas_rvie insert" ON public.ventas_rvie
  FOR INSERT TO authenticated WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "ventas_rvie update" ON public.ventas_rvie
  FOR UPDATE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "ventas_rvie delete" ON public.ventas_rvie
  FOR DELETE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));

-- =============================================================================
-- 6. RPC: fn_clasificar_compra_destino_igv
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_clasificar_compra_destino_igv(
  p_compra_id uuid,
  p_destino public.destino_igv_enum,
  p_factor_prorrata numeric DEFAULT 0.5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_compra public.compras_rce%ROWTYPE;
  v_credito numeric;
  v_costo numeric;
BEGIN
  SELECT * INTO v_compra FROM public.compras_rce WHERE id = p_compra_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compra no encontrada: %', p_compra_id;
  END IF;

  IF coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT public.fn_user_can_access_contribuyente(v_compra.contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado' USING ERRCODE = '42501';
  END IF;

  SELECT igv_credito, igv_costo INTO v_credito, v_costo
  FROM public.fn_calcular_credito_fiscal_igv(v_compra.igv, p_destino, p_factor_prorrata);

  UPDATE public.compras_rce SET
    destino_igv = p_destino,
    igv_credito_fiscal = v_credito,
    igv_costo_gasto = v_costo,
    updated_at = now()
  WHERE id = p_compra_id;

  RETURN jsonb_build_object(
    'ok', true,
    'compra_id', p_compra_id,
    'destino_igv', p_destino,
    'igv_credito_fiscal', v_credito,
    'igv_costo_gasto', v_costo,
    'igv_original', v_compra.igv
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_clasificar_compra_destino_igv(uuid, public.destino_igv_enum, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_clasificar_compra_destino_igv(uuid, public.destino_igv_enum, numeric) TO authenticated;

-- =============================================================================
-- 7. RPC: fn_reemplazar_propuesta_compras
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_reemplazar_propuesta_compras(
  p_contribuyente_id uuid,
  p_periodo varchar,
  p_compras_nuevas jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_periodo_id uuid;
  v_item jsonb;
  v_insertados int := 0;
  v_actualizados int := 0;
  v_existente uuid;
  v_igv numeric(14,2);
  v_destino public.destino_igv_enum;
  v_credito numeric;
  v_costo numeric;
BEGIN
  IF coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado' USING ERRCODE = '42501';
  END IF;

  v_periodo := regexp_replace(p_periodo, '\D', '', 'g');
  v_periodo_id := public.fn_sire_upsert_periodo(p_contribuyente_id, v_periodo);

  IF jsonb_typeof(p_compras_nuevas) <> 'array' THEN
    RAISE EXCEPTION 'p_compras_nuevas debe ser un array JSON';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_compras_nuevas)
  LOOP
    v_igv := COALESCE((v_item->>'igv')::numeric, 0);
    v_destino := COALESCE(
      NULLIF(upper(trim(v_item->>'destino_igv')), '')::public.destino_igv_enum,
      'DESTINO_1_GRAVADO'::public.destino_igv_enum
    );
    SELECT igv_credito, igv_costo INTO v_credito, v_costo
    FROM public.fn_calcular_credito_fiscal_igv(v_igv, v_destino);

    SELECT id INTO v_existente
    FROM public.compras_rce cr
    WHERE cr.contribuyente_id = p_contribuyente_id
      AND cr.periodo = v_periodo
      AND cr.tipo_comprobante = COALESCE(NULLIF(trim(v_item->>'tipo_comprobante'), ''), '01')
      AND cr.serie IS NOT DISTINCT FROM NULLIF(trim(v_item->>'serie'), '')
      AND cr.numero = COALESCE(NULLIF(trim(v_item->>'numero'), ''), 'S/N');

    IF v_existente IS NOT NULL THEN
      UPDATE public.compras_rce SET
        ruc_proveedor = left(regexp_replace(COALESCE(v_item->>'ruc_proveedor', ''), '\D', '', 'g'), 11),
        razon_social_proveedor = NULLIF(trim(v_item->>'razon_social_proveedor'), ''),
        fecha_emision = COALESCE((v_item->>'fecha_emision')::date, fecha_emision),
        base_imponible = COALESCE((v_item->>'base_imponible')::numeric, base_imponible),
        igv = v_igv,
        destino_igv = v_destino,
        igv_credito_fiscal = v_credito,
        igv_costo_gasto = v_costo,
        total = COALESCE((v_item->>'total')::numeric, total),
        tiene_detraccion = COALESCE((v_item->>'tiene_detraccion')::boolean, tiene_detraccion),
        monto_detraccion = COALESCE((v_item->>'monto_detraccion')::numeric, monto_detraccion),
        periodo_id = v_periodo_id,
        updated_at = now()
      WHERE id = v_existente;
      v_actualizados := v_actualizados + 1;
    ELSE
      INSERT INTO public.compras_rce (
        contribuyente_id, periodo_id, periodo, tipo_comprobante, serie, numero,
        fecha_emision, ruc_proveedor, razon_social_proveedor, moneda, tipo_cambio,
        destino_igv, base_imponible, igv, igv_credito_fiscal, igv_costo_gasto,
        valor_no_gravado, total, tiene_detraccion, monto_detraccion,
        comprobante_ref_serie, comprobante_ref_numero, comprobante_ref_fecha
      ) VALUES (
        p_contribuyente_id, v_periodo_id, v_periodo,
        COALESCE(NULLIF(trim(v_item->>'tipo_comprobante'), ''), '01'),
        NULLIF(trim(v_item->>'serie'), ''),
        COALESCE(NULLIF(trim(v_item->>'numero'), ''), 'S/N'),
        COALESCE((v_item->>'fecha_emision')::date, CURRENT_DATE),
        left(regexp_replace(COALESCE(v_item->>'ruc_proveedor', ''), '\D', '', 'g'), 11),
        NULLIF(trim(v_item->>'razon_social_proveedor'), ''),
        COALESCE(NULLIF(trim(v_item->>'moneda'), ''), 'PEN'),
        COALESCE((v_item->>'tipo_cambio')::numeric, 1),
        v_destino,
        COALESCE((v_item->>'base_imponible')::numeric, 0),
        v_igv, v_credito, v_costo,
        COALESCE((v_item->>'valor_no_gravado')::numeric, 0),
        COALESCE((v_item->>'total')::numeric, 0),
        COALESCE((v_item->>'tiene_detraccion')::boolean, false),
        COALESCE((v_item->>'monto_detraccion')::numeric, 0),
        NULLIF(trim(v_item->>'comprobante_ref_serie'), ''),
        NULLIF(trim(v_item->>'comprobante_ref_numero'), ''),
        CASE WHEN v_item->>'comprobante_ref_fecha' IS NOT NULL
          THEN (v_item->>'comprobante_ref_fecha')::date ELSE NULL END
      );
      v_insertados := v_insertados + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'contribuyente_id', p_contribuyente_id,
    'periodo', v_periodo,
    'insertados', v_insertados,
    'actualizados', v_actualizados
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_reemplazar_propuesta_compras(uuid, varchar, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_reemplazar_propuesta_compras(uuid, varchar, jsonb) TO authenticated;

-- =============================================================================
-- 8. RPC: fn_obtener_resumen_fiscal_periodo
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_obtener_resumen_fiscal_periodo(
  p_contribuyente_id uuid,
  p_periodo varchar
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_debito numeric(14,2);
  v_credito_d1 numeric(14,2);
  v_credito_d2 numeric(14,2);
  v_credito_d3 numeric(14,2);
  v_credito_sin numeric(14,2);
  v_credito_total numeric(14,2);
  v_saldo numeric(14,2);
  v_cnt_compras int;
  v_cnt_ventas int;
BEGIN
  IF coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado' USING ERRCODE = '42501';
  END IF;

  v_periodo := regexp_replace(p_periodo, '\D', '', 'g');

  SELECT COALESCE(SUM(igv), 0), COUNT(*)::int
  INTO v_debito, v_cnt_ventas
  FROM public.ventas_rvie
  WHERE contribuyente_id = p_contribuyente_id AND periodo = v_periodo;

  SELECT
    COALESCE(SUM(CASE WHEN destino_igv = 'DESTINO_1_GRAVADO' THEN igv_credito_fiscal ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN destino_igv = 'DESTINO_2_MIXTO' THEN igv_credito_fiscal ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN destino_igv = 'DESTINO_3_NO_GRAVADO' THEN igv_costo_gasto ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN destino_igv = 'SIN_CREDITO_FISCAL' THEN igv_costo_gasto ELSE 0 END), 0),
    COUNT(*)::int
  INTO v_credito_d1, v_credito_d2, v_credito_d3, v_credito_sin, v_cnt_compras
  FROM public.compras_rce
  WHERE contribuyente_id = p_contribuyente_id AND periodo = v_periodo;

  v_credito_total := v_credito_d1 + v_credito_d2;
  v_saldo := v_debito - v_credito_total;

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'periodo', v_periodo,
    'debito_fiscal_igv_ventas', v_debito,
    'credito_fiscal_destino_1', v_credito_d1,
    'credito_fiscal_destino_2_prorrata', v_credito_d2,
    'igv_costo_destino_3', v_credito_d3,
    'igv_sin_credito_fiscal', v_credito_sin,
    'credito_fiscal_total', v_credito_total,
    'igv_a_pagar_estimado', GREATEST(v_saldo, 0),
    'saldo_favor_estimado', GREATEST(-v_saldo, 0),
    'cantidad_compras', v_cnt_compras,
    'cantidad_ventas', v_cnt_ventas,
    'evaluado_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_obtener_resumen_fiscal_periodo(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_obtener_resumen_fiscal_periodo(uuid, varchar) TO authenticated;
