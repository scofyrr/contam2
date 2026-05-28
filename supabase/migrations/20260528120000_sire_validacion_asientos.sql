-- Validación SIRE + asientos contables vinculados a registros_sire

ALTER TABLE public.registros_sire
  ADD COLUMN IF NOT EXISTS estado_validacion text NOT NULL DEFAULT 'pendiente'
    CHECK (estado_validacion IN ('pendiente', 'validado', 'ia_sugerido')),
  ADD COLUMN IF NOT EXISTS cuenta_pcge varchar(10),
  ADD COLUMN IF NOT EXISTS finalidad_operativa text,
  ADD COLUMN IF NOT EXISTS descripcion_items text;

CREATE INDEX IF NOT EXISTS idx_rsire_estado_validacion
  ON public.registros_sire(estado_validacion);

ALTER TABLE public.asientos_contables
  ADD COLUMN IF NOT EXISTS registro_sire_id uuid
    REFERENCES public.registros_sire(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_asientos_registro_sire
  ON public.asientos_contables(registro_sire_id);

ALTER TABLE public.asientos_contables
  DROP CONSTRAINT IF EXISTS asientos_contables_check;

ALTER TABLE public.asientos_contables
  ADD CONSTRAINT asientos_contables_origen_check CHECK (
    (
      origen = 'VENTAS'
      AND comprobante_venta_id IS NOT NULL
      AND comprobante_compra_id IS NULL
    )
    OR (
      origen = 'COMPRAS'
      AND comprobante_compra_id IS NOT NULL
      AND comprobante_venta_id IS NULL
    )
    OR (
      registro_sire_id IS NOT NULL
      AND comprobante_venta_id IS NULL
      AND comprobante_compra_id IS NULL
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_asientos_un_asiento_por_registro_sire
  ON public.asientos_contables(registro_sire_id)
  WHERE registro_sire_id IS NOT NULL;

-- Vista plana para Libro Diario (equivalente al modelo línea a línea solicitado)
CREATE OR REPLACE VIEW public.v_libro_diario AS
SELECT
  la.id,
  ac.registro_sire_id AS sire_registro_id,
  ac.fecha AS fecha_asiento,
  ac.periodo,
  la.cuenta AS cuenta_contable,
  la.debe,
  la.haber,
  COALESCE(la.glosa, ac.glosa) AS glosa,
  CASE WHEN la.debe > 0 THEN 'debe' ELSE 'haber' END AS naturaleza,
  ac.origen,
  rs.tipo AS tipo_registro,
  rs.ruc,
  rs.razon_social,
  rs.cod_tipo_cdp,
  rs.serie_cdp,
  rs.nro_cdp_inicial,
  ac.created_at
FROM public.lineas_asiento la
INNER JOIN public.asientos_contables ac ON ac.id = la.asiento_id
LEFT JOIN public.registros_sire rs ON rs.id = ac.registro_sire_id;

ALTER VIEW public.v_libro_diario SET (security_invoker = on);

GRANT SELECT ON public.v_libro_diario TO authenticated;

-- Políticas RLS para asientos y líneas (si no existen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'asientos_contables' AND policyname = 'auth select asientos'
  ) THEN
    CREATE POLICY "auth select asientos" ON public.asientos_contables
      FOR SELECT TO authenticated USING (true);
    CREATE POLICY "auth insert asientos" ON public.asientos_contables
      FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "auth update asientos" ON public.asientos_contables
      FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "auth delete asientos" ON public.asientos_contables
      FOR DELETE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'lineas_asiento' AND policyname = 'auth select lineas'
  ) THEN
    CREATE POLICY "auth select lineas" ON public.lineas_asiento
      FOR SELECT TO authenticated USING (true);
    CREATE POLICY "auth insert lineas" ON public.lineas_asiento
      FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "auth update lineas" ON public.lineas_asiento
      FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "auth delete lineas" ON public.lineas_asiento
      FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- Cuentas PCGE de uso frecuente para asientos automáticos
INSERT INTO public.tabla_pcge (codigo, descripcion, nivel) VALUES
  ('121201', 'FACTURAS POR COBRAR', 3),
  ('421201', 'FACTURAS POR PAGAR', 3),
  ('401111', 'IGV - CUENTA PROPIA', 3),
  ('601101', 'MERCADERIAS', 3),
  ('701111', 'VENTA DE MERCADERIAS', 3)
ON CONFLICT (codigo) DO NOTHING;
