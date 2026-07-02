-- =============================================================================
-- CONTAM — Esquema de base de datos consolidado (referencia)
-- Proyecto: peru-fiscal-core8 | Supabase PostgreSQL
-- Generado: documentación de migraciones 019–030 + migraciones fechadas
--
-- USO:
--   • Referencia de tablas, columnas y relaciones (NO ejecutar en producción
--     si las migraciones ya están aplicadas).
--   • Para instalar desde cero: usar supabase/migrations/ en orden.
--   • Al final: consultas para listar FKs y objetos en BD viva.
-- =============================================================================

SET search_path TO public;

-- =============================================================================
-- EXTENSIONES Y TIPOS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE rol_usuario   AS ENUM ('ADMIN','CONTADOR','OPERADOR');
CREATE TYPE tipo_entidad  AS ENUM ('CLIENTE','PROVEEDOR','AMBOS');
CREATE TYPE moneda_iso    AS ENUM ('PEN','USD','EUR');
CREATE TYPE estado_cpe    AS ENUM ('REGISTRADO','ANOTADO','ANULADO','RECHAZADO','OBSERVADO');
CREATE TYPE origen_libro  AS ENUM ('VENTAS','COMPRAS');

-- =============================================================================
-- 1. AUTENTICACIÓN Y RBAC
-- Relación clave: auth.users ← usuario_roles → roles → rol_permisos → permisos
-- Admin vs Contador: se determina por rol + permisos (dashboard.configurar)
-- =============================================================================

-- Esquema Supabase (externo, no creado aquí)
-- auth.users (id uuid PK, email, ...)

CREATE TABLE IF NOT EXISTS public.roles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text NOT NULL UNIQUE,  -- SUPER_ADMIN, ADMIN_ESTUDIO, CONTADOR, ...
  descripcion       text,
  nivel_jerarquico  int NOT NULL DEFAULT 0,
  es_sistema        boolean DEFAULT false,
  color             text,
  icono             text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permisos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text NOT NULL UNIQUE,        -- ej: dashboard.leer, sire.crear
  nombre      text NOT NULL,
  descripcion text,
  modulo      text NOT NULL,
  categoria   text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rol_permisos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rol_id      uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permiso_id  uuid NOT NULL REFERENCES public.permisos(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (rol_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS public.usuario_roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol_id       uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  ruc_id       text,                        -- NULL = alcance global (admin)
  asignado_por uuid REFERENCES auth.users(id),
  fecha_desde  date DEFAULT CURRENT_DATE,
  fecha_hasta  date,
  activo       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_roles_unique
  ON public.usuario_roles (user_id, rol_id, COALESCE(ruc_id, ''));

CREATE TABLE IF NOT EXISTS public.auditoria_seguridad (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id),
  accion              text NOT NULL,
  modulo              text,
  permiso_solicitado  text,
  ruc_afectado        text,
  severidad           text DEFAULT 'INFO',
  detalles            jsonb,
  ip_address          text,
  user_agent          text,
  created_at          timestamptz DEFAULT now()
);

-- Legacy perfil app (coexiste con auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext UNIQUE NOT NULL,
  password_hash text NOT NULL,
  nombre        text NOT NULL,
  rol           rol_usuario NOT NULL DEFAULT 'OPERADOR',
  activo        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. CONTRIBUYENTES Y FICHA RUC (tabla maestra: contribuyentes.ruc)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.contribuyentes (
  ruc                          char(11) PRIMARY KEY,
  razon_social                 text NOT NULL,
  otros                        text NOT NULL DEFAULT '',
  categorias                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  fecha_vencimiento_declaracion date,
  estado                       text NOT NULL DEFAULT 'ACTIVO'
    CHECK (estado IN ('ACTIVO','INACTIVO','DE_BAJA')),
  clave_sol                    jsonb NOT NULL DEFAULT '{"usuario":"","clave":""}'::jsonb,
  afp_net                      jsonb NOT NULL DEFAULT '{"usuario":"","clave":""}'::jsonb,
  validez_cpe                  jsonb NOT NULL DEFAULT '{"usuario":"","clave":""}'::jsonb,
  claves_sire                  jsonb NOT NULL DEFAULT '{"usuario":"","clave":""}'::jsonb,
  id                           uuid DEFAULT gen_random_uuid(),
  cat1ra                       boolean NOT NULL DEFAULT false,
  cat2da                       boolean NOT NULL DEFAULT false,
  cat3ra                       boolean NOT NULL DEFAULT false,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fichas_ruc (
  ruc        char(11) PRIMARY KEY REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  payload    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tributos_afectos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc         char(11) NOT NULL REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  orden       int NOT NULL DEFAULT 0,
  codigo      varchar(20),
  descripcion text,
  payload     jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.representantes_legales (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc         char(11) NOT NULL REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  orden       int NOT NULL DEFAULT 0,
  nombre      text,
  documento   varchar(20),
  cargo       text,
  payload     jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.otras_personas_vinculadas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc         char(11) NOT NULL REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  orden       int NOT NULL DEFAULT 0,
  nombre      text,
  documento   varchar(20),
  vinculo     text,
  payload     jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.establecimientos_anexos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc         char(11) NOT NULL REFERENCES public.contribuyentes(ruc) ON DELETE CASCADE,
  orden       int NOT NULL DEFAULT 0,
  codigo      varchar(20),
  direccion   text,
  ubigeo      varchar(6),
  payload     jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3. PLAN DE CUENTAS (PCGE)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tabla_pcge (
  codigo        varchar(10) PRIMARY KEY,
  descripcion   text NOT NULL,
  nivel         smallint NOT NULL DEFAULT 1,
  padre_codigo  varchar(10) REFERENCES public.tabla_pcge(codigo),
  activo        boolean DEFAULT true,
  naturaleza    varchar(20),
  created_at    timestamptz,
  updated_at    timestamptz
);

CREATE TABLE IF NOT EXISTS public.plan_contable_pcge (
  codigo_cuenta   varchar(10) PRIMARY KEY,
  nombre_cuenta   text NOT NULL,
  nivel           smallint NOT NULL DEFAULT 1,
  activo          boolean NOT NULL DEFAULT true,
  naturaleza      varchar(20),
  padre_codigo    varchar(10),
  id              uuid DEFAULT gen_random_uuid(),
  tipo_cuenta     varchar(50),
  aplica_para     varchar(100),
  palabras_clave  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pcge_fix_log (
  id         serial PRIMARY KEY,
  codigo_old varchar(10),
  codigo_new varchar(10),
  motivo     text,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 4. SIRE — COMPROBANTES SUNAT
-- Modelo activo: registros_sire (plano)
-- Modelo normalizado paralelo: registros_sire_cabecera + hijas
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.registros_sire (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                  text NOT NULL CHECK (tipo IN ('VENTA','COMPRA')),
  ruc                   varchar(11) NOT NULL,          -- → contribuyentes.ruc (lógico)
  razon_social          text NOT NULL,
  periodo               char(6) NOT NULL,
  car_sunat             varchar(40),
  fecha_emision         date NOT NULL,
  fecha_vencimiento     date,
  cod_tipo_cdp          varchar(2) NOT NULL,
  serie_cdp             varchar(20),
  anio_dam_dsi          varchar(4),
  nro_cdp_inicial       varchar(20) NOT NULL,
  nro_cdp_final         varchar(20),
  tipo_doc_contraparte  varchar(2),
  nro_doc_contraparte   varchar(20),
  nombre_contraparte    text,
  bi_grav               numeric(14,2) DEFAULT 0,
  igv_grav              numeric(14,2) DEFAULT 0,
  bi_grav_y_no_grav     numeric(14,2) DEFAULT 0,
  igv_grav_y_no_grav    numeric(14,2) DEFAULT 0,
  bi_no_grav            numeric(14,2) DEFAULT 0,
  igv_no_grav           numeric(14,2) DEFAULT 0,
  valor_no_grav         numeric(14,2) DEFAULT 0,
  isc                   numeric(14,2) DEFAULT 0,
  icbper                numeric(14,2) DEFAULT 0,
  otros_tributos        numeric(14,2) DEFAULT 0,
  importe_total         numeric(14,2) NOT NULL DEFAULT 0,
  cod_moneda            varchar(3) NOT NULL DEFAULT 'PEN',
  tipo_cambio           numeric(8,3) DEFAULT 1.000,
  mto_bi_gravada        numeric(14,2) DEFAULT 0,
  mto_igv_ipe           numeric(14,2) DEFAULT 0,
  mto_total_cp          numeric(14,2) DEFAULT 0,
  fecha_emision_mod     date,
  tipo_cdp_mod          varchar(2),
  serie_cdp_mod         varchar(20),
  cod_dam_dsi           varchar(20),
  nro_cdp_mod           varchar(20),
  clasificacion_bienes_serv varchar(10),
  id_proyecto_operadores varchar(40),
  pct_participacion     numeric(6,2) DEFAULT 0,
  impuesto_beneficio    numeric(14,2) DEFAULT 0,
  car_orig_indicador    varchar(40),
  campos_38_41          jsonb DEFAULT '{}'::jsonb,
  campos_libres         jsonb DEFAULT '{}'::jsonb,
  tipo_venta_config     jsonb DEFAULT '[]'::jsonb,
  observaciones         text,
  datos_completos       jsonb DEFAULT '{}'::jsonb,
  estado_validacion     text NOT NULL DEFAULT 'pendiente',
  estado_cobro          text DEFAULT 'pendiente',
  estado_pago           text DEFAULT 'pendiente',
  cuenta_pcge           varchar(10),
  finalidad_operativa   text,
  descripcion_items     text,
  cancelacion_asiento_id    uuid,   -- → asientos_contables.id
  cancelacion_mov_caja_id   uuid,   -- → movimientos_caja.id
  cancelacion_generada_at   timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registros_sire_cabecera (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                      text NOT NULL CHECK (tipo IN ('VENTA','COMPRA')),
  ruc                       varchar(11) NOT NULL REFERENCES public.contribuyentes(ruc),
  razon_social              text NOT NULL,
  periodo                   char(6) NOT NULL,
  car_sunat                 varchar(40),
  fecha_emision             date NOT NULL,
  fecha_vencimiento         date,
  cod_tipo_cdp              varchar(2) NOT NULL,
  serie_cdp                 varchar(20),
  anio_dam_dsi              varchar(4),
  nro_cdp_inicial           varchar(20) NOT NULL,
  nro_cdp_final             varchar(20),
  tipo_doc_contraparte      varchar(2),
  nro_doc_contraparte       varchar(20),
  nombre_contraparte        text,
  cod_moneda                varchar(3) NOT NULL DEFAULT 'PEN',
  tipo_cambio               numeric(8,3) DEFAULT 1.000,
  estado_validacion         text NOT NULL DEFAULT 'pendiente',
  estado_cobro              text NOT NULL DEFAULT 'pendiente',
  estado_pago               text NOT NULL DEFAULT 'pendiente',
  cuenta_pcge               varchar(10),
  finalidad_operativa       text,
  descripcion_items         text,
  cancelacion_asiento_id    uuid,
  cancelacion_mov_caja_id   uuid,
  cancelacion_generada_at   timestamptz,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registros_sire_montos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_sire_id    uuid NOT NULL UNIQUE
    REFERENCES public.registros_sire_cabecera(id) ON DELETE CASCADE,
  bi_grav             numeric(14,2) DEFAULT 0,
  igv_grav            numeric(14,2) DEFAULT 0,
  bi_grav_y_no_grav   numeric(14,2) DEFAULT 0,
  igv_grav_y_no_grav  numeric(14,2) DEFAULT 0,
  bi_no_grav          numeric(14,2) DEFAULT 0,
  igv_no_grav         numeric(14,2) DEFAULT 0,
  valor_no_grav       numeric(14,2) DEFAULT 0,
  isc                 numeric(14,2) DEFAULT 0,
  icbper              numeric(14,2) DEFAULT 0,
  otros_tributos      numeric(14,2) DEFAULT 0,
  importe_total       numeric(14,2) NOT NULL DEFAULT 0,
  mto_bi_gravada      numeric(14,2) DEFAULT 0,
  mto_igv_ipe         numeric(14,2) DEFAULT 0,
  mto_total_cp        numeric(14,2) DEFAULT 0,
  bi_adq_grav         numeric(14,2) DEFAULT 0,
  igv_adq_grav        numeric(14,2) DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registros_sire_modificaciones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_sire_id  uuid NOT NULL UNIQUE
    REFERENCES public.registros_sire_cabecera(id) ON DELETE CASCADE,
  fecha_emision_mod date,
  tipo_cdp_mod      varchar(2),
  serie_cdp_mod     varchar(20),
  cod_dam_dsi       varchar(20),
  nro_cdp_mod       varchar(20),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registros_sire_adicionales (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_sire_id          uuid NOT NULL UNIQUE
    REFERENCES public.registros_sire_cabecera(id) ON DELETE CASCADE,
  clasificacion_bienes_serv varchar(10),
  id_proyecto_operadores    varchar(40),
  pct_participacion         numeric(6,2) DEFAULT 0,
  impuesto_beneficio        numeric(14,2) DEFAULT 0,
  car_orig_indicador        varchar(40),
  campos_38_41              jsonb DEFAULT '{}'::jsonb,
  campos_libres             jsonb DEFAULT '{}'::jsonb,
  tipo_venta_config         jsonb DEFAULT '[]'::jsonb,
  observaciones             text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sire_sync_errors (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  source_table   text NOT NULL,
  target_table   text NOT NULL,
  record_id      uuid,
  error_message  text NOT NULL,
  error_detail   jsonb DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  resolved_at    timestamptz,
  resolved_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =============================================================================
-- 5. CONTABILIDAD — LIBRO DIARIO (modelo plano + legacy)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.entidades (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento       char(1) NOT NULL,
  numero_documento     varchar(15) NOT NULL,
  razon_social         text NOT NULL,
  nombre_comercial     text,
  direccion            text,
  ubigeo               char(6),
  condicion_domicilio  varchar(20),
  estado_contribuyente varchar(20),
  tipo                 tipo_entidad NOT NULL DEFAULT 'CLIENTE',
  email                citext,
  telefono             varchar(30),
  activo               boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tipo_documento, numero_documento)
);

CREATE TABLE IF NOT EXISTS public.comprobantes_ventas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo          char(6) NOT NULL,
  fecha_emision    date NOT NULL,
  tipo_comprobante char(2) NOT NULL,
  serie            varchar(4) NOT NULL,
  numero           varchar(20) NOT NULL,
  cliente_id       uuid NOT NULL REFERENCES public.entidades(id) ON DELETE RESTRICT,
  moneda           moneda_iso NOT NULL DEFAULT 'PEN',
  importe_total    numeric(14,2) NOT NULL DEFAULT 0,
  estado           estado_cpe NOT NULL DEFAULT 'REGISTRADO',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comprobantes_compras (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo          char(6) NOT NULL,
  fecha_emision    date NOT NULL,
  tipo_comprobante char(2) NOT NULL,
  serie            varchar(20) NOT NULL,
  numero           varchar(20) NOT NULL,
  proveedor_id     uuid NOT NULL REFERENCES public.entidades(id) ON DELETE RESTRICT,
  moneda           moneda_iso NOT NULL DEFAULT 'PEN',
  importe_total    numeric(14,2) NOT NULL DEFAULT 0,
  estado           estado_cpe NOT NULL DEFAULT 'REGISTRADO',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- asientos_contables: modelo PLANO actual (1 fila = 1 línea contable)
CREATE TABLE IF NOT EXISTS public.asientos_contables (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Legacy cabecera
  periodo               char(6),
  fecha                 date,
  origen                origen_libro,
  comprobante_venta_id  uuid REFERENCES public.comprobantes_ventas(id) ON DELETE CASCADE,
  comprobante_compra_id uuid REFERENCES public.comprobantes_compras(id) ON DELETE CASCADE,
  glosa                 text,
  moneda                moneda_iso DEFAULT 'PEN',
  tipo_cambio           numeric(8,3) DEFAULT 1.000,
  total_debe            numeric(14,2) DEFAULT 0,
  total_haber           numeric(14,2) DEFAULT 0,
  -- Modelo plano SIRE
  sire_registro_id      uuid REFERENCES public.registros_sire(id) ON DELETE CASCADE,
  registro_sire_id      uuid,              -- alias histórico
  ruc                   char(11),
  ruc_contraparte       varchar(11),
  fecha_asiento         date,
  cuenta_contable       varchar(10),
  debe                  numeric(14,2) DEFAULT 0,
  haber                 numeric(14,2) DEFAULT 0,
  naturaleza            text,
  tipo_asiento          text,
  tipo_registro         text,
  tipo_libro            text CHECK (tipo_libro IN (
    'DIARIO_COMPRAS','DIARIO_VENTAS','CAJA_BANCOS','DIARIO_MANUAL'
  )),
  referencia_lote_id    uuid,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lineas_asiento (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asiento_id  uuid NOT NULL REFERENCES public.asientos_contables(id) ON DELETE CASCADE,
  orden       smallint NOT NULL,
  cuenta      varchar(10) NOT NULL,
  glosa       text,
  debe        numeric(14,2) NOT NULL DEFAULT 0,
  haber       numeric(14,2) NOT NULL DEFAULT 0,
  editado_por text,
  editado_el  timestamptz,
  editado_motivo text
);

CREATE TABLE IF NOT EXISTS public.asientos_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  descripcion   text,
  categoria     text NOT NULL,
  tipo_libro    text NOT NULL,
  configuracion jsonb NOT NULL DEFAULT '{}'::jsonb,
  activo        boolean DEFAULT true,
  uso_count     int DEFAULT 0,
  ultima_uso    timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.asientos_programados (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id             uuid REFERENCES public.asientos_templates(id),
  nombre                  text NOT NULL,
  parametros              jsonb NOT NULL DEFAULT '{}'::jsonb,
  frecuencia              text NOT NULL,
  dia_ejecucion           int NOT NULL DEFAULT 1,
  fecha_inicio            date NOT NULL,
  fecha_fin               date,
  ultima_ejecucion        timestamptz,
  proxima_ejecucion       date NOT NULL,
  activo                  boolean DEFAULT true,
  generar_automaticamente boolean DEFAULT false,
  notificar_antes         int DEFAULT 3,
  ruc                     text,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tipos_cambio (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha      date NOT NULL,
  moneda     text NOT NULL DEFAULT 'USD',
  compra     numeric(10,4) NOT NULL,
  venta      numeric(10,4) NOT NULL,
  fuente     text DEFAULT 'MANUAL',
  created_at timestamptz DEFAULT now(),
  UNIQUE (fecha, moneda)
);

CREATE TABLE IF NOT EXISTS public.config_contable (
  id                  smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cuenta_caja_default varchar(10) NOT NULL DEFAULT '10',
  cuenta_cxc_default  varchar(10) NOT NULL DEFAULT '12',
  cuenta_cxp_default  varchar(10) NOT NULL DEFAULT '42',
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Configuración remota del estudio (dashboard contador, umbrales, sidebar, etc.)
CREATE TABLE IF NOT EXISTS public.config_estudio (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave           text NOT NULL UNIQUE,
  valor           jsonb NOT NULL,
  descripcion     text,
  actualizado_por uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Feature flags globales o por RUC
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

CREATE INDEX IF NOT EXISTS idx_feature_flags_activo ON public.feature_flags(activo, scope);
CREATE INDEX IF NOT EXISTS idx_config_estudio_clave ON public.config_estudio(clave);

-- RPCs: rpc_get_config_estudio, rpc_get_all_config_estudio, rpc_update_config_estudio,
--       rpc_get_feature_flags, rpc_toggle_feature_flag (ver migración 031)

CREATE TABLE IF NOT EXISTS public.accounting_integrity_errors (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type     text NOT NULL,
  table_name     text,
  record_id      uuid,
  details        jsonb,
  resolved       boolean DEFAULT false,
  resolved_at    timestamptz,
  resolved_by    uuid REFERENCES auth.users(id),
  created_at     timestamptz DEFAULT now()
);

-- =============================================================================
-- 6. LIBRO CAJA Y CONCILIACIÓN
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cuentas_financieras (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc             varchar(11) NOT NULL,     -- → contribuyentes.ruc (lógico)
  nombre          text NOT NULL,
  tipo            text NOT NULL CHECK (tipo IN ('CAJA_CHICA','BANCO')),
  cuenta_contable varchar(20) NOT NULL,
  banco           text,
  numero_cuenta   text,
  activo          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.movimientos_caja (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlativo           bigserial,
  ruc                   varchar(11),
  ruc_contribuyente     varchar(11),
  periodo               char(6),
  fecha_operacion       date NOT NULL,
  fecha                 date,
  glosa                 text NOT NULL,
  cuenta_contable       varchar(10) NOT NULL
    REFERENCES public.plan_contable_pcge(codigo_cuenta),
  debe                  numeric(14,2) NOT NULL DEFAULT 0,
  haber                 numeric(14,2) NOT NULL DEFAULT 0,
  origen                text NOT NULL DEFAULT 'manual',
  origen_documento      text DEFAULT 'manual',
  numero_documento      varchar(50),
  descripcion           text,
  tipo_movimiento       varchar(20) DEFAULT 'ingreso',
  registro_sire_id      uuid REFERENCES public.registros_sire(id) ON DELETE SET NULL,
  asiento_id            uuid REFERENCES public.asientos_contables(id) ON DELETE SET NULL,
  cuenta_financiera_id  uuid REFERENCES public.cuentas_financieras(id),
  editado_por           text,
  editado_el            timestamptz,
  editado_motivo        text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conciliaciones_bancarias (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_financiera_id  uuid REFERENCES public.cuentas_financieras(id),
  periodo               char(6) NOT NULL,
  fecha_corte           date NOT NULL,
  saldo_libro           numeric(14,2),
  saldo_banco           numeric(14,2),
  usuario_id            uuid REFERENCES auth.users(id),
  estado                text DEFAULT 'borrador',
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conciliacion_detalles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conciliacion_id       uuid NOT NULL
    REFERENCES public.conciliaciones_bancarias(id) ON DELETE CASCADE,
  movimiento_banco_id   text,
  movimiento_sistema_id uuid REFERENCES public.movimientos_caja(id),
  monto                 numeric(14,2),
  conciliado            boolean DEFAULT false,
  created_at            timestamptz DEFAULT now()
);

-- =============================================================================
-- 7. TAREAS Y NOTIFICACIONES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tareas_pendientes (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc                      varchar(11) REFERENCES public.contribuyentes(ruc),
  entidad                  text NOT NULL,
  tramite                  text NOT NULL,
  titulo                   text,
  descripcion              text,
  fecha_tramitar           date,
  problema                 text,
  plazo_vencimiento        date,
  critica                  boolean NOT NULL DEFAULT false,
  estado                   text NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','en_progreso','completada','cancelada')),
  prioridad                text NOT NULL DEFAULT 'media',
  modulo_origen            text DEFAULT 'general',
  referencia_id            text,
  usuario_id               uuid,            -- → auth.users
  asignado_a               text,
  fecha_completada         timestamptz,
  hash_deduplicacion       text,
  generada_automaticamente boolean NOT NULL DEFAULT false,
  regla_generadora         text,
  metadata                 jsonb DEFAULT '{}'::jsonb,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notificaciones_correo (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      uuid,                     -- → auth.users
  correo_destino  text NOT NULL,
  remitente       text,
  asunto          text NOT NULL,
  cuerpo          text,
  tipo            text DEFAULT 'ALERTA_SISTEMA',
  metadata        jsonb DEFAULT '{}'::jsonb,
  leido           boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.preferencias_notificaciones (
  user_id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notificaciones_in_app boolean DEFAULT true,
  notificaciones_correo boolean DEFAULT false,
  frecuencia_correo     text DEFAULT 'diario',
  horas_silencio        jsonb,
  modulos_activos       jsonb DEFAULT '[]'::jsonb,
  prioridad_minima      text DEFAULT 'MEDIA',
  updated_at            timestamptz DEFAULT now()
);

-- =============================================================================
-- 8. AUDITORÍA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.auditoria_cambios (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla_nombre      text NOT NULL,
  registro_id       text NOT NULL,
  operacion         text NOT NULL CHECK (operacion IN ('INSERT','UPDATE','DELETE')),
  datos_anteriores  jsonb,
  datos_nuevos      jsonb,
  usuario_id        uuid,
  modulo_afectado   text,
  ruc_afectado      text,
  periodo_afectado  text,
  accion            text,
  detalle_jsonb     jsonb,
  diff_jsonb        jsonb,
  ip_address        text,
  user_agent        text,
  severity          text DEFAULT 'INFO',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alertas_auditoria (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo            text NOT NULL,
  severidad       text NOT NULL DEFAULT 'WARNING',
  titulo          text NOT NULL,
  descripcion     text,
  modulo_afectado text,
  user_id         uuid REFERENCES auth.users(id),
  ruc_afectado    text,
  detalles        jsonb,
  resuelta        boolean DEFAULT false,
  resuelta_por    uuid REFERENCES auth.users(id),
  resuelta_en     timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- =============================================================================
-- 9. VISTAS (SQL)
-- =============================================================================

CREATE OR REPLACE VIEW public.v_libro_diario AS
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
  rs.razon_social,
  rs.cod_tipo_cdp,
  rs.serie_cdp,
  rs.nro_cdp_inicial,
  rs.tipo AS tipo_registro
FROM public.asientos_contables ac
LEFT JOIN public.registros_sire rs ON rs.id = ac.sire_registro_id;

CREATE OR REPLACE VIEW public.v_tareas_pendientes AS
SELECT
  t.*,
  c.razon_social,
  CASE
    WHEN t.estado IN ('completada','cancelada') THEN false
    WHEN t.plazo_vencimiento IS NOT NULL AND t.plazo_vencimiento < CURRENT_DATE THEN true
    ELSE false
  END AS vencida,
  CASE WHEN t.plazo_vencimiento IS NULL THEN NULL
       ELSE (t.plazo_vencimiento - CURRENT_DATE) END AS dias_restantes
FROM public.tareas_pendientes t
LEFT JOIN public.contribuyentes c ON c.ruc = t.ruc;

CREATE OR REPLACE VIEW public.registros_sire_completo AS
SELECT
  cab.*,
  m.importe_total, m.mto_total_cp,
  mod.fecha_emision_mod,
  ad.observaciones
FROM public.registros_sire_cabecera cab
LEFT JOIN public.registros_sire_montos m ON m.registro_sire_id = cab.id
LEFT JOIN public.registros_sire_modificaciones mod ON mod.registro_sire_id = cab.id
LEFT JOIN public.registros_sire_adicionales ad ON ad.registro_sire_id = cab.id;

CREATE OR REPLACE VIEW public.v_auditoria_resumen AS
SELECT
  usuario_id AS user_id,
  DATE(created_at) AS fecha,
  modulo_afectado,
  accion,
  COUNT(*) AS cantidad,
  COUNT(DISTINCT ruc_afectado) AS rucs_afectados
FROM public.auditoria_cambios
GROUP BY usuario_id, DATE(created_at), modulo_afectado, accion;

CREATE OR REPLACE VIEW public.v_cambios_sensibles AS
SELECT ac.*
FROM public.auditoria_cambios ac
WHERE ac.severity IN ('CRITICAL','WARNING');

CREATE OR REPLACE VIEW public.v_actividad_reciente AS
SELECT
  modulo_afectado,
  accion,
  COUNT(*) AS total,
  COUNT(DISTINCT usuario_id) AS usuarios_unicos,
  COUNT(DISTINCT ruc_afectado) AS rucs_unicos,
  MAX(created_at) AS ultima_actividad
FROM public.auditoria_cambios
WHERE created_at >= now() - interval '24 hours'
GROUP BY modulo_afectado, accion;

-- =============================================================================
-- 10. VISTAS MATERIALIZADAS (KPI / Dashboard)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_dashboard_stats AS
SELECT
  COALESCE(ac.ruc, ac.ruc_contraparte) AS ruc,
  ac.periodo,
  COUNT(DISTINCT CASE WHEN ac.tipo_libro = 'DIARIO_COMPRAS' THEN ac.sire_registro_id END) AS total_compras,
  COUNT(DISTINCT CASE WHEN ac.tipo_libro = 'DIARIO_VENTAS' THEN ac.sire_registro_id END) AS total_ventas,
  COALESCE(SUM(CASE WHEN ac.tipo_libro = 'DIARIO_COMPRAS' THEN ac.debe ELSE 0 END), 0) AS total_monto_compras,
  COALESCE(SUM(CASE WHEN ac.tipo_libro = 'DIARIO_VENTAS' THEN ac.haber ELSE 0 END), 0) AS total_monto_ventas,
  COUNT(DISTINCT ac.cuenta_contable) AS cuentas_utilizadas,
  COUNT(*) AS total_lineas,
  MIN(ac.fecha_asiento) AS primera_fecha,
  MAX(ac.fecha_asiento) AS ultima_fecha
FROM public.asientos_contables ac
WHERE ac.sire_registro_id IS NOT NULL
GROUP BY COALESCE(ac.ruc, ac.ruc_contraparte), ac.periodo;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_ruc_periodo
  ON public.mv_dashboard_stats(ruc, periodo);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_saldos_cxc_cxp AS
SELECT
  ac.sire_registro_id,
  COALESCE(ac.ruc_contraparte, ac.ruc) AS ruc,
  ac.periodo,
  ac.tipo_libro,
  SUM(ac.debe) - SUM(ac.haber) AS saldo_pendiente,
  COUNT(*) AS lineas_pendientes,
  MAX(ac.fecha_asiento) AS ultima_actualizacion
FROM public.asientos_contables ac
WHERE ac.sire_registro_id IS NOT NULL
GROUP BY ac.sire_registro_id, COALESCE(ac.ruc_contraparte, ac.ruc), ac.periodo, ac.tipo_libro
HAVING SUM(ac.debe) - SUM(ac.haber) <> 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_saldos_sire
  ON public.mv_saldos_cxc_cxp(sire_registro_id, periodo, tipo_libro);

-- =============================================================================
-- 11. MAPA DE RELACIONES (FOREIGN KEYS)
-- =============================================================================
/*
┌─────────────────────────────────────────────────────────────────────────────┐
│ RBAC                                                                        │
│   auth.users ──< usuario_roles >── roles ──< rol_permisos >── permisos      │
│   auth.users ──< preferencias_notificaciones                                │
│   auth.users ──< notificaciones_correo                                      │
│   auth.users ──< auditoria_seguridad / alertas_auditoria                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ CONTRIBUYENTES (hub central: contribuyentes.ruc)                            │
│   contribuyentes ──< fichas_ruc                                             │
│   contribuyentes ──< tributos_afectos | representantes_legales | ...        │
│   contribuyentes ──< registros_sire | registros_sire_cabecera               │
│   contribuyentes ──< tareas_pendientes                                      │
│   contribuyentes ──< cuentas_financieras (ruc lógico)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIRE → CONTABILIDAD → CAJA                                                  │
│   registros_sire ──< asientos_contables (sire_registro_id)                  │
│   registros_sire ──< movimientos_caja (registro_sire_id)                    │
│   registros_sire_cabecera ──1:1── registros_sire_montos                     │
│   registros_sire_cabecera ──1:1── registros_sire_modificaciones             │
│   registros_sire_cabecera ──1:1── registros_sire_adicionales                │
├─────────────────────────────────────────────────────────────────────────────┤
│ PCGE                                                                        │
│   plan_contable_pcge ──< movimientos_caja.cuenta_contable                   │
│   tabla_pcge (legacy) ── padre_codigo → tabla_pcge                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ CAJA / CONCILIACIÓN                                                         │
│   cuentas_financieras ──< conciliaciones_bancarias                          │
│   conciliaciones_bancarias ──< conciliacion_detalles ──> movimientos_caja   │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEGACY                                                                      │
│   entidades ──< comprobantes_ventas | comprobantes_compras                   │
│   comprobantes_* ──< asientos_contables (comprobante_*_id)                  │
│   asientos_contables ──< lineas_asiento (modelo legacy)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ DIARIO PREMIUM                                                              │
│   asientos_templates ──< asientos_programados                               │
└─────────────────────────────────────────────────────────────────────────────┘
*/

-- =============================================================================
-- 12. CONSULTAS ÚTILES (ejecutar en BD viva)
-- =============================================================================

-- Listar todas las tablas del esquema public
-- SELECT table_name, table_type
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_type, table_name;

-- Listar todas las FKs con relaciones
-- SELECT
--   tc.table_name      AS tabla_origen,
--   kcu.column_name    AS columna_origen,
--   ccu.table_name     AS tabla_destino,
--   ccu.column_name    AS columna_destino,
--   tc.constraint_name AS fk_name
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu
--   ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage ccu
--   ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_schema = 'public'
-- ORDER BY tc.table_name, kcu.column_name;

-- Roles y scope RUC de un usuario
-- SELECT u.email, r.nombre AS rol, ur.ruc_id, ur.activo
-- FROM usuario_roles ur
-- JOIN roles r ON r.id = ur.rol_id
-- JOIN auth.users u ON u.id = ur.user_id
-- WHERE ur.user_id = auth.uid();

-- Permisos efectivos
-- SELECT * FROM rpc_get_user_permissions(auth.uid(), NULL);

-- Diagrama ER simplificado (solo tablas con FK explícita)
-- SELECT conrelid::regclass AS desde,
--        confrelid::regclass AS hacia,
--        conname AS fk
-- FROM pg_constraint
-- WHERE contype = 'f' AND connamespace = 'public'::regnamespace
-- ORDER BY 1, 2;

-- =============================================================================
-- FIN — CONTAM_ESQUEMA_COMPLETO.sql
-- =============================================================================
