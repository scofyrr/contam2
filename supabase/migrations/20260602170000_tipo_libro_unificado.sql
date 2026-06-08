-- Clasificación unificada Libro Diario / Libro Caja sobre asientos_contables plano

ALTER TABLE public.asientos_contables
  ADD COLUMN IF NOT EXISTS tipo_libro text;

UPDATE public.asientos_contables
SET tipo_libro = CASE
  WHEN tipo_asiento = 'cancelacion_caja' THEN 'CAJA_BANCOS'
  WHEN tipo_registro = 'VENTA' AND tipo_asiento = 'principal' THEN 'DIARIO_VENTAS'
  WHEN tipo_registro = 'COMPRA' AND tipo_asiento = 'principal' THEN 'DIARIO_COMPRAS'
  ELSE 'DIARIO_MANUAL'
END
WHERE tipo_libro IS NULL;

ALTER TABLE public.asientos_contables
  ALTER COLUMN tipo_libro SET DEFAULT 'DIARIO_MANUAL';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asientos_contables_tipo_libro_check'
  ) THEN
    ALTER TABLE public.asientos_contables
      ADD CONSTRAINT asientos_contables_tipo_libro_check
      CHECK (tipo_libro IN ('DIARIO_COMPRAS', 'DIARIO_VENTAS', 'CAJA_BANCOS', 'DIARIO_MANUAL'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_asientos_tipo_libro_periodo
  ON public.asientos_contables(tipo_libro, periodo);

CREATE INDEX IF NOT EXISTS idx_asientos_tipo_libro_ruc_contraparte
  ON public.asientos_contables(ruc_contraparte, tipo_libro);

-- Cuentas financieras (Clase 10) por contribuyente
CREATE TABLE IF NOT EXISTS public.cuentas_financieras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc varchar(11) NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('CAJA_CHICA', 'BANCO')),
  cuenta_contable varchar(20) NOT NULL,
  banco text,
  numero_cuenta text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cuentas_financieras_ruc
  ON public.cuentas_financieras(ruc) WHERE activo = true;

ALTER TABLE public.cuentas_financieras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth all cuentas_financieras" ON public.cuentas_financieras;
CREATE POLICY "auth all cuentas_financieras" ON public.cuentas_financieras
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP VIEW IF EXISTS public.v_libro_diario;
CREATE OR REPLACE VIEW public.v_libro_diario AS
SELECT
  a.id,
  a.sire_registro_id,
  a.ruc_contraparte AS ruc,
  a.periodo,
  a.fecha_asiento,
  a.cuenta_contable,
  a.debe,
  a.haber,
  a.glosa,
  a.tipo_asiento AS origen,
  a.tipo_libro,
  a.tipo_registro,
  a.serie_cdp,
  a.nro_cdp_inicial,
  rs.razon_social,
  rs.cod_tipo_cdp,
  rs.nombre_contraparte
FROM public.asientos_contables a
LEFT JOIN public.registros_sire rs ON rs.id = a.sire_registro_id;
