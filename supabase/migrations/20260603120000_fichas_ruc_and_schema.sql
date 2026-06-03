-- Fichas RUC persistidas + columnas PCGE de producción (idempotente)

CREATE TABLE IF NOT EXISTS public.fichas_ruc (
  ruc char(11) PRIMARY KEY,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS fichas_ruc_updated ON public.fichas_ruc;
CREATE TRIGGER fichas_ruc_updated
  BEFORE UPDATE ON public.fichas_ruc
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.fichas_ruc ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth select fichas_ruc" ON public.fichas_ruc;
DROP POLICY IF EXISTS "auth insert fichas_ruc" ON public.fichas_ruc;
DROP POLICY IF EXISTS "auth update fichas_ruc" ON public.fichas_ruc;
DROP POLICY IF EXISTS "auth delete fichas_ruc" ON public.fichas_ruc;

CREATE POLICY "auth select fichas_ruc" ON public.fichas_ruc FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert fichas_ruc" ON public.fichas_ruc FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update fichas_ruc" ON public.fichas_ruc FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete fichas_ruc" ON public.fichas_ruc FOR DELETE TO authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fichas_ruc_ruc_contribuyente_fkey'
  ) THEN
    ALTER TABLE public.fichas_ruc
      ADD CONSTRAINT fichas_ruc_ruc_contribuyente_fkey
      FOREIGN KEY (ruc) REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Columnas adicionales PCGE (producción)
ALTER TABLE public.plan_contable_pcge ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE public.plan_contable_pcge ADD COLUMN IF NOT EXISTS tipo_cuenta varchar(50);
ALTER TABLE public.plan_contable_pcge ADD COLUMN IF NOT EXISTS aplica_para varchar(100);
ALTER TABLE public.plan_contable_pcge ADD COLUMN IF NOT EXISTS palabras_clave text;

-- Contribuyentes: rentas atómicas (migración desde categorias jsonb si existe)
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS cat1ra boolean NOT NULL DEFAULT false;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS cat2da boolean NOT NULL DEFAULT false;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS cat3ra boolean NOT NULL DEFAULT false;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS cat4ta_retenciones boolean NOT NULL DEFAULT false;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS cat4ta_cta_propia boolean NOT NULL DEFAULT false;
ALTER TABLE public.contribuyentes ADD COLUMN IF NOT EXISTS cat5ta boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contribuyentes' AND column_name = 'categorias'
  ) THEN
    UPDATE public.contribuyentes SET
      cat1ra = COALESCE((categorias->>'cat1ra')::boolean, false),
      cat2da = COALESCE((categorias->>'cat2da')::boolean, false),
      cat3ra = COALESCE((categorias->>'cat3ra')::boolean, false),
      cat4ta_retenciones = COALESCE((categorias->>'cat4taRetenciones')::boolean, false),
      cat4ta_cta_propia = COALESCE((categorias->>'cat4taCtaPropia')::boolean, false),
      cat5ta = COALESCE((categorias->>'cat5ta')::boolean, false);
  END IF;
END $$;
