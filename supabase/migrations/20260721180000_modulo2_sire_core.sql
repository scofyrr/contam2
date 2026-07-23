-- =============================================================================
-- Módulo 2: SIRE Core, Extractor & Sincronizador API/SOL SUNAT
-- Extiende registros_sire_cabecera/montos existentes + tablas nuevas de periodo
-- Idempotente — compatible con CONTAM normalizado (ADR-003)
-- =============================================================================

-- =============================================================================
-- 1. ENUMS MÓDULO SIRE CORE
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sire_tipo_registro_enum') THEN
    CREATE TYPE public.sire_tipo_registro_enum AS ENUM ('RVIE', 'RCE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sire_origen_registro_enum') THEN
    CREATE TYPE public.sire_origen_registro_enum AS ENUM (
      'SUNAT_PROPUESTA', 'AJUSTE_POSTERIOR', 'REEMPLAZO'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sire_estado_periodo_enum') THEN
    CREATE TYPE public.sire_estado_periodo_enum AS ENUM (
      'PENDIENTE', 'SINCRONIZADO', 'CON_INCONSISTENCIAS', 'VACIO', 'ERROR'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sire_severidad_enum') THEN
    CREATE TYPE public.sire_severidad_enum AS ENUM ('ALERTA', 'ERROR_BLOQUEANTE');
  END IF;
END $$;

-- =============================================================================
-- 2. SIRE PERIODOS (nueva — tracking por contribuyente/mes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sire_periodos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  periodo char(6) NOT NULL CHECK (periodo ~ '^\d{6}$'),
  estado_rvie public.sire_estado_periodo_enum NOT NULL DEFAULT 'PENDIENTE',
  estado_rce public.sire_estado_periodo_enum NOT NULL DEFAULT 'PENDIENTE',
  total_ventas_soles numeric(16, 2) NOT NULL DEFAULT 0,
  total_compras_soles numeric(16, 2) NOT NULL DEFAULT 0,
  fecha_sincronizacion timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contribuyente_id, periodo)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sire_periodos_contribuyente_id_fkey'
  ) THEN
    ALTER TABLE public.sire_periodos
      ADD CONSTRAINT sire_periodos_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sire_periodos_contrib_periodo
  ON public.sire_periodos (contribuyente_id, periodo DESC);

DROP TRIGGER IF EXISTS sire_periodos_updated ON public.sire_periodos;
CREATE TRIGGER sire_periodos_updated
  BEFORE UPDATE ON public.sire_periodos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 3. EXTENSIÓN registros_sire_cabecera (tabla existente)
-- =============================================================================
ALTER TABLE public.registros_sire_cabecera ADD COLUMN IF NOT EXISTS contribuyente_id uuid;
ALTER TABLE public.registros_sire_cabecera ADD COLUMN IF NOT EXISTS periodo_id uuid;
ALTER TABLE public.registros_sire_cabecera ADD COLUMN IF NOT EXISTS tipo_registro public.sire_tipo_registro_enum;
ALTER TABLE public.registros_sire_cabecera ADD COLUMN IF NOT EXISTS origen public.sire_origen_registro_enum
  NOT NULL DEFAULT 'SUNAT_PROPUESTA';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'registros_sire_cabecera_contribuyente_id_fkey'
  ) THEN
    ALTER TABLE public.registros_sire_cabecera
      ADD CONSTRAINT registros_sire_cabecera_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'registros_sire_cabecera_periodo_id_fkey'
  ) THEN
    ALTER TABLE public.registros_sire_cabecera
      ADD CONSTRAINT registros_sire_cabecera_periodo_id_fkey
      FOREIGN KEY (periodo_id) REFERENCES public.sire_periodos(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sire_cab_contribuyente_periodo
  ON public.registros_sire_cabecera (contribuyente_id, periodo_id);

CREATE INDEX IF NOT EXISTS idx_sire_cab_tipo_registro
  ON public.registros_sire_cabecera (tipo_registro, periodo_id);

-- Backfill contribuyente_id desde ruc
UPDATE public.registros_sire_cabecera c
SET contribuyente_id = co.id
FROM public.contribuyentes co
WHERE c.contribuyente_id IS NULL
  AND co.ruc = c.ruc;

-- Backfill tipo_registro desde tipo legacy
UPDATE public.registros_sire_cabecera
SET tipo_registro = CASE tipo WHEN 'VENTA' THEN 'RVIE'::public.sire_tipo_registro_enum
                              WHEN 'COMPRA' THEN 'RCE'::public.sire_tipo_registro_enum
                              ELSE NULL END
WHERE tipo_registro IS NULL;

-- Backfill periodo_id
INSERT INTO public.sire_periodos (contribuyente_id, periodo, estado_rvie, estado_rce)
SELECT DISTINCT c.contribuyente_id, c.periodo, 'SINCRONIZADO', 'SINCRONIZADO'
FROM public.registros_sire_cabecera c
WHERE c.contribuyente_id IS NOT NULL
ON CONFLICT (contribuyente_id, periodo) DO NOTHING;

UPDATE public.registros_sire_cabecera c
SET periodo_id = sp.id
FROM public.sire_periodos sp
WHERE c.periodo_id IS NULL
  AND c.contribuyente_id = sp.contribuyente_id
  AND c.periodo = sp.periodo;

-- =============================================================================
-- 4. EXTENSIÓN registros_sire_montos — alias columnas módulo 2 (opcional denorm)
-- =============================================================================
ALTER TABLE public.registros_sire_montos ADD COLUMN IF NOT EXISTS base_imponible_gravada numeric(14, 2) DEFAULT 0;
ALTER TABLE public.registros_sire_montos ADD COLUMN IF NOT EXISTS igv_ipm numeric(14, 2) DEFAULT 0;
ALTER TABLE public.registros_sire_montos ADD COLUMN IF NOT EXISTS base_imponible_dgng numeric(14, 2) DEFAULT 0;
ALTER TABLE public.registros_sire_montos ADD COLUMN IF NOT EXISTS igv_dgng numeric(14, 2) DEFAULT 0;
ALTER TABLE public.registros_sire_montos ADD COLUMN IF NOT EXISTS valor_no_gravado numeric(14, 2) DEFAULT 0;
ALTER TABLE public.registros_sire_montos ADD COLUMN IF NOT EXISTS total_comprobante numeric(14, 2) DEFAULT 0;

UPDATE public.registros_sire_montos m
SET
  base_imponible_gravada = COALESCE(m.bi_grav, m.bi_adq_grav, 0),
  igv_ipm = COALESCE(m.igv_grav, m.igv_adq_grav, 0),
  base_imponible_dgng = COALESCE(m.bi_grav_y_no_grav, 0),
  igv_dgng = COALESCE(m.igv_grav_y_no_grav, 0),
  valor_no_gravado = COALESCE(m.valor_no_grav, 0),
  total_comprobante = COALESCE(m.importe_total, 0)
WHERE base_imponible_gravada = 0 AND importe_total > 0;

-- =============================================================================
-- 5. SIRE INCONSISTENCIAS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sire_inconsistencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id uuid NOT NULL,
  tipo_registro public.sire_tipo_registro_enum NOT NULL,
  comprobante_ref text,
  descripcion_error text NOT NULL,
  severidad public.sire_severidad_enum NOT NULL DEFAULT 'ALERTA',
  resuelto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sire_inconsistencias_periodo_id_fkey'
  ) THEN
    ALTER TABLE public.sire_inconsistencias
      ADD CONSTRAINT sire_inconsistencias_periodo_id_fkey
      FOREIGN KEY (periodo_id) REFERENCES public.sire_periodos(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sire_inconsistencias_periodo
  ON public.sire_inconsistencias (periodo_id, resuelto);

DROP TRIGGER IF EXISTS sire_inconsistencias_updated ON public.sire_inconsistencias;
CREATE TRIGGER sire_inconsistencias_updated
  BEFORE UPDATE ON public.sire_inconsistencias
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 6. HELPERS INTERNOS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_sire_tipo_legacy(p_tipo public.sire_tipo_registro_enum)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_tipo WHEN 'RVIE' THEN 'VENTA' WHEN 'RCE' THEN 'COMPRA' END;
$$;

CREATE OR REPLACE FUNCTION public.fn_sire_upsert_periodo(
  p_contribuyente_id uuid,
  p_periodo char(6)
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.sire_periodos (contribuyente_id, periodo)
  VALUES (p_contribuyente_id, p_periodo)
  ON CONFLICT (contribuyente_id, periodo) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- =============================================================================
-- 7. RPC: fn_sincronizar_propuesta_sire
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_sincronizar_propuesta_sire(
  p_contribuyente_id uuid,
  p_periodo varchar,
  p_tipo_registro varchar,
  p_comprobantes jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo char(6);
  v_tipo public.sire_tipo_registro_enum;
  v_tipo_legacy text;
  v_periodo_id uuid;
  v_ruc char(11);
  v_razon text;
  v_item jsonb;
  v_cab_id uuid;
  v_insertados int := 0;
  v_actualizados int := 0;
  v_inconsistencias int := 0;
  v_origen public.sire_origen_registro_enum;
  v_serie text;
  v_numero text;
  v_existente uuid;
BEGIN
  IF coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente %', p_contribuyente_id
      USING ERRCODE = '42501';
  END IF;

  v_periodo := regexp_replace(p_periodo, '\D', '', 'g');
  IF length(v_periodo) <> 6 THEN
    RAISE EXCEPTION 'Periodo inválido: debe ser YYYYMM';
  END IF;

  v_tipo := upper(trim(p_tipo_registro))::public.sire_tipo_registro_enum;
  v_tipo_legacy := public.fn_sire_tipo_legacy(v_tipo);

  SELECT c.ruc, c.razon_social INTO v_ruc, v_razon
  FROM public.contribuyentes c
  WHERE c.id = p_contribuyente_id;

  IF v_ruc IS NULL THEN
    RAISE EXCEPTION 'Contribuyente no encontrado: %', p_contribuyente_id;
  END IF;

  v_periodo_id := public.fn_sire_upsert_periodo(p_contribuyente_id, v_periodo);

  IF jsonb_typeof(p_comprobantes) <> 'array' THEN
    RAISE EXCEPTION 'p_comprobantes debe ser un array JSON';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_comprobantes)
  LOOP
    v_serie := NULLIF(trim(v_item->>'serie'), '');
    v_numero := COALESCE(NULLIF(trim(v_item->>'numero'), ''), 'S/N');

    v_origen := COALESCE(
      NULLIF(upper(trim(v_item->>'origen')), '')::public.sire_origen_registro_enum,
      'SUNAT_PROPUESTA'::public.sire_origen_registro_enum
    );

    IF v_item->>'ruc_contraparte' IS NULL OR length(regexp_replace(v_item->>'ruc_contraparte', '\D', '', 'g')) < 8 THEN
      INSERT INTO public.sire_inconsistencias (
        periodo_id, tipo_registro, comprobante_ref, descripcion_error, severidad
      ) VALUES (
        v_periodo_id, v_tipo,
        concat(COALESCE(v_serie, ''), '-', v_numero),
        'RUC contraparte inválido o ausente',
        'ALERTA'
      );
      v_inconsistencias := v_inconsistencias + 1;
    END IF;

    IF COALESCE((v_item->>'total_comprobante')::numeric, 0) <= 0
       AND COALESCE((v_item->>'base_imponible_gravada')::numeric, 0) <= 0 THEN
      INSERT INTO public.sire_inconsistencias (
        periodo_id, tipo_registro, comprobante_ref, descripcion_error, severidad
      ) VALUES (
        v_periodo_id, v_tipo,
        concat(COALESCE(v_serie, ''), '-', v_numero),
        'Comprobante con montos en cero — verificar propuesta SUNAT',
        'ALERTA'
      );
      v_inconsistencias := v_inconsistencias + 1;
    END IF;

    SELECT c.id INTO v_existente
    FROM public.registros_sire_cabecera c
    WHERE c.contribuyente_id = p_contribuyente_id
      AND c.periodo = v_periodo
      AND c.tipo_registro = v_tipo
      AND c.serie_cdp IS NOT DISTINCT FROM v_serie
      AND c.nro_cdp_inicial = v_numero
    LIMIT 1;

    IF v_existente IS NOT NULL THEN
      UPDATE public.registros_sire_cabecera SET
        origen = v_origen,
        nro_doc_contraparte = regexp_replace(COALESCE(v_item->>'ruc_contraparte', ''), '\D', '', 'g'),
        nombre_contraparte = NULLIF(trim(v_item->>'razon_social_contraparte'), ''),
        fecha_emision = COALESCE((v_item->>'fecha_emision')::date, fecha_emision),
        fecha_vencimiento = CASE
          WHEN v_item->>'fecha_vencimiento' IS NOT NULL AND trim(v_item->>'fecha_vencimiento') <> ''
          THEN (v_item->>'fecha_vencimiento')::date ELSE fecha_vencimiento END,
        cod_tipo_cdp = COALESCE(NULLIF(trim(v_item->>'tipo_comprobante'), ''), cod_tipo_cdp),
        cod_moneda = COALESCE(NULLIF(trim(v_item->>'moneda'), ''), cod_moneda),
        tipo_cambio = COALESCE((v_item->>'tipo_cambio')::numeric, tipo_cambio),
        periodo_id = v_periodo_id,
        updated_at = now()
      WHERE id = v_existente;

      UPDATE public.registros_sire_montos SET
        bi_grav = CASE WHEN v_tipo = 'RVIE' THEN COALESCE((v_item->>'base_imponible_gravada')::numeric, bi_grav) ELSE bi_grav END,
        bi_adq_grav = CASE WHEN v_tipo = 'RCE' THEN COALESCE((v_item->>'base_imponible_gravada')::numeric, bi_adq_grav) ELSE bi_adq_grav END,
        igv_grav = CASE WHEN v_tipo = 'RVIE' THEN COALESCE((v_item->>'igv_ipm')::numeric, igv_grav) ELSE igv_grav END,
        igv_adq_grav = CASE WHEN v_tipo = 'RCE' THEN COALESCE((v_item->>'igv_ipm')::numeric, igv_adq_grav) ELSE igv_adq_grav END,
        bi_grav_y_no_grav = COALESCE((v_item->>'base_imponible_dgng')::numeric, bi_grav_y_no_grav),
        igv_grav_y_no_grav = COALESCE((v_item->>'igv_dgng')::numeric, igv_grav_y_no_grav),
        valor_no_grav = COALESCE((v_item->>'valor_no_gravado')::numeric, valor_no_grav),
        isc = COALESCE((v_item->>'isc')::numeric, isc),
        icbper = COALESCE((v_item->>'icbper')::numeric, icbper),
        otros_tributos = COALESCE((v_item->>'otros_tributos')::numeric, otros_tributos),
        importe_total = COALESCE((v_item->>'total_comprobante')::numeric, importe_total),
        base_imponible_gravada = COALESCE((v_item->>'base_imponible_gravada')::numeric, base_imponible_gravada),
        igv_ipm = COALESCE((v_item->>'igv_ipm')::numeric, igv_ipm),
        base_imponible_dgng = COALESCE((v_item->>'base_imponible_dgng')::numeric, base_imponible_dgng),
        igv_dgng = COALESCE((v_item->>'igv_dgng')::numeric, igv_dgng),
        valor_no_gravado = COALESCE((v_item->>'valor_no_gravado')::numeric, valor_no_gravado),
        total_comprobante = COALESCE((v_item->>'total_comprobante')::numeric, total_comprobante),
        mto_bi_gravada = COALESCE((v_item->>'base_imponible_gravada')::numeric, mto_bi_gravada),
        mto_igv_ipe = COALESCE((v_item->>'igv_ipm')::numeric, mto_igv_ipe),
        mto_total_cp = COALESCE((v_item->>'total_comprobante')::numeric, mto_total_cp),
        updated_at = now()
      WHERE registro_sire_id = v_existente;

      v_actualizados := v_actualizados + 1;
    ELSE
      INSERT INTO public.registros_sire_cabecera (
        tipo, tipo_registro, origen, contribuyente_id, periodo_id,
        ruc, razon_social, periodo,
        fecha_emision, fecha_vencimiento,
        cod_tipo_cdp, serie_cdp, nro_cdp_inicial,
        nro_doc_contraparte, nombre_contraparte,
        cod_moneda, tipo_cambio,
        estado_validacion
      ) VALUES (
        v_tipo_legacy, v_tipo, v_origen, p_contribuyente_id, v_periodo_id,
        v_ruc, v_razon, v_periodo,
        COALESCE((v_item->>'fecha_emision')::date, (v_periodo || '01')::date),
        CASE WHEN v_item->>'fecha_vencimiento' IS NOT NULL AND trim(v_item->>'fecha_vencimiento') <> ''
          THEN (v_item->>'fecha_vencimiento')::date ELSE NULL END,
        COALESCE(NULLIF(trim(v_item->>'tipo_comprobante'), ''), '01'),
        v_serie,
        v_numero,
        regexp_replace(COALESCE(v_item->>'ruc_contraparte', ''), '\D', '', 'g'),
        NULLIF(trim(v_item->>'razon_social_contraparte'), ''),
        COALESCE(NULLIF(trim(v_item->>'moneda'), ''), 'PEN'),
        COALESCE((v_item->>'tipo_cambio')::numeric, 1.000),
        'pendiente'
      )
      RETURNING id INTO v_cab_id;

      INSERT INTO public.registros_sire_montos (
        registro_sire_id,
        bi_grav, igv_grav, bi_adq_grav, igv_adq_grav,
        bi_grav_y_no_grav, igv_grav_y_no_grav, valor_no_grav,
        isc, icbper, otros_tributos, importe_total,
        base_imponible_gravada, igv_ipm, base_imponible_dgng, igv_dgng,
        valor_no_gravado, total_comprobante,
        mto_bi_gravada, mto_igv_ipe, mto_total_cp
      ) VALUES (
        v_cab_id,
        CASE WHEN v_tipo = 'RVIE' THEN COALESCE((v_item->>'base_imponible_gravada')::numeric, 0) ELSE 0 END,
        CASE WHEN v_tipo = 'RVIE' THEN COALESCE((v_item->>'igv_ipm')::numeric, 0) ELSE 0 END,
        CASE WHEN v_tipo = 'RCE' THEN COALESCE((v_item->>'base_imponible_gravada')::numeric, 0) ELSE 0 END,
        CASE WHEN v_tipo = 'RCE' THEN COALESCE((v_item->>'igv_ipm')::numeric, 0) ELSE 0 END,
        COALESCE((v_item->>'base_imponible_dgng')::numeric, 0),
        COALESCE((v_item->>'igv_dgng')::numeric, 0),
        COALESCE((v_item->>'valor_no_gravado')::numeric, 0),
        COALESCE((v_item->>'isc')::numeric, 0),
        COALESCE((v_item->>'icbper')::numeric, 0),
        COALESCE((v_item->>'otros_tributos')::numeric, 0),
        COALESCE((v_item->>'total_comprobante')::numeric, 0),
        COALESCE((v_item->>'base_imponible_gravada')::numeric, 0),
        COALESCE((v_item->>'igv_ipm')::numeric, 0),
        COALESCE((v_item->>'base_imponible_dgng')::numeric, 0),
        COALESCE((v_item->>'igv_dgng')::numeric, 0),
        COALESCE((v_item->>'valor_no_gravado')::numeric, 0),
        COALESCE((v_item->>'total_comprobante')::numeric, 0),
        COALESCE((v_item->>'base_imponible_gravada')::numeric, 0),
        COALESCE((v_item->>'igv_ipm')::numeric, 0),
        COALESCE((v_item->>'total_comprobante')::numeric, 0)
      );

      v_insertados := v_insertados + 1;
    END IF;
  END LOOP;

  UPDATE public.sire_periodos sp SET
    estado_rvie = CASE WHEN v_tipo = 'RVIE' THEN
      CASE WHEN v_inconsistencias > 0 THEN 'CON_INCONSISTENCIAS'::public.sire_estado_periodo_enum
           WHEN v_insertados + v_actualizados = 0 THEN 'VACIO'::public.sire_estado_periodo_enum
           ELSE 'SINCRONIZADO'::public.sire_estado_periodo_enum END
      ELSE estado_rvie END,
    estado_rce = CASE WHEN v_tipo = 'RCE' THEN
      CASE WHEN v_inconsistencias > 0 THEN 'CON_INCONSISTENCIAS'::public.sire_estado_periodo_enum
           WHEN v_insertados + v_actualizados = 0 THEN 'VACIO'::public.sire_estado_periodo_enum
           ELSE 'SINCRONIZADO'::public.sire_estado_periodo_enum END
      ELSE estado_rce END,
    total_ventas_soles = CASE WHEN v_tipo = 'RVIE' THEN (
      SELECT COALESCE(SUM(m.importe_total), 0)
      FROM public.registros_sire_cabecera c
      INNER JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
      WHERE c.periodo_id = v_periodo_id AND c.tipo_registro = 'RVIE'
    ) ELSE total_ventas_soles END,
    total_compras_soles = CASE WHEN v_tipo = 'RCE' THEN (
      SELECT COALESCE(SUM(m.importe_total), 0)
      FROM public.registros_sire_cabecera c
      INNER JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
      WHERE c.periodo_id = v_periodo_id AND c.tipo_registro = 'RCE'
    ) ELSE total_compras_soles END,
    fecha_sincronizacion = now(),
    updated_at = now()
  WHERE sp.id = v_periodo_id;

  RETURN jsonb_build_object(
    'ok', true,
    'contribuyente_id', p_contribuyente_id,
    'periodo', v_periodo,
    'tipo_registro', v_tipo,
    'periodo_id', v_periodo_id,
    'insertados', v_insertados,
    'actualizados', v_actualizados,
    'inconsistencias', v_inconsistencias
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_sincronizar_propuesta_sire(uuid, varchar, varchar, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_sincronizar_propuesta_sire(uuid, varchar, varchar, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_sincronizar_propuesta_sire(uuid, varchar, varchar, jsonb) TO service_role;

-- =============================================================================
-- 8. RPC: fn_obtener_resumen_sire_periodo
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_obtener_resumen_sire_periodo(
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
  v_periodo_id uuid;
  v_ruc char(11);
  v_rvie record;
  v_rce record;
  v_alertas int;
  v_errores int;
  v_fecha_sync timestamptz;
BEGIN
  IF coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente %', p_contribuyente_id
      USING ERRCODE = '42501';
  END IF;

  v_periodo := regexp_replace(p_periodo, '\D', '', 'g');

  SELECT c.ruc INTO v_ruc FROM public.contribuyentes c WHERE c.id = p_contribuyente_id;

  SELECT sp.id, sp.fecha_sincronizacion
  INTO v_periodo_id, v_fecha_sync
  FROM public.sire_periodos sp
  WHERE sp.contribuyente_id = p_contribuyente_id AND sp.periodo = v_periodo;

  SELECT
    COUNT(*)::int AS cantidad,
    COALESCE(SUM(COALESCE(m.base_imponible_gravada, m.bi_grav, m.bi_adq_grav, 0)), 0) AS base,
    COALESCE(SUM(COALESCE(m.igv_ipm, m.igv_grav, m.igv_adq_grav, 0)), 0) AS igv,
    COALESCE(SUM(COALESCE(m.total_comprobante, m.importe_total, 0)), 0) AS total
  INTO v_rvie
  FROM public.registros_sire_cabecera c
  LEFT JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
  WHERE c.contribuyente_id = p_contribuyente_id
    AND c.periodo = v_periodo
    AND c.tipo_registro = 'RVIE';

  SELECT
    COUNT(*)::int AS cantidad,
    COALESCE(SUM(COALESCE(m.base_imponible_gravada, m.bi_adq_grav, m.bi_grav, 0)), 0) AS base,
    COALESCE(SUM(COALESCE(m.igv_ipm, m.igv_adq_grav, m.igv_grav, 0)), 0) AS igv,
    COALESCE(SUM(COALESCE(m.total_comprobante, m.importe_total, 0)), 0) AS total
  INTO v_rce
  FROM public.registros_sire_cabecera c
  LEFT JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
  WHERE c.contribuyente_id = p_contribuyente_id
    AND c.periodo = v_periodo
    AND c.tipo_registro = 'RCE';

  SELECT
    COUNT(*) FILTER (WHERE severidad = 'ALERTA' AND NOT resuelto),
    COUNT(*) FILTER (WHERE severidad = 'ERROR_BLOQUEANTE' AND NOT resuelto)
  INTO v_alertas, v_errores
  FROM public.sire_inconsistencias si
  WHERE si.periodo_id = v_periodo_id;

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'ruc', v_ruc,
    'periodo', v_periodo,
    'periodo_id', v_periodo_id,
    'rvie', jsonb_build_object(
      'estado', COALESCE((
        SELECT sp.estado_rvie FROM public.sire_periodos sp WHERE sp.id = v_periodo_id
      ), 'PENDIENTE'),
      'cantidad_comprobantes', COALESCE(v_rvie.cantidad, 0),
      'base_imponible', COALESCE(v_rvie.base, 0),
      'igv', COALESCE(v_rvie.igv, 0),
      'total', COALESCE(v_rvie.total, 0)
    ),
    'rce', jsonb_build_object(
      'estado', COALESCE((
        SELECT sp.estado_rce FROM public.sire_periodos sp WHERE sp.id = v_periodo_id
      ), 'PENDIENTE'),
      'cantidad_comprobantes', COALESCE(v_rce.cantidad, 0),
      'base_imponible', COALESCE(v_rce.base, 0),
      'igv', COALESCE(v_rce.igv, 0),
      'total', COALESCE(v_rce.total, 0)
    ),
    'inconsistencias', jsonb_build_object(
      'alertas', COALESCE(v_alertas, 0),
      'errores_bloqueantes', COALESCE(v_errores, 0),
      'total', COALESCE(v_alertas, 0) + COALESCE(v_errores, 0)
    ),
    'fecha_sincronizacion', v_fecha_sync
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_obtener_resumen_sire_periodo(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_obtener_resumen_sire_periodo(uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_obtener_resumen_sire_periodo(uuid, varchar) TO service_role;

-- =============================================================================
-- 9. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.sire_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sire_inconsistencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sire_periodos select" ON public.sire_periodos;
DROP POLICY IF EXISTS "sire_periodos insert" ON public.sire_periodos;
DROP POLICY IF EXISTS "sire_periodos update" ON public.sire_periodos;
DROP POLICY IF EXISTS "sire_periodos delete" ON public.sire_periodos;

CREATE POLICY "sire_periodos select" ON public.sire_periodos
  FOR SELECT TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id));

CREATE POLICY "sire_periodos insert" ON public.sire_periodos
  FOR INSERT TO authenticated
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

CREATE POLICY "sire_periodos update" ON public.sire_periodos
  FOR UPDATE TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id));

CREATE POLICY "sire_periodos delete" ON public.sire_periodos
  FOR DELETE TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS "sire_inconsistencias select" ON public.sire_inconsistencias;
DROP POLICY IF EXISTS "sire_inconsistencias insert" ON public.sire_inconsistencias;
DROP POLICY IF EXISTS "sire_inconsistencias update" ON public.sire_inconsistencias;

CREATE POLICY "sire_inconsistencias select" ON public.sire_inconsistencias
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sire_periodos sp
      WHERE sp.id = sire_inconsistencias.periodo_id
        AND public.fn_user_can_access_contribuyente(sp.contribuyente_id)
    )
  );

CREATE POLICY "sire_inconsistencias insert" ON public.sire_inconsistencias
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sire_periodos sp
      WHERE sp.id = sire_inconsistencias.periodo_id
        AND public.fn_user_can_access_contribuyente(sp.contribuyente_id)
    )
  );

CREATE POLICY "sire_inconsistencias update" ON public.sire_inconsistencias
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sire_periodos sp
      WHERE sp.id = sire_inconsistencias.periodo_id
        AND public.fn_user_can_access_contribuyente(sp.contribuyente_id)
    )
  );

-- Reemplazar políticas abiertas en cabecera/montos por multi-tenant (si existen)
DROP POLICY IF EXISTS "auth_all_select registros_sire_cabecera" ON public.registros_sire_cabecera;
DROP POLICY IF EXISTS "auth_all_insert registros_sire_cabecera" ON public.registros_sire_cabecera;
DROP POLICY IF EXISTS "auth_all_update registros_sire_cabecera" ON public.registros_sire_cabecera;
DROP POLICY IF EXISTS "auth_all_delete registros_sire_cabecera" ON public.registros_sire_cabecera;
DROP POLICY IF EXISTS "sire_cabecera select estudio" ON public.registros_sire_cabecera;
DROP POLICY IF EXISTS "sire_cabecera insert estudio" ON public.registros_sire_cabecera;
DROP POLICY IF EXISTS "sire_cabecera update estudio" ON public.registros_sire_cabecera;
DROP POLICY IF EXISTS "sire_cabecera delete estudio" ON public.registros_sire_cabecera;

CREATE POLICY "sire_cabecera select estudio" ON public.registros_sire_cabecera
  FOR SELECT TO authenticated
  USING (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

CREATE POLICY "sire_cabecera insert estudio" ON public.registros_sire_cabecera
  FOR INSERT TO authenticated
  WITH CHECK (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

CREATE POLICY "sire_cabecera update estudio" ON public.registros_sire_cabecera
  FOR UPDATE TO authenticated
  USING (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

CREATE POLICY "sire_cabecera delete estudio" ON public.registros_sire_cabecera
  FOR DELETE TO authenticated
  USING (
    contribuyente_id IS NOT NULL
    AND public.fn_user_can_access_contribuyente(contribuyente_id)
  );

DROP POLICY IF EXISTS "auth_all_select registros_sire_montos" ON public.registros_sire_montos;
DROP POLICY IF EXISTS "auth_all_insert registros_sire_montos" ON public.registros_sire_montos;
DROP POLICY IF EXISTS "auth_all_update registros_sire_montos" ON public.registros_sire_montos;
DROP POLICY IF EXISTS "auth_all_delete registros_sire_montos" ON public.registros_sire_montos;
DROP POLICY IF EXISTS "sire_montos select estudio" ON public.registros_sire_montos;
DROP POLICY IF EXISTS "sire_montos insert estudio" ON public.registros_sire_montos;
DROP POLICY IF EXISTS "sire_montos update estudio" ON public.registros_sire_montos;
DROP POLICY IF EXISTS "sire_montos delete estudio" ON public.registros_sire_montos;

CREATE POLICY "sire_montos select estudio" ON public.registros_sire_montos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.registros_sire_cabecera c
      WHERE c.id = registros_sire_montos.registro_sire_id
        AND c.contribuyente_id IS NOT NULL
        AND public.fn_user_can_access_contribuyente(c.contribuyente_id)
    )
  );

CREATE POLICY "sire_montos insert estudio" ON public.registros_sire_montos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registros_sire_cabecera c
      WHERE c.id = registros_sire_montos.registro_sire_id
        AND c.contribuyente_id IS NOT NULL
        AND public.fn_user_can_access_contribuyente(c.contribuyente_id)
    )
  );

CREATE POLICY "sire_montos update estudio" ON public.registros_sire_montos
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.registros_sire_cabecera c
      WHERE c.id = registros_sire_montos.registro_sire_id
        AND c.contribuyente_id IS NOT NULL
        AND public.fn_user_can_access_contribuyente(c.contribuyente_id)
    )
  );

CREATE POLICY "sire_montos delete estudio" ON public.registros_sire_montos
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.registros_sire_cabecera c
      WHERE c.id = registros_sire_montos.registro_sire_id
        AND c.contribuyente_id IS NOT NULL
        AND public.fn_user_can_access_contribuyente(c.contribuyente_id)
    )
  );
