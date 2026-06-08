-- Alinear nombres de columnas SUNAT con producción (bi_adq_*, porcentaje_participacion)
-- Idempotente: solo renombra si existe el nombre legacy y falta el nuevo.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'bi_grav'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'bi_adq_grav'
  ) THEN
    ALTER TABLE public.registros_sire RENAME COLUMN bi_grav TO bi_adq_grav;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'igv_grav'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'igv_adq_grav'
  ) THEN
    ALTER TABLE public.registros_sire RENAME COLUMN igv_grav TO igv_adq_grav;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'bi_grav_y_no_grav'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'bi_adq_grav_y_no_grav'
  ) THEN
    ALTER TABLE public.registros_sire RENAME COLUMN bi_grav_y_no_grav TO bi_adq_grav_y_no_grav;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'igv_grav_y_no_grav'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'igv_adq_grav_y_no_grav'
  ) THEN
    ALTER TABLE public.registros_sire RENAME COLUMN igv_grav_y_no_grav TO igv_adq_grav_y_no_grav;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'bi_no_grav'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'bi_adq_no_grav'
  ) THEN
    ALTER TABLE public.registros_sire RENAME COLUMN bi_no_grav TO bi_adq_no_grav;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'igv_no_grav'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'igv_adq_no_grav'
  ) THEN
    ALTER TABLE public.registros_sire RENAME COLUMN igv_no_grav TO igv_adq_no_grav;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'valor_no_grav'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'valor_adq_no_grav'
  ) THEN
    ALTER TABLE public.registros_sire RENAME COLUMN valor_no_grav TO valor_adq_no_grav;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'pct_participacion'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registros_sire' AND column_name = 'porcentaje_participacion'
  ) THEN
    ALTER TABLE public.registros_sire RENAME COLUMN pct_participacion TO porcentaje_participacion;
  END IF;
END $$;

-- Opcional: quitar columnas mto_* si ya no se usan en producción
ALTER TABLE public.registros_sire DROP COLUMN IF EXISTS mto_bi_gravada;
ALTER TABLE public.registros_sire DROP COLUMN IF EXISTS mto_igv_ipe;
ALTER TABLE public.registros_sire DROP COLUMN IF EXISTS mto_total_cp;
