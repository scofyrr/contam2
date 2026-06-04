from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ContribuyenteViewSet,
    EstadisticasAPIView,
    FichaRucDetailAPIView,
    FichaRucListCreateAPIView,
    PlanContablePcgeViewSet,
    RegistroSireViewSet,
)

router = DefaultRouter()
router.register(r"contribuyentes", ContribuyenteViewSet, basename="contribuyente")
router.register(r"plan-contable-pcge", PlanContablePcgeViewSet, basename="plan-contable-pcge")
router.register(r"registros-sire", RegistroSireViewSet, basename="registro-sire")

urlpatterns = [
    path("fichas-ruc/", FichaRucListCreateAPIView.as_view(), name="fichas-ruc-list"),
    path("fichas-ruc/<str:ruc>/", FichaRucDetailAPIView.as_view(), name="fichas-ruc-detail"),
    path("estadisticas/", EstadisticasAPIView.as_view(), name="estadisticas"),
    *router.urls,
]
