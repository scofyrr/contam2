-- =============================================================================
-- Fix: columnas de auditoría en config_estudio / feature_flags
-- Corrige error 42703 — actualizado_por does not exist (tablas creadas antes
-- de la migración 20260703000031 o con esquema parcial)
-- =============================================================================

ALTER TABLE public.config_estudio
  ADD COLUMN IF NOT EXISTS actualizado_por uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.feature_flags
  ADD COLUMN IF NOT EXISTS actualizado_por uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Asegurar trigger updated_at en config_estudio
DROP TRIGGER IF EXISTS config_estudio_updated ON public.config_estudio;
CREATE TRIGGER config_estudio_updated
  BEFORE UPDATE ON public.config_estudio
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS feature_flags_updated ON public.feature_flags;
CREATE TRIGGER feature_flags_updated
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Re-crear RPC de actualización (referencia actualizado_por)
CREATE OR REPLACE FUNCTION public.rpc_update_config_estudio(
  p_clave text,
  p_valor jsonb,
  p_descripcion text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.configuracion', NULL) THEN
    RAISE EXCEPTION 'No tiene permisos para modificar configuración';
  END IF;

  INSERT INTO public.config_estudio (clave, valor, descripcion, actualizado_por, updated_at)
  VALUES (p_clave, p_valor, p_descripcion, auth.uid(), now())
  ON CONFLICT (clave) DO UPDATE SET
    valor = EXCLUDED.valor,
    descripcion = COALESCE(p_descripcion, public.config_estudio.descripcion),
    actualizado_por = auth.uid(),
    updated_at = now();

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_toggle_feature_flag(p_codigo text, p_activo boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.rpc_check_permission(auth.uid(), 'admin.feature_flags', NULL) THEN
    RAISE EXCEPTION 'No tiene permisos para modificar feature flags';
  END IF;

  UPDATE public.feature_flags
  SET activo = p_activo, actualizado_por = auth.uid(), updated_at = now()
  WHERE codigo = p_codigo;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_update_config_estudio(text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_update_config_estudio(text, jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_toggle_feature_flag(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_toggle_feature_flag(text, boolean) TO service_role;

-- Opcional: agregar /libro-mayor al sidebar si aún no está
UPDATE public.config_estudio
SET
  valor = jsonb_set(
    valor,
    '{modulos}',
    COALESCE(valor->'modulos', '[]'::jsonb) || '["/libro-mayor"]'::jsonb,
    true
  ),
  updated_at = now()
WHERE clave = 'sidebar_contador'
  AND NOT COALESCE(valor->'modulos', '[]'::jsonb) @> '["/libro-mayor"]'::jsonb;
