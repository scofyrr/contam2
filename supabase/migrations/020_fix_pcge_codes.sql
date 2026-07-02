-- PCGE: corrección masiva de códigos + validación en BD
-- Idempotente · alinea con reglas TypeScript pcge-validator

-- ============================================================
-- A. Tabla temporal de log (persistente para auditoría)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pcge_fix_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_anterior text,
  codigo_nuevo text,
  accion text NOT NULL,
  detalle jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pcge_fix_log_created ON public.pcge_fix_log(created_at DESC);

-- ============================================================
-- Función validación SQL (espejo de TypeScript)
-- ============================================================
CREATE OR REPLACE FUNCTION public.pcge_validar_codigo(
  p_codigo text,
  p_padre text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_c text := public.pcge_strip_dots(p_codigo);
  v_padre text := NULLIF(public.pcge_strip_dots(p_padre), '');
  v_len int;
  v_padre_esperado text;
  v_errors text[] := '{}';
BEGIN
  IF v_c IS NULL OR v_c = '' THEN
    v_errors := array_append(v_errors, 'El código de cuenta es obligatorio');
  ELSIF v_c !~ '^[0-9]+$' THEN
    v_errors := array_append(v_errors, 'Solo se permiten dígitos');
  ELSE
    v_len := length(v_c);
    IF v_len < 1 OR v_len > 8 THEN
      v_errors := array_append(v_errors, format('Longitud %s inválida (1-8 dígitos)', v_len));
    ELSIF v_len NOT IN (1, 2, 3, 4, 6, 8) THEN
      v_errors := array_append(v_errors, format('Longitud %s no es nivel PCGE válido', v_len));
    END IF;
    v_padre_esperado := public.pcge_padre_desde_codigo(v_c);
    IF v_padre IS NOT NULL AND NOT v_c LIKE v_padre || '%' THEN
      v_errors := array_append(v_errors, format('Debe comenzar con prefijo del padre %s', v_padre));
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'valid', COALESCE(array_length(v_errors, 1), 0) = 0,
    'codigo', v_c,
    'nivel', public.pcge_nivel_desde_codigo(v_c),
    'padre_esperado', v_padre_esperado,
    'errors', to_jsonb(v_errors)
  );
END;
$$;

-- ============================================================
-- A. validate_and_fix_all_pcge_codes
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_and_fix_all_pcge_codes(p_dry_run boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_new text;
  v_fixed int := 0;
  v_orphans int := 0;
  v_dupes int := 0;
  v_invalid int := 0;
BEGIN
  -- 1. Normalizar códigos con puntos/espacios
  FOR r IN
    SELECT codigo_cuenta, nombre_cuenta
    FROM public.plan_contable_pcge
    WHERE codigo_cuenta ~ '[^0-9]' OR codigo_cuenta <> public.pcge_strip_dots(codigo_cuenta)
  LOOP
    v_new := public.pcge_strip_dots(r.codigo_cuenta);
    IF NOT p_dry_run AND v_new <> '' AND v_new <> r.codigo_cuenta THEN
      UPDATE public.plan_contable_pcge SET codigo_cuenta = v_new WHERE codigo_cuenta = r.codigo_cuenta;
      INSERT INTO public.pcge_fix_log (codigo_anterior, codigo_nuevo, accion, detalle)
      VALUES (r.codigo_cuenta, v_new, 'normalize', jsonb_build_object('nombre', r.nombre_cuenta));
    END IF;
    v_fixed := v_fixed + 1;
  END LOOP;

  -- 2. Sincronizar nivel, padre, agrupador
  IF NOT p_dry_run THEN
    UPDATE public.plan_contable_pcge SET
      nivel = public.pcge_nivel_desde_codigo(codigo_cuenta),
      padre_codigo = public.pcge_padre_desde_codigo(codigo_cuenta);

    UPDATE public.plan_contable_pcge p SET es_agrupador = EXISTS (
      SELECT 1 FROM public.plan_contable_pcge h WHERE h.padre_codigo = p.codigo_cuenta
    );
  END IF;

  -- 3. Huérfanos
  SELECT COUNT(*) INTO v_orphans
  FROM public.plan_contable_pcge p
  WHERE p.padre_codigo IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.plan_contable_pcge pad WHERE pad.codigo_cuenta = p.padre_codigo
    );

  -- 4. Duplicados (post-normalización)
  SELECT COUNT(*) INTO v_dupes
  FROM (
    SELECT codigo_cuenta FROM public.plan_contable_pcge
    GROUP BY codigo_cuenta HAVING COUNT(*) > 1
  ) d;

  -- 5. Inválidos por longitud
  SELECT COUNT(*) INTO v_invalid
  FROM public.plan_contable_pcge
  WHERE length(public.pcge_strip_dots(codigo_cuenta)) NOT IN (1, 2, 3, 4, 6, 8)
     OR public.pcge_strip_dots(codigo_cuenta) !~ '^[0-9]+$';

  -- 6. Duplicados: mantener más reciente
  IF NOT p_dry_run THEN
    DELETE FROM public.plan_contable_pcge a
    USING public.plan_contable_pcge b
    WHERE a.codigo_cuenta = b.codigo_cuenta
      AND a.ctid < b.ctid;
  END IF;

  RETURN jsonb_build_object(
    'dry_run', p_dry_run,
    'normalized', v_fixed,
    'orphans', v_orphans,
    'duplicates_found', v_dupes,
    'invalid_length', v_invalid
  );
END;
$$;

-- ============================================================
-- B. Trigger prevent_invalid_pcge_code
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_invalid_pcge_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_val jsonb;
  v_norm text;
BEGIN
  v_norm := public.pcge_strip_dots(NEW.codigo_cuenta);
  IF v_norm = '' THEN
    RAISE EXCEPTION 'Código PCGE obligatorio';
  END IF;

  NEW.codigo_cuenta := v_norm;
  NEW.nivel := public.pcge_nivel_desde_codigo(v_norm);
  NEW.padre_codigo := COALESCE(
    NULLIF(public.pcge_strip_dots(NEW.padre_codigo), ''),
    public.pcge_padre_desde_codigo(v_norm)
  );

  v_val := public.pcge_validar_codigo(v_norm, NEW.padre_codigo);
  IF NOT (v_val->>'valid')::boolean THEN
    RAISE EXCEPTION 'Código PCGE inválido: %', v_val->'errors';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_invalid_pcge_code ON public.plan_contable_pcge;
CREATE TRIGGER trg_prevent_invalid_pcge_code
  BEFORE INSERT OR UPDATE ON public.plan_contable_pcge
  FOR EACH ROW EXECUTE FUNCTION public.prevent_invalid_pcge_code();

-- ============================================================
-- C. Vista v_pcge_validation_errors
-- ============================================================
CREATE OR REPLACE VIEW public.v_pcge_validation_errors AS
SELECT
  p.codigo_cuenta,
  p.nombre_cuenta,
  p.nivel,
  p.padre_codigo,
  CASE
    WHEN length(public.pcge_strip_dots(p.codigo_cuenta)) NOT IN (1, 2, 3, 4, 6, 8)
      THEN 'longitud_invalida'
    WHEN p.padre_codigo IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.plan_contable_pcge pad WHERE pad.codigo_cuenta = p.padre_codigo)
      THEN 'padre_inexistente'
    WHEN p.padre_codigo IS NOT NULL
      AND NOT public.pcge_strip_dots(p.codigo_cuenta) LIKE p.padre_codigo || '%'
      THEN 'prefijo_padre'
    ELSE 'otro'
  END AS error_tipo,
  CASE
    WHEN length(public.pcge_strip_dots(p.codigo_cuenta)) NOT IN (1, 2, 3, 4, 6, 8)
      THEN format('Corregir a longitud válida (actual: %s)', length(public.pcge_strip_dots(p.codigo_cuenta)))
    WHEN p.padre_codigo IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.plan_contable_pcge pad WHERE pad.codigo_cuenta = p.padre_codigo)
      THEN format('Crear padre %s o asignar %s', p.padre_codigo, public.pcge_padre_desde_codigo(p.codigo_cuenta))
    WHEN p.padre_codigo IS NOT NULL
      THEN format('Asignar padre %s', public.pcge_padre_desde_codigo(p.codigo_cuenta))
    ELSE 'Revisar código'
  END AS sugerencia
FROM public.plan_contable_pcge p
WHERE
  length(public.pcge_strip_dots(p.codigo_cuenta)) NOT IN (1, 2, 3, 4, 6, 8)
  OR public.pcge_strip_dots(p.codigo_cuenta) !~ '^[0-9]+$'
  OR (
    p.padre_codigo IS NOT NULL
    AND (
      NOT EXISTS (SELECT 1 FROM public.plan_contable_pcge pad WHERE pad.codigo_cuenta = p.padre_codigo)
      OR NOT public.pcge_strip_dots(p.codigo_cuenta) LIKE p.padre_codigo || '%'
    )
  );

-- ============================================================
-- D. Constraints e índices
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pcge_codigo_formato'
  ) THEN
    ALTER TABLE public.plan_contable_pcge
      ADD CONSTRAINT chk_pcge_codigo_formato
      CHECK (codigo_cuenta ~ '^[0-9]{1,8}$');
  END IF;
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'chk_pcge_codigo_formato: hay filas inválidas; ejecute validate_and_fix_all_pcge_codes(false) primero';
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pcge_codigo_unique
  ON public.plan_contable_pcge (codigo_cuenta);

UPDATE public.plan_contable_pcge p SET es_agrupador = EXISTS (
  SELECT 1 FROM public.plan_contable_pcge h WHERE h.padre_codigo = p.codigo_cuenta
);

GRANT SELECT ON public.v_pcge_validation_errors TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_and_fix_all_pcge_codes(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pcge_validar_codigo(text, text) TO authenticated;
