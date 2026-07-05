-- Ficha RUC: enriquecimiento SIRE, columnas trazabilidad, vista desactualizadas
-- Idempotente

-- ============================================================
-- A. Columnas planas fichas_ruc (compatibilidad mapper)
-- ============================================================
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS razon_social text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS nombre_comercial text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS tipo_contribuyente text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS estado_contribuyente text DEFAULT 'ACTIVO';
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS fecha_inscripcion date;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS fecha_inicio_actividades date;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS actividad_economica_principal text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS actividad_economica text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS departamento text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS provincia text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS distrito text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS tipo_via text;
ALTER TABLE public.fichas_ruc ADD COLUMN IF NOT EXISTS ultima_actualizacion timestamptz;

ALTER TABLE public.fichas_ruc
  ADD COLUMN IF NOT EXISTS datos_incompletos boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fuente_datos text DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS ultima_actividad timestamptz,
  ADD COLUMN IF NOT EXISTS cantidad_comprobantes int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_compras_12m numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_ventas_12m numeric(14,2) DEFAULT 0;

-- ============================================================
-- B. Trigger enriquecimiento desde SIRE (contraparte)
-- ============================================================
CREATE OR REPLACE FUNCTION public.enrich_ficha_ruc_from_sire()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ruc text;
  v_razon_social text;
  v_existe boolean;
  v_sire_id uuid;
BEGIN
  v_sire_id := NEW.id;

  IF TG_TABLE_NAME = 'registros_sire' THEN
    v_ruc := NULLIF(regexp_replace(COALESCE(NEW.nro_doc_contraparte, ''), '\D', '', 'g'), '');
    v_razon_social := COALESCE(NEW.nombre_contraparte, NEW.datos_completos->>'nombre_contraparte');
  ELSIF TG_TABLE_NAME = 'registros_sire_cabecera' THEN
    v_ruc := NULLIF(regexp_replace(COALESCE(NEW.nro_doc_contraparte, ''), '\D', '', 'g'), '');
    v_razon_social := NEW.nombre_contraparte;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_ruc IS NULL OR length(v_ruc) <> 11 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.fichas_ruc WHERE ruc = v_ruc) INTO v_existe;

  INSERT INTO public.contribuyentes (ruc, razon_social, estado)
  VALUES (v_ruc, COALESCE(NULLIF(v_razon_social, ''), 'PENDIENTE DE VERIFICACION'), 'ACTIVO')
  ON CONFLICT (ruc) DO NOTHING;

  IF NOT v_existe THEN
    INSERT INTO public.fichas_ruc (
      ruc, razon_social, estado_contribuyente, datos_incompletos, fuente_datos,
      ultima_actualizacion, ultima_actividad, payload
    ) VALUES (
      v_ruc,
      COALESCE(NULLIF(v_razon_social, ''), 'PENDIENTE DE VERIFICACION'),
      'ACTIVO',
      true,
      'SIRE_COMPROBANTE',
      now(),
      now(),
      '{}'::jsonb
    )
    ON CONFLICT (ruc) DO UPDATE SET
      ultima_actividad = now(),
      updated_at = now()
    WHERE fichas_ruc.datos_incompletos = true;

    IF NOT EXISTS (
      SELECT 1 FROM public.tareas_pendientes
      WHERE hash_deduplicacion = 'ficha_ruc_' || v_ruc
        AND estado NOT IN ('completada', 'cancelada')
    ) THEN
      INSERT INTO public.tareas_pendientes (
        ruc, entidad, tramite, titulo, descripcion, prioridad, modulo_origen,
        plazo_vencimiento, generada_automaticamente, regla_generadora, hash_deduplicacion, metadata
      ) VALUES (
        v_ruc,
        'Ficha RUC',
        'Completar ficha RUC: ' || v_ruc,
        'Completar ficha RUC: ' || v_ruc,
        'RUC detectado en comprobante SIRE (' || COALESCE(v_razon_social, 'Sin razón social') || '). Completar desde consulta SUNAT.',
        'media',
        'contribuyentes',
        (CURRENT_DATE + INTERVAL '7 days')::date,
        true,
        'AUTO_SIRE_FICHA_RUC',
        'ficha_ruc_' || v_ruc,
        jsonb_build_object('origen', 'AUTO_SIRE', 'sire_registro_id', v_sire_id, 'razon_social_comprobante', v_razon_social)
      );
    END IF;
  ELSE
    UPDATE public.fichas_ruc SET ultima_actividad = now(), updated_at = now() WHERE ruc = v_ruc;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_enrich_ficha_ruc_legacy ON public.registros_sire;
CREATE TRIGGER trg_enrich_ficha_ruc_legacy
  AFTER INSERT ON public.registros_sire
  FOR EACH ROW EXECUTE FUNCTION public.enrich_ficha_ruc_from_sire();

DROP TRIGGER IF EXISTS trg_enrich_ficha_ruc_normalized ON public.registros_sire_cabecera;
CREATE TRIGGER trg_enrich_ficha_ruc_normalized
  AFTER INSERT ON public.registros_sire_cabecera
  FOR EACH ROW EXECUTE FUNCTION public.enrich_ficha_ruc_from_sire();

-- ============================================================
-- C. Estadísticas periódicas
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_ficha_ruc_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ruc text;
  v_cnt int;
BEGIN
  IF TG_TABLE_NAME = 'registros_sire' THEN
    v_ruc := COALESCE(NEW.ruc, OLD.ruc);
  ELSE
    v_ruc := COALESCE(NEW.ruc, OLD.ruc);
  END IF;

  IF v_ruc IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  SELECT
    (SELECT COUNT(*)::int FROM public.registros_sire WHERE ruc = v_ruc)
    + (SELECT COUNT(*)::int FROM public.registros_sire_cabecera WHERE ruc = v_ruc)
  INTO v_cnt;

  UPDATE public.fichas_ruc SET
    cantidad_comprobantes = v_cnt,
    ultima_actividad = now(),
    updated_at = now()
  WHERE ruc = v_ruc;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_ficha_stats_sire ON public.registros_sire;
CREATE TRIGGER trg_ficha_stats_sire
  AFTER INSERT OR UPDATE ON public.registros_sire
  FOR EACH ROW EXECUTE FUNCTION public.update_ficha_ruc_stats();

DROP TRIGGER IF EXISTS trg_ficha_stats_cab ON public.registros_sire_cabecera;
CREATE TRIGGER trg_ficha_stats_cab
  AFTER INSERT OR UPDATE ON public.registros_sire_cabecera
  FOR EACH ROW EXECUTE FUNCTION public.update_ficha_ruc_stats();

-- ============================================================
-- D. Vista fichas desactualizadas
-- ============================================================
CREATE OR REPLACE VIEW public.v_fichas_ruc_desactualizadas AS
SELECT
  ruc,
  razon_social,
  estado_contribuyente,
  ultima_actualizacion,
  ultima_actividad,
  CASE
    WHEN ultima_actualizacion IS NULL THEN 'NUNCA_ACTUALIZADA'
    WHEN ultima_actualizacion < now() - INTERVAL '90 days' THEN 'DESACTUALIZADA_90_DIAS'
    WHEN ultima_actualizacion < now() - INTERVAL '30 days' THEN 'DESACTUALIZADA_30_DIAS'
    ELSE 'ACTUALIZADA'
  END AS estado_actualizacion,
  datos_incompletos,
  cantidad_comprobantes,
  CASE
    WHEN ultima_actividad IS NULL THEN 999
    ELSE EXTRACT(DAY FROM (now() - ultima_actividad))::int
  END AS dias_sin_actividad
FROM public.fichas_ruc
WHERE COALESCE(estado_contribuyente, 'ACTIVO') ILIKE '%ACTIVO%'
ORDER BY dias_sin_actividad DESC;

GRANT SELECT ON public.v_fichas_ruc_desactualizadas TO authenticated;
