-- PCGE Editable (Mantenimiento de Plan de Cuentas)
-- Extiende tabla_pcge existente para permitir edición/activación.

ALTER TABLE public.tabla_pcge
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS naturaleza text,
  ADD COLUMN IF NOT EXISTS padre_codigo varchar(10),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- FK opcional a sí misma (jerarquía). No bloquear si aún no existe la cuenta padre.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tabla_pcge_padre_codigo_fkey'
  ) THEN
    ALTER TABLE public.tabla_pcge
      ADD CONSTRAINT tabla_pcge_padre_codigo_fkey
      FOREIGN KEY (padre_codigo) REFERENCES public.tabla_pcge(codigo)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pcge_activo ON public.tabla_pcge(activo);
CREATE INDEX IF NOT EXISTS idx_pcge_padre ON public.tabla_pcge(padre_codigo);

DROP TRIGGER IF EXISTS tabla_pcge_updated ON public.tabla_pcge;
CREATE TRIGGER tabla_pcge_updated
  BEFORE UPDATE ON public.tabla_pcge
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.tabla_pcge ENABLE ROW LEVEL SECURITY;

-- Reemplazar política read-only por CRUD (por ahora a authenticated).
DROP POLICY IF EXISTS "auth read pcge" ON public.tabla_pcge;
DROP POLICY IF EXISTS "auth select pcge" ON public.tabla_pcge;
DROP POLICY IF EXISTS "auth insert pcge" ON public.tabla_pcge;
DROP POLICY IF EXISTS "auth update pcge" ON public.tabla_pcge;
DROP POLICY IF EXISTS "auth delete pcge" ON public.tabla_pcge;

CREATE POLICY "auth select pcge" ON public.tabla_pcge
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert pcge" ON public.tabla_pcge
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update pcge" ON public.tabla_pcge
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete pcge" ON public.tabla_pcge
  FOR DELETE TO authenticated USING (true);

