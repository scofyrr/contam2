-- Libro Caja y Bancos (efectivo) - Formato SUNAT simplificado

CREATE TABLE IF NOT EXISTS public.movimientos_caja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlativo bigserial,
  ruc varchar(11),
  periodo char(6),
  fecha_operacion date NOT NULL,
  glosa text NOT NULL,
  cuenta_pcge varchar(10) NOT NULL REFERENCES public.tabla_pcge(codigo),
  debe numeric(14,2) NOT NULL DEFAULT 0,
  haber numeric(14,2) NOT NULL DEFAULT 0,
  origen text NOT NULL DEFAULT 'manual' CHECK (origen IN ('manual','sire')),
  registro_sire_id uuid REFERENCES public.registros_sire(id) ON DELETE SET NULL,
  asiento_id uuid REFERENCES public.asientos_contables(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (debe >= 0 AND haber >= 0),
  CHECK (NOT (debe > 0 AND haber > 0))
);

CREATE INDEX IF NOT EXISTS idx_caja_ruc_periodo_fecha
  ON public.movimientos_caja(ruc, periodo, fecha_operacion, correlativo);
CREATE INDEX IF NOT EXISTS idx_caja_registro_sire
  ON public.movimientos_caja(registro_sire_id);
CREATE INDEX IF NOT EXISTS idx_caja_asiento
  ON public.movimientos_caja(asiento_id);

DROP TRIGGER IF EXISTS movimientos_caja_updated ON public.movimientos_caja;
CREATE TRIGGER movimientos_caja_updated
  BEFORE UPDATE ON public.movimientos_caja
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.movimientos_caja ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth select caja" ON public.movimientos_caja;
DROP POLICY IF EXISTS "auth insert caja" ON public.movimientos_caja;
DROP POLICY IF EXISTS "auth update caja" ON public.movimientos_caja;
DROP POLICY IF EXISTS "auth delete caja" ON public.movimientos_caja;

CREATE POLICY "auth select caja" ON public.movimientos_caja
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert caja" ON public.movimientos_caja
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update caja" ON public.movimientos_caja
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete caja" ON public.movimientos_caja
  FOR DELETE TO authenticated USING (true);

