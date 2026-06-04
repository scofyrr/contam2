import logging

from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from .models import Contribuyente, FichaRuc, PlanContablePcge, RegistroSire
from .serializers import (
    ContribuyenteSerializer,
    EstadisticasQuerySerializer,
    FichaRucSerializer,
    FichaRucUpdateSerializer,
    PlanContablePcgeSerializer,
    RegistroSireSerializer,
)
from .services.estadisticas import (
    compute_kpis,
    compute_kpis_by_ruc,
    filtrar_registros,
)

logger = logging.getLogger(__name__)


def _error_response(message: str, *, status_code: int, detail: str | None = None):
    body = {"error": message, "detail": detail or message}
    return Response(body, status=status_code)


class ContribuyenteViewSet(ModelViewSet):
    queryset = Contribuyente.objects.all().order_by("razon_social")
    serializer_class = ContribuyenteSerializer
    lookup_field = "ruc"
    lookup_value_regex = r"\d{11}"


class PlanContablePcgeViewSet(ModelViewSet):
    queryset = PlanContablePcge.objects.filter(activo=True).order_by("codigo_cuenta")
    serializer_class = PlanContablePcgeSerializer
    lookup_field = "codigo_cuenta"


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
    """GET lista / POST crea ficha."""

    def get(self, request):
        ruc = request.query_params.get("ruc", "").strip()
        qs = FichaRuc.objects.all().order_by("ruc")
        if ruc:
            qs = qs.filter(ruc__icontains=ruc)
        serializer = FichaRucSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FichaRucSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                instance = serializer.save()
        except IntegrityError as exc:
            logger.exception("Error creando ficha RUC")
            return _error_response(
                "No se pudo crear la ficha RUC (conflicto o restricción de BD).",
                status_code=status.HTTP_409_CONFLICT,
                detail=str(exc),
            )
        return Response(FichaRucSerializer(instance).data, status=status.HTTP_201_CREATED)


class FichaRucDetailAPIView(APIView):
    """GET / PATCH / DELETE por RUC."""

    def get(self, request, ruc: str):
        ficha = get_object_or_404(FichaRuc, ruc=ruc.strip())
        return Response(FichaRucSerializer(ficha).data)

    def patch(self, request, ruc: str):
        """
        Persistencia estricta: transacción + save() real.
        Errores de constraint se devuelven explícitos a la UI.
        """
        ficha = get_object_or_404(FichaRuc, ruc=ruc.strip())
        serializer = FichaRucUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        payload = serializer.validated_data.get("payload")
        if payload is None:
            return _error_response(
                "Campo 'payload' requerido para actualizar la ficha.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                ficha.payload = payload
                ficha.save(update_fields=["payload", "updated_at"])
                ficha.refresh_from_db()
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

        return Response(FichaRucSerializer(ficha).data)

    def delete(self, request, ruc: str):
        ficha = get_object_or_404(FichaRuc, ruc=ruc.strip())
        try:
            with transaction.atomic():
                ficha.delete()
        except Exception as exc:
            logger.exception("Error eliminando ficha RUC %s", ruc)
            return _error_response(
                "No se pudo eliminar la ficha.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(exc),
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class EstadisticasAPIView(APIView):
    """
    GET /api/estadisticas/?desde_periodo=202401&hasta_periodo=202412&ruc=20123456789&modo=total|individual
    """

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
