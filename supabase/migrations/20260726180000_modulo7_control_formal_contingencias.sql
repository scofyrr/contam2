-- =============================================================================
-- Módulo 7: Control Formal, Foliación, Legalizaciones Notariales & Contingencias
-- Idempotente — multi-tenant vía fn_user_can_access_contribuyente
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_llevado_libro_enum') THEN
    CREATE TYPE public.tipo_llevado_libro_enum AS ENUM (
      'MANUAL',
      'HOJAS_SUELTAS',
      'HOJAS_CONTINUAS',
      'ELECTRONICO_SIRE'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'motivo_contingencia_enum') THEN
    CREATE TYPE public.motivo_contingencia_enum AS ENUM (
      'PERDIDA',
      'DESTRUCCION',
      'SINIESTRO',
      'ASALTO',
      'OTRO'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_contingencia_sunat_enum') THEN
    CREATE TYPE public.estado_contingencia_sunat_enum AS ENUM (
      'PENDIENTE_DENUNCIAR',
      'DENUNCIADO_POLICIA',
      'COMUNICADO_SUNAT',
      'EN_RECONSTRUCCION',
      'RECONSTRUIDO'
    );
  END IF;
END $$;

-- =============================================================================
-- 1. LEGALIZACIONES NOTARIALES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.legalizaciones_notariales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  codigo_libro_tabla8 varchar(10) NOT NULL,
  nombre_libro varchar(255) NOT NULL,
  numero_legalizacion varchar(100) NOT NULL,
  notaria_juzgado varchar(200) NOT NULL,
  fecha_legalizacion date NOT NULL,
  folios_desde int NOT NULL CHECK (folios_desde > 0),
  folios_hasta int NOT NULL CHECK (folios_hasta >= folios_desde),
  tipo_llevado public.tipo_llevado_libro_enum NOT NULL DEFAULT 'HOJAS_SUELTAS',
  estado varchar(20) NOT NULL DEFAULT 'ACTIVO'
    CHECK (estado IN ('ACTIVO', 'CONCLUIDO', 'ANULADO')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'legalizaciones_notariales_contribuyente_id_fkey') THEN
    ALTER TABLE public.legalizaciones_notariales
      ADD CONSTRAINT legalizaciones_notariales_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_legalizaciones_contrib
  ON public.legalizaciones_notariales (contribuyente_id, codigo_libro_tabla8);

DROP TRIGGER IF EXISTS legalizaciones_notariales_updated ON public.legalizaciones_notariales;
CREATE TRIGGER legalizaciones_notariales_updated
  BEFORE UPDATE ON public.legalizaciones_notariales
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 2. CONTROL DE FOLIOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.control_folios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legalizacion_id uuid NOT NULL,
  numero_folio int NOT NULL,
  estado_folio varchar(20) NOT NULL DEFAULT 'DISPONIBLE'
    CHECK (estado_folio IN ('DISPONIBLE', 'IMPRESO', 'ANULADO', 'RESERVADO')),
  periodo_asociado char(6),
  fecha_uso date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (legalizacion_id, numero_folio)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'control_folios_legalizacion_id_fkey') THEN
    ALTER TABLE public.control_folios
      ADD CONSTRAINT control_folios_legalizacion_id_fkey
      FOREIGN KEY (legalizacion_id) REFERENCES public.legalizaciones_notariales(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_control_folios_legalizacion
  ON public.control_folios (legalizacion_id, numero_folio);

-- =============================================================================
-- 3. CONTINGENCIAS LIBROS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.contingencias_libros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  fecha_ocurrencia date NOT NULL,
  fecha_denuncia_policial date,
  numero_denuncia_policial varchar(100),
  comisaria varchar(200),
  motivo public.motivo_contingencia_enum NOT NULL DEFAULT 'PERDIDA',
  libros_afectados jsonb NOT NULL DEFAULT '[]'::jsonb,
  fecha_limite_comunicacion_15d date NOT NULL,
  fecha_comunicacion_sunat date,
  numero_expediente_sunat varchar(100),
  fecha_limite_reconstruccion_60d date NOT NULL,
  fecha_finalizacion_reconstruccion date,
  prorroga_solicitada boolean NOT NULL DEFAULT false,
  fecha_solicitud_prorroga date,
  estado_contingencia public.estado_contingencia_sunat_enum NOT NULL DEFAULT 'PENDIENTE_DENUNCIAR',
  observaciones text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contingencias_libros_contribuyente_id_fkey') THEN
    ALTER TABLE public.contingencias_libros
      ADD CONSTRAINT contingencias_libros_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contingencias_contrib_estado
  ON public.contingencias_libros (contribuyente_id, estado_contingencia);

DROP TRIGGER IF EXISTS contingencias_libros_updated ON public.contingencias_libros;
CREATE TRIGGER contingencias_libros_updated
  BEFORE UPDATE ON public.contingencias_libros
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 4. FERIADOS NACIONALES PERÚ (catálogo base)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feriados_nacionales_pe (
  fecha date PRIMARY KEY,
  descripcion varchar(200) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.feriados_nacionales_pe (fecha, descripcion) VALUES
  ('2025-01-01', 'Año Nuevo'),
  ('2025-04-17', 'Jueves Santo'),
  ('2025-04-18', 'Viernes Santo'),
  ('2025-05-01', 'Día del Trabajo'),
  ('2025-06-07', 'Batalla de Arica y bandera'),
  ('2025-06-29', 'San Pedro y San Pablo'),
  ('2025-07-23', 'Día de la Fuerza Aérea'),
  ('2025-07-28', 'Fiestas Patrias'),
  ('2025-07-29', 'Fiestas Patrias'),
  ('2025-08-06', 'Batalla de Junín'),
  ('2025-08-30', 'Santa Rosa de Lima'),
  ('2025-10-08', 'Combate de Angamos'),
  ('2025-11-01', 'Todos los Santos'),
  ('2025-12-08', 'Inmaculada Concepción'),
  ('2025-12-25', 'Navidad'),
  ('2026-01-01', 'Año Nuevo'),
  ('2026-04-02', 'Jueves Santo'),
  ('2026-04-03', 'Viernes Santo'),
  ('2026-05-01', 'Día del Trabajo'),
  ('2026-06-07', 'Batalla de Arica y bandera'),
  ('2026-06-29', 'San Pedro y San Pablo'),
  ('2026-07-23', 'Día de la Fuerza Aérea'),
  ('2026-07-28', 'Fiestas Patrias'),
  ('2026-07-29', 'Fiestas Patrias'),
  ('2026-08-06', 'Batalla de Junín'),
  ('2026-08-30', 'Santa Rosa de Lima'),
  ('2026-10-08', 'Combate de Angamos'),
  ('2026-11-01', 'Todos los Santos'),
  ('2026-12-08', 'Inmaculada Concepción'),
  ('2026-12-25', 'Navidad')
ON CONFLICT (fecha) DO NOTHING;

ALTER TABLE public.feriados_nacionales_pe ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feriados_select ON public.feriados_nacionales_pe;
CREATE POLICY feriados_select ON public.feriados_nacionales_pe
  FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- 5. RLS
-- =============================================================================
ALTER TABLE public.legalizaciones_notariales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_folios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contingencias_libros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS legalizaciones_tenant ON public.legalizaciones_notariales;
CREATE POLICY legalizaciones_tenant ON public.legalizaciones_notariales
  FOR ALL TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id))
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS control_folios_tenant ON public.control_folios;
CREATE POLICY control_folios_tenant ON public.control_folios
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.legalizaciones_notariales ln
      WHERE ln.id = control_folios.legalizacion_id
        AND public.fn_user_can_access_contribuyente(ln.contribuyente_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.legalizaciones_notariales ln
      WHERE ln.id = control_folios.legalizacion_id
        AND public.fn_user_can_access_contribuyente(ln.contribuyente_id)
    )
  );

DROP POLICY IF EXISTS contingencias_tenant ON public.contingencias_libros;
CREATE POLICY contingencias_tenant ON public.contingencias_libros
  FOR ALL TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id))
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

-- =============================================================================
-- 6. HELPERS — días hábiles Perú
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_es_dia_habil_peru(p_fecha date)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    EXTRACT(DOW FROM p_fecha) NOT IN (0, 6)
    AND NOT EXISTS (SELECT 1 FROM public.feriados_nacionales_pe f WHERE f.fecha = p_fecha);
$$;

CREATE OR REPLACE FUNCTION public.fn_calcular_15_dias_habiles_peru(p_fecha_inicio date)
RETURNS date
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_fecha date := p_fecha_inicio;
  v_contador int := 0;
BEGIN
  IF p_fecha_inicio IS NULL THEN
    RETURN NULL;
  END IF;

  WHILE v_contador < 15 LOOP
    v_fecha := v_fecha + 1;
    IF public.fn_es_dia_habil_peru(v_fecha) THEN
      v_contador := v_contador + 1;
    END IF;
  END LOOP;

  RETURN v_fecha;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_calcular_60_dias_calendario(p_fecha_inicio date)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE WHEN p_fecha_inicio IS NULL THEN NULL ELSE p_fecha_inicio + 60 END;
$$;

-- Trigger: generar folios al insertar legalización
CREATE OR REPLACE FUNCTION public.tg_generar_folios_legalizacion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_folio int;
BEGIN
  FOR v_folio IN NEW.folios_desde..NEW.folios_hasta LOOP
    INSERT INTO public.control_folios (legalizacion_id, numero_folio, estado_folio)
    VALUES (NEW.id, v_folio, 'DISPONIBLE')
    ON CONFLICT (legalizacion_id, numero_folio) DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generar_folios_legalizacion ON public.legalizaciones_notariales;
CREATE TRIGGER trg_generar_folios_legalizacion
  AFTER INSERT ON public.legalizaciones_notariales
  FOR EACH ROW EXECUTE FUNCTION public.tg_generar_folios_legalizacion();

-- =============================================================================
-- 7. RPC: Registrar contingencia
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_registrar_contingencia_libro(
  p_contribuyente_id uuid,
  p_fecha_ocurrencia date,
  p_motivo varchar,
  p_libros_afectados jsonb,
  p_num_denuncia varchar DEFAULT NULL,
  p_comisaria varchar DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_motivo public.motivo_contingencia_enum;
  v_limite_15d date;
  v_limite_60d date;
  v_estado public.estado_contingencia_sunat_enum;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  IF p_fecha_ocurrencia IS NULL THEN
    RAISE EXCEPTION 'Fecha de ocurrencia requerida';
  END IF;

  v_motivo := CASE upper(trim(COALESCE(p_motivo, 'PERDIDA')))
    WHEN 'DESTRUCCION' THEN 'DESTRUCCION'::public.motivo_contingencia_enum
    WHEN 'SINIESTRO' THEN 'SINIESTRO'::public.motivo_contingencia_enum
    WHEN 'ASALTO' THEN 'ASALTO'::public.motivo_contingencia_enum
    WHEN 'OTRO' THEN 'OTRO'::public.motivo_contingencia_enum
    ELSE 'PERDIDA'::public.motivo_contingencia_enum
  END;

  v_limite_15d := public.fn_calcular_15_dias_habiles_peru(p_fecha_ocurrencia);
  v_limite_60d := public.fn_calcular_60_dias_calendario(p_fecha_ocurrencia);

  v_estado := CASE
    WHEN p_num_denuncia IS NOT NULL AND trim(p_num_denuncia) <> '' THEN 'DENUNCIADO_POLICIA'::public.estado_contingencia_sunat_enum
    ELSE 'PENDIENTE_DENUNCIAR'::public.estado_contingencia_sunat_enum
  END;

  INSERT INTO public.contingencias_libros (
    contribuyente_id,
    fecha_ocurrencia,
    fecha_denuncia_policial,
    numero_denuncia_policial,
    comisaria,
    motivo,
    libros_afectados,
    fecha_limite_comunicacion_15d,
    fecha_limite_reconstruccion_60d,
    estado_contingencia,
    observaciones
  ) VALUES (
    p_contribuyente_id,
    p_fecha_ocurrencia,
    CASE WHEN p_num_denuncia IS NOT NULL AND trim(p_num_denuncia) <> '' THEN CURRENT_DATE ELSE NULL END,
    NULLIF(trim(p_num_denuncia), ''),
    NULLIF(trim(p_comisaria), ''),
    v_motivo,
    COALESCE(p_libros_afectados, '[]'::jsonb),
    v_limite_15d,
    v_limite_60d,
    v_estado,
    NULL
  ) RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'ok', true,
    'contingencia_id', v_id,
    'fecha_limite_comunicacion_15d', v_limite_15d,
    'fecha_limite_reconstruccion_60d', v_limite_60d,
    'estado_contingencia', v_estado::text
  );
END;
$$;

-- =============================================================================
-- 8. RPC: Semáforo contingencias
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_obtener_semaforo_contingencias(p_contribuyente_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hoy date := CURRENT_DATE;
  v_alertas jsonb;
  v_resumen jsonb;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.prioridad, t.fecha_limite), '[]'::jsonb)
  INTO v_alertas
  FROM (
    SELECT
      c.id AS contingencia_id,
      c.motivo::text AS motivo,
      c.estado_contingencia::text AS estado,
      c.fecha_ocurrencia,
      c.fecha_limite_comunicacion_15d AS fecha_limite_comunicacion,
      c.fecha_limite_reconstruccion_60d AS fecha_limite_reconstruccion,
      c.fecha_comunicacion_sunat,
      c.fecha_finalizacion_reconstruccion,
      c.numero_denuncia_policial,
      c.libros_afectados,
      CASE
        WHEN c.estado_contingencia NOT IN ('COMUNICADO_SUNAT', 'EN_RECONSTRUCCION', 'RECONSTRUIDO')
          AND c.fecha_comunicacion_sunat IS NULL
        THEN GREATEST(
          (SELECT COUNT(*)::int FROM generate_series(c.fecha_ocurrencia + 1, v_hoy, '1 day'::interval) d
           WHERE public.fn_es_dia_habil_peru(d::date)),
          0
        )
        ELSE NULL
      END AS dias_habiles_transcurridos,
      CASE
        WHEN c.estado_contingencia NOT IN ('COMUNICADO_SUNAT', 'EN_RECONSTRUCCION', 'RECONSTRUIDO')
          AND c.fecha_comunicacion_sunat IS NULL
        THEN (c.fecha_limite_comunicacion_15d - v_hoy)
        ELSE NULL
      END AS dias_restantes_comunicacion,
      CASE
        WHEN c.estado_contingencia NOT IN ('RECONSTRUIDO')
          AND c.fecha_finalizacion_reconstruccion IS NULL
        THEN (c.fecha_limite_reconstruccion_60d - v_hoy)
        ELSE NULL
      END AS dias_restantes_reconstruccion,
      CASE
        WHEN c.estado_contingencia NOT IN ('COMUNICADO_SUNAT', 'EN_RECONSTRUCCION', 'RECONSTRUIDO')
          AND c.fecha_comunicacion_sunat IS NULL
          AND c.fecha_limite_comunicacion_15d < v_hoy
        THEN 'ROJO'
        WHEN c.estado_contingencia NOT IN ('COMUNICADO_SUNAT', 'EN_RECONSTRUCCION', 'RECONSTRUIDO')
          AND c.fecha_comunicacion_sunat IS NULL
          AND (c.fecha_limite_comunicacion_15d - v_hoy) <= 3
        THEN 'ROJO'
        WHEN c.estado_contingencia NOT IN ('COMUNICADO_SUNAT', 'EN_RECONSTRUCCION', 'RECONSTRUIDO')
          AND c.fecha_comunicacion_sunat IS NULL
          AND (c.fecha_limite_comunicacion_15d - v_hoy) <= 7
        THEN 'AMARILLO'
        WHEN c.estado_contingencia NOT IN ('RECONSTRUIDO')
          AND c.fecha_finalizacion_reconstruccion IS NULL
          AND c.fecha_limite_reconstruccion_60d < v_hoy
        THEN 'ROJO'
        WHEN c.estado_contingencia NOT IN ('RECONSTRUIDO')
          AND c.fecha_finalizacion_reconstruccion IS NULL
          AND (c.fecha_limite_reconstruccion_60d - v_hoy) <= 10
        THEN 'AMARILLO'
        ELSE 'VERDE'
      END AS semaforo,
      CASE
        WHEN c.fecha_comunicacion_sunat IS NULL
          AND c.estado_contingencia NOT IN ('COMUNICADO_SUNAT', 'RECONSTRUIDO')
        THEN c.fecha_limite_comunicacion_15d
        WHEN c.fecha_finalizacion_reconstruccion IS NULL
          AND c.estado_contingencia NOT IN ('RECONSTRUIDO')
        THEN c.fecha_limite_reconstruccion_60d
        ELSE c.fecha_ocurrencia
      END AS fecha_limite,
      CASE
        WHEN c.fecha_comunicacion_sunat IS NULL
          AND c.estado_contingencia NOT IN ('COMUNICADO_SUNAT', 'RECONSTRUIDO')
        THEN 1
        ELSE 2
      END AS prioridad
    FROM public.contingencias_libros c
    WHERE c.contribuyente_id = p_contribuyente_id
      AND c.estado_contingencia <> 'RECONSTRUIDO'
  ) t;

  SELECT jsonb_build_object(
    'total_activas', (SELECT COUNT(*) FROM public.contingencias_libros WHERE contribuyente_id = p_contribuyente_id AND estado_contingencia <> 'RECONSTRUIDO'),
    'rojas', (SELECT COUNT(*) FROM jsonb_array_elements(v_alertas) e WHERE e->>'semaforo' = 'ROJO'),
    'amarillas', (SELECT COUNT(*) FROM jsonb_array_elements(v_alertas) e WHERE e->>'semaforo' = 'AMARILLO'),
    'verdes', (SELECT COUNT(*) FROM jsonb_array_elements(v_alertas) e WHERE e->>'semaforo' = 'VERDE')
  ) INTO v_resumen;

  RETURN jsonb_build_object(
    'contribuyente_id', p_contribuyente_id,
    'fecha_evaluacion', v_hoy,
    'resumen', v_resumen,
    'alertas', v_alertas
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_es_dia_habil_peru(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_calcular_15_dias_habiles_peru(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_calcular_60_dias_calendario(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_registrar_contingencia_libro(uuid, date, varchar, jsonb, varchar, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_obtener_semaforo_contingencias(uuid) TO authenticated;
