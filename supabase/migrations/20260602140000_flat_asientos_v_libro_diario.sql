-- Libro diario y caja alineados al modelo plano (sin lineas_asiento)

-- Renombrar cuenta en movimientos_caja si aún existe cuenta_pcge
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'movimientos_caja' AND column_name = 'cuenta_pcge'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'movimientos_caja' AND column_name = 'cuenta_contable'
  ) THEN
    ALTER TABLE public.movimientos_caja RENAME COLUMN cuenta_pcge TO cuenta_contable;
  END IF;
END $$;

-- Columna fecha contable (paralela a fecha_operacion)
ALTER TABLE public.movimientos_caja
  ADD COLUMN IF NOT EXISTS fecha date;

UPDATE public.movimientos_caja
SET fecha = COALESCE(fecha, fecha_operacion)
WHERE fecha IS NULL;

-- Vista libro diario desde asientos_contables planos
DROP VIEW IF EXISTS public.v_libro_diario;

CREATE VIEW public.v_libro_diario AS
SELECT
  ac.id,
  ac.sire_registro_id,
  ac.periodo,
  ac.fecha_asiento,
  ac.cuenta_contable,
  ac.debe,
  ac.haber,
  ac.glosa,
  ac.naturaleza,
  ac.tipo_asiento AS origen,
  ac.tipo_registro,
  rs.ruc,
  rs.razon_social,
  rs.cod_tipo_cdp,
  rs.serie_cdp,
  rs.nro_cdp_inicial
FROM public.asientos_contables ac
LEFT JOIN public.registros_sire rs ON rs.id = ac.sire_registro_id;

-- Quitar índice único que impedía varias filas por comprobante SIRE (modelo plano)
DROP INDEX IF EXISTS public.idx_asientos_un_asiento_por_registro_sire;
