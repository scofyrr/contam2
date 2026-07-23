-- =============================================================================
-- Módulo 3: Importador Multiformato, Parser PDF (OCR) & Plantillas Excel CONTAM
-- Idempotente — integrado con SIRE normalizado + asientos_contables
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'importacion_origen_enum') THEN
    CREATE TYPE public.importacion_origen_enum AS ENUM ('EXCEL', 'CSV', 'PDF_OCR');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'importacion_tipo_lote_enum') THEN
    CREATE TYPE public.importacion_tipo_lote_enum AS ENUM ('COMPRAS', 'VENTAS', 'ASIENTOS_MANUALES');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'importacion_estado_lote_enum') THEN
    CREATE TYPE public.importacion_estado_lote_enum AS ENUM ('BORRADOR', 'PROCESADO', 'RECHAZADO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'importacion_estado_registro_enum') THEN
    CREATE TYPE public.importacion_estado_registro_enum AS ENUM ('VALIDO', 'ERROR');
  END IF;
END $$;

-- =============================================================================
-- 1. IMPORTACIONES LOTES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.importaciones_lotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuyente_id uuid NOT NULL,
  origen public.importacion_origen_enum NOT NULL,
  tipo_lote public.importacion_tipo_lote_enum NOT NULL,
  total_registros int NOT NULL DEFAULT 0 CHECK (total_registros >= 0),
  registros_exitosos int NOT NULL DEFAULT 0 CHECK (registros_exitosos >= 0),
  registros_con_error int NOT NULL DEFAULT 0 CHECK (registros_con_error >= 0),
  estado public.importacion_estado_lote_enum NOT NULL DEFAULT 'BORRADOR',
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre_archivo text,
  periodo_contable char(6),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  procesado_at timestamptz
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'importaciones_lotes_contribuyente_id_fkey'
  ) THEN
    ALTER TABLE public.importaciones_lotes
      ADD CONSTRAINT importaciones_lotes_contribuyente_id_fkey
      FOREIGN KEY (contribuyente_id) REFERENCES public.contribuyentes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_importaciones_lotes_contrib
  ON public.importaciones_lotes (contribuyente_id, created_at DESC);

DROP TRIGGER IF EXISTS importaciones_lotes_updated ON public.importaciones_lotes;
CREATE TRIGGER importaciones_lotes_updated
  BEFORE UPDATE ON public.importaciones_lotes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 2. IMPORTACIONES DETALLES (staging)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.importaciones_detalles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL,
  fila_numero int NOT NULL CHECK (fila_numero > 0),
  datos_raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  estado_registro public.importacion_estado_registro_enum NOT NULL DEFAULT 'VALIDO',
  errores jsonb NOT NULL DEFAULT '[]'::jsonb,
  comprobante_generado_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lote_id, fila_numero)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'importaciones_detalles_lote_id_fkey'
  ) THEN
    ALTER TABLE public.importaciones_detalles
      ADD CONSTRAINT importaciones_detalles_lote_id_fkey
      FOREIGN KEY (lote_id) REFERENCES public.importaciones_lotes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'importaciones_detalles_comprobante_fkey'
  ) THEN
    ALTER TABLE public.importaciones_detalles
      ADD CONSTRAINT importaciones_detalles_comprobante_fkey
      FOREIGN KEY (comprobante_generado_id) REFERENCES public.registros_sire_cabecera(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_importaciones_detalles_lote
  ON public.importaciones_detalles (lote_id, estado_registro);

DROP TRIGGER IF EXISTS importaciones_detalles_updated ON public.importaciones_detalles;
CREATE TRIGGER importaciones_detalles_updated
  BEFORE UPDATE ON public.importaciones_detalles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- 3. RLS
-- =============================================================================
ALTER TABLE public.importaciones_lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.importaciones_detalles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "import_lotes select" ON public.importaciones_lotes;
DROP POLICY IF EXISTS "import_lotes insert" ON public.importaciones_lotes;
DROP POLICY IF EXISTS "import_lotes update" ON public.importaciones_lotes;
DROP POLICY IF EXISTS "import_lotes delete" ON public.importaciones_lotes;

CREATE POLICY "import_lotes select" ON public.importaciones_lotes
  FOR SELECT TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id));

CREATE POLICY "import_lotes insert" ON public.importaciones_lotes
  FOR INSERT TO authenticated
  WITH CHECK (public.fn_user_can_access_contribuyente(contribuyente_id));

CREATE POLICY "import_lotes update" ON public.importaciones_lotes
  FOR UPDATE TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id));

CREATE POLICY "import_lotes delete" ON public.importaciones_lotes
  FOR DELETE TO authenticated
  USING (public.fn_user_can_access_contribuyente(contribuyente_id));

DROP POLICY IF EXISTS "import_detalles select" ON public.importaciones_detalles;
DROP POLICY IF EXISTS "import_detalles insert" ON public.importaciones_detalles;
DROP POLICY IF EXISTS "import_detalles update" ON public.importaciones_detalles;
DROP POLICY IF EXISTS "import_detalles delete" ON public.importaciones_detalles;

CREATE POLICY "import_detalles select" ON public.importaciones_detalles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.importaciones_lotes l
      WHERE l.id = importaciones_detalles.lote_id
        AND public.fn_user_can_access_contribuyente(l.contribuyente_id)
    )
  );

CREATE POLICY "import_detalles insert" ON public.importaciones_detalles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.importaciones_lotes l
      WHERE l.id = importaciones_detalles.lote_id
        AND public.fn_user_can_access_contribuyente(l.contribuyente_id)
    )
  );

CREATE POLICY "import_detalles update" ON public.importaciones_detalles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.importaciones_lotes l
      WHERE l.id = importaciones_detalles.lote_id
        AND public.fn_user_can_access_contribuyente(l.contribuyente_id)
    )
  );

CREATE POLICY "import_detalles delete" ON public.importaciones_detalles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.importaciones_lotes l
      WHERE l.id = importaciones_detalles.lote_id
        AND public.fn_user_can_access_contribuyente(l.contribuyente_id)
    )
  );

-- =============================================================================
-- 4. RPC: fn_procesar_lote_importacion
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_procesar_lote_importacion(p_lote_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lote public.importaciones_lotes%ROWTYPE;
  v_contrib record;
  v_det record;
  v_cab_id uuid;
  v_periodo char(6);
  v_tipo text;
  v_tipo_registro public.sire_tipo_registro_enum;
  v_exitosos int := 0;
  v_errores int := 0;
  v_periodo_id uuid;
  v_ruc_contraparte text;
  v_serie text;
  v_numero text;
  v_fecha date;
  v_base numeric(14,2);
  v_igv numeric(14,2);
  v_total numeric(14,2);
BEGIN
  SELECT * INTO v_lote FROM public.importaciones_lotes WHERE id = p_lote_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lote de importación no encontrado: %', p_lote_id;
  END IF;

  IF coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT public.fn_user_can_access_contribuyente(v_lote.contribuyente_id) THEN
    RAISE EXCEPTION 'Acceso denegado al lote %', p_lote_id USING ERRCODE = '42501';
  END IF;

  IF v_lote.estado = 'PROCESADO' THEN
    RAISE EXCEPTION 'El lote % ya fue procesado', p_lote_id;
  END IF;

  SELECT c.ruc, c.razon_social, c.id
  INTO v_contrib
  FROM public.contribuyentes c
  WHERE c.id = v_lote.contribuyente_id;

  IF v_contrib.id IS NULL THEN
    RAISE EXCEPTION 'Contribuyente del lote no encontrado';
  END IF;

  FOR v_det IN
    SELECT *
    FROM public.importaciones_detalles d
    WHERE d.lote_id = p_lote_id
    ORDER BY d.fila_numero
  LOOP
    IF v_det.estado_registro = 'ERROR' THEN
      v_errores := v_errores + 1;
      CONTINUE;
    END IF;

    BEGIN
      IF v_lote.tipo_lote IN ('COMPRAS', 'VENTAS') THEN
        v_tipo := CASE v_lote.tipo_lote WHEN 'COMPRAS' THEN 'COMPRA' ELSE 'VENTA' END;
        v_tipo_registro := CASE v_lote.tipo_lote WHEN 'COMPRAS' THEN 'RCE'::public.sire_tipo_registro_enum
                                                  ELSE 'RVIE'::public.sire_tipo_registro_enum END;

        v_ruc_contraparte := regexp_replace(COALESCE(v_det.datos_raw->>'ruc', ''), '\D', '', 'g');
        v_serie := NULLIF(trim(v_det.datos_raw->>'serie'), '');
        v_numero := COALESCE(NULLIF(trim(v_det.datos_raw->>'numero'), ''), 'S/N');
        v_fecha := COALESCE((v_det.datos_raw->>'fecha')::date, CURRENT_DATE);
        v_periodo := COALESCE(
          NULLIF(regexp_replace(COALESCE(v_det.datos_raw->>'periodo', ''), '\D', ''), ''),
          v_lote.periodo_contable,
          to_char(v_fecha, 'YYYYMM')
        );
        v_base := COALESCE((v_det.datos_raw->>'base')::numeric, 0);
        v_igv := COALESCE((v_det.datos_raw->>'igv')::numeric, 0);
        v_total := COALESCE((v_det.datos_raw->>'total')::numeric, v_base + v_igv);

        v_periodo_id := public.fn_sire_upsert_periodo(v_lote.contribuyente_id, v_periodo);

        SELECT c.id INTO v_cab_id
        FROM public.registros_sire_cabecera c
        WHERE c.contribuyente_id = v_lote.contribuyente_id
          AND c.periodo = v_periodo
          AND c.tipo = v_tipo
          AND c.serie_cdp IS NOT DISTINCT FROM v_serie
          AND c.nro_cdp_inicial = v_numero
        LIMIT 1;

        IF v_cab_id IS NULL THEN
          INSERT INTO public.registros_sire_cabecera (
            tipo, tipo_registro, origen, contribuyente_id, periodo_id,
            ruc, razon_social, periodo,
            fecha_emision, cod_tipo_cdp, serie_cdp, nro_cdp_inicial,
            nro_doc_contraparte, nombre_contraparte,
            cod_moneda, tipo_cambio, estado_validacion
          ) VALUES (
            v_tipo, v_tipo_registro, 'AJUSTE_POSTERIOR'::public.sire_origen_registro_enum,
            v_lote.contribuyente_id, v_periodo_id,
            v_contrib.ruc, v_contrib.razon_social, v_periodo,
            v_fecha,
            COALESCE(NULLIF(trim(v_det.datos_raw->>'tipo_doc'), ''), '01'),
            v_serie, v_numero,
            v_ruc_contraparte,
            NULLIF(trim(v_det.datos_raw->>'razon_social'), ''),
            COALESCE(NULLIF(trim(v_det.datos_raw->>'moneda'), ''), 'PEN'),
            COALESCE((v_det.datos_raw->>'tipo_cambio')::numeric, 1.000),
            'pendiente'
          )
          RETURNING id INTO v_cab_id;

          INSERT INTO public.registros_sire_montos (
            registro_sire_id,
            bi_grav, igv_grav, bi_adq_grav, igv_adq_grav,
            importe_total, base_imponible_gravada, igv_ipm, total_comprobante,
            mto_bi_gravada, mto_igv_ipe, mto_total_cp
          ) VALUES (
            v_cab_id,
            CASE WHEN v_tipo = 'VENTA' THEN v_base ELSE 0 END,
            CASE WHEN v_tipo = 'VENTA' THEN v_igv ELSE 0 END,
            CASE WHEN v_tipo = 'COMPRA' THEN v_base ELSE 0 END,
            CASE WHEN v_tipo = 'COMPRA' THEN v_igv ELSE 0 END,
            v_total, v_base, v_igv, v_total,
            v_base, v_igv, v_total
          );
        ELSE
          UPDATE public.registros_sire_montos SET
            bi_grav = CASE WHEN v_tipo = 'VENTA' THEN v_base ELSE bi_grav END,
            igv_grav = CASE WHEN v_tipo = 'VENTA' THEN v_igv ELSE igv_grav END,
            bi_adq_grav = CASE WHEN v_tipo = 'COMPRA' THEN v_base ELSE bi_adq_grav END,
            igv_adq_grav = CASE WHEN v_tipo = 'COMPRA' THEN v_igv ELSE igv_adq_grav END,
            importe_total = v_total,
            base_imponible_gravada = v_base,
            igv_ipm = v_igv,
            total_comprobante = v_total,
            mto_bi_gravada = v_base,
            mto_igv_ipe = v_igv,
            mto_total_cp = v_total,
            updated_at = now()
          WHERE registro_sire_id = v_cab_id;
        END IF;

        UPDATE public.importaciones_detalles SET
          comprobante_generado_id = v_cab_id,
          updated_at = now()
        WHERE id = v_det.id;

        v_exitosos := v_exitosos + 1;

      ELSIF v_lote.tipo_lote = 'ASIENTOS_MANUALES' THEN
        v_fecha := COALESCE((v_det.datos_raw->>'fecha_asiento')::date, CURRENT_DATE);
        v_periodo := COALESCE(
          NULLIF(regexp_replace(COALESCE(v_det.datos_raw->>'periodo', ''), '\D', ''), ''),
          v_lote.periodo_contable,
          to_char(v_fecha, 'YYYYMM')
        );

        INSERT INTO public.asientos_contables (
          sire_registro_id, periodo, tipo_asiento, tipo_libro,
          fecha_asiento, cuenta_contable, glosa, debe, haber,
          naturaleza, tipo_registro, serie_cdp, nro_cdp_inicial,
          ruc_contraparte, nombre_contraparte, ruc
        ) VALUES (
          NULL,
          v_periodo,
          'principal',
          'DIARIO_MANUAL',
          v_fecha,
          COALESCE(NULLIF(trim(v_det.datos_raw->>'cuenta_contable'), ''), '999999'),
          NULLIF(trim(v_det.datos_raw->>'glosa'), ''),
          COALESCE((v_det.datos_raw->>'debe')::numeric, 0),
          COALESCE((v_det.datos_raw->>'haber')::numeric, 0),
          CASE WHEN COALESCE((v_det.datos_raw->>'debe')::numeric, 0) > 0 THEN 'debe' ELSE 'haber' END,
          COALESCE(NULLIF(trim(v_det.datos_raw->>'tipo_registro'), ''), 'COMPRA')::text,
          NULLIF(trim(v_det.datos_raw->>'serie'), ''),
          NULLIF(trim(v_det.datos_raw->>'numero'), ''),
          NULLIF(regexp_replace(COALESCE(v_det.datos_raw->>'ruc_contraparte', ''), '\D', '', 'g'), ''),
          NULLIF(trim(v_det.datos_raw->>'nombre_contraparte'), ''),
          v_contrib.ruc
        );

        v_exitosos := v_exitosos + 1;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      v_errores := v_errores + 1;
      UPDATE public.importaciones_detalles SET
        estado_registro = 'ERROR',
        errores = jsonb_build_array(jsonb_build_object(
          'codigo', 'PROCESAMIENTO',
          'mensaje', SQLERRM
        )),
        updated_at = now()
      WHERE id = v_det.id;
    END;
  END LOOP;

  UPDATE public.importaciones_lotes SET
    registros_exitosos = v_exitosos,
    registros_con_error = v_errores + (
      SELECT COUNT(*)::int FROM public.importaciones_detalles d
      WHERE d.lote_id = p_lote_id AND d.estado_registro = 'ERROR'
    ),
    estado = CASE
      WHEN v_exitosos = 0 THEN 'RECHAZADO'::public.importacion_estado_lote_enum
      ELSE 'PROCESADO'::public.importacion_estado_lote_enum
    END,
    procesado_at = now(),
    updated_at = now()
  WHERE id = p_lote_id;

  RETURN jsonb_build_object(
    'ok', true,
    'lote_id', p_lote_id,
    'registros_exitosos', v_exitosos,
    'registros_con_error', v_errores,
    'estado', CASE WHEN v_exitosos = 0 THEN 'RECHAZADO' ELSE 'PROCESADO' END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_procesar_lote_importacion(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_procesar_lote_importacion(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_procesar_lote_importacion(uuid) TO service_role;
