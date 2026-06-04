from decimal import Decimal

from rest_framework import serializers

from .models import Contribuyente, FichaRuc, PlanContablePcge, RegistroSire


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
    class Meta:
        model = FichaRuc
        fields = ["ruc", "payload", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class FichaRucUpdateSerializer(serializers.Serializer):
    """PATCH parcial: solo actualiza el JSON de la ficha."""

    payload = serializers.JSONField(required=True)

    def validate_payload(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("payload debe ser un objeto JSON.")
        return value


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
        read_only_fields = ["codigo_cuenta", "id", "created_at", "updated_at"]
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
