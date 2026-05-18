CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE rol_usuario       AS ENUM ('ADMIN','CONTADOR','OPERADOR');
CREATE TYPE tipo_entidad      AS ENUM ('CLIENTE','PROVEEDOR','AMBOS');
CREATE TYPE moneda_iso        AS ENUM ('PEN','USD','EUR');
CREATE TYPE estado_cpe        AS ENUM ('REGISTRADO','ANOTADO','ANULADO','RECHAZADO','OBSERVADO');
CREATE TYPE origen_libro      AS ENUM ('VENTAS','COMPRAS');

CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol rol_usuario NOT NULL DEFAULT 'OPERADOR',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.entidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento CHAR(1) NOT NULL,
  numero_documento VARCHAR(15) NOT NULL,
  razon_social TEXT NOT NULL,
  nombre_comercial TEXT,
  direccion TEXT,
  ubigeo CHAR(6),
  condicion_domicilio VARCHAR(20),
  estado_contribuyente VARCHAR(20),
  tipo tipo_entidad NOT NULL DEFAULT 'CLIENTE',
  email CITEXT,
  telefono VARCHAR(30),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tipo_documento, numero_documento)
);
CREATE INDEX entidades_razon_idx ON public.entidades USING gin (to_tsvector('spanish', razon_social));

CREATE TABLE public.comprobantes_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo CHAR(6) NOT NULL,
  car VARCHAR(40),
  correlativo_libro BIGINT,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  tipo_comprobante CHAR(2) NOT NULL,
  serie VARCHAR(4) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.entidades(id) ON DELETE RESTRICT,
  moneda moneda_iso NOT NULL DEFAULT 'PEN',
  tipo_cambio NUMERIC(8,3) NOT NULL DEFAULT 1.000,
  base_gravada NUMERIC(14,2) NOT NULL DEFAULT 0,
  base_exonerada NUMERIC(14,2) NOT NULL DEFAULT 0,
  base_inafecta NUMERIC(14,2) NOT NULL DEFAULT 0,
  base_exportacion NUMERIC(14,2) NOT NULL DEFAULT 0,
  igv NUMERIC(14,2) NOT NULL DEFAULT 0,
  isc NUMERIC(14,2) NOT NULL DEFAULT 0,
  icbper NUMERIC(14,2) NOT NULL DEFAULT 0,
  otros_tributos NUMERIC(14,2) NOT NULL DEFAULT 0,
  importe_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  retencion NUMERIC(14,2) NOT NULL DEFAULT 0,
  percepcion NUMERIC(14,2) NOT NULL DEFAULT 0,
  medio_pago CHAR(3),
  doc_referencia_tipo CHAR(2),
  doc_referencia_serie VARCHAR(4),
  doc_referencia_numero VARCHAR(20),
  doc_referencia_fecha DATE,
  estado estado_cpe NOT NULL DEFAULT 'REGISTRADO',
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tipo_comprobante, serie, numero, cliente_id)
);
CREATE INDEX cv_periodo_idx ON public.comprobantes_ventas(periodo);
CREATE INDEX cv_cliente_idx ON public.comprobantes_ventas(cliente_id);

CREATE TABLE public.comprobantes_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo CHAR(6) NOT NULL,
  car VARCHAR(40),
  correlativo_libro BIGINT,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  tipo_comprobante CHAR(2) NOT NULL,
  serie VARCHAR(20) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  proveedor_id UUID NOT NULL REFERENCES public.entidades(id) ON DELETE RESTRICT,
  moneda moneda_iso NOT NULL DEFAULT 'PEN',
  tipo_cambio NUMERIC(8,3) NOT NULL DEFAULT 1.000,
  base_gravada_dg NUMERIC(14,2) NOT NULL DEFAULT 0,
  igv_dg NUMERIC(14,2) NOT NULL DEFAULT 0,
  base_gravada_dgng NUMERIC(14,2) NOT NULL DEFAULT 0,
  igv_dgng NUMERIC(14,2) NOT NULL DEFAULT 0,
  base_gravada_dng NUMERIC(14,2) NOT NULL DEFAULT 0,
  igv_dng NUMERIC(14,2) NOT NULL DEFAULT 0,
  isc NUMERIC(14,2) NOT NULL DEFAULT 0,
  icbper NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_no_gravado NUMERIC(14,2) NOT NULL DEFAULT 0,
  otros_tributos NUMERIC(14,2) NOT NULL DEFAULT 0,
  importe_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  retencion NUMERIC(14,2) NOT NULL DEFAULT 0,
  percepcion NUMERIC(14,2) NOT NULL DEFAULT 0,
  detraccion_numero VARCHAR(20),
  detraccion_fecha DATE,
  medio_pago CHAR(3),
  doc_referencia_tipo CHAR(2),
  doc_referencia_serie VARCHAR(4),
  doc_referencia_numero VARCHAR(20),
  doc_referencia_fecha DATE,
  estado estado_cpe NOT NULL DEFAULT 'REGISTRADO',
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tipo_comprobante, serie, numero, proveedor_id)
);
CREATE INDEX cc_periodo_idx ON public.comprobantes_compras(periodo);
CREATE INDEX cc_proveedor_idx ON public.comprobantes_compras(proveedor_id);

CREATE TABLE public.asientos_contables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo CHAR(6) NOT NULL,
  fecha DATE NOT NULL,
  origen origen_libro NOT NULL,
  comprobante_venta_id UUID REFERENCES public.comprobantes_ventas(id) ON DELETE CASCADE,
  comprobante_compra_id UUID REFERENCES public.comprobantes_compras(id) ON DELETE CASCADE,
  glosa TEXT NOT NULL,
  moneda moneda_iso NOT NULL DEFAULT 'PEN',
  tipo_cambio NUMERIC(8,3) NOT NULL DEFAULT 1.000,
  total_debe NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_haber NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (origen = 'VENTAS'  AND comprobante_venta_id  IS NOT NULL AND comprobante_compra_id IS NULL) OR
    (origen = 'COMPRAS' AND comprobante_compra_id IS NOT NULL AND comprobante_venta_id  IS NULL)
  )
);
CREATE INDEX asientos_periodo_idx ON public.asientos_contables(periodo);

CREATE TABLE public.lineas_asiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asiento_id UUID NOT NULL REFERENCES public.asientos_contables(id) ON DELETE CASCADE,
  orden SMALLINT NOT NULL,
  cuenta VARCHAR(10) NOT NULL,
  glosa TEXT,
  debe NUMERIC(14,2) NOT NULL DEFAULT 0,
  haber NUMERIC(14,2) NOT NULL DEFAULT 0,
  CHECK (debe >= 0 AND haber >= 0),
  CHECK (NOT (debe > 0 AND haber > 0))
);
CREATE INDEX lineas_asiento_idx ON public.lineas_asiento(asiento_id);

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER usuarios_updated  BEFORE UPDATE ON public.usuarios            FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER entidades_updated BEFORE UPDATE ON public.entidades           FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER cv_updated        BEFORE UPDATE ON public.comprobantes_ventas FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER cc_updated        BEFORE UPDATE ON public.comprobantes_compras FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.usuarios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidades            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes_ventas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asientos_contables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineas_asiento       ENABLE ROW LEVEL SECURITY;

INSERT INTO public.usuarios (email, password_hash, nombre, rol, activo)
VALUES (
  'admin@sistema.pe',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'Administrador Global',
  'ADMIN',
  TRUE
)
ON CONFLICT (email) DO NOTHING;
