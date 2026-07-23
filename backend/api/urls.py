from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CentralizarCajaAPIView,
    ContribuyenteViewSet,
    EstadisticasAPIView,
    FichaRucDetailAPIView,
    FichaRucListCreateAPIView,
    HealthAPIView,
    PlanContablePcgeViewSet,
    RegistroSireViewSet,
)

router = DefaultRouter()
router.register(r"contribuyentes", ContribuyenteViewSet, basename="contribuyente")
router.register(r"plan-contable-pcge", PlanContablePcgeViewSet, basename="plan-contable-pcge")
router.register(r"registros-sire", RegistroSireViewSet, basename="registro-sire")

urlpatterns = [
    path("health/", HealthAPIView.as_view(), name="health"),
    path("fichas-ruc/", FichaRucListCreateAPIView.as_view(), name="fichas-ruc-list"),
    path("fichas-ruc/<str:ruc>/", FichaRucDetailAPIView.as_view(), name="fichas-ruc-detail"),
    path("estadisticas/", EstadisticasAPIView.as_view(), name="estadisticas"),
    path("caja/centralizar-periodo/", CentralizarCajaAPIView.as_view(), name="caja-centralizar"),
    *router.urls,
]
