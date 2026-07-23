-- =============================================================================
-- Módulo 1: Infraestructura Core, Profiling RUC & Multi-Tenant Security
-- Idempotente — compatible con esquema CONTAM existente (contribuyentes PK = ruc)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. ESTUDIOS CONTABLES (Multi-Tenant Root)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.estudios_contables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc char(11) NOT NULL,
  razon_social text NOT NULL,
  nombre_comercial text,
  estado text NOT NULL DEFAULT 'ACTIVO'
    CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT estudios_contables_ruc_chk CHECK (ruc ~ '^\d{11}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_estudios_contables_ruc
  ON public.estudios_contables (ruc);

DROP TRIGGER IF EXISTS estudios_contables_updated ON public.estudios_contables;
CREATE TRIGGER estudios_contables_updated
  BEFORE UPDATE ON public.estudios_contables
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 2. ESTUDIO USUARIOS (Membership + Rol)
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estudio_rol_enum') THEN
    CREATE TYPE public.estudio_rol_enum AS ENUM ('ADMIN', 'CONTADOR', 'ASISTENTE', 'AUDITOR');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.estudio_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudio_id uuid NOT NULL REFERENCES public.estudios_contables(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol public.estudio_rol_enum NOT NULL DEFAULT 'CONTADOR',
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estudio_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_estudio_usuarios_user
  ON public.estudio_usuarios (user_id) WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_estudio_usuarios_estudio
  ON public.estudio_usuarios (estudio_id) WHERE activo = true;

DROP TRIGGER IF EXISTS estudio_usuarios_updated ON public.estudio_usuarios;
CREATE TRIGGER estudio_usuarios_updated
  BEFORE UPDATE ON public.estudio_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Estudio por defecto para datos legacy
INSERT INTO public.estudios_contables (ruc, razon_social, nombre_comercial, estado)
VALUES ('00000000000', 'Estudio Contable Principal', 'CONTAM Default', 'ACTIVO')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. CONTRIBUYENTES — enriquecimiento multi-tenant (tabla existente)
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'regimen_tributario_enum') THEN
    CREATE TYPE public.regimen_tributario_enum AS ENUM ('NRUS', 'RER', 'RMT', 'RG');
  END IF;
END $$;

ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS estudio_id uuid;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS nombre_comercial text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS estado_contribuyente text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS condicion_domicilio text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS codigo_regimen public.regimen_tributario_enum;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS direccion_fiscal text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS ubigeo char(6);
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS departamento text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS provincia text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS distrito text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS sistema_emision text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS sistema_contabilidad text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS actividad_economica_principal text;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS fecha_inicio_actividades date;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS es_agente_retencion boolean NOT NULL DEFAULT false;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS es_agente_percepcion boolean NOT NULL DEFAULT false;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS es_buen_contribuyente boolean NOT NULL DEFAULT false;

UPDATE public.contribuyentes
SET id = gen_random_uuid()
WHERE id IS NULL;

UPDATE public.contribuyentes c
SET estudio_id = e.id
FROM public.estudios_contables e
WHERE c.estudio_id IS NULL
  AND e.ruc = '00000000000';

CREATE UNIQUE INDEX IF NOT EXISTS idx_contribuyentes_id_unique
  ON public.contribuyentes (id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contribuyentes_estudio_ruc
  ON public.contribuyentes (estudio_id, ruc);

CREATE INDEX IF NOT EXISTS idx_contribuyentes_estudio
  ON public.contribuyentes (estudio_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contribuyentes_estudio_id_fkey'
  ) THEN
    ALTER TABLE public.contribuyentes
      ADD CONSTRAINT contribuyentes_estudio_id_fkey
      FOREIGN KEY (estudio_id) REFERENCES public.estudios_contables(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- =============================================================================
-- 4. TABLAS HIJAS FICHA RUC (Profiling Decolecta / SUNAT)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.contribuyente_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  codigo_anexo varchar(10) NOT NULL,
  tipo_establecimiento text,
  direccion text,
  departamento text,
  provincia text,
  distrito text,
  estado text NOT NULL DEFAULT 'ACTIVO',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contribuyente_representantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  tipo_documento varchar(10) NOT NULL DEFAULT 'DNI',
  numero_documento varchar(20) NOT NULL,
  nombre_completo text NOT NULL,
  cargo text,
  fecha_desde date,
  estado text NOT NULL DEFAULT 'ACTIVO',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contribuyente_tributos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  codigo_tributo varchar(20) NOT NULL,
  descripcion_tributo text,
  fecha_afectacion date,
  estado text NOT NULL DEFAULT 'VIGENTE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contribuyente_anexos_contribuyente_id_fkey'
  ) THEN
    ALTER TABLE public.contribuyente_anexos
      ADD CONSTRAINT contribuyente_anexos_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contribuyente_representantes_contribuyente_id_fkey'
  ) THEN
    ALTER TABLE public.contribuyente_representantes
      ADD CONSTRAINT contribuyente_representantes_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contribuyente_tributos_contribuyente_id_fkey'
  ) THEN
    ALTER TABLE public.contribuyente_tributos
      ADD CONSTRAINT contribuyente_tributos_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contribuyente_anexos_contrib
  ON public.contribuyente_anexos (contribuyente_id);

CREATE INDEX IF NOT EXISTS idx_contribuyente_representantes_contrib
  ON public.contribuyente_representantes (contribuyente_id);

CREATE INDEX IF NOT EXISTS idx_contribuyente_tributos_contrib
  ON public.contribuyente_tributos (contribuyente_id);

DROP TRIGGER IF EXISTS contribuyente_anexos_updated ON public.contribuyente_anexos;
CREATE TRIGGER contribuyente_anexos_updated
  BEFORE UPDATE ON public.contribuyente_anexos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS contribuyente_representantes_updated ON public.contribuyente_representantes;
CREATE TRIGGER contribuyente_representantes_updated
  BEFORE UPDATE ON public.contribuyente_representantes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS contribuyente_tributos_updated ON public.contribuyente_tributos;
CREATE TRIGGER contribuyente_tributos_updated
  BEFORE UPDATE ON public.contribuyente_tributos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 5. UIT VALORES + INGRESOS ANUALES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.uit_valores (
  ejercicio int PRIMARY KEY,
  monto numeric(10, 2) NOT NULL CHECK (monto > 0),
  base_legal text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.uit_valores (ejercicio, monto, base_legal) VALUES
  (2023, 4950.00, 'Ley N° 31814 — UIT 2023'),
  (2024, 5150.00, 'Ley N° 31953 — UIT 2024'),
  (2025, 5350.00, 'Ley N° 32110 — UIT 2025'),
  (2026, 5500.00, 'Ley N° 32359 — UIT 2026')
ON CONFLICT (ejercicio) DO UPDATE SET
  monto = EXCLUDED.monto,
  base_legal = EXCLUDED.base_legal,
  updated_at = now();

DROP TRIGGER IF EXISTS uit_valores_updated ON public.uit_valores;
CREATE TRIGGER uit_valores_updated
  BEFORE UPDATE ON public.uit_valores
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.contribuyente_ingresos_anuales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  ejercicio int NOT NULL CHECK (ejercicio >= 2000 AND ejercicio <= 2100),
  ingresos_brutos_soles numeric(16, 2) NOT NULL DEFAULT 0 CHECK (ingresos_brutos_soles >= 0),
  uit_monto numeric(10, 2) NOT NULL CHECK (uit_monto > 0),
  ingresos_brutos_uit numeric(14, 4) GENERATED ALWAYS AS (
    CASE
      WHEN uit_monto IS NULL OR uit_monto = 0 THEN NULL
      ELSE round(ingresos_brutos_soles / uit_monto, 4)
    END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contribuyente_id, ejercicio)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contribuyente_ingresos_contribuyente_id_fkey'
  ) THEN
    ALTER TABLE public.contribuyente_ingresos_anuales
      ADD CONSTRAINT contribuyente_ingresos_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contribuyente_ingresos_contrib_ejercicio
  ON public.contribuyente_ingresos_anuales (contribuyente_id, ejercicio DESC);

DROP TRIGGER IF EXISTS contribuyente_ingresos_updated ON public.contribuyente_ingresos_anuales;
CREATE TRIGGER contribuyente_ingresos_updated
  BEFORE UPDATE ON public.contribuyente_ingresos_anuales
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE FUNCTION public.tg_contribuyente_ingresos_set_uit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_uit numeric(10, 2);
BEGIN
  SELECT u.monto INTO v_uit
  FROM public.uit_valores u
  WHERE u.ejercicio = NEW.ejercicio;

  IF v_uit IS NULL THEN
    RAISE EXCEPTION 'No existe valor UIT para el ejercicio %', NEW.ejercicio;
  END IF;

  NEW.uit_monto := v_uit;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contribuyente_ingresos_set_uit ON public.contribuyente_ingresos_anuales;
CREATE TRIGGER contribuyente_ingresos_set_uit
  BEFORE INSERT OR UPDATE OF ejercicio, ingresos_brutos_soles ON public.contribuyente_ingresos_anuales
  FOR EACH ROW EXECUTE FUNCTION public.tg_contribuyente_ingresos_set_uit();

-- =============================================================================
-- 6. HELPERS RLS MULTI-TENANT
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_user_has_estudio_access(p_estudio_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.estudio_usuarios eu
    WHERE eu.user_id = auth.uid()
      AND eu.estudio_id = p_estudio_id
      AND eu.activo = true
  );
$$;

CREATE OR REPLACE FUNCTION public.fn_user_can_access_contribuyente(p_contribuyente_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contribuyentes c
    INNER JOIN public.estudio_usuarios eu
      ON eu.estudio_id = c.estudio_id
     AND eu.user_id = auth.uid()
     AND eu.activo = true
    WHERE c.id = p_contribuyente_id
  );
$$;

REVOKE ALL ON FUNCTION public.fn_user_has_estudio_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_user_has_estudio_access(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.fn_user_can_access_contribuyente(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_user_can_access_contribuyente(uuid) TO authenticated;

-- =============================================================================
-- 7. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.estudios_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudio_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuyentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuyente_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuyente_representantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuyente_tributos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uit_valores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuyente_ingresos_anuales ENABLE ROW LEVEL SECURITY;

-- estudios_contables
DROP POLICY IF EXISTS "estudio select own" ON public.estudios_contables;
DROP POLICY IF EXISTS "estudio insert admin" ON public.estudios_contables;
DROP POLICY IF EXISTS "estudio update admin" ON public.estudios_contables;

CREATE POLICY "estudio select own" ON public.estudios_contables
  FOR SELECT TO authenticated
  USING (public.fn_user_has_estudio_access(id));

CREATE POLICY "estudio insert admin" ON public.estudios_contables
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "estudio update admin" ON public.estudios_contables
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.estudio_usuarios eu
      WHERE eu.estudio_id = estudios_contables.id
        AND eu.user_id = auth.uid()
        AND eu.rol = 'ADMIN'
        AND eu.activo = true
    )
  );

-- estudio_usuarios
DROP POLICY IF EXISTS "estudio_usuarios select own" ON public.estudio_usuarios;
DROP POLICY IF EXISTS "estudio_usuarios insert admin" ON public.estudio_usuarios;
DROP POLICY IF EXISTS "estudio_usuarios update admin" ON public.estudio_usuarios;
DROP POLICY IF EXISTS "estudio_usuarios delete admin" ON public.estudio_usuarios;

CREATE POLICY "estudio_usuarios select own" ON public.estudio_usuarios
  FOR SELECT TO authenticated
  USING (public.fn_user_has_estudio_access(estudio_id) OR user_id = auth.uid());

CREATE POLICY "estudio_usuarios insert admin" ON public.estudio_usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estudio_usuarios eu
      WHERE eu.estudio_id = estudio_usuarios.estudio_id
        AND eu.user_id = auth.uid()
        AND eu.rol = 'ADMIN'
        AND eu.activo = true
    )
  );

CREATE POLICY "estudio_usuarios update admin" ON public.estudio_usuarios
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.estudio_usuarios eu
      WHERE eu.estudio_id = estudio_usuarios.estudio_id
        AND eu.user_id = auth.uid()
        AND eu.rol = 'ADMIN'
        AND eu.activo = true
    )
  );

CREATE POLICY "estudio_usuarios delete admin" ON public.estudio_usuarios
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.estudio_usuarios eu
      WHERE eu.estudio_id = estudio_usuarios.estudio_id
        AND eu.user_id = auth.uid()
        AND eu.rol = 'ADMIN'
        AND eu.activo = true
    )
  );

-- contribuyentes (reemplaza políticas abiertas)
DROP POLICY IF EXISTS "auth select contribuyentes" ON public.contribuyentes;
DROP POLICY IF EXISTS "auth insert contribuyentes" ON public.contribuyentes;
DROP POLICY IF EXISTS "auth update contribuyentes" ON public.contribuyentes;
DROP POLICY IF EXISTS "auth delete contribuyentes" ON public.contribuyentes;
DROP POLICY IF EXISTS "contribuyentes select estudio" ON public.contribuyentes;
DROP POLICY IF EXISTS "contribuyentes insert estudio" ON public.contribuyentes;
DROP POLICY IF EXISTS "contribuyentes update estudio" ON public.contribuyentes;
DROP POLICY IF EXISTS "contribuyentes delete estudio" ON public.contribuyentes;

CREATE POLICY "contribuyentes select estudio" ON public.contribuyentes
  FOR SELECT TO authenticated
  USING (
    estudio_id IS NOT NULL
    AND public.fn_user_has_estudio_access(estudio_id)
  );

CREATE POLICY "contribuyentes insert estudio" ON public.contribuyentes
  FOR INSERT TO authenticated
  WITH CHECK (
    estudio_id IS NOT NULL
    AND public.fn_user_has_estudio_access(estudio_id)
  );

CREATE POLICY "contribuyentes update estudio" ON public.contribuyentes
  FOR UPDATE TO authenticated
  USING (
    estudio_id IS NOT NULL
    AND public.fn_user_has_estudio_access(estudio_id)
  )
  WITH CHECK (
    estudio_id IS NOT NULL
    AND public.fn_user_has_estudio_access(estudio_id)
  );

CREATE POLICY "contribuyentes delete estudio" ON public.contribuyentes
  FOR DELETE TO authenticated
  USING (
    estudio_id IS NOT NULL
    AND public.fn_user_has_estudio_access(estudio_id)
    AND EXISTS (
      SELECT 1 FROM public.estudio_usuarios eu
      WHERE eu.estudio_id = contribuyentes.estudio_id
        AND eu.user_id = auth.uid()
        AND eu.rol IN ('ADMIN', 'CONTADOR')
        AND eu.activo = true
    )
  );

-- hijas contribuyente
DROP POLICY IF EXISTS "anexos select" ON public.contribuyente_anexos;
DROP POLICY IF EXISTS "anexos insert" ON public.contribuyente_anexos;
DROP POLICY IF EXISTS "anexos update" ON public.contribuyente_anexos;
DROP POLICY IF EXISTS "anexos delete" ON public.contribuyente_anexos;

CREATE POLICY "anexos select" ON public.contribuyente_anexos
  FOR SELECT TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "anexos insert" ON public.contribuyente_anexos
  FOR INSERT TO authenticated WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "anexos update" ON public.contribuyente_anexos
  FOR UPDATE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "anexos delete" ON public.contribuyente_anexos
  FOR DELETE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS "representantes select" ON public.contribuyente_representantes;
DROP POLICY IF EXISTS "representantes insert" ON public.contribuyente_representantes;
DROP POLICY IF EXISTS "representantes update" ON public.contribuyente_representantes;
DROP POLICY IF EXISTS "representantes delete" ON public.contribuyente_representantes;

CREATE POLICY "representantes select" ON public.contribuyente_representantes
  FOR SELECT TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "representantes insert" ON public.contribuyente_representantes
  FOR INSERT TO authenticated WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "representantes update" ON public.contribuyente_representantes
  FOR UPDATE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "representantes delete" ON public.contribuyente_representantes
  FOR DELETE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS "tributos select" ON public.contribuyente_tributos;
DROP POLICY IF EXISTS "tributos insert" ON public.contribuyente_tributos;
DROP POLICY IF EXISTS "tributos update" ON public.contribuyente_tributos;
DROP POLICY IF EXISTS "tributos delete" ON public.contribuyente_tributos;

CREATE POLICY "tributos select" ON public.contribuyente_tributos
  FOR SELECT TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "tributos insert" ON public.contribuyente_tributos
  FOR INSERT TO authenticated WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "tributos update" ON public.contribuyente_tributos
  FOR UPDATE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "tributos delete" ON public.contribuyente_tributos
  FOR DELETE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));

-- uit_valores: lectura global autenticada
DROP POLICY IF EXISTS "uit select auth" ON public.uit_valores;
CREATE POLICY "uit select auth" ON public.uit_valores
  FOR SELECT TO authenticated USING (true);

-- ingresos anuales
DROP POLICY IF EXISTS "ingresos select" ON public.contribuyente_ingresos_anuales;
DROP POLICY IF EXISTS "ingresos insert" ON public.contribuyente_ingresos_anuales;
DROP POLICY IF EXISTS "ingresos update" ON public.contribuyente_ingresos_anuales;
DROP POLICY IF EXISTS "ingresos delete" ON public.contribuyente_ingresos_anuales;

CREATE POLICY "ingresos select" ON public.contribuyente_ingresos_anuales
  FOR SELECT TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "ingresos insert" ON public.contribuyente_ingresos_anuales
  FOR INSERT TO authenticated WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "ingresos update" ON public.contribuyente_ingresos_anuales
  FOR UPDATE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));
CREATE POLICY "ingresos delete" ON public.contribuyente_ingresos_anuales
  FOR DELETE TO authenticated USING (public.fn_user_can_access_contribuyente(contribuyente_id));

-- =============================================================================
-- 8. RPC: fn_evaluar_libros_obligados
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_evaluar_libros_obligados(
  p_contribuyente_id uuid,
  p_ejercicio int
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contrib record;
  v_uit numeric(10, 2);
  v_ingresos_soles numeric(16, 2) := 0;
  v_ingresos_uit numeric(14, 4) := 0;
  v_formato text;
  v_libros jsonb := '[]'::jsonb;
BEGIN
  IF NOT public.fn_user_can_access_contribuyente(p_contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al contribuyente %', p_contribuyente_id
      USING ERRCODE = '42501';
  END IF;

  SELECT
    c.id,
    c.ruc,
    c.razon_social,
    c.codigo_regimen,
    c.estado_contribuyente,
    c.condicion_domicilio
  INTO v_contrib
  FROM public.contribuyentes c
  WHERE c.id = p_contribuyente_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contribuyente no encontrado: %', p_contribuyente_id
      USING ERRCODE = 'P0002';
  END IF;

  SELECT u.monto INTO v_uit
  FROM public.uit_valores u
  WHERE u.ejercicio = p_ejercicio;

  IF v_uit IS NULL THEN
    RAISE EXCEPTION 'No existe UIT configurada para el ejercicio %', p_ejercicio;
  END IF;

  SELECT COALESCE(cia.ingresos_brutos_soles, 0), COALESCE(cia.ingresos_brutos_uit, 0)
  INTO v_ingresos_soles, v_ingresos_uit
  FROM public.contribuyente_ingresos_anuales cia
  WHERE cia.contribuyente_id = p_contribuyente_id
    AND cia.ejercicio = p_ejercicio;

  IF v_contrib.codigo_regimen IN ('NRUS', 'RER') THEN
    v_formato := 'NO_APLICA';
    v_libros := jsonb_build_array(
      jsonb_build_object(
        'codigo', 'INFO',
        'nombre', 'Régimen simplificado (NRUS/RER)',
        'obligatorio', false,
        'descripcion', 'No aplica Formato 5.1 ni 5.2. Obligaciones según régimen especial SUNAT.'
      )
    );
  ELSE
    IF v_ingresos_uit <= 300 THEN
      v_formato := 'FORMATO_5_2_SIMPLIFICADO';
    ELSE
      v_formato := 'FORMATO_5_1_DIARIO';
    END IF;

    v_libros := jsonb_build_array(
      jsonb_build_object(
        'codigo', '080100',
        'nombre', 'Registro de Compras Electrónico (RCE)',
        'obligatorio', true,
        'formato_ple', '8.1'
      ),
      jsonb_build_object(
        'codigo', '140100',
        'nombre', 'Registro de Ventas e Ingresos Electrónico (RVIE)',
        'obligatorio', true,
        'formato_ple', '14.1'
      )
    );

    IF v_formato = 'FORMATO_5_2_SIMPLIFICADO' THEN
      v_libros := v_libros || jsonb_build_array(
        jsonb_build_object(
          'codigo', '050200',
          'nombre', 'Libro Diario Simplificado (Formato 5.2)',
          'obligatorio', true,
          'formato_ple', '5.2',
          'destacado', true
        ),
        jsonb_build_object(
          'codigo', '010100',
          'nombre', 'Libro Caja y Bancos',
          'obligatorio', true,
          'formato_ple', '1.1'
        )
      );
    ELSE
      v_libros := v_libros || jsonb_build_array(
        jsonb_build_object(
          'codigo', '050100',
          'nombre', 'Libro Diario (Formato 5.1)',
          'obligatorio', true,
          'formato_ple', '5.1',
          'destacado', true
        ),
        jsonb_build_object(
          'codigo', '060100',
          'nombre', 'Libro Mayor',
          'obligatorio', true,
          'formato_ple', '6.1'
        ),
        jsonb_build_object(
          'codigo', '030100',
          'nombre', 'Libro de Inventarios y Balances',
          'obligatorio', true,
          'formato_ple', '3.1'
        ),
        jsonb_build_object(
          'codigo', '010100',
          'nombre', 'Libro Caja y Bancos',
          'obligatorio', true,
          'formato_ple', '1.1'
        )
      );
    END IF;

    IF v_ingresos_uit > 500 THEN
      v_libros := v_libros || jsonb_build_array(
        jsonb_build_object(
          'codigo', 'NOTA_500',
          'nombre', 'Umbral 500 UIT superado',
          'obligatorio', false,
          'descripcion', 'Verificar obligaciones adicionales de información financiera SUNAT.'
        )
      );
    END IF;

    IF v_ingresos_uit > 1700 THEN
      v_libros := v_libros || jsonb_build_array(
        jsonb_build_object(
          'codigo', 'NOTA_1700',
          'nombre', 'Umbral 1700 UIT superado',
          'obligatorio', false,
          'descripcion', 'Empresa de mediano/gran porte: revisar auditoría y EEFF completos.'
        )
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'contribuyente_id', v_contrib.id,
    'ruc', v_contrib.ruc,
    'razon_social', v_contrib.razon_social,
    'ejercicio', p_ejercicio,
    'codigo_regimen', v_contrib.codigo_regimen,
    'estado_contribuyente', v_contrib.estado_contribuyente,
    'condicion_domicilio', v_contrib.condicion_domicilio,
    'ingresos_brutos_soles', v_ingresos_soles,
    'uit_monto', v_uit,
    'ingresos_brutos_uit', COALESCE(v_ingresos_uit, round(v_ingresos_soles / v_uit, 4)),
    'formato_libro_diario', v_formato,
    'umbrales_uit', jsonb_build_object(
      'simplificado', 300,
      'intermedio', 500,
      'completo', 1700
    ),
    'libros_obligados', v_libros,
    'evaluado_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_evaluar_libros_obligados(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_evaluar_libros_obligados(uuid, int) TO authenticated;

-- =============================================================================
-- 9. RPC: fn_upsert_contribuyente_full
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_upsert_contribuyente_full(
  p_estudio_id uuid,
  p_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ruc char(11);
  v_contribuyente_id uuid;
  v_anexo jsonb;
  v_repr jsonb;
  v_trib jsonb;
BEGIN
  IF NOT public.fn_user_has_estudio_access(p_estudio_id) THEN
    RAISE EXCEPTION 'Acceso denegado al estudio %', p_estudio_id
      USING ERRCODE = '42501';
  END IF;

  v_ruc := regexp_replace(COALESCE(p_data->>'ruc', ''), '\D', '', 'g');
  IF length(v_ruc) <> 11 THEN
    RAISE EXCEPTION 'RUC inválido: debe tener 11 dígitos';
  END IF;

  INSERT INTO public.contribuyentes (
    ruc,
    estudio_id,
    razon_social,
    nombre_comercial,
    estado_contribuyente,
    condicion_domicilio,
    codigo_regimen,
    direccion_fiscal,
    ubigeo,
    departamento,
    provincia,
    distrito,
    sistema_emision,
    sistema_contabilidad,
    actividad_economica_principal,
    fecha_inicio_actividades,
    es_agente_retencion,
    es_agente_percepcion,
    es_buen_contribuyente,
    estado,
    otros
  ) VALUES (
    v_ruc,
    p_estudio_id,
    COALESCE(NULLIF(trim(p_data->>'razon_social'), ''), 'SIN RAZON SOCIAL'),
    NULLIF(trim(p_data->>'nombre_comercial'), ''),
    NULLIF(trim(p_data->>'estado_contribuyente'), ''),
    NULLIF(trim(p_data->>'condicion_domicilio'), ''),
    CASE
      WHEN upper(COALESCE(p_data->>'codigo_regimen', '')) IN ('NRUS', 'RER', 'RMT', 'RG')
        THEN upper(p_data->>'codigo_regimen')::public.regimen_tributario_enum
      ELSE NULL
    END,
    NULLIF(trim(p_data->>'direccion_fiscal'), ''),
    NULLIF(regexp_replace(COALESCE(p_data->>'ubigeo', ''), '\D', '', 'g'), '')::char(6),
    NULLIF(trim(p_data->>'departamento'), ''),
    NULLIF(trim(p_data->>'provincia'), ''),
    NULLIF(trim(p_data->>'distrito'), ''),
    NULLIF(trim(p_data->>'sistema_emision'), ''),
    NULLIF(trim(p_data->>'sistema_contabilidad'), ''),
    NULLIF(trim(p_data->>'actividad_economica_principal'), ''),
    CASE
      WHEN p_data->>'fecha_inicio_actividades' IS NOT NULL
        AND trim(p_data->>'fecha_inicio_actividades') <> ''
      THEN (p_data->>'fecha_inicio_actividades')::date
      ELSE NULL
    END,
    COALESCE((p_data->>'es_agente_retencion')::boolean, false),
    COALESCE((p_data->>'es_agente_percepcion')::boolean, false),
    COALESCE((p_data->>'es_buen_contribuyente')::boolean, false),
    COALESCE(NULLIF(trim(p_data->>'estado'), ''), 'ACTIVO'),
    COALESCE(NULLIF(trim(p_data->>'otros'), ''), '')
  )
  ON CONFLICT (ruc) DO UPDATE SET
    estudio_id = EXCLUDED.estudio_id,
    razon_social = EXCLUDED.razon_social,
    nombre_comercial = EXCLUDED.nombre_comercial,
    estado_contribuyente = EXCLUDED.estado_contribuyente,
    condicion_domicilio = EXCLUDED.condicion_domicilio,
    codigo_regimen = EXCLUDED.codigo_regimen,
    direccion_fiscal = EXCLUDED.direccion_fiscal,
    ubigeo = EXCLUDED.ubigeo,
    departamento = EXCLUDED.departamento,
    provincia = EXCLUDED.provincia,
    distrito = EXCLUDED.distrito,
    sistema_emision = EXCLUDED.sistema_emision,
    sistema_contabilidad = EXCLUDED.sistema_contabilidad,
    actividad_economica_principal = EXCLUDED.actividad_economica_principal,
    fecha_inicio_actividades = EXCLUDED.fecha_inicio_actividades,
    es_agente_retencion = EXCLUDED.es_agente_retencion,
    es_agente_percepcion = EXCLUDED.es_agente_percepcion,
    es_buen_contribuyente = EXCLUDED.es_buen_contribuyente,
    estado = EXCLUDED.estado,
    otros = EXCLUDED.otros,
    updated_at = now()
  RETURNING id INTO v_contribuyente_id;

  DELETE FROM public.contribuyente_anexos WHERE contribuyente_id = v_contribuyente_id;
  DELETE FROM public.contribuyente_representantes WHERE contribuyente_id = v_contribuyente_id;
  DELETE FROM public.contribuyente_tributos WHERE contribuyente_id = v_contribuyente_id;

  IF jsonb_typeof(p_data->'anexos') = 'array' THEN
    FOR v_anexo IN SELECT * FROM jsonb_array_elements(p_data->'anexos')
    LOOP
      INSERT INTO public.contribuyente_anexos (
        contribuyente_id,
        codigo_anexo,
        tipo_establecimiento,
        direccion,
        departamento,
        provincia,
        distrito,
        estado
      ) VALUES (
        v_contribuyente_id,
        COALESCE(NULLIF(trim(v_anexo->>'codigo_anexo'), ''), '0000'),
        NULLIF(trim(v_anexo->>'tipo_establecimiento'), ''),
        NULLIF(trim(v_anexo->>'direccion'), ''),
        NULLIF(trim(v_anexo->>'departamento'), ''),
        NULLIF(trim(v_anexo->>'provincia'), ''),
        NULLIF(trim(v_anexo->>'distrito'), ''),
        COALESCE(NULLIF(trim(v_anexo->>'estado'), ''), 'ACTIVO')
      );
    END LOOP;
  END IF;

  IF jsonb_typeof(p_data->'representantes') = 'array' THEN
    FOR v_repr IN SELECT * FROM jsonb_array_elements(p_data->'representantes')
    LOOP
      INSERT INTO public.contribuyente_representantes (
        contribuyente_id,
        tipo_documento,
        numero_documento,
        nombre_completo,
        cargo,
        fecha_desde,
        estado
      ) VALUES (
        v_contribuyente_id,
        COALESCE(NULLIF(trim(v_repr->>'tipo_documento'), ''), 'DNI'),
        COALESCE(NULLIF(trim(v_repr->>'numero_documento'), ''), 'S/N'),
        COALESCE(NULLIF(trim(v_repr->>'nombre_completo'), ''), 'SIN NOMBRE'),
        NULLIF(trim(v_repr->>'cargo'), ''),
        CASE
          WHEN v_repr->>'fecha_desde' IS NOT NULL AND trim(v_repr->>'fecha_desde') <> ''
          THEN (v_repr->>'fecha_desde')::date
          ELSE NULL
        END,
        COALESCE(NULLIF(trim(v_repr->>'estado'), ''), 'ACTIVO')
      );
    END LOOP;
  END IF;

  IF jsonb_typeof(p_data->'tributos') = 'array' THEN
    FOR v_trib IN SELECT * FROM jsonb_array_elements(p_data->'tributos')
    LOOP
      INSERT INTO public.contribuyente_tributos (
        contribuyente_id,
        codigo_tributo,
        descripcion_tributo,
        fecha_afectacion,
        estado
      ) VALUES (
        v_contribuyente_id,
        COALESCE(NULLIF(trim(v_trib->>'codigo_tributo'), ''), 'S/N'),
        NULLIF(trim(v_trib->>'descripcion_tributo'), ''),
        CASE
          WHEN v_trib->>'fecha_afectacion' IS NOT NULL AND trim(v_trib->>'fecha_afectacion') <> ''
          THEN (v_trib->>'fecha_afectacion')::date
          ELSE NULL
        END,
        COALESCE(NULLIF(trim(v_trib->>'estado'), ''), 'VIGENTE')
      );
    END LOOP;
  END IF;

  IF p_data ? 'ingresos_anuales' AND jsonb_typeof(p_data->'ingresos_anuales') = 'object' THEN
    INSERT INTO public.contribuyente_ingresos_anuales (
      contribuyente_id,
      ejercicio,
      ingresos_brutos_soles,
      uit_monto
    )
    SELECT
      v_contribuyente_id,
      (kv.key)::int,
      COALESCE((kv.value)::numeric, 0),
      u.monto
    FROM jsonb_each_text(p_data->'ingresos_anuales') kv
    INNER JOIN public.uit_valores u ON u.ejercicio = (kv.key)::int
    ON CONFLICT (contribuyente_id, ejercicio) DO UPDATE SET
      ingresos_brutos_soles = EXCLUDED.ingresos_brutos_soles,
      uit_monto = EXCLUDED.uit_monto,
      updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'contribuyente_id', v_contribuyente_id,
    'ruc', v_ruc,
    'estudio_id', p_estudio_id,
    'updated_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_upsert_contribuyente_full(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_upsert_contribuyente_full(uuid, jsonb) TO authenticated;

-- Auto-vincular usuarios autenticados al estudio default si no tienen membresía
CREATE OR REPLACE FUNCTION public.fn_ensure_default_estudio_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_estudio_id uuid;
BEGIN
  SELECT id INTO v_estudio_id
  FROM public.estudios_contables
  WHERE ruc = '00000000000'
  LIMIT 1;

  IF v_estudio_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.estudio_usuarios (estudio_id, user_id, rol, activo)
  VALUES (v_estudio_id, NEW.id, 'CONTADOR', true)
  ON CONFLICT (estudio_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_estudio ON auth.users;
CREATE TRIGGER on_auth_user_created_estudio
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_ensure_default_estudio_membership();

-- Vincular usuarios existentes al estudio default
INSERT INTO public.estudio_usuarios (estudio_id, user_id, rol, activo)
SELECT e.id, u.id, 'CONTADOR', true
FROM auth.users u
CROSS JOIN public.estudios_contables e
WHERE e.ruc = '00000000000'
ON CONFLICT (estudio_id, user_id) DO NOTHING;
