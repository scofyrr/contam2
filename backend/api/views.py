import logging

from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from .models import Contribuyente, FichaRuc, PlanContablePcge, RegistroSire
from .serializers import (
    CentralizarCajaSerializer,
    ContribuyenteSerializer,
    EstadisticasQuerySerializer,
    FichaRucSerializer,
    FichaRucUpsertSerializer,
    PlanContablePcgeSerializer,
    RegistroSireSerializer,
)
from .services.estadisticas import (
    compute_kpis,
    compute_kpis_by_ruc,
    filtrar_registros,
)
from .services.centralizacion_caja import centralizar_periodo_caja
from .services.ficha_ruc_mapper import (
    apply_row_to_ficha,
    normalize_ficha_input,
    payload_from_ficha,
    sync_child_tables_optional,
)

logger = logging.getLogger(__name__)


def _error_response(message: str, *, status_code: int, detail: str | None = None):
    body = {"error": message, "detail": detail or message}
    return Response(body, status=status_code)


def _normalize_ruc(value: str) -> str:
    return "".join(c for c in (value or "") if c.isdigit())[:11]


def _load_ficha_children(ruc: str):
    try:
        from api.models import (
            EstablecimientoAnexo,
            OtraPersonaVinculada,
            RepresentanteLegal,
            TributoAfecto,
        )

        return (
            list(TributoAfecto.objects.filter(ruc=ruc).order_by("orden", "id")),
            list(RepresentanteLegal.objects.filter(ruc=ruc).order_by("orden", "id")),
            list(OtraPersonaVinculada.objects.filter(ruc=ruc).order_by("orden", "id")),
            list(EstablecimientoAnexo.objects.filter(ruc=ruc).order_by("orden", "id")),
        )
    except Exception:
        return [], [], [], []


def _ficha_api_body(ruc: str) -> dict:
    clean = _normalize_ruc(ruc)
    ficha = get_object_or_404(FichaRuc, ruc=clean)
    tributos, representantes, personas, establecimientos = _load_ficha_children(clean)
    payload = payload_from_ficha(
        ficha,
        tributos=tributos,
        representantes=representantes,
        personas=personas,
        establecimientos=establecimientos,
    )
    return {
        "ruc": clean,
        "payload": payload,
        "ficha": FichaRucSerializer(ficha).data,
        "updated_at": ficha.updated_at,
    }


def _save_ficha_from_source(data: dict) -> FichaRuc:
    row = normalize_ficha_input(data)
    ruc = _normalize_ruc(str(row.get("ruc", "")))
    if len(ruc) != 11:
        raise ValueError("RUC invalido: debe tener 11 digitos")

    # Sanitizacion estricta de fechas SUNAT: "" / "null" -> None (NULL en PostgreSQL)
    sunat_date_fields = [
        "fecha_inscripcion",
        "fecha_inicio_actividades",
        "fecha_baja",
        "fecha_nacimiento",
        "fecha_inscripcion_rrpp",
        "emisor_electronico_desde",
    ]
    for field in sunat_date_fields:
        if field not in row:
            continue
        val = row[field]
        if val is None:
            row[field] = None
        elif isinstance(val, str) and (not val.strip() or val.strip().lower() == "null"):
            row[field] = None

    now = timezone.now()
    ficha, _created = FichaRuc.objects.get_or_create(ruc=ruc)
    apply_row_to_ficha(ficha, row)
    if not ficha.created_at:
        ficha.created_at = now
    ficha.updated_at = now
    ficha.last_sync_at = now
    ficha.save()

    source = {**data, "ruc": ruc}
    sync_child_tables_optional(ruc, source)
    return ficha


class ContribuyenteViewSet(ModelViewSet):
    queryset = Contribuyente.objects.all().order_by("razon_social")
    serializer_class = ContribuyenteSerializer
    lookup_field = "ruc"
    lookup_value_regex = r"\d{11}"


class PlanContablePcgeViewSet(ModelViewSet):
    queryset = PlanContablePcge.objects.filter(activo=True).order_by("codigo_cuenta")
    serializer_class = PlanContablePcgeSerializer
    lookup_field = "codigo_cuenta"
    lookup_value_regex = r"[\w\d]+"


class RegistroSireViewSet(ReadOnlyModelViewSet):
    queryset = RegistroSire.objects.all().order_by("-periodo", "-fecha_emision")
    serializer_class = RegistroSireSerializer
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        periodo = self.request.query_params.get("periodo")
        ruc = self.request.query_params.get("ruc")
        tipo = self.request.query_params.get("tipo")
        if periodo:
            qs = qs.filter(periodo=periodo)
        if ruc:
            qs = qs.filter(ruc__icontains=ruc.strip())
        if tipo:
            qs = qs.filter(tipo=tipo.upper())
        return qs


class FichaRucListCreateAPIView(APIView):
    def get(self, request):
        ruc = request.query_params.get("ruc", "").strip()
        qs = FichaRuc.objects.all().order_by("ruc")
        if ruc:
            qs = qs.filter(ruc__icontains=ruc)
        items = []
        for f in qs:
            tributos, representantes, personas, establecimientos = _load_ficha_children(f.ruc)
            payload = payload_from_ficha(
                f,
                tributos=tributos,
                representantes=representantes,
                personas=personas,
                establecimientos=establecimientos,
            )
            items.append(
                {
                    "ruc": f.ruc,
                    "payload": payload,
                    "ficha": FichaRucSerializer(f).data,
                    "updated_at": f.updated_at,
                }
            )
        return Response(items)

    def post(self, request):
        serializer = FichaRucUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        source = serializer.validated_data["source"]
        try:
            with transaction.atomic():
                ficha = _save_ficha_from_source(source)
        except IntegrityError as exc:
            logger.exception("Error creando ficha RUC")
            return _error_response(
                "No se pudo crear la ficha RUC (conflicto o restriccion de BD).",
                status_code=status.HTTP_409_CONFLICT,
                detail=str(exc),
            )
        return Response(_ficha_api_body(ficha.ruc), status=status.HTTP_201_CREATED)


class FichaRucDetailAPIView(APIView):
    def get(self, request, ruc: str):
        return Response(_ficha_api_body(ruc))

    def patch(self, request, ruc: str):
        serializer = FichaRucUpsertSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        source = serializer.validated_data.get("source")
        if source is None:
            return _error_response(
                "Envie 'payload' (UI SUNAT) o campos planos para actualizar la ficha.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        source["ruc"] = _normalize_ruc(ruc)
        try:
            with transaction.atomic():
                _save_ficha_from_source(source)
        except IntegrityError as exc:
            logger.exception("IntegrityError actualizando ficha RUC %s", ruc)
            return _error_response(
                "La base de datos rechazó la actualización (restricción o datos inválidos).",
                status_code=status.HTTP_409_CONFLICT,
                detail=str(exc),
            )
        except Exception as exc:
            logger.exception("Error inesperado actualizando ficha RUC %s", ruc)
            return _error_response(
                "Error al guardar la ficha RUC en PostgreSQL.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(exc),
            )
        return Response(_ficha_api_body(ruc))

    def delete(self, request, ruc: str):
        clean = _normalize_ruc(ruc)
        try:
            with transaction.atomic():
                FichaRuc.objects.filter(ruc=clean).delete()
        except Exception as exc:
            logger.exception("Error eliminando ficha RUC %s", ruc)
            return _error_response(
                "No se pudo eliminar la ficha.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(exc),
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class EstadisticasAPIView(APIView):
    def get(self, request):
        query = EstadisticasQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        data = query.validated_data

        desde = data.get("desde_periodo")
        hasta = data.get("hasta_periodo")
        ruc = data.get("ruc")
        modo = data.get("modo") or ("individual" if ruc else "total")

        qs = filtrar_registros(
            RegistroSire.objects.all(),
            desde_periodo=desde,
            hasta_periodo=hasta,
            ruc=ruc,
        )
        rows = list(qs)

        periodo_label = None
        if desde and hasta:
            periodo_label = f"{desde}-{hasta}"
        elif desde:
            periodo_label = f"desde {desde}"
        elif hasta:
            periodo_label = f"hasta {hasta}"

        kpis = compute_kpis(rows, periodo_label)
        body = {
            "modo": modo,
            "filtros": {
                "desde_periodo": desde,
                "hasta_periodo": hasta,
                "ruc": ruc,
            },
            "kpis": kpis,
        }

        if modo == "individual":
            body["por_entidad"] = compute_kpis_by_ruc(rows, periodo_label)

        return Response(body)


class HealthAPIView(APIView):
    """GET: health check para Render."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "contam-django"})


class CentralizarCajaAPIView(APIView):
    """POST: centraliza movimientos de caja pendientes hacia asientos_contables (lote único)."""

    def post(self, request):
        serializer = CentralizarCajaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ruc = serializer.validated_data["ruc"]
        periodo = serializer.validated_data["periodo"]
        try:
            result = centralizar_periodo_caja(ruc, periodo)
        except ValueError as exc:
            return _error_response(str(exc), status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            logger.exception("Error centralizando caja RUC=%s periodo=%s", ruc, periodo)
            return _error_response(
                "No se pudo centralizar el periodo.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(exc),
            )
        return Response(result, status=status.HTTP_201_CREATED)
