-- Normalización SIRE + Ficha RUC + Auditoría + Notificaciones
-- Ejecutar en Supabase SQL Editor. Idempotente donde sea posible.
-- Mantiene registros_sire original para compatibilidad (feature flag).

-- ============================================================
-- 1. TABLAS HIJAS FICHA RUC
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tributos_afectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc char(11) NOT NULL REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  orden int NOT NULL DEFAULT 0,
  codigo varchar(20),
  descripcion text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.representantes_legales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc char(11) NOT NULL REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  orden int NOT NULL DEFAULT 0,
  nombre text,
  documento varchar(20),
  cargo text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.otras_personas_vinculadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc char(11) NOT NULL REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  orden int NOT NULL DEFAULT 0,
  nombre text,
  documento varchar(20),
  vinculo text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.establecimientos_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc char(11) NOT NULL REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  orden int NOT NULL DEFAULT 0,
  codigo varchar(20),
  direccion text,
  ubigeo varchar(6),
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. SIRE NORMALIZADO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.registros_sire_cabecera (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('VENTA','COMPRA')),
  ruc varchar(11) NOT NULL REFERENCES public.contribuyentes(ruc),
  razon_social text NOT NULL,
  periodo char(6) NOT NULL,
  car_sunat varchar(40),
  fecha_emision date NOT NULL,
  fecha_vencimiento date,
  cod_tipo_cdp varchar(2) NOT NULL,
  serie_cdp varchar(20),
  anio_dam_dsi varchar(4),
  nro_cdp_inicial varchar(20) NOT NULL,
  nro_cdp_final varchar(20),
  tipo_doc_contraparte varchar(2),
  nro_doc_contraparte varchar(20),
  nombre_contraparte text,
  cod_moneda varchar(3) NOT NULL DEFAULT 'PEN',
  tipo_cambio numeric(8,3) DEFAULT 1.000,
  estado_validacion text NOT NULL DEFAULT 'pendiente'
    CHECK (estado_validacion IN ('pendiente','validado','ia_sugerido')),
  estado_cobro text NOT NULL DEFAULT 'pendiente',
  estado_pago text NOT NULL DEFAULT 'pendiente',
  cuenta_pcge varchar(10),
  finalidad_operativa text,
  descripcion_items text,
  cancelacion_asiento_id uuid,
  cancelacion_mov_caja_id uuid,
  cancelacion_generada_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registros_sire_montos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_sire_id uuid NOT NULL UNIQUE
    REFERENCES public.registros_sire_cabecera(id) ON DELETE CASCADE,
  bi_grav numeric(14,2) DEFAULT 0,
  igv_grav numeric(14,2) DEFAULT 0,
  bi_grav_y_no_grav numeric(14,2) DEFAULT 0,
  igv_grav_y_no_grav numeric(14,2) DEFAULT 0,
  bi_no_grav numeric(14,2) DEFAULT 0,
  igv_no_grav numeric(14,2) DEFAULT 0,
  valor_no_grav numeric(14,2) DEFAULT 0,
  isc numeric(14,2) DEFAULT 0,
  icbper numeric(14,2) DEFAULT 0,
  otros_tributos numeric(14,2) DEFAULT 0,
  importe_total numeric(14,2) NOT NULL DEFAULT 0,
  mto_bi_gravada numeric(14,2) DEFAULT 0,
  mto_igv_ipe numeric(14,2) DEFAULT 0,
  mto_total_cp numeric(14,2) DEFAULT 0,
  bi_adq_grav numeric(14,2) DEFAULT 0,
  igv_adq_grav numeric(14,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registros_sire_modificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_sire_id uuid NOT NULL UNIQUE
    REFERENCES public.registros_sire_cabecera(id) ON DELETE CASCADE,
  fecha_emision_mod date,
  tipo_cdp_mod varchar(2),
  serie_cdp_mod varchar(20),
  cod_dam_dsi varchar(20),
  nro_cdp_mod varchar(20),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registros_sire_adicionales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_sire_id uuid NOT NULL UNIQUE
    REFERENCES public.registros_sire_cabecera(id) ON DELETE CASCADE,
  clasificacion_bienes_serv varchar(10),
  id_proyecto_operadores varchar(40),
  pct_participacion numeric(6,2) DEFAULT 0,
  impuesto_beneficio numeric(14,2) DEFAULT 0,
  car_orig_indicador varchar(40),
  campos_38_41 jsonb DEFAULT '{}'::jsonb,
  campos_libres jsonb DEFAULT '{}'::jsonb,
  tipo_venta_config jsonb DEFAULT '[]'::jsonb,
  observaciones text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. AUDITORÍA Y NOTIFICACIONES (futuro)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.auditoria_cambios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla_nombre text NOT NULL,
  registro_id text NOT NULL,
  operacion text NOT NULL CHECK (operacion IN ('INSERT','UPDATE','DELETE')),
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  usuario_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notificaciones_correo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid,
  correo_destino text NOT NULL,
  remitente text,
  asunto text NOT NULL,
  cuerpo text,
  leido boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tareas_pendientes 
  ADD COLUMN IF NOT EXISTS ruc varchar(11) REFERENCES public.contribuyentes(ruc),
  ADD COLUMN IF NOT EXISTS entidad text,
  ADD COLUMN IF NOT EXISTS tramite text,
  ADD COLUMN IF NOT EXISTS fecha_tramitar date,
  ADD COLUMN IF NOT EXISTS problema text,
  ADD COLUMN IF NOT EXISTS plazo_vencimiento date,
  ADD COLUMN IF NOT EXISTS critica boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.tareas_pendientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc varchar(11) REFERENCES public.contribuyentes(ruc),
  entidad text NOT NULL,
  tramite text NOT NULL,
  fecha_tramitar date,
  problema text,
  plazo_vencimiento date,
  critica boolean NOT NULL DEFAULT false,
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. CAMPOS NUEVOS movimientos_caja
-- ============================================================
ALTER TABLE public.movimientos_caja
  ADD COLUMN IF NOT EXISTS origen_documento text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS numero_documento varchar(50),
  ADD COLUMN IF NOT EXISTS ruc_contribuyente varchar(11),
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS tipo_movimiento varchar(20) DEFAULT 'ingreso';

UPDATE public.movimientos_caja
SET ruc_contribuyente = COALESCE(ruc_contribuyente, ruc)
WHERE ruc_contribuyente IS NULL AND ruc IS NOT NULL;

-- ============================================================
-- 5. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sire_cab_ruc ON public.registros_sire_cabecera(ruc);
CREATE INDEX IF NOT EXISTS idx_sire_cab_periodo ON public.registros_sire_cabecera(periodo);
CREATE INDEX IF NOT EXISTS idx_sire_cab_estado ON public.registros_sire_cabecera(estado_validacion);
CREATE INDEX IF NOT EXISTS idx_sire_cab_tipo ON public.registros_sire_cabecera(tipo);
CREATE INDEX IF NOT EXISTS idx_asientos_periodo ON public.asientos_contables(periodo);
CREATE INDEX IF NOT EXISTS idx_asientos_cuenta ON public.asientos_contables(cuenta_contable);
CREATE INDEX IF NOT EXISTS idx_asientos_sire ON public.asientos_contables(sire_registro_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_periodo ON public.movimientos_caja(periodo);
CREATE INDEX IF NOT EXISTS idx_movimientos_ruc ON public.movimientos_caja(ruc);
CREATE INDEX IF NOT EXISTS idx_movimientos_cuenta ON public.movimientos_caja(cuenta_contable);
CREATE INDEX IF NOT EXISTS idx_tributos_ruc ON public.tributos_afectos(ruc);
CREATE INDEX IF NOT EXISTS idx_representantes_ruc ON public.representantes_legales(ruc);
CREATE INDEX IF NOT EXISTS idx_vinculadas_ruc ON public.otras_personas_vinculadas(ruc);
CREATE INDEX IF NOT EXISTS idx_establecimientos_ruc ON public.establecimientos_anexos(ruc);

CREATE UNIQUE INDEX IF NOT EXISTS idx_caja_unico_por_registro_sire_sire
  ON public.movimientos_caja(registro_sire_id)
  WHERE origen = 'sire' AND registro_sire_id IS NOT NULL;

-- ============================================================
-- 6. MIGRACIÓN DE DATOS (preserva UUID para FKs existentes)
-- ============================================================
ALTER TABLE public.registros_sire 
  ADD COLUMN IF NOT EXISTS cuenta_pcge varchar(10),
  ADD COLUMN IF NOT EXISTS finalidad_operativa text,
  ADD COLUMN IF NOT EXISTS descripcion_items text;

INSERT INTO public.registros_sire_cabecera (
  id, tipo, ruc, razon_social, periodo, car_sunat, fecha_emision, fecha_vencimiento,
  cod_tipo_cdp, serie_cdp, anio_dam_dsi, nro_cdp_inicial, nro_cdp_final,
  tipo_doc_contraparte, nro_doc_contraparte, nombre_contraparte,
  cod_moneda, tipo_cambio, estado_validacion, estado_cobro, estado_pago,
  cuenta_pcge, finalidad_operativa, descripcion_items,
  cancelacion_asiento_id, cancelacion_mov_caja_id, cancelacion_generada_at,
  created_at, updated_at
)
SELECT
  id, 
  CASE WHEN tipo = 'COMPRAS' THEN 'COMPRA' WHEN tipo = 'VENTAS' THEN 'VENTA' ELSE tipo END AS tipo,
  ruc, razon_social, periodo, car_sunat, fecha_emision, fecha_vencimiento,
  cod_tipo_cdp, serie_cdp, anio_dam_dsi, nro_cdp_inicial, nro_cdp_final,
  tipo_doc_contraparte, nro_doc_contraparte, nombre_contraparte,
  cod_moneda, tipo_cambio,
  COALESCE(estado_validacion, 'pendiente'),
  COALESCE(estado_cobro, 'pendiente'),
  COALESCE(estado_pago, 'pendiente'),
  cuenta_pcge, finalidad_operativa, descripcion_items,
  cancelacion_asiento_id, cancelacion_mov_caja_id, cancelacion_generada_at,
  created_at, updated_at
FROM public.registros_sire rs
WHERE NOT EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = rs.id)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.registros_sire_montos 
  ADD COLUMN IF NOT EXISTS bi_adq_grav numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS igv_adq_grav numeric(14,2) DEFAULT 0;

INSERT INTO public.registros_sire_montos (
  registro_sire_id, bi_grav, igv_grav, bi_grav_y_no_grav, igv_grav_y_no_grav,
  bi_no_grav, igv_no_grav, valor_no_grav, isc, icbper, otros_tributos,
  importe_total, mto_bi_gravada, mto_igv_ipe, mto_total_cp,
  bi_adq_grav, igv_adq_grav
)
SELECT
  id,
  COALESCE(bi_adq_grav, 0), COALESCE(igv_adq_grav, 0),
  COALESCE(bi_adq_grav_y_no_grav, 0), COALESCE(igv_adq_grav_y_no_grav, 0),
  COALESCE(bi_adq_no_grav, 0), COALESCE(igv_adq_no_grav, 0), COALESCE(valor_adq_no_grav, 0),
  COALESCE(isc, 0), COALESCE(icbper, 0), COALESCE(otros_tributos, 0),
  COALESCE(importe_total, 0), COALESCE(bi_adq_grav, 0), COALESCE(igv_adq_grav, 0), COALESCE(importe_total, 0),
  COALESCE(bi_adq_grav, 0), COALESCE(igv_adq_grav, 0)
FROM public.registros_sire rs
WHERE EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = rs.id)
  AND NOT EXISTS (SELECT 1 FROM public.registros_sire_montos m WHERE m.registro_sire_id = rs.id);

INSERT INTO public.registros_sire_modificaciones (
  registro_sire_id, fecha_emision_mod, tipo_cdp_mod, serie_cdp_mod, cod_dam_dsi, nro_cdp_mod
)
SELECT id, fecha_emision_mod, tipo_cdp_mod, serie_cdp_mod, cod_dam_dsi, nro_cdp_mod
FROM public.registros_sire rs
WHERE EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = rs.id)
  AND NOT EXISTS (SELECT 1 FROM public.registros_sire_modificaciones m WHERE m.registro_sire_id = rs.id);

INSERT INTO public.registros_sire_adicionales (
  registro_sire_id, clasificacion_bienes_serv, id_proyecto_operadores,
  pct_participacion, impuesto_beneficio, car_orig_indicador,
  campos_38_41, campos_libres, tipo_venta_config, observaciones
)
SELECT
  id, clasificacion_bienes_serv, 
  COALESCE(id_proyecto, '') || COALESCE(operadores, '') AS id_proyecto_operadores,
  COALESCE(porcentaje_participacion, 0) AS pct_participacion, 
  COALESCE(CASE WHEN trim(impuesto_materia_beneficio) ~ '^[0-9]+(\.[0-9]+)?$' THEN trim(impuesto_materia_beneficio)::numeric ELSE 0 END, 0) AS impuesto_beneficio, 
  car_orig_indicador,
  COALESCE(campos_38_41, '{}'::jsonb), COALESCE(campos_libres, '{}'::jsonb),
  '[]'::jsonb AS tipo_venta_config, NULL::text AS observaciones
FROM public.registros_sire rs
WHERE EXISTS (SELECT 1 FROM public.registros_sire_cabecera c WHERE c.id = rs.id)
  AND NOT EXISTS (SELECT 1 FROM public.registros_sire_adicionales a WHERE a.registro_sire_id = rs.id);

-- ============================================================
-- 7. VISTAS
-- ============================================================
DROP VIEW IF EXISTS public.registros_sire_completo;
CREATE VIEW public.registros_sire_completo AS
SELECT
  c.*,
  m.id AS montos_id,
  m.bi_grav, m.igv_grav, m.bi_grav_y_no_grav, m.igv_grav_y_no_grav,
  m.bi_no_grav, m.igv_no_grav, m.valor_no_grav, m.isc, m.icbper, m.otros_tributos,
  m.importe_total, m.mto_bi_gravada, m.mto_igv_ipe, m.mto_total_cp,
  m.bi_adq_grav, m.igv_adq_grav,
  mod.id AS modificaciones_id,
  mod.fecha_emision_mod, mod.tipo_cdp_mod, mod.serie_cdp_mod, mod.cod_dam_dsi, mod.nro_cdp_mod,
  a.id AS adicionales_id,
  a.clasificacion_bienes_serv, a.id_proyecto_operadores, a.pct_participacion,
  a.impuesto_beneficio, a.car_orig_indicador, a.campos_38_41, a.campos_libres,
  a.tipo_venta_config, a.observaciones
FROM public.registros_sire_cabecera c
LEFT JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
LEFT JOIN public.registros_sire_modificaciones mod ON mod.registro_sire_id = c.id
LEFT JOIN public.registros_sire_adicionales a ON a.registro_sire_id = c.id;

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
  ac.tipo_libro,
  ac.tipo_registro,
  rs.razon_social,
  rs.cod_tipo_cdp,
  rs.serie_cdp,
  rs.nro_cdp_inicial
FROM public.asientos_contables ac
LEFT JOIN public.registros_sire_cabecera rs ON rs.id = ac.sire_registro_id;

CREATE OR REPLACE VIEW public.v_resumen_periodo AS
SELECT
  c.ruc,
  c.periodo,
  c.tipo,
  COUNT(*) AS total_comprobantes,
  SUM(COALESCE(m.importe_total, 0)) AS total_importe,
  SUM(COALESCE(m.mto_igv_ipe, m.igv_grav, 0)) AS total_igv
FROM public.registros_sire_cabecera c
LEFT JOIN public.registros_sire_montos m ON m.registro_sire_id = c.id
GROUP BY c.ruc, c.periodo, c.tipo;

CREATE OR REPLACE VIEW public.v_saldos_cuenta AS
SELECT
  ruc,
  periodo,
  cuenta_contable,
  SUM(COALESCE(debe, 0)) AS total_debe,
  SUM(COALESCE(haber, 0)) AS total_haber,
  SUM(COALESCE(debe, 0)) - SUM(COALESCE(haber, 0)) AS saldo
FROM public.asientos_contables
GROUP BY ruc, periodo, cuenta_contable;

GRANT SELECT ON public.registros_sire_completo TO authenticated;
GRANT SELECT ON public.v_libro_diario TO authenticated;
GRANT SELECT ON public.v_resumen_periodo TO authenticated;
GRANT SELECT ON public.v_saldos_cuenta TO authenticated;

-- ============================================================
-- 8. AUDITORÍA
-- ============================================================
CREATE OR REPLACE FUNCTION public.auditar_cambios()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.auditoria_cambios (
    tabla_nombre, registro_id, operacion, datos_anteriores, datos_nuevos, usuario_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::text,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_auditoria_registros_sire ON public.registros_sire_cabecera;
CREATE TRIGGER trigger_auditoria_registros_sire
  AFTER INSERT OR UPDATE OR DELETE ON public.registros_sire_cabecera
  FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios();

DROP TRIGGER IF EXISTS trigger_auditoria_asientos ON public.asientos_contables;
CREATE TRIGGER trigger_auditoria_asientos
  AFTER INSERT OR UPDATE OR DELETE ON public.asientos_contables
  FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios();

DROP TRIGGER IF EXISTS trigger_auditoria_movimientos ON public.movimientos_caja;
CREATE TRIGGER trigger_auditoria_movimientos
  AFTER INSERT OR UPDATE OR DELETE ON public.movimientos_caja
  FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios();

-- ============================================================
-- 9. RPC LIQUIDACIÓN MEJORADA (modelo plano asientos_contables)
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_liquidacion_caja_mejorada(
  p_registro_sire_id uuid,
  p_cuenta_caja varchar(10) DEFAULT NULL,
  p_cuenta_cxc varchar(10) DEFAULT NULL,
  p_cuenta_cxp varchar(10) DEFAULT NULL,
  p_usuario_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg record;
  v_cfg record;
  v_importe numeric(14,2);
  v_caja varchar(10);
  v_comercial varchar(10);
  v_glosa text;
  v_asiento_id uuid;
  v_mov_id uuid;
BEGIN
  SELECT c.*, m.importe_total, m.mto_total_cp
  INTO v_reg
  FROM registros_sire_cabecera c
  LEFT JOIN registros_sire_montos m ON m.registro_sire_id = c.id
  WHERE c.id = p_registro_sire_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registro SIRE no encontrado');
  END IF;

  IF v_reg.cancelacion_asiento_id IS NOT NULL AND v_reg.cancelacion_mov_caja_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true, 'duplicado', true,
      'asiento_id', v_reg.cancelacion_asiento_id,
      'movimiento_caja_id', v_reg.cancelacion_mov_caja_id
    );
  END IF;

  SELECT * INTO v_cfg FROM config_contable WHERE id = 1;
  v_importe := round(COALESCE(v_reg.mto_total_cp, v_reg.importe_total, 0), 2);
  v_caja := COALESCE(p_cuenta_caja, v_cfg.cuenta_caja_default, '101');
  v_comercial := CASE
    WHEN v_reg.tipo = 'VENTA' THEN COALESCE(p_cuenta_cxc, v_cfg.cuenta_cxc_default, '121201')
    ELSE COALESCE(p_cuenta_cxp, v_cfg.cuenta_cxp_default, '421201')
  END;
  v_glosa := CASE
    WHEN v_reg.tipo = 'VENTA' THEN 'Cobro de venta ' || v_reg.id::text
    ELSE 'Pago de compra ' || v_reg.id::text
  END;

  IF v_reg.tipo = 'VENTA' THEN
    INSERT INTO asientos_contables (
      sire_registro_id, ruc, periodo, fecha_asiento, cuenta_contable, glosa,
      debe, haber, tipo_asiento, tipo_libro, tipo_registro
    ) VALUES
      (v_reg.id, v_reg.ruc, v_reg.periodo, v_reg.fecha_emision, v_caja, v_glosa, v_importe, 0, 'cancelacion_caja', 'CAJA_BANCOS', 'VENTA'),
      (v_reg.id, v_reg.ruc, v_reg.periodo, v_reg.fecha_emision, v_comercial, v_glosa, 0, v_importe, 'cancelacion_caja', 'CAJA_BANCOS', 'VENTA')
    RETURNING id INTO v_asiento_id;
  ELSE
    INSERT INTO asientos_contables (
      sire_registro_id, ruc, periodo, fecha_asiento, cuenta_contable, glosa,
      debe, haber, tipo_asiento, tipo_libro, tipo_registro
    ) VALUES
      (v_reg.id, v_reg.ruc, v_reg.periodo, v_reg.fecha_emision, v_comercial, v_glosa, v_importe, 0, 'cancelacion_caja', 'CAJA_BANCOS', 'COMPRA'),
      (v_reg.id, v_reg.ruc, v_reg.periodo, v_reg.fecha_emision, v_caja, v_glosa, 0, v_importe, 'cancelacion_caja', 'CAJA_BANCOS', 'COMPRA')
    RETURNING id INTO v_asiento_id;
  END IF;

  INSERT INTO movimientos_caja (
    ruc, ruc_contribuyente, periodo, fecha, fecha_operacion, glosa, cuenta_contable,
    debe, haber, origen, origen_documento, tipo_movimiento, registro_sire_id, asiento_id
  ) VALUES (
    v_reg.ruc, v_reg.ruc, v_reg.periodo, v_reg.fecha_emision, v_reg.fecha_emision, v_glosa, v_caja,
    CASE WHEN v_reg.tipo = 'VENTA' THEN v_importe ELSE 0 END,
    CASE WHEN v_reg.tipo = 'COMPRA' THEN v_importe ELSE 0 END,
    'sire', 'sire', CASE WHEN v_reg.tipo = 'VENTA' THEN 'ingreso' ELSE 'egreso' END,
    v_reg.id, v_asiento_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_mov_id;

  IF v_mov_id IS NULL THEN
    SELECT id INTO v_mov_id FROM movimientos_caja
    WHERE registro_sire_id = v_reg.id AND origen = 'sire' LIMIT 1;
  END IF;

  UPDATE registros_sire_cabecera SET
    cancelacion_asiento_id = v_asiento_id,
    cancelacion_mov_caja_id = v_mov_id,
    cancelacion_generada_at = now(),
    estado_cobro = CASE WHEN v_reg.tipo = 'VENTA' THEN 'cobrado' ELSE estado_cobro END,
    estado_pago = CASE WHEN v_reg.tipo = 'COMPRA' THEN 'pagado' ELSE estado_pago END,
    updated_at = now()
  WHERE id = v_reg.id;

  RETURN jsonb_build_object(
    'success', true, 'duplicado', false,
    'asiento_id', v_asiento_id, 'movimiento_caja_id', v_mov_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_liquidacion_caja_mejorada(uuid, varchar, varchar, varchar, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_cancelar_liquidacion(p_registro_sire_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg record;
BEGIN
  SELECT * INTO v_reg FROM registros_sire_cabecera WHERE id = p_registro_sire_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registro no encontrado');
  END IF;

  DELETE FROM movimientos_caja WHERE registro_sire_id = p_registro_sire_id AND origen = 'sire';
  DELETE FROM asientos_contables WHERE sire_registro_id = p_registro_sire_id AND tipo_asiento = 'cancelacion_caja';

  UPDATE registros_sire_cabecera SET
    cancelacion_asiento_id = NULL,
    cancelacion_mov_caja_id = NULL,
    cancelacion_generada_at = NULL,
    estado_cobro = CASE WHEN tipo = 'VENTA' THEN 'pendiente' ELSE estado_cobro END,
    estado_pago = CASE WHEN tipo = 'COMPRA' THEN 'pendiente' ELSE estado_pago END
  WHERE id = p_registro_sire_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_cancelar_liquidacion(uuid) TO authenticated;

-- RLS básico en tablas nuevas
ALTER TABLE public.registros_sire_cabecera ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_sire_montos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_sire_modificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_sire_adicionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tributos_afectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representantes_legales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otras_personas_vinculadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establecimientos_anexos ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'registros_sire_cabecera','registros_sire_montos','registros_sire_modificaciones',
    'registros_sire_adicionales','tributos_afectos','representantes_legales',
    'otras_personas_vinculadas','establecimientos_anexos'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS auth_all_%s ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY auth_all_%s ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t, t
    );
  END LOOP;
END $$;
