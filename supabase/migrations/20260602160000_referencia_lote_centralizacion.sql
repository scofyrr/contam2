-- Referencia única por lote de centralización Caja → Diario

ALTER TABLE public.asientos_contables
  ADD COLUMN IF NOT EXISTS referencia_lote_id uuid;

CREATE INDEX IF NOT EXISTS idx_asientos_referencia_lote
  ON public.asientos_contables(referencia_lote_id)
  WHERE referencia_lote_id IS NOT NULL;
