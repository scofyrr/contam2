-- Configuración contable para cancelaciones + auditoría mínima + anti-duplicados en caja

CREATE TABLE IF NOT EXISTS public.config_contable (
  id smallint PRIMARY KEY DEFAULT 1,
  cuenta_caja_default varchar(10) NOT NULL DEFAULT '10',
  cuenta_cxc_default varchar(10) NOT NULL DEFAULT '12',
  cuenta_cxp_default varchar(10) NOT NULL DEFAULT '42',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (id = 1)
);

-- Asegurar una fila
INSERT INTO public.config_contable (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS config_contable_updated ON public.config_contable;
CREATE TRIGGER config_contable_updated
  BEFORE UPDATE ON public.config_contable
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.config_contable ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth select config_contable" ON public.config_contable;
DROP POLICY IF EXISTS "auth update config_contable" ON public.config_contable;

CREATE POLICY "auth select config_contable" ON public.config_contable
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth update config_contable" ON public.config_contable
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Auditoría mínima: quién y cuándo ajustó manualmente
ALTER TABLE public.movimientos_caja
  ADD COLUMN IF NOT EXISTS editado_por text,
  ADD COLUMN IF NOT EXISTS editado_el timestamptz,
  ADD COLUMN IF NOT EXISTS editado_motivo text;

ALTER TABLE public.lineas_asiento
  ADD COLUMN IF NOT EXISTS editado_por text,
  ADD COLUMN IF NOT EXISTS editado_el timestamptz,
  ADD COLUMN IF NOT EXISTS editado_motivo text;

-- Evitar duplicar movimientos SIRE por el mismo registro (si ya existe, no crear otro)
CREATE UNIQUE INDEX IF NOT EXISTS idx_caja_unico_por_registro_sire_sire
  ON public.movimientos_caja(registro_sire_id)
  WHERE origen = 'sire' AND registro_sire_id IS NOT NULL;

