"""
Modelos unmanaged: mapean tablas existentes en Supabase/PostgreSQL sin alterar el esquema.
Django usa estos modelos solo para ORM y DRF; las migraciones no recrean tablas.
"""

import uuid

from django.db import models


class Contribuyente(models.Model):
    ruc = models.CharField(max_length=11, primary_key=True)
    id = models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True)
    razon_social = models.TextField()
    estado = models.CharField(max_length=20, default="ACTIVO")
    otros = models.TextField(blank=True, default="")
    fecha_vencimiento_declaracion = models.DateField(null=True, blank=True)

    cat1ra = models.BooleanField(default=False)
    cat2da = models.BooleanField(default=False)
    cat3ra = models.BooleanField(default=False)
    cat4ta_retenciones = models.BooleanField(default=False)
    cat4ta_cta_propia = models.BooleanField(default=False)
    cat5ta = models.BooleanField(default=False)

    clave_sol = models.JSONField(default=dict)
    afp_net = models.JSONField(default=dict)
    validez_cpe = models.JSONField(default=dict)
    claves_sire = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "contribuyentes"
        verbose_name = "Contribuyente"
        verbose_name_plural = "Contribuyentes"


class FichaRuc(models.Model):
    """
    public.fichas_ruc: Mapeo exacto de las columnas planas de la SUNAT en Supabase.
    Sin campo 'payload'. Alineado al 100% con la estructura fisica del ERP.
    """

    ruc = models.CharField(max_length=11, primary_key=True)
    razon_social = models.TextField()
    nombre_comercial = models.TextField(null=True, blank=True)
    tipo_contribuyente = models.CharField(max_length=100, null=True, blank=True)
    fecha_inscripcion = models.DateField(null=True, blank=True)
    fecha_inicio_actividades = models.DateField(null=True, blank=True)
    estado_contribuyente = models.CharField(max_length=50, null=True, blank=True)
    condicion_domicilio_fiscal = models.CharField(max_length=50, null=True, blank=True)
    dependencia_sunat = models.CharField(max_length=100, null=True, blank=True)
    emisor_electronico_desde = models.CharField(max_length=100, null=True, blank=True)
    fecha_baja = models.DateField(null=True, blank=True)
    comprobantes_electronicos = models.TextField(null=True, blank=True)
    tipo_representacion = models.CharField(max_length=100, null=True, blank=True)
    actividad_economica_principal = models.TextField(null=True, blank=True)
    actividad_economica_secundaria1 = models.TextField(null=True, blank=True)
    actividad_economica_secundaria2 = models.TextField(null=True, blank=True)
    sistema_emision_comprobantes = models.CharField(max_length=100, null=True, blank=True)
    sistema_contabilidad = models.CharField(max_length=100, null=True, blank=True)
    codigo_profesion_oficio = models.CharField(max_length=50, null=True, blank=True)
    actividad_comercio_exterior = models.CharField(max_length=100, null=True, blank=True)
    numero_fax = models.CharField(max_length=50, null=True, blank=True)
    telefono_fijo1 = models.CharField(max_length=50, null=True, blank=True)
    telefono_fijo2 = models.CharField(max_length=50, null=True, blank=True)
    telefono_movil1 = models.CharField(max_length=50, null=True, blank=True)
    telefono_movil2 = models.CharField(max_length=50, null=True, blank=True)
    correo_electronico1 = models.CharField(max_length=100, null=True, blank=True)
    correo_electronico2 = models.CharField(max_length=100, null=True, blank=True)
    actividad_economica = models.TextField(null=True, blank=True)
    departamento = models.CharField(max_length=100, null=True, blank=True)
    provincia = models.CharField(max_length=100, null=True, blank=True)
    distrito = models.CharField(max_length=100, null=True, blank=True)
    ubigeo = models.CharField(max_length=6, null=True, blank=True)
    tipo_zona = models.CharField(max_length=50, null=True, blank=True)
    nombre_zona = models.CharField(max_length=200, null=True, blank=True)
    tipo_via = models.CharField(max_length=50, null=True, blank=True)
    nombre_via = models.CharField(max_length=200, null=True, blank=True)
    numero = models.CharField(max_length=20, null=True, blank=True)
    km = models.CharField(max_length=20, null=True, blank=True)
    manzana = models.CharField(max_length=20, null=True, blank=True)
    lote = models.CharField(max_length=20, null=True, blank=True)
    departamento_interno = models.CharField(max_length=50, null=True, blank=True)
    interior = models.CharField(max_length=50, null=True, blank=True)
    otras_referencias = models.TextField(null=True, blank=True)
    condicion_inmueble = models.CharField(max_length=100, null=True, blank=True)
    licencia_municipal = models.CharField(max_length=100, null=True, blank=True)
    documento_identidad = models.CharField(max_length=20, null=True, blank=True)
    sexo = models.CharField(max_length=20, null=True, blank=True)
    nacionalidad = models.CharField(max_length=50, null=True, blank=True)
    cond_domiciliado = models.CharField(max_length=50, null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    pasaporte = models.CharField(max_length=50, null=True, blank=True)
    pais_procedencia = models.CharField(max_length=100, null=True, blank=True)
    fecha_inscripcion_rrpp = models.DateField(null=True, blank=True)
    tomo_ficha_folio_asiento = models.CharField(max_length=100, null=True, blank=True)
    pais_origen_capital = models.CharField(max_length=100, null=True, blank=True)
    numero_partida_registral = models.CharField(max_length=100, null=True, blank=True)
    origen_capital = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    sync_user_id = models.UUIDField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "fichas_ruc"
        verbose_name = "Ficha RUC"
        verbose_name_plural = "Fichas RUC"


class PlanContablePcge(models.Model):
    codigo_cuenta = models.CharField(max_length=10, primary_key=True)
    id = models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True)
    nombre_cuenta = models.TextField()
    tipo_cuenta = models.CharField(max_length=50, null=True, blank=True)
    nivel = models.SmallIntegerField(default=1)
    naturaleza = models.CharField(max_length=20, null=True, blank=True)
    aplica_para = models.CharField(max_length=100, null=True, blank=True)
    palabras_clave = models.TextField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "plan_contable_pcge"
        verbose_name = "Cuenta PCGE"
        verbose_name_plural = "Plan de Cuentas PCGE"


class RegistroSire(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    tipo = models.CharField(max_length=10)
    periodo = models.CharField(max_length=6, db_index=True)
    ruc = models.CharField(max_length=11, db_index=True)
    razon_social = models.TextField()

    car_sunat = models.CharField(max_length=50, null=True, blank=True)
    fecha_emision = models.DateField()
    fecha_vencimiento = models.DateField(null=True, blank=True)
    cod_tipo_cdp = models.CharField(max_length=2)
    serie_cdp = models.CharField(max_length=20, null=True, blank=True)
    anio_dam_dsi = models.CharField(max_length=4, null=True, blank=True)
    nro_cdp_inicial = models.CharField(max_length=20)
    nro_cdp_final = models.CharField(max_length=20, null=True, blank=True)

    tipo_doc_contraparte = models.CharField(max_length=2, null=True, blank=True)
    nro_doc_contraparte = models.CharField(max_length=20, null=True, blank=True)
    nombre_contraparte = models.TextField(null=True, blank=True)

    bi_grav = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    igv_grav = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    bi_grav_y_no_grav = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    igv_grav_y_no_grav = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    bi_no_grav = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    igv_no_grav = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    valor_no_grav = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    mto_bi_gravada = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    mto_igv_ipe = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    mto_total_cp = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    isc = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    icbper = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    otros_tributos = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    importe_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    cod_moneda = models.CharField(max_length=3, default="PEN")
    tipo_cambio = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)

    fecha_emision_mod = models.DateField(null=True, blank=True)
    tipo_cdp_mod = models.CharField(max_length=2, null=True, blank=True)
    serie_cdp_mod = models.CharField(max_length=20, null=True, blank=True)
    cod_dam_dsi = models.CharField(max_length=50, null=True, blank=True)
    nro_cdp_mod = models.CharField(max_length=20, null=True, blank=True)

    clasificacion_bienes_serv = models.CharField(max_length=100, null=True, blank=True)
    id_proyecto_operadores = models.CharField(max_length=100, null=True, blank=True)
    impuesto_beneficio = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    pct_participacion = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    car_orig_indicador = models.CharField(max_length=50, null=True, blank=True)

    cuenta_pcge = models.CharField(max_length=10, null=True, blank=True)
    descripcion_items = models.TextField(null=True, blank=True)
    finalidad_operativa = models.CharField(max_length=100, null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)

    estado_validacion = models.CharField(max_length=20, null=True, blank=True, default="pendiente")
    estado_cobro = models.CharField(max_length=20, default="pendiente")
    estado_pago = models.CharField(max_length=20, default="pendiente")

    campos_38_41 = models.JSONField(null=True, blank=True)
    campos_libres = models.JSONField(null=True, blank=True)
    tipo_venta_config = models.JSONField(null=True, blank=True)

    cancelacion_asiento_id = models.UUIDField(null=True, blank=True)
    cancelacion_generada_at = models.DateTimeField(null=True, blank=True)
    cancelacion_mov_caja_id = models.UUIDField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "registros_sire"
        verbose_name = "Registro SIRE"
        verbose_name_plural = "Registros SIRE"

class AsientoContable(models.Model):
    """
    public.asientos_contables — modelo plano (una fila = una linea contable).
    Columnas verificadas en Supabase.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sire_registro_id = models.UUIDField(null=True, blank=True, db_column="sire_registro_id")
    fecha_asiento = models.DateField()
    periodo = models.CharField(max_length=6)
    cuenta_contable = models.CharField(max_length=20)
    glosa = models.TextField(null=True, blank=True)
    debe = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    haber = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    tipo_asiento = models.TextField()
    naturaleza = models.CharField(max_length=20, null=True, blank=True)
    tipo_registro = models.CharField(max_length=50, null=True, blank=True)
    serie_cdp = models.CharField(max_length=20, null=True, blank=True)
    nro_cdp_inicial = models.CharField(max_length=20, null=True, blank=True)
    ruc_contraparte = models.CharField(max_length=11, null=True, blank=True)
    nombre_contraparte = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "asientos_contables"


class MovimientoCaja(models.Model):
    """
    public.movimientos_caja — libro auxiliar.
    asiento_id referencia el UUID de lote centralizado en asientos_contables.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    periodo = models.CharField(max_length=6)
    fecha = models.DateField()
    correlativo = models.CharField(max_length=50, null=True, blank=True)
    glosa = models.TextField()
    cuenta_contable = models.CharField(max_length=20)
    debe = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    haber = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    registro_sire_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    ruc = models.CharField(max_length=11, null=True, blank=True)
    fecha_operacion = models.DateField(null=True, blank=True)
    origen = models.CharField(max_length=50, null=True, blank=True)
    asiento_id = models.UUIDField(null=True, blank=True, db_index=True)
    origen_documento = models.TextField(default="manual")
    numero_documento = models.CharField(max_length=50, null=True, blank=True)
    ruc_contribuyente = models.CharField(max_length=11, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    tipo_movimiento = models.CharField(max_length=20, default="ingreso")

    class Meta:
        managed = False
        db_table = "movimientos_caja"


class RegistrosSireCabecera(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tipo = models.CharField(max_length=10)
    ruc = models.CharField(max_length=11, db_index=True)
    razon_social = models.TextField()
    periodo = models.CharField(max_length=6, db_index=True)
    car_sunat = models.CharField(max_length=40, null=True, blank=True)
    fecha_emision = models.DateField()
    fecha_vencimiento = models.DateField(null=True, blank=True)
    cod_tipo_cdp = models.CharField(max_length=2)
    serie_cdp = models.CharField(max_length=20, null=True, blank=True)
    anio_dam_dsi = models.CharField(max_length=4, null=True, blank=True)
    nro_cdp_inicial = models.CharField(max_length=20)
    nro_cdp_final = models.CharField(max_length=20, null=True, blank=True)
    tipo_doc_contraparte = models.CharField(max_length=2, null=True, blank=True)
    nro_doc_contraparte = models.CharField(max_length=20, null=True, blank=True)
    nombre_contraparte = models.TextField(null=True, blank=True)
    cod_moneda = models.CharField(max_length=3, default="PEN")
    tipo_cambio = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    estado_validacion = models.CharField(max_length=20, default="pendiente")
    estado_cobro = models.CharField(max_length=20, default="pendiente")
    estado_pago = models.CharField(max_length=20, default="pendiente")
    cuenta_pcge = models.CharField(max_length=10, null=True, blank=True)
    finalidad_operativa = models.TextField(null=True, blank=True)
    descripcion_items = models.TextField(null=True, blank=True)
    cancelacion_asiento_id = models.UUIDField(null=True, blank=True)
    cancelacion_mov_caja_id = models.UUIDField(null=True, blank=True)
    cancelacion_generada_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "registros_sire_cabecera"


class RegistrosSireMontos(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registro_sire_id = models.UUIDField(db_index=True)
    bi_grav = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    igv_grav = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    bi_grav_y_no_grav = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    igv_grav_y_no_grav = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    bi_no_grav = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    igv_no_grav = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    valor_no_grav = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    isc = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    icbper = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    otros_tributos = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    importe_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    mto_bi_gravada = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    mto_igv_ipe = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    mto_total_cp = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "registros_sire_montos"


class RegistrosSireModificaciones(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registro_sire_id = models.UUIDField(db_index=True)
    fecha_emision_mod = models.DateField(null=True, blank=True)
    tipo_cdp_mod = models.CharField(max_length=2, null=True, blank=True)
    serie_cdp_mod = models.CharField(max_length=20, null=True, blank=True)
    cod_dam_dsi = models.CharField(max_length=20, null=True, blank=True)
    nro_cdp_mod = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "registros_sire_modificaciones"


class RegistrosSireAdicionales(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registro_sire_id = models.UUIDField(db_index=True)
    clasificacion_bienes_serv = models.CharField(max_length=10, null=True, blank=True)
    id_proyecto_operadores = models.CharField(max_length=40, null=True, blank=True)
    pct_participacion = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    impuesto_beneficio = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    car_orig_indicador = models.CharField(max_length=40, null=True, blank=True)
    campos_38_41 = models.JSONField(null=True, blank=True)
    campos_libres = models.JSONField(null=True, blank=True)
    tipo_venta_config = models.JSONField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "registros_sire_adicionales"


class TributosAfectos(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ruc = models.CharField(max_length=11, db_index=True)
    orden = models.IntegerField(default=0)
    codigo = models.CharField(max_length=20, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "tributos_afectos"


class RepresentantesLegales(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ruc = models.CharField(max_length=11, db_index=True)
    orden = models.IntegerField(default=0)
    nombre = models.TextField(null=True, blank=True)
    documento = models.CharField(max_length=20, null=True, blank=True)
    cargo = models.TextField(null=True, blank=True)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "representantes_legales"


class OtrasPersonasVinculadas(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ruc = models.CharField(max_length=11, db_index=True)
    orden = models.IntegerField(default=0)
    nombre = models.TextField(null=True, blank=True)
    documento = models.CharField(max_length=20, null=True, blank=True)
    vinculo = models.TextField(null=True, blank=True)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "otras_personas_vinculadas"


class EstablecimientosAnexos(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ruc = models.CharField(max_length=11, db_index=True)
    orden = models.IntegerField(default=0)
    codigo = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.TextField(null=True, blank=True)
    ubigeo = models.CharField(max_length=6, null=True, blank=True)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "establecimientos_anexos"


class AuditoriaCambios(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tabla_nombre = models.TextField()
    registro_id = models.TextField()
    operacion = models.CharField(max_length=10)
    datos_anteriores = models.JSONField(null=True, blank=True)
    datos_nuevos = models.JSONField(null=True, blank=True)
    usuario_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "auditoria_cambios"
