from decimal import Decimal

from rest_framework import serializers

from .models import (
    AsientoContable,
    Contribuyente,
    FichaRuc,
    MovimientoCaja,
    PlanContablePcge,
    RegistroSire,
)
from .services.cuenta_contable import normalize_cuenta_contable
from .services.ficha_ruc_mapper import sanitize_ficha_source_data


class ContribuyenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribuyente
        fields = [
            "id",
            "ruc",
            "razon_social",
            "estado",
            "otros",
            "fecha_vencimiento_declaracion",
            "cat1ra",
            "cat2da",
            "cat3ra",
            "cat4ta_retenciones",
            "cat4ta_cta_propia",
            "cat5ta",
            "clave_sol",
            "afp_net",
            "validez_cpe",
            "claves_sire",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FichaRucSerializer(serializers.ModelSerializer):
    """Serializacion de columnas planas public.fichas_ruc."""

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = sanitize_ficha_source_data(dict(data))
        return super().to_internal_value(data)

    class Meta:
        model = FichaRuc
        fields = [
            "ruc",
            "razon_social",
            "nombre_comercial",
            "tipo_contribuyente",
            "fecha_inscripcion",
            "fecha_inicio_actividades",
            "estado_contribuyente",
            "condicion_domicilio_fiscal",
            "dependencia_sunat",
            "emisor_electronico_desde",
            "fecha_baja",
            "comprobantes_electronicos",
            "tipo_representacion",
            "actividad_economica_principal",
            "actividad_economica_secundaria1",
            "actividad_economica_secundaria2",
            "sistema_emision_comprobantes",
            "sistema_contabilidad",
            "codigo_profesion_oficio",
            "actividad_comercio_exterior",
            "numero_fax",
            "telefono_fijo1",
            "telefono_fijo2",
            "telefono_movil1",
            "telefono_movil2",
            "correo_electronico1",
            "correo_electronico2",
            "actividad_economica",
            "departamento",
            "provincia",
            "distrito",
            "ubigeo",
            "tipo_zona",
            "nombre_zona",
            "tipo_via",
            "nombre_via",
            "numero",
            "km",
            "manzana",
            "lote",
            "departamento_interno",
            "interior",
            "otras_referencias",
            "condicion_inmueble",
            "licencia_municipal",
            "documento_identidad",
            "sexo",
            "nacionalidad",
            "cond_domiciliado",
            "fecha_nacimiento",
            "pasaporte",
            "pais_procedencia",
            "fecha_inscripcion_rrpp",
            "tomo_ficha_folio_asiento",
            "pais_origen_capital",
            "numero_partida_registral",
            "origen_capital",
            "created_at",
            "updated_at",
            "last_sync_at",
            "sync_user_id",
        ]
        read_only_fields = ["ruc", "created_at", "updated_at", "last_sync_at"]


class FichaRucUpsertSerializer(serializers.Serializer):
    """
    Entrada POST/PATCH: acepta `payload` anidado (frontend/scraper UI)
    o campos planos snake_case alineados a fichas_ruc.
    """

    payload = serializers.JSONField(required=False)

    def validate(self, attrs):
        raw = self.initial_data
        if not isinstance(raw, dict):
            raise serializers.ValidationError("Cuerpo JSON invalido.")
        if attrs.get("payload") is not None:
            if not isinstance(attrs["payload"], dict):
                raise serializers.ValidationError({"payload": "Debe ser un objeto JSON."})
            attrs["source"] = attrs["payload"]
        elif raw.get("ruc"):
            attrs["source"] = raw
        else:
            raise serializers.ValidationError(
                "Envie 'payload' (UI SUNAT) o campos planos con 'ruc'."
            )
        attrs["source"] = sanitize_ficha_source_data(attrs["source"])
        return attrs


class PlanContablePcgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanContablePcge
        fields = [
            "id",
            "codigo_cuenta",
            "nombre_cuenta",
            "tipo_cuenta",
            "nivel",
            "naturaleza",
            "aplica_para",
            "palabras_clave",
            "activo",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "tipo_cuenta": {"required": False, "allow_null": True},
            "naturaleza": {"required": False, "allow_null": True},
            "aplica_para": {"required": False, "allow_null": True},
            "palabras_clave": {"required": False, "allow_null": True},
        }


class RegistroSireSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroSire
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class AsientoContableSerializer(serializers.ModelSerializer):
    cuenta_contable = serializers.CharField()

    class Meta:
        model = AsientoContable
        fields = [
            "id",
            "sire_registro_id",
            "fecha_asiento",
            "periodo",
            "cuenta_contable",
            "glosa",
            "debe",
            "haber",
            "tipo_asiento",
            "naturaleza",
            "tipo_registro",
            "serie_cdp",
            "nro_cdp_inicial",
            "ruc_contraparte",
            "nombre_contraparte",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_cuenta_contable(self, value):
        clean = normalize_cuenta_contable(value)
        if not clean:
            raise serializers.ValidationError("Cuenta contable inválida.")
        return clean


class MovimientoCajaSerializer(serializers.ModelSerializer):
    cuenta_contable = serializers.CharField()

    class Meta:
        model = MovimientoCaja
        fields = [
            "id",
            "periodo",
            "fecha",
            "correlativo",
            "glosa",
            "cuenta_contable",
            "debe",
            "haber",
            "registro_sire_id",
            "created_at",
            "ruc",
            "fecha_operacion",
            "origen",
            "asiento_id",
        ]
        read_only_fields = ["id", "created_at", "correlativo"]

    def validate_cuenta_contable(self, value):
        clean = normalize_cuenta_contable(value)
        if not clean:
            raise serializers.ValidationError("Cuenta contable inválida.")
        return clean


class CentralizarCajaSerializer(serializers.Serializer):
    ruc = serializers.CharField(max_length=11)
    periodo = serializers.CharField(max_length=6)

    def validate_ruc(self, value):
        clean = "".join(c for c in (value or "") if c.isdigit())[:11]
        if len(clean) != 11:
            raise serializers.ValidationError("RUC debe tener 11 dígitos.")
        return clean

    def validate_periodo(self, value):
        clean = (value or "").strip()
        if len(clean) != 6 or not clean.isdigit():
            raise serializers.ValidationError("Periodo debe ser AAAAMM.")
        return clean


def _decimal_to_float(value):
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


class EstadisticasQuerySerializer(serializers.Serializer):
    desde_periodo = serializers.CharField(required=False, allow_blank=True, max_length=6)
    hasta_periodo = serializers.CharField(required=False, allow_blank=True, max_length=6)
    ruc = serializers.CharField(required=False, allow_blank=True, max_length=11)
    modo = serializers.ChoiceField(
        choices=["total", "individual"],
        required=False,
        default="total",
    )

    def validate_desde_periodo(self, value):
        clean = (value or "").strip()
        if clean and (len(clean) != 6 or not clean.isdigit()):
            raise serializers.ValidationError("Formato AAAAMM requerido.")
        return clean or None

    def validate_hasta_periodo(self, value):
        clean = (value or "").strip()
        if clean and (len(clean) != 6 or not clean.isdigit()):
            raise serializers.ValidationError("Formato AAAAMM requerido.")
        return clean or None

    def validate_ruc(self, value):
        clean = (value or "").replace(" ", "").strip()
        if clean and (len(clean) != 11 or not clean.isdigit()):
            raise serializers.ValidationError("RUC debe tener 11 dígitos.")
        return clean or None


class KpisSerializer(serializers.Serializer):
    periodo = serializers.CharField(allow_null=True)
    ventas_totales = serializers.FloatField()
    compras_totales = serializers.FloatField()
    utilidad_neta = serializers.FloatField()
    ratio_igv = serializers.FloatField()
    igv_ventas = serializers.FloatField()
    igv_compras = serializers.FloatField()
    count_ventas = serializers.IntegerField()
    count_compras = serializers.IntegerField()


class EntidadKpiSerializer(serializers.Serializer):
    ruc = serializers.CharField()
    razon_social = serializers.CharField()
    kpis = KpisSerializer()


class EstadisticasResponseSerializer(serializers.Serializer):
    modo = serializers.CharField()
    filtros = serializers.DictField()
    kpis = KpisSerializer()
    por_entidad = EntidadKpiSerializer(many=True, required=False)
