-- Macro-tarea 15-A: config_estudio + feature_flags (idempotente)

-- ============================================================
-- TABLA DE CONFIGURACIÓN DEL ESTUDIO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.config_estudio (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave           text NOT NULL UNIQUE,
  valor           jsonb NOT NULL,
  descripcion     text,
  actualizado_por uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

INSERT INTO public.config_estudio (clave, valor, descripcion) VALUES
(
  'dashboard_contador',
  '{
    "widgets": {
      "activos": ["kpis", "tareas_urgentes", "clientes", "carga_trabajo", "sugerencias", "logros", "actividad_reciente"],
      "orden": ["kpis", "tareas_urgentes", "clientes", "carga_trabajo", "sugerencias", "logros", "actividad_reciente"]
    },
    "kpis_visibles": ["clientes", "tareas", "vencidas", "efectividad", "racha"],
    "max_tareas_urgentes": 5,
    "max_clientes_grafico": 8,
    "mostrar_gamificacion": true,
    "mostrar_sugerencias": true,
    "mostrar_actividad_reciente": true,
    "intervalo_refresh_seg": 30
  }'::jsonb,
  'Configuración del dashboard del contador'
),
(
  'umbrales_contador',
  '{
    "carga_baja": 10,
    "carga_alta": 25,
    "carga_critica": 40,
    "vencidas_criticas": 5,
    "dias_alerta_proxima": 3,
    "efectividad_meta": 90,
    "efectividad_excelente": 95,
    "racha_minima_logro": 7,
    "horas_inactividad_ausente": 24,
    "horas_inactividad_inactivo": 72
  }'::jsonb,
  'Umbrales de alertas y rendimiento'
),
(
  'colores_contador',
  '{
    "acento": "#00D4FF",
    "urgencia_vencida": "#FF0000",
    "urgencia_hoy": "#FF6B00",
    "urgencia_semana": "#FFB800",
    "urgencia_normal": "#00D4FF",
    "fab_visible": true,
    "fab_posicion_default": "bottom-right",
    "pulse_en_vencidas": true,
    "reducir_animaciones_global": false
  }'::jsonb,
  'Colores y comportamiento visual'
),
(
  'notificaciones_default',
  '{
    "sonidos_habilitados_default": false,
    "solo_sonidos_criticos": true,
    "horas_silencio": {"inicio": "22:00", "fin": "07:00"},
    "modulos_activos": ["SIRE", "CAJA", "TAREAS", "DIARIO"],
    "prioridad_minima_default": "MEDIA",
    "dias_retencion_notificaciones": 30,
    "fab_solo_vencidas_hoy": true
  }'::jsonb,
  'Configuración por defecto de notificaciones'
),
(
  'sidebar_contador',
  '{
    "modulos": [
      "/dashboard",
      "/sire-registros",
      "/libro-diario",
      "/libro-caja",
      "/pcge",
      "/contribuyentes",
      "/tareas",
      "/ficha-ruc"
    ],
    "modulo_inicio": "/dashboard",
    "mostrar_estadisticas_sire": true,
    "mostrar_dashboard_estadisticas": true,
    "mostrar_chat_ai": false,
    "mostrar_lupa_accesibilidad": true,
    "mostrar_cancelaciones": true
  }'::jsonb,
  'Módulos visibles en sidebar del contador'
),
(
  'contenido_contador',
  '{
    "mensaje_bienvenida": "Bienvenido a tu Centro de Operaciones",
    "anuncios": [],
    "meta_mensual_monto": 500000,
    "meta_mensual_activa": true,
    "enlaces_rapidos": [
      {"label": "Registrar comprobante", "url": "/sire-registros", "icono": "FilePlus"},
      {"label": "Ver tareas pendientes", "url": "/tareas", "icono": "CheckSquare"},
      {"label": "Libro caja", "url": "/libro-caja", "icono": "Wallet"}
    ]
  }'::jsonb,
  'Contenido inyectable en dashboard contador'
),
(
  'tareas_auto',
  '{
    "reglas_activas": {
      "sire_sin_provision": true,
      "vencimiento_proximo": true,
      "cxc_vencida": true,
      "centralizar_caja": true,
      "asiento_descadrado": true,
      "contribuyente_inactivo": false,
      "cierre_periodo": true
    },
    "dias_anticipacion_vencimiento": 5,
    "prioridad_default_nueva": "MEDIA",
    "auto_asignar_por_ruc": true,
    "permitir_snooze_horas": [1, 4, 24, 48]
  }'::jsonb,
  'Configuración del motor automático de tareas'
)
ON CONFLICT (clave) DO NOTHING;

-- ============================================================
-- TABLA DE FEATURE FLAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          text NOT NULL UNIQUE,
  nombre          text NOT NULL,
  descripcion     text,
  activo          boolean DEFAULT false,
  scope           text DEFAULT 'global',
  ruc_id          text,
  metadata        jsonb,
  actualizado_por uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

INSERT INTO public.feature_flags (codigo, nombre, descripcion, activo, scope) VALUES
  ('gamificacion_activa', 'Gamificación', 'Logros, rachas y recompensas para contadores', true, 'global'),
  ('fab_alertas_dual', 'FAB de Alertas Dual', 'Botón flotante con badge rojo de tareas urgentes', true, 'global'),
  ('sugerencias_inteligentes', 'Sugerencias Inteligentes', 'Recomendaciones automáticas en dashboard', true, 'global'),
  ('dashboard_contador_v2', 'Dashboard V2', 'Nueva versión del panel del contador', false, 'global'),
  ('mv_dashboard_stats', 'Materialized Views', 'Usar vistas materializadas para KPIs (más rápido)', true, 'global'),
  ('conciliacion_bancaria', 'Conciliación Bancaria', 'Módulo de conciliación con matching difuso', true, 'global'),
  ('sire_modelo_normalizado', 'SIRE Normalizado', 'Usar estructura normalizada de SIRE', false, 'global'),
  ('chat_ia_contador', 'Chat IA', 'Asistente de IA para consultas', false, 'global'),
  ('notificaciones_correo', 'Notificaciones Email', 'Enviar notificaciones por correo electrónico', false, 'global'),
  ('exportacion_ple', 'Exportación PLE', 'Exportar libros electrónicos SUNAT', false, 'global')
ON CONFLICT (codigo) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_feature_flags_activo ON public.feature_flags(activo, scope);
CREATE INDEX IF NOT EXISTS idx_config_estudio_clave ON public.config_estudio(clave);

DROP TRIGGER IF EXISTS config_estudio_updated ON public.config_estudio;
CREATE TRIGGER config_estudio_updated
  BEFORE UPDATE ON public.config_estudio
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS feature_flags_updated ON public.feature_flags;
CREATE TRIGGER feature_flags_updated
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.config_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leen config" ON public.config_estudio;
CREATE POLICY "Usuarios leen config" ON public.config_estudio
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin gestiona config" ON public.config_estudio;
CREATE POLICY "Admin gestiona config" ON public.config_estudio
  FOR ALL TO authenticated
  USING (public.rpc_check_permission(auth.uid(), 'admin.configuracion', NULL))
  WITH CHECK (public.rpc_check_permission(auth.uid(), 'admin.configuracion', NULL));

DROP POLICY IF EXISTS "Usuarios leen flags" ON public.feature_flags;
CREATE POLICY "Usuarios leen flags" ON public.feature_flags
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin gestiona flags" ON public.feature_flags;
CREATE POLICY "Admin gestiona flags" ON public.feature_flags
  FOR ALL TO authenticated
  USING (public.rpc_check_permission(auth.uid(), 'admin.feature_flags', NULL))
  WITH CHECK (public.rpc_check_permission(auth.uid(), 'admin.feature_flags', NULL));

-- ============================================================
-- RPCs
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_get_config_estudio(p_clave text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT valor FROM public.config_estudio WHERE clave = p_clave;
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_all_config_estudio()
RETURNS TABLE(clave text, valor jsonb, descripcion text, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ce.clave, ce.valor, ce.descripcion, ce.updated_at
  FROM public.config_estudio ce
  ORDER BY ce.clave;
$$;

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

CREATE OR REPLACE FUNCTION public.rpc_get_feature_flags(p_scope text DEFAULT 'global')
RETURNS TABLE(codigo text, nombre text, activo boolean, descripcion text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ff.codigo, ff.nombre, ff.activo, ff.descripcion
  FROM public.feature_flags ff
  WHERE p_scope IS NULL OR ff.scope = p_scope OR ff.scope = 'global'
  ORDER BY ff.codigo;
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

GRANT EXECUTE ON FUNCTION public.rpc_get_config_estudio(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_all_config_estudio() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_update_config_estudio(text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_feature_flags(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_toggle_feature_flag(text, boolean) TO authenticated;
