export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      asientos_contables: {
        Row: {
          comprobante_compra_id: string | null
          comprobante_venta_id: string | null
          created_at: string
          fecha: string
          glosa: string
          id: string
          moneda: Database["public"]["Enums"]["moneda_iso"]
          origen: Database["public"]["Enums"]["origen_libro"]
          periodo: string
          registro_sire_id: string | null
          tipo_asiento: string
          tipo_cambio: number
          total_debe: number
          total_haber: number
        }
        Insert: {
          comprobante_compra_id?: string | null
          comprobante_venta_id?: string | null
          created_at?: string
          fecha: string
          glosa: string
          id?: string
          moneda?: Database["public"]["Enums"]["moneda_iso"]
          origen: Database["public"]["Enums"]["origen_libro"]
          periodo: string
          registro_sire_id?: string | null
          tipo_asiento?: string
          tipo_cambio?: number
          total_debe?: number
          total_haber?: number
        }
        Update: {
          comprobante_compra_id?: string | null
          comprobante_venta_id?: string | null
          created_at?: string
          fecha?: string
          glosa?: string
          id?: string
          moneda?: Database["public"]["Enums"]["moneda_iso"]
          origen?: Database["public"]["Enums"]["origen_libro"]
          periodo?: string
          registro_sire_id?: string | null
          tipo_asiento?: string
          tipo_cambio?: number
          total_debe?: number
          total_haber?: number
        }
        Relationships: [
          {
            foreignKeyName: "asientos_contables_comprobante_compra_id_fkey"
            columns: ["comprobante_compra_id"]
            isOneToOne: false
            referencedRelation: "comprobantes_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asientos_contables_comprobante_venta_id_fkey"
            columns: ["comprobante_venta_id"]
            isOneToOne: false
            referencedRelation: "comprobantes_ventas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asientos_contables_registro_sire_id_fkey"
            columns: ["registro_sire_id"]
            isOneToOne: false
            referencedRelation: "registros_sire"
            referencedColumns: ["id"]
          },
        ]
      }
      comprobantes_compras: {
        Row: {
          base_gravada_dg: number
          base_gravada_dgng: number
          base_gravada_dng: number
          car: string | null
          correlativo_libro: number | null
          created_at: string
          detraccion_fecha: string | null
          detraccion_numero: string | null
          doc_referencia_fecha: string | null
          doc_referencia_numero: string | null
          doc_referencia_serie: string | null
          doc_referencia_tipo: string | null
          estado: Database["public"]["Enums"]["estado_cpe"]
          fecha_emision: string
          fecha_vencimiento: string | null
          icbper: number
          id: string
          igv_dg: number
          igv_dgng: number
          igv_dng: number
          importe_total: number
          isc: number
          medio_pago: string | null
          moneda: Database["public"]["Enums"]["moneda_iso"]
          numero: string
          observaciones: string | null
          otros_tributos: number
          percepcion: number
          periodo: string
          proveedor_id: string
          retencion: number
          serie: string
          tipo_cambio: number
          tipo_comprobante: string
          updated_at: string
          valor_no_gravado: number
        }
        Insert: {
          base_gravada_dg?: number
          base_gravada_dgng?: number
          base_gravada_dng?: number
          car?: string | null
          correlativo_libro?: number | null
          created_at?: string
          detraccion_fecha?: string | null
          detraccion_numero?: string | null
          doc_referencia_fecha?: string | null
          doc_referencia_numero?: string | null
          doc_referencia_serie?: string | null
          doc_referencia_tipo?: string | null
          estado?: Database["public"]["Enums"]["estado_cpe"]
          fecha_emision: string
          fecha_vencimiento?: string | null
          icbper?: number
          id?: string
          igv_dg?: number
          igv_dgng?: number
          igv_dng?: number
          importe_total?: number
          isc?: number
          medio_pago?: string | null
          moneda?: Database["public"]["Enums"]["moneda_iso"]
          numero: string
          observaciones?: string | null
          otros_tributos?: number
          percepcion?: number
          periodo: string
          proveedor_id: string
          retencion?: number
          serie: string
          tipo_cambio?: number
          tipo_comprobante: string
          updated_at?: string
          valor_no_gravado?: number
        }
        Update: {
          base_gravada_dg?: number
          base_gravada_dgng?: number
          base_gravada_dng?: number
          car?: string | null
          correlativo_libro?: number | null
          created_at?: string
          detraccion_fecha?: string | null
          detraccion_numero?: string | null
          doc_referencia_fecha?: string | null
          doc_referencia_numero?: string | null
          doc_referencia_serie?: string | null
          doc_referencia_tipo?: string | null
          estado?: Database["public"]["Enums"]["estado_cpe"]
          fecha_emision?: string
          fecha_vencimiento?: string | null
          icbper?: number
          id?: string
          igv_dg?: number
          igv_dgng?: number
          igv_dng?: number
          importe_total?: number
          isc?: number
          medio_pago?: string | null
          moneda?: Database["public"]["Enums"]["moneda_iso"]
          numero?: string
          observaciones?: string | null
          otros_tributos?: number
          percepcion?: number
          periodo?: string
          proveedor_id?: string
          retencion?: number
          serie?: string
          tipo_cambio?: number
          tipo_comprobante?: string
          updated_at?: string
          valor_no_gravado?: number
        }
        Relationships: [
          {
            foreignKeyName: "comprobantes_compras_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
        ]
      }
      comprobantes_ventas: {
        Row: {
          base_exonerada: number
          base_exportacion: number
          base_gravada: number
          base_inafecta: number
          car: string | null
          cliente_id: string
          correlativo_libro: number | null
          created_at: string
          doc_referencia_fecha: string | null
          doc_referencia_numero: string | null
          doc_referencia_serie: string | null
          doc_referencia_tipo: string | null
          estado: Database["public"]["Enums"]["estado_cpe"]
          fecha_emision: string
          fecha_vencimiento: string | null
          icbper: number
          id: string
          igv: number
          importe_total: number
          isc: number
          medio_pago: string | null
          moneda: Database["public"]["Enums"]["moneda_iso"]
          numero: string
          observaciones: string | null
          otros_tributos: number
          percepcion: number
          periodo: string
          retencion: number
          serie: string
          tipo_cambio: number
          tipo_comprobante: string
          updated_at: string
        }
        Insert: {
          base_exonerada?: number
          base_exportacion?: number
          base_gravada?: number
          base_inafecta?: number
          car?: string | null
          cliente_id: string
          correlativo_libro?: number | null
          created_at?: string
          doc_referencia_fecha?: string | null
          doc_referencia_numero?: string | null
          doc_referencia_serie?: string | null
          doc_referencia_tipo?: string | null
          estado?: Database["public"]["Enums"]["estado_cpe"]
          fecha_emision: string
          fecha_vencimiento?: string | null
          icbper?: number
          id?: string
          igv?: number
          importe_total?: number
          isc?: number
          medio_pago?: string | null
          moneda?: Database["public"]["Enums"]["moneda_iso"]
          numero: string
          observaciones?: string | null
          otros_tributos?: number
          percepcion?: number
          periodo: string
          retencion?: number
          serie: string
          tipo_cambio?: number
          tipo_comprobante: string
          updated_at?: string
        }
        Update: {
          base_exonerada?: number
          base_exportacion?: number
          base_gravada?: number
          base_inafecta?: number
          car?: string | null
          cliente_id?: string
          correlativo_libro?: number | null
          created_at?: string
          doc_referencia_fecha?: string | null
          doc_referencia_numero?: string | null
          doc_referencia_serie?: string | null
          doc_referencia_tipo?: string | null
          estado?: Database["public"]["Enums"]["estado_cpe"]
          fecha_emision?: string
          fecha_vencimiento?: string | null
          icbper?: number
          id?: string
          igv?: number
          importe_total?: number
          isc?: number
          medio_pago?: string | null
          moneda?: Database["public"]["Enums"]["moneda_iso"]
          numero?: string
          observaciones?: string | null
          otros_tributos?: number
          percepcion?: number
          periodo?: string
          retencion?: number
          serie?: string
          tipo_cambio?: number
          tipo_comprobante?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comprobantes_ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
        ]
      }
      config_contable: {
        Row: {
          cuenta_caja_default: string
          cuenta_cxc_default: string
          cuenta_cxp_default: string
          created_at: string
          id: number
          updated_at: string
        }
        Insert: {
          cuenta_caja_default?: string
          cuenta_cxc_default?: string
          cuenta_cxp_default?: string
          created_at?: string
          id?: number
          updated_at?: string
        }
        Update: {
          cuenta_caja_default?: string
          cuenta_cxc_default?: string
          cuenta_cxp_default?: string
          created_at?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      entidades: {
        Row: {
          activo: boolean
          condicion_domicilio: string | null
          created_at: string
          direccion: string | null
          email: string | null
          estado_contribuyente: string | null
          id: string
          nombre_comercial: string | null
          numero_documento: string
          razon_social: string
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_entidad"]
          tipo_documento: string
          ubigeo: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          condicion_domicilio?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          estado_contribuyente?: string | null
          id?: string
          nombre_comercial?: string | null
          numero_documento: string
          razon_social: string
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_entidad"]
          tipo_documento: string
          ubigeo?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          condicion_domicilio?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          estado_contribuyente?: string | null
          id?: string
          nombre_comercial?: string | null
          numero_documento?: string
          razon_social?: string
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_entidad"]
          tipo_documento?: string
          ubigeo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lineas_asiento: {
        Row: {
          asiento_id: string
          cuenta: string
          debe: number
          editado_el: string | null
          editado_motivo: string | null
          editado_por: string | null
          glosa: string | null
          haber: number
          id: string
          orden: number
        }
        Insert: {
          asiento_id: string
          cuenta: string
          debe?: number
          editado_el?: string | null
          editado_motivo?: string | null
          editado_por?: string | null
          glosa?: string | null
          haber?: number
          id?: string
          orden: number
        }
        Update: {
          asiento_id?: string
          cuenta?: string
          debe?: number
          editado_el?: string | null
          editado_motivo?: string | null
          editado_por?: string | null
          glosa?: string | null
          haber?: number
          id?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "lineas_asiento_asiento_id_fkey"
            columns: ["asiento_id"]
            isOneToOne: false
            referencedRelation: "asientos_contables"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_caja: {
        Row: {
          asiento_id: string | null
          correlativo: number | null
          cuenta_pcge: string
          created_at: string
          debe: number
          editado_el: string | null
          editado_motivo: string | null
          editado_por: string | null
          fecha_operacion: string
          glosa: string
          haber: number
          id: string
          origen: string
          periodo: string | null
          registro_sire_id: string | null
          ruc: string | null
          updated_at: string
        }
        Insert: {
          asiento_id?: string | null
          correlativo?: number | null
          cuenta_pcge: string
          created_at?: string
          debe?: number
          editado_el?: string | null
          editado_motivo?: string | null
          editado_por?: string | null
          fecha_operacion: string
          glosa: string
          haber?: number
          id?: string
          origen?: string
          periodo?: string | null
          registro_sire_id?: string | null
          ruc?: string | null
          updated_at?: string
        }
        Update: {
          asiento_id?: string | null
          correlativo?: number | null
          cuenta_pcge?: string
          created_at?: string
          debe?: number
          editado_el?: string | null
          editado_motivo?: string | null
          editado_por?: string | null
          fecha_operacion?: string
          glosa?: string
          haber?: number
          id?: string
          origen?: string
          periodo?: string | null
          registro_sire_id?: string | null
          ruc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_caja_asiento_id_fkey"
            columns: ["asiento_id"]
            isOneToOne: false
            referencedRelation: "asientos_contables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_cuenta_pcge_fkey"
            columns: ["cuenta_pcge"]
            isOneToOne: false
            referencedRelation: "tabla_pcge"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "movimientos_caja_registro_sire_id_fkey"
            columns: ["registro_sire_id"]
            isOneToOne: false
            referencedRelation: "registros_sire"
            referencedColumns: ["id"]
          },
        ]
      }
      registros_sire: {
        Row: {
          anio_dam_dsi: string | null
          bi_grav: number | null
          bi_grav_y_no_grav: number | null
          bi_no_grav: number | null
          campos_38_41: Json | null
          campos_libres: Json | null
          car_orig_indicador: string | null
          car_sunat: string | null
          clasificacion_bienes_serv: string | null
          cod_dam_dsi: string | null
          cod_moneda: string
          cod_tipo_cdp: string
          cuenta_pcge: string | null
          created_at: string
          descripcion_items: string | null
          estado_cobro: string
          estado_pago: string
          estado_validacion: string | null
          fecha_emision: string
          finalidad_operativa: string | null
          fecha_emision_mod: string | null
          fecha_vencimiento: string | null
          icbper: number | null
          id: string
          id_proyecto_operadores: string | null
          igv_grav: number | null
          igv_grav_y_no_grav: number | null
          igv_no_grav: number | null
          importe_total: number
          impuesto_beneficio: number | null
          isc: number | null
          nombre_contraparte: string | null
          nro_cdp_final: string | null
          nro_cdp_inicial: string
          nro_cdp_mod: string | null
          nro_doc_contraparte: string | null
          observaciones: string | null
          otros_tributos: number | null
          pct_participacion: number | null
          periodo: string
          razon_social: string
          ruc: string
          serie_cdp: string | null
          serie_cdp_mod: string | null
          tipo: string
          tipo_cambio: number | null
          tipo_cdp_mod: string | null
          tipo_doc_contraparte: string | null
          tipo_venta_config: Json | null
          updated_at: string
          valor_no_grav: number | null
          cancelacion_asiento_id: string | null
          cancelacion_generada_at: string | null
          cancelacion_mov_caja_id: string | null
        }
        Insert: {
          anio_dam_dsi?: string | null
          bi_grav?: number | null
          bi_grav_y_no_grav?: number | null
          bi_no_grav?: number | null
          campos_38_41?: Json | null
          campos_libres?: Json | null
          car_orig_indicador?: string | null
          car_sunat?: string | null
          clasificacion_bienes_serv?: string | null
          cod_dam_dsi?: string | null
          cod_moneda?: string
          cod_tipo_cdp: string
          cuenta_pcge?: string | null
          created_at?: string
          descripcion_items?: string | null
          estado_cobro?: string
          estado_pago?: string
          estado_validacion?: string | null
          fecha_emision: string
          fecha_emision_mod?: string | null
          fecha_vencimiento?: string | null
          finalidad_operativa?: string | null
          icbper?: number | null
          id?: string
          id_proyecto_operadores?: string | null
          igv_grav?: number | null
          igv_grav_y_no_grav?: number | null
          igv_no_grav?: number | null
          importe_total?: number
          impuesto_beneficio?: number | null
          isc?: number | null
          nombre_contraparte?: string | null
          nro_cdp_final?: string | null
          nro_cdp_inicial: string
          nro_cdp_mod?: string | null
          nro_doc_contraparte?: string | null
          observaciones?: string | null
          otros_tributos?: number | null
          pct_participacion?: number | null
          periodo: string
          razon_social: string
          ruc: string
          serie_cdp?: string | null
          serie_cdp_mod?: string | null
          tipo: string
          tipo_cambio?: number | null
          tipo_cdp_mod?: string | null
          tipo_doc_contraparte?: string | null
          tipo_venta_config?: Json | null
          updated_at?: string
          valor_no_grav?: number | null
          cancelacion_asiento_id?: string | null
          cancelacion_generada_at?: string | null
          cancelacion_mov_caja_id?: string | null
        }
        Update: {
          anio_dam_dsi?: string | null
          bi_grav?: number | null
          bi_grav_y_no_grav?: number | null
          bi_no_grav?: number | null
          campos_38_41?: Json | null
          campos_libres?: Json | null
          car_orig_indicador?: string | null
          car_sunat?: string | null
          clasificacion_bienes_serv?: string | null
          cod_dam_dsi?: string | null
          cod_moneda?: string
          cod_tipo_cdp?: string
          cuenta_pcge?: string | null
          created_at?: string
          descripcion_items?: string | null
          estado_validacion?: string | null
          fecha_emision?: string
          fecha_emision_mod?: string | null
          fecha_vencimiento?: string | null
          finalidad_operativa?: string | null
          icbper?: number | null
          id?: string
          id_proyecto_operadores?: string | null
          igv_grav?: number | null
          igv_grav_y_no_grav?: number | null
          igv_no_grav?: number | null
          importe_total?: number
          impuesto_beneficio?: number | null
          isc?: number | null
          nombre_contraparte?: string | null
          nro_cdp_final?: string | null
          nro_cdp_inicial?: string
          nro_cdp_mod?: string | null
          nro_doc_contraparte?: string | null
          observaciones?: string | null
          otros_tributos?: number | null
          pct_participacion?: number | null
          periodo?: string
          razon_social?: string
          ruc?: string
          serie_cdp?: string | null
          serie_cdp_mod?: string | null
          tipo?: string
          tipo_cambio?: number | null
          tipo_cdp_mod?: string | null
          tipo_doc_contraparte?: string | null
          tipo_venta_config?: Json | null
          updated_at?: string
          valor_no_grav?: number | null
        }
        Relationships: []
      }
      tabla_pcge: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          descripcion: string
          nivel: number
          naturaleza: string | null
          padre_codigo: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          descripcion: string
          nivel?: number
          naturaleza?: string | null
          padre_codigo?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          descripcion?: string
          nivel?: number
          naturaleza?: string | null
          padre_codigo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean
          created_at: string
          email: string
          id: string
          nombre: string
          password_hash: string
          rol: Database["public"]["Enums"]["rol_usuario"]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email: string
          id?: string
          nombre: string
          password_hash: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string
          id?: string
          nombre?: string
          password_hash?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_libro_diario: {
        Row: {
          cod_tipo_cdp: string | null
          cuenta_contable: string | null
          debe: number | null
          fecha_asiento: string | null
          glosa: string | null
          haber: number | null
          id: string | null
          naturaleza: string | null
          nro_cdp_inicial: string | null
          origen: string | null
          periodo: string | null
          razon_social: string | null
          ruc: string | null
          serie_cdp: string | null
          sire_registro_id: string | null
          tipo_registro: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      estado_cpe:
        | "REGISTRADO"
        | "ANOTADO"
        | "ANULADO"
        | "RECHAZADO"
        | "OBSERVADO"
      moneda_iso: "PEN" | "USD" | "EUR"
      origen_libro: "VENTAS" | "COMPRAS"
      rol_usuario: "ADMIN" | "CONTADOR" | "OPERADOR"
      tipo_entidad: "CLIENTE" | "PROVEEDOR" | "AMBOS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_cpe: [
        "REGISTRADO",
        "ANOTADO",
        "ANULADO",
        "RECHAZADO",
        "OBSERVADO",
      ],
      moneda_iso: ["PEN", "USD", "EUR"],
      origen_libro: ["VENTAS", "COMPRAS"],
      rol_usuario: ["ADMIN", "CONTADOR", "OPERADOR"],
      tipo_entidad: ["CLIENTE", "PROVEEDOR", "AMBOS"],
    },
  },
} as const
