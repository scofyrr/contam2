-- PCGE Peruano: códigos secuenciales SIN PUNTOS (Resolución CONASEV / PCGE 2026)
-- Idempotente · incluye plan de rollback al final

-- ============================================================
-- 1. COLUMNAS Y EXTENSIÓN
-- ============================================================
ALTER TABLE public.plan_contable_pcge
  ALTER COLUMN codigo_cuenta TYPE varchar(10);

ALTER TABLE public.plan_contable_pcge
  ADD COLUMN IF NOT EXISTS es_agrupador boolean NOT NULL DEFAULT false;

-- ============================================================
-- 2. NORMALIZAR CÓDIGOS EXISTENTES (eliminar puntos)
-- ============================================================
CREATE OR REPLACE FUNCTION public.pcge_strip_dots(p_codigo text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(trim(COALESCE(p_codigo, '')), '\.', '', 'g');
$$;

-- Migrar PKs con puntos: insertar nuevo código, actualizar hijos y referencias
DO $$
DECLARE
  r RECORD;
  v_new text;
BEGIN
  FOR r IN
    SELECT codigo_cuenta, nombre_cuenta, nivel, activo, naturaleza, padre_codigo,
           tipo_cuenta, aplica_para, palabras_clave, created_at, updated_at
    FROM public.plan_contable_pcge
    WHERE codigo_cuenta ~ '\.'
    ORDER BY length(codigo_cuenta) DESC
  LOOP
    v_new := public.pcge_strip_dots(r.codigo_cuenta);
    IF v_new = r.codigo_cuenta OR v_new = '' THEN
      CONTINUE;
    END IF;

    INSERT INTO public.plan_contable_pcge (
      codigo_cuenta, nombre_cuenta, nivel, activo, naturaleza, padre_codigo,
      tipo_cuenta, aplica_para, palabras_clave, created_at, updated_at
    ) VALUES (
      v_new, r.nombre_cuenta, r.nivel, r.activo, r.naturaleza,
      CASE WHEN r.padre_codigo IS NOT NULL THEN public.pcge_strip_dots(r.padre_codigo) ELSE NULL END,
      r.tipo_cuenta, r.aplica_para, r.palabras_clave, r.created_at, r.updated_at
    )
    ON CONFLICT (codigo_cuenta) DO UPDATE SET
      nombre_cuenta = EXCLUDED.nombre_cuenta,
      nivel = EXCLUDED.nivel,
      updated_at = now();

    UPDATE public.plan_contable_pcge
    SET padre_codigo = v_new
    WHERE padre_codigo = r.codigo_cuenta;

    UPDATE public.registros_sire SET cuenta_pcge = v_new WHERE cuenta_pcge = r.codigo_cuenta;
    UPDATE public.registros_sire_cabecera SET cuenta_pcge = v_new WHERE cuenta_pcge = r.codigo_cuenta;
    UPDATE public.asientos_contables SET cuenta_contable = v_new WHERE cuenta_contable = r.codigo_cuenta;
    UPDATE public.movimientos_caja SET cuenta_contable = v_new WHERE cuenta_contable = r.codigo_cuenta;
    UPDATE public.config_contable
    SET cuenta_caja_default = v_new WHERE cuenta_caja_default = r.codigo_cuenta;
    UPDATE public.config_contable
    SET cuenta_cxc_default = v_new WHERE cuenta_cxc_default = r.codigo_cuenta;
    UPDATE public.config_contable
    SET cuenta_cxp_default = v_new WHERE cuenta_cxp_default = r.codigo_cuenta;

    DELETE FROM public.plan_contable_pcge WHERE codigo_cuenta = r.codigo_cuenta;
  END LOOP;
END $$;

-- Normalizar referencias en tablas operativas
UPDATE public.asientos_contables
SET cuenta_contable = public.pcge_strip_dots(cuenta_contable)
WHERE cuenta_contable ~ '\.';

UPDATE public.movimientos_caja
SET cuenta_contable = public.pcge_strip_dots(cuenta_contable)
WHERE cuenta_contable ~ '\.';

UPDATE public.cuentas_financieras
SET cuenta_contable = public.pcge_strip_dots(cuenta_contable)
WHERE cuenta_contable ~ '\.';

-- ============================================================
-- 3. FUNCIÓN NIVEL PCGE PERUANO
-- ============================================================
CREATE OR REPLACE FUNCTION public.pcge_nivel_desde_codigo(p_codigo text)
RETURNS smallint
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE length(public.pcge_strip_dots(p_codigo))
    WHEN 1 THEN 1
    WHEN 2 THEN 2
    WHEN 3 THEN 3
    WHEN 4 THEN 4
    WHEN 5 THEN 4
    WHEN 6 THEN 5
    ELSE 6
  END::smallint;
$$;

CREATE OR REPLACE FUNCTION public.pcge_padre_desde_codigo(p_codigo text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE length(c)
    WHEN 0 THEN NULL
    WHEN 1 THEN NULL
    WHEN 2 THEN left(c, 1)
    WHEN 3 THEN left(c, 2)
    WHEN 4 THEN left(c, 3)
    WHEN 5 THEN left(c, 3)
    WHEN 6 THEN left(c, 4)
    WHEN 7 THEN left(c, 6)
    WHEN 8 THEN left(c, 6)
    ELSE left(c, 6)
  END
  FROM (SELECT public.pcge_strip_dots(p_codigo) AS c) s;
$$;

-- ============================================================
-- 4. GENERAR CÓDIGO HIJO
-- ============================================================
CREATE OR REPLACE FUNCTION public.generar_codigo_pcge(p_codigo_padre text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_padre text := public.pcge_strip_dots(p_codigo_padre);
  v_len int;
  v_next_len int;
  v_max text;
  v_num bigint;
  v_new text;
BEGIN
  IF v_padre IS NULL OR v_padre = '' THEN
    SELECT COALESCE(max(codigo_cuenta), '0') INTO v_max
    FROM plan_contable_pcge WHERE length(codigo_cuenta) = 1;
    v_num := COALESCE(v_max::bigint, 0) + 1;
  RETURN lpad(v_num::text, 1, '0');
  END IF;

  v_len := length(v_padre);
  v_next_len := CASE v_len
    WHEN 1 THEN 2
    WHEN 2 THEN 3
    WHEN 3 THEN 4
    WHEN 4 THEN 6
    WHEN 6 THEN 8
    ELSE NULL
  END;

  IF v_next_len IS NULL THEN
    RAISE EXCEPTION 'No se puede generar hijo para código % (nivel máximo alcanzado)', v_padre;
  END IF;

  SELECT max(codigo_cuenta) INTO v_max
  FROM plan_contable_pcge
  WHERE codigo_cuenta LIKE v_padre || '%'
    AND length(codigo_cuenta) = v_next_len;

  IF v_max IS NULL THEN
    v_new := v_padre || lpad('1', v_next_len - v_len, '0');
  ELSE
    v_num := v_max::bigint + 1;
    v_new := lpad(v_num::text, v_next_len, '0');
  END IF;

  RETURN v_new;
END;
$$;

-- ============================================================
-- 5. SINCRONIZAR NIVEL, PADRE Y AGRUPADOR
-- ============================================================
UPDATE public.plan_contable_pcge
SET
  nivel = public.pcge_nivel_desde_codigo(codigo_cuenta),
  padre_codigo = public.pcge_padre_desde_codigo(codigo_cuenta),
  codigo_cuenta = public.pcge_strip_dots(codigo_cuenta);

UPDATE public.plan_contable_pcge p
SET es_agrupador = EXISTS (
  SELECT 1 FROM public.plan_contable_pcge h
  WHERE h.padre_codigo = p.codigo_cuenta
);

-- ============================================================
-- 6. VISTA JERÁRQUICA
-- ============================================================
CREATE OR REPLACE VIEW public.v_pcge_jerarquico AS
SELECT
  p.codigo_cuenta,
  p.nombre_cuenta,
  p.nivel,
  p.padre_codigo,
  p.es_agrupador,
  p.activo,
  p.naturaleza,
  p.tipo_cuenta,
  pad.nombre_cuenta AS nombre_padre,
  repeat('  ', GREATEST(p.nivel - 1, 0)) || p.codigo_cuenta || ' — ' || p.nombre_cuenta AS ruta_visual
FROM public.plan_contable_pcge p
LEFT JOIN public.plan_contable_pcge pad ON pad.codigo_cuenta = p.padre_codigo
ORDER BY p.codigo_cuenta;

-- ============================================================
-- 7. DATOS INICIALES — CLASES Y DIVISIONES PCGE 2026
-- ============================================================
INSERT INTO public.plan_contable_pcge (codigo_cuenta, nombre_cuenta, nivel, es_agrupador, activo, naturaleza) VALUES
  ('1', 'ACTIVO', 1, true, true, 'deudora'),
  ('10', 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', 2, true, true, 'deudora'),
  ('101', 'CAJA', 3, true, true, 'deudora'),
  ('1011', 'CAJA', 4, true, true, 'deudora'),
  ('101101', 'CAJA', 5, false, true, 'deudora'),
  ('104', 'CUENTAS CORRIENTES EN INSTITUCIONES FINANCIERAS', 3, true, true, 'deudora'),
  ('1041', 'CUENTAS CORRIENTES EN INSTITUCIONES FINANCIERAS', 4, true, true, 'deudora'),
  ('104101', 'CUENTAS CORRIENTES OPERATIVAS', 5, false, true, 'deudora'),
  ('12', 'CUENTAS POR COBRAR COMERCIALES – TERCEROS', 2, true, true, 'deudora'),
  ('121', 'FACTURAS, BOLETAS Y OTROS COMPROBANTES POR COBRAR', 3, true, true, 'deudora'),
  ('1212', 'FACTURAS, BOLETAS Y OTROS COMPROBANTES POR COBRAR', 4, true, true, 'deudora'),
  ('121201', 'FACTURAS POR COBRAR', 5, false, true, 'deudora'),
  ('2', 'PASIVO', 1, true, true, 'acreedora'),
  ('40', 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR', 2, true, true, 'acreedora'),
  ('401', 'GOBIERNO CENTRAL', 3, true, true, 'acreedora'),
  ('4011', 'IMPUESTO GENERAL A LAS VENTAS', 4, true, true, 'acreedora'),
  ('40111', 'IGV', 5, false, true, 'acreedora'),
  ('42', 'CUENTAS POR PAGAR COMERCIALES – TERCEROS', 2, true, true, 'acreedora'),
  ('421', 'FACTURAS, BOLETAS Y OTROS COMPROBANTES POR PAGAR', 3, true, true, 'acreedora'),
  ('4212', 'FACTURAS, BOLETAS Y OTROS COMPROBANTES POR PAGAR', 4, true, true, 'acreedora'),
  ('421201', 'FACTURAS POR PAGAR', 5, false, true, 'acreedora'),
  ('6', 'COSTO DE VENTAS', 1, true, true, 'deudora'),
  ('60', 'COMPRAS', 2, true, true, 'deudora'),
  ('601', 'MERCADERÍAS', 3, true, true, 'deudora'),
  ('6011', 'MERCADERÍAS', 4, true, true, 'deudora'),
  ('601101', 'MERCADERÍAS', 5, false, true, 'deudora'),
  ('7', 'INGRESOS', 1, true, true, 'acreedora'),
  ('70', 'VENTAS', 2, true, true, 'acreedora'),
  ('701', 'MERCADERÍAS', 3, true, true, 'acreedora'),
  ('7011', 'MERCADERÍAS', 4, true, true, 'acreedora'),
  ('701111', 'VENTAS DE MERCADERÍAS', 5, false, true, 'acreedora')
ON CONFLICT (codigo_cuenta) DO UPDATE SET
  nombre_cuenta = EXCLUDED.nombre_cuenta,
  nivel = EXCLUDED.nivel,
  es_agrupador = EXCLUDED.es_agrupador,
  naturaleza = EXCLUDED.naturaleza,
  padre_codigo = public.pcge_padre_desde_codigo(EXCLUDED.codigo_cuenta),
  updated_at = now();

UPDATE public.config_contable
SET cuenta_caja_default = '101101'
WHERE cuenta_caja_default IN ('104101', '101', '10') OR cuenta_caja_default IS NULL;

CREATE INDEX IF NOT EXISTS idx_plan_pcge_nivel ON public.plan_contable_pcge(nivel);
CREATE INDEX IF NOT EXISTS idx_plan_pcge_es_agrupador ON public.plan_contable_pcge(es_agrupador);

GRANT SELECT ON public.v_pcge_jerarquico TO authenticated;
GRANT EXECUTE ON FUNCTION public.generar_codigo_pcge(text) TO authenticated;

-- ROLLBACK (manual):
-- DROP VIEW IF EXISTS public.v_pcge_jerarquico;
-- DROP FUNCTION IF EXISTS public.generar_codigo_pcge(text);
-- DROP FUNCTION IF EXISTS public.pcge_padre_desde_codigo(text);
-- DROP FUNCTION IF EXISTS public.pcge_nivel_desde_codigo(text);
-- DROP FUNCTION IF EXISTS public.pcge_strip_dots(text);
-- ALTER TABLE public.plan_contable_pcge DROP COLUMN IF EXISTS es_agrupador;
