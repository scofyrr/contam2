-- Multiempresa: RUC en asientos_contables y vista libro diario

ALTER TABLE public.asientos_contables
  ADD COLUMN IF NOT EXISTS ruc char(11);

UPDATE public.asientos_contables ac
SET ruc = rs.ruc
FROM public.registros_sire rs
WHERE ac.ruc IS NULL
  AND ac.sire_registro_id IS NOT NULL
  AND rs.id = ac.sire_registro_id;

CREATE INDEX IF NOT EXISTS idx_asientos_ruc_periodo
  ON public.asientos_contables(ruc, periodo);

DROP VIEW IF EXISTS public.v_libro_diario;

CREATE VIEW public.v_libro_diario AS
SELECT
  ac.id,
  ac.sire_registro_id,
  ac.ruc,
  ac.periodo,
  ac.fecha_asiento,
  ac.cuenta_contable,
  ac.debe,
  ac.haber,
  ac.glosa,
  ac.tipo_asiento AS origen,
  rs.razon_social,
  rs.cod_tipo_cdp,
  rs.serie_cdp,
  rs.nro_cdp_inicial,
  rs.tipo AS tipo_registro
FROM public.asientos_contables ac
LEFT JOIN public.registros_sire rs ON rs.id = ac.sire_registro_id;
