-- Cobrado/Pagado + asiento de cancelación + vínculo con libro caja

ALTER TABLE public.registros_sire
  ADD COLUMN IF NOT EXISTS estado_cobro text NOT NULL DEFAULT 'pendiente' CHECK (estado_cobro IN ('pendiente','cobrado')),
  ADD COLUMN IF NOT EXISTS estado_pago text NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente','pagado')),
  ADD COLUMN IF NOT EXISTS cancelacion_asiento_id uuid,
  ADD COLUMN IF NOT EXISTS cancelacion_mov_caja_id uuid,
  ADD COLUMN IF NOT EXISTS cancelacion_generada_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'registros_sire_cancelacion_asiento_id_fkey'
  ) THEN
    ALTER TABLE public.registros_sire
      ADD CONSTRAINT registros_sire_cancelacion_asiento_id_fkey
      FOREIGN KEY (cancelacion_asiento_id) REFERENCES public.asientos_contables(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'registros_sire_cancelacion_mov_caja_id_fkey'
  ) THEN
    ALTER TABLE public.registros_sire
      ADD CONSTRAINT registros_sire_cancelacion_mov_caja_id_fkey
      FOREIGN KEY (cancelacion_mov_caja_id) REFERENCES public.movimientos_caja(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

-- Permitir más de un asiento por registro_sire_id (principal vs cancelación).
ALTER TABLE public.asientos_contables
  ADD COLUMN IF NOT EXISTS tipo_asiento text NOT NULL DEFAULT 'principal'
    CHECK (tipo_asiento IN ('principal','cancelacion_caja'));

DROP INDEX IF EXISTS public.idx_asientos_un_asiento_por_registro_sire;
CREATE UNIQUE INDEX IF NOT EXISTS idx_asientos_unico_por_registro_sire_y_tipo
  ON public.asientos_contables(registro_sire_id, tipo_asiento)
  WHERE registro_sire_id IS NOT NULL;

