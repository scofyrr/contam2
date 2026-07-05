-- PCGE Peruano: códigos secuenciales SIN PUNTOS (Resolución CONASEV / PCGE 2026)
-- Idempotente · incluye plan de rollback al final

-- ============================================================
-- 1. COLUMNAS Y EXTENSIÓN
-- ============================================================
ALTER TABLE public.plan_contable_pcge
  ALTER COLUMN codigo_cuenta TYPE varchar(10);

ALTER TABLE public.plan_contable_pcge
  ADD COLUMN IF NOT EXISTS padre_codigo varchar(20),
  ADD COLUMN IF NOT EXISTS es_agrupador boolean NOT NULL DEFAULT false;

ALTER TABLE public.auditoria_cambios 
  ALTER COLUMN registro_id TYPE text,
  ALTER COLUMN tabla_afectada DROP NOT NULL,
  ALTER COLUMN accion DROP NOT NULL;

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

    IF EXISTS (SELECT 1 FROM public.plan_contable_pcge WHERE codigo_cuenta = v_new) THEN
      UPDATE public.plan_contable_pcge 
      SET nombre_cuenta = r.nombre_cuenta,
          nivel = r.nivel,
          updated_at = now()
      WHERE codigo_cuenta = v_new;
    ELSE
      INSERT INTO public.plan_contable_pcge (
        codigo_cuenta, nombre_cuenta, nivel, activo, naturaleza, padre_codigo,
        tipo_cuenta, aplica_para, palabras_clave, created_at, updated_at
      ) VALUES (
        v_new, r.nombre_cuenta, r.nivel, r.activo, r.naturaleza,
        CASE WHEN r.padre_codigo IS NOT NULL THEN public.pcge_strip_dots(r.padre_codigo) ELSE NULL END,
        r.tipo_cuenta, r.aplica_para, r.palabras_clave, r.created_at, r.updated_at
      );
    END IF;

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
DO $$
DECLARE
  v_caja_values jsonb := '[
    {"c": "1", "n": "ACTIVO", "lvl": 1, "agr": true, "nat": "deudora"},
    {"c": "10", "n": "EFECTIVO Y EQUIVALENTES DE EFECTIVO", "lvl": 2, "agr": true, "nat": "deudora"},
    {"c": "101", "n": "CAJA", "lvl": 3, "agr": true, "nat": "deudora"},
    {"c": "1011", "n": "CAJA", "lvl": 4, "agr": true, "nat": "deudora"},
    {"c": "101101", "n": "CAJA", "lvl": 5, "agr": false, "nat": "deudora"},
    {"c": "104", "n": "CUENTAS CORRIENTES EN INSTITUCIONES FINANCIERAS", "lvl": 3, "agr": true, "nat": "deudora"},
    {"c": "1041", "n": "CUENTAS CORRIENTES EN INSTITUCIONES FINANCIERAS", "lvl": 4, "agr": true, "nat": "deudora"},
    {"c": "104101", "n": "CUENTAS CORRIENTES OPERATIVAS", "lvl": 5, "agr": false, "nat": "deudora"},
    {"c": "12", "n": "CUENTAS POR COBRAR COMERCIALES – TERCEROS", "lvl": 2, "agr": true, "nat": "deudora"},
    {"c": "121", "n": "FACTURAS, BOLETAS Y OTROS COMPROBANTES POR COBRAR", "lvl": 3, "agr": true, "nat": "deudora"},
    {"c": "1212", "n": "FACTURAS, BOLETAS Y OTROS COMPROBANTES POR COBRAR", "lvl": 4, "agr": true, "nat": "deudora"},
    {"c": "121201", "n": "FACTURAS POR COBRAR", "lvl": 5, "agr": false, "nat": "deudora"},
    {"c": "2", "n": "PASIVO", "lvl": 1, "agr": true, "nat": "acreedora"},
    {"c": "40", "n": "TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR", "lvl": 2, "agr": true, "nat": "acreedora"},
    {"c": "401", "n": "GOBIERNO CENTRAL", "lvl": 3, "agr": true, "nat": "acreedora"},
    {"c": "4011", "n": "IMPUESTO GENERAL A LAS VENTAS", "lvl": 4, "agr": true, "nat": "acreedora"},
    {"c": "40111", "n": "IGV", "lvl": 5, "agr": false, "nat": "acreedora"},
    {"c": "42", "n": "CUENTAS POR PAGAR COMERCIALES – TERCEROS", "lvl": 2, "agr": true, "nat": "acreedora"},
    {"c": "421", "n": "FACTURAS, BOLETAS Y OTROS COMPROBANTES POR PAGAR", "lvl": 3, "agr": true, "nat": "acreedora"},
    {"c": "4212", "n": "FACTURAS, BOLETAS Y OTROS COMPROBANTES POR PAGAR", "lvl": 4, "agr": true, "nat": "acreedora"},
    {"c": "421201", "n": "FACTURAS POR PAGAR", "lvl": 5, "agr": false, "nat": "acreedora"},
    {"c": "6", "n": "COSTO DE VENTAS", "lvl": 1, "agr": true, "nat": "deudora"},
    {"c": "60", "n": "COMPRAS", "lvl": 2, "agr": true, "nat": "deudora"},
    {"c": "601", "n": "MERCADERÍAS", "lvl": 3, "agr": true, "nat": "deudora"},
    {"c": "6011", "n": "MERCADERÍAS", "lvl": 4, "agr": true, "nat": "deudora"},
    {"c": "601101", "n": "MERCADERÍAS", "lvl": 5, "agr": false, "nat": "deudora"},
    {"c": "7", "n": "INGRESOS", "lvl": 1, "agr": true, "nat": "acreedora"},
    {"c": "70", "n": "VENTAS", "lvl": 2, "agr": true, "nat": "acreedora"},
    {"c": "701", "n": "MERCADERÍAS", "lvl": 3, "agr": true, "nat": "acreedora"},
    {"c": "7011", "n": "MERCADERÍAS", "lvl": 4, "agr": true, "nat": "acreedora"},
    {"c": "701111", "n": "VENTAS DE MERCADERÍAS", "lvl": 5, "agr": false, "nat": "acreedora"}
  ]'::jsonb;
  v_item jsonb;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_caja_values)
  LOOP
    IF EXISTS (SELECT 1 FROM public.plan_contable_pcge WHERE codigo_cuenta = v_item->>'c') THEN
      UPDATE public.plan_contable_pcge
      SET nombre_cuenta = v_item->>'n',
          nivel = (v_item->>'lvl')::int,
          es_agrupador = (v_item->>'agr')::boolean,
          naturaleza = upper(v_item->>'nat'),
          padre_codigo = public.pcge_padre_desde_codigo(v_item->>'c'),
          updated_at = now()
      WHERE codigo_cuenta = v_item->>'c';
    ELSE
      INSERT INTO public.plan_contable_pcge (codigo_cuenta, nombre_cuenta, nivel, es_agrupador, activo, naturaleza, padre_codigo)
      VALUES (
        v_item->>'c',
        v_item->>'n',
        (v_item->>'lvl')::int,
        (v_item->>'agr')::boolean,
        true,
        upper(v_item->>'nat'),
        public.pcge_padre_desde_codigo(v_item->>'c')
      );
    END IF;
  END LOOP;
END $$;

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
