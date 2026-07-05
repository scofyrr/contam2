-- Libro Diario premium: plantillas, programados, tipos de cambio
-- Idempotente

CREATE TABLE IF NOT EXISTS public.asientos_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  categoria text NOT NULL,
  tipo_libro text NOT NULL,
  configuracion jsonb NOT NULL DEFAULT '{}'::jsonb,
  activo boolean DEFAULT true,
  uso_count int DEFAULT 0,
  ultima_uso timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.asientos_programados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.asientos_templates(id),
  nombre text NOT NULL,
  parametros jsonb NOT NULL DEFAULT '{}'::jsonb,
  frecuencia text NOT NULL,
  dia_ejecucion int NOT NULL DEFAULT 1,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  ultima_ejecucion timestamptz,
  proxima_ejecucion date NOT NULL,
  activo boolean DEFAULT true,
  generar_automaticamente boolean DEFAULT false,
  notificar_antes int DEFAULT 3,
  ruc text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tipos_cambio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL,
  moneda text NOT NULL DEFAULT 'USD',
  compra numeric(10,4) NOT NULL,
  venta numeric(10,4) NOT NULL,
  fuente text DEFAULT 'MANUAL',
  created_at timestamptz DEFAULT now(),
  UNIQUE(fecha, moneda)
);

CREATE INDEX IF NOT EXISTS idx_asientos_prog_proxima ON public.asientos_programados(proxima_ejecucion) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_tipos_cambio_fecha ON public.tipos_cambio(fecha DESC, moneda);

ALTER TABLE public.asientos_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asientos_programados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_cambio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tpl_select ON public.asientos_templates;
CREATE POLICY tpl_select ON public.asientos_templates FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS tpl_write ON public.asientos_templates;
CREATE POLICY tpl_write ON public.asientos_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS prog_select ON public.asientos_programados;
CREATE POLICY prog_select ON public.asientos_programados FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS prog_write ON public.asientos_programados;
CREATE POLICY prog_write ON public.asientos_programados FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS tc_select ON public.tipos_cambio;
CREATE POLICY tc_select ON public.tipos_cambio FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS tc_write ON public.tipos_cambio;
CREATE POLICY tc_write ON public.tipos_cambio FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.get_tipo_cambio(p_fecha date, p_moneda text DEFAULT 'USD')
RETURNS numeric(10,4)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_tc numeric(10,4);
BEGIN
  SELECT venta INTO v_tc
  FROM tipos_cambio
  WHERE fecha <= p_fecha AND moneda = p_moneda
  ORDER BY fecha DESC
  LIMIT 1;

  RETURN COALESCE(v_tc, 3.7500);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tipo_cambio(date, text) TO authenticated;

-- Seed tipos de cambio recientes (simulados)
INSERT INTO public.tipos_cambio (fecha, moneda, compra, venta, fuente)
SELECT d::date, 'USD', 3.73, 3.75, 'SBS'
FROM generate_series(CURRENT_DATE - 30, CURRENT_DATE, '1 day'::interval) AS d
ON CONFLICT (fecha, moneda) DO NOTHING;
