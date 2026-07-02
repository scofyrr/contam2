-- ============================================================
-- Agregar columna padre_codigo a plan_contable_pcge
-- ============================================================

-- Agregar la columna si no existe
ALTER TABLE public.plan_contable_pcge 
ADD COLUMN IF NOT EXISTS padre_codigo TEXT;

-- Agregar columna es_agrupador si no existe
ALTER TABLE public.plan_contable_pcge 
ADD COLUMN IF NOT EXISTS es_agrupador BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pcge_padre_codigo 
ON public.plan_contable_pcge(padre_codigo);

-- Poblar padre_codigo basado en la lógica de PCGE
UPDATE public.plan_contable_pcge 
SET padre_codigo = public.pcge_padre_desde_codigo(codigo_cuenta)
WHERE padre_codigo IS NULL 
AND codigo_cuenta IS NOT NULL;