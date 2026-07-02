/** Tipos alineados a la arquitectura normalizada Supabase (2026-06-29). */

export type RegistroSireCabecera = {
  id: string;
  tipo: "VENTA" | "COMPRA";
  ruc: string;
  razon_social: string;
  periodo: string;
  car_sunat?: string | null;
  fecha_emision: string;
  fecha_vencimiento?: string | null;
  cod_tipo_cdp: string;
  serie_cdp?: string | null;
  anio_dam_dsi?: string | null;
  nro_cdp_inicial: string;
  nro_cdp_final?: string | null;
  tipo_doc_contraparte?: string | null;
  nro_doc_contraparte?: string | null;
  nombre_contraparte?: string | null;
  cod_moneda: string;
  tipo_cambio?: number | null;
  estado_validacion?: string;
  estado_cobro?: string;
  estado_pago?: string;
  cuenta_pcge?: string | null;
  finalidad_operativa?: string | null;
  descripcion_items?: string | null;
  cancelacion_asiento_id?: string | null;
  cancelacion_mov_caja_id?: string | null;
  cancelacion_generada_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RegistroSireMontos = {
  id?: string;
  registro_sire_id: string;
  bi_grav?: number;
  igv_grav?: number;
  bi_grav_y_no_grav?: number;
  igv_grav_y_no_grav?: number;
  bi_no_grav?: number;
  igv_no_grav?: number;
  valor_no_grav?: number;
  isc?: number;
  icbper?: number;
  otros_tributos?: number;
  importe_total: number;
  mto_bi_gravada?: number;
  mto_igv_ipe?: number;
  mto_total_cp?: number;
  bi_adq_grav?: number;
  igv_adq_grav?: number;
  created_at?: string;
  updated_at?: string;
};

export type RegistroSireModificaciones = {
  id?: string;
  registro_sire_id: string;
  fecha_emision_mod?: string | null;
  tipo_cdp_mod?: string | null;
  serie_cdp_mod?: string | null;
  cod_dam_dsi?: string | null;
  nro_cdp_mod?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RegistroSireAdicionales = {
  id?: string;
  registro_sire_id: string;
  clasificacion_bienes_serv?: string | null;
  id_proyecto_operadores?: string | null;
  pct_participacion?: number | null;
  impuesto_beneficio?: number | null;
  car_orig_indicador?: string | null;
  campos_38_41?: Record<string, unknown>;
  campos_libres?: Record<string, unknown>;
  tipo_venta_config?: unknown[];
  observaciones?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RegistroSireCompleto = RegistroSireCabecera &
  Omit<RegistroSireMontos, "id" | "registro_sire_id"> &
  Omit<RegistroSireModificaciones, "id" | "registro_sire_id"> &
  Omit<RegistroSireAdicionales, "id" | "registro_sire_id"> & {
    montos_id?: string;
    modificaciones_id?: string;
    adicionales_id?: string;
  };

export type TributoAfecto = {
  id?: string;
  ruc: string;
  orden?: number;
  codigo?: string;
  descripcion?: string;
  [key: string]: unknown;
};

export type RepresentanteLegal = {
  id?: string;
  ruc: string;
  orden?: number;
  nombre?: string;
  documento?: string;
  [key: string]: unknown;
};

export type OtraPersonaVinculada = {
  id?: string;
  ruc: string;
  orden?: number;
  nombre?: string;
  documento?: string;
  [key: string]: unknown;
};

export type EstablecimientoAnexo = {
  id?: string;
  ruc: string;
  orden?: number;
  codigo?: string;
  direccion?: string;
  [key: string]: unknown;
};

export type AuditoriaCambio = {
  id: string;
  tabla_nombre: string;
  registro_id: string;
  operacion: "INSERT" | "UPDATE" | "DELETE";
  datos_anteriores?: Record<string, unknown> | null;
  datos_nuevos?: Record<string, unknown> | null;
  usuario_id?: string | null;
  created_at: string;
};

export type MovimientoCajaExtendido = {
  id: string;
  correlativo?: string | null;
  ruc: string | null;
  ruc_contribuyente?: string | null;
  periodo: string;
  fecha: string;
  fecha_operacion: string | null;
  glosa: string;
  cuenta_contable: string;
  debe: number;
  haber: number;
  origen: string;
  origen_documento?: string;
  numero_documento?: string | null;
  descripcion?: string | null;
  tipo_movimiento?: "ingreso" | "egreso" | string;
  registro_sire_id: string | null;
  asiento_id: string | null;
  editado_por?: string | null;
  editado_el?: string | null;
  editado_motivo?: string | null;
  created_at?: string;
};

export type AsientoContableRow = {
  id: string;
  sire_registro_id: string | null;
  ruc: string | null;
  periodo: string;
  fecha_asiento: string;
  cuenta_contable: string;
  glosa: string | null;
  debe: number | null;
  haber: number | null;
  tipo_asiento: string;
  tipo_libro: string | null;
  tipo_registro: string | null;
  naturaleza: string | null;
  created_at?: string | null;
};

export type RpcResult = {
  success: boolean;
  error?: string;
  asiento_id?: string;
  movimiento_caja_id?: string;
  duplicado?: boolean;
};
