
-- ============================================================
-- REGISTROS SIRE — formato unificado (Ventas + Compras)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.registros_sire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('VENTA','COMPRA')),

  -- Campos 1-14 (cabecera SIRE)
  ruc varchar(11) NOT NULL,                    -- 1
  razon_social text NOT NULL,                  -- 2
  periodo char(6) NOT NULL,                    -- 3  AAAAMM
  car_sunat varchar(40),                       -- 4
  fecha_emision date NOT NULL,                 -- 5
  fecha_vencimiento date,                      -- 6
  cod_tipo_cdp varchar(2) NOT NULL,            -- 7
  serie_cdp varchar(20),                       -- 8
  anio_dam_dsi varchar(4),                     -- 9
  nro_cdp_inicial varchar(20) NOT NULL,        -- 10
  nro_cdp_final varchar(20),                   -- 11
  tipo_doc_contraparte varchar(2),             -- 12 (proveedor/cliente)
  nro_doc_contraparte varchar(20),             -- 13
  nombre_contraparte text,                     -- 14

  -- Campos 15-26 (importes)
  bi_grav numeric(14,2) DEFAULT 0,             -- 15 BI ADQ. GRAV. / VALOR FACTURADO EXPORT
  igv_grav numeric(14,2) DEFAULT 0,            -- 16
  bi_grav_y_no_grav numeric(14,2) DEFAULT 0,   -- 17
  igv_grav_y_no_grav numeric(14,2) DEFAULT 0,  -- 18
  bi_no_grav numeric(14,2) DEFAULT 0,          -- 19
  igv_no_grav numeric(14,2) DEFAULT 0,         -- 20
  valor_no_grav numeric(14,2) DEFAULT 0,       -- 21
  isc numeric(14,2) DEFAULT 0,                 -- 22
  icbper numeric(14,2) DEFAULT 0,              -- 23
  otros_tributos numeric(14,2) DEFAULT 0,      -- 24
  importe_total numeric(14,2) NOT NULL DEFAULT 0,  -- 25
  cod_moneda varchar(3) NOT NULL DEFAULT 'PEN',    -- 26
  tipo_cambio numeric(8,3) DEFAULT 1.000,          -- 27

  -- Campos 28-33 (doc modificado)
  fecha_emision_mod date,                      -- 28
  tipo_cdp_mod varchar(2),                     -- 29
  serie_cdp_mod varchar(20),                   -- 30
  cod_dam_dsi varchar(20),                     -- 31
  nro_cdp_mod varchar(20),                     -- 32

  -- Campos 33-37
  clasificacion_bienes_serv varchar(10),       -- 33
  id_proyecto_operadores varchar(40),          -- 34
  pct_participacion numeric(6,2) DEFAULT 0,    -- 35
  impuesto_beneficio numeric(14,2) DEFAULT 0,  -- 36
  car_orig_indicador varchar(40),              -- 37

  -- Campos 38-41 / 42-80 (campos libres)
  campos_38_41 jsonb DEFAULT '{}'::jsonb,
  campos_libres jsonb DEFAULT '{}'::jsonb,

  -- Tipo de Venta (multi-select) y extras
  tipo_venta_config jsonb DEFAULT '[]'::jsonb,
  observaciones text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_totales CHECK (
    abs((bi_grav + igv_grav + bi_grav_y_no_grav + igv_grav_y_no_grav
       + bi_no_grav + igv_no_grav + valor_no_grav + isc + icbper + otros_tributos)
       - importe_total) <= 0.10
  )
);

CREATE INDEX IF NOT EXISTS idx_rsire_periodo ON public.registros_sire(periodo);
CREATE INDEX IF NOT EXISTS idx_rsire_tipo ON public.registros_sire(tipo);
CREATE INDEX IF NOT EXISTS idx_rsire_ruc ON public.registros_sire(ruc);
CREATE INDEX IF NOT EXISTS idx_rsire_contraparte ON public.registros_sire(nro_doc_contraparte);

CREATE TRIGGER trg_rsire_updated BEFORE UPDATE ON public.registros_sire
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.registros_sire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth select rsire" ON public.registros_sire FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert rsire" ON public.registros_sire FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update rsire" ON public.registros_sire FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete rsire" ON public.registros_sire FOR DELETE TO authenticated USING (true);

-- ============================================================
-- PCGE (Plan Contable General Empresarial) — catálogo
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tabla_pcge (
  codigo varchar(10) PRIMARY KEY,
  descripcion text NOT NULL,
  nivel smallint NOT NULL DEFAULT 1
);

ALTER TABLE public.tabla_pcge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read pcge" ON public.tabla_pcge FOR SELECT TO authenticated USING (true);

INSERT INTO public.tabla_pcge (codigo, descripcion, nivel) VALUES
  ('10','EFECTIVO Y EQUIVALENTES DE EFECTIVO',1),
  ('12','CUENTAS POR COBRAR COMERCIALES - TERCEROS',1),
  ('40','TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SPP Y SALUD',1),
  ('42','CUENTAS POR PAGAR COMERCIALES - TERCEROS',1),
  ('60','COMPRAS',1),
  ('70','VENTAS',1)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- Usuario admin por defecto en auth.users
-- ============================================================
DO $$
DECLARE
  v_uid uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@contam.pe') THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      'admin@contam.pe',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nombre":"Administrador","rol":"ADMIN"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_uid,
      format('{"sub":"%s","email":"%s"}', v_uid::text, 'admin@contam.pe')::jsonb,
      'email', v_uid::text, now(), now(), now());
  END IF;
END $$;
