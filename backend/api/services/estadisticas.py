"""
Lógica analítica SIRE — equivalente a src/lib/stats-service.ts (TypeScript).
"""

from collections import defaultdict
from decimal import Decimal

from django.db.models import QuerySet

from api.models import RegistroSire


def _round2(n: float) -> float:
    return round(n, 2)


def _base_of(row: RegistroSire) -> float:
    if row.bi_adq_grav is not None:
        return _round2(float(row.bi_adq_grav))
    return 0.0


def _igv_of(row: RegistroSire) -> float:
    if row.igv_adq_grav is not None:
        return _round2(float(row.igv_adq_grav))
    return 0.0


def filtrar_registros(
    qs: QuerySet[RegistroSire],
    *,
    desde_periodo: str | None = None,
    hasta_periodo: str | None = None,
    ruc: str | None = None,
) -> QuerySet[RegistroSire]:
    if desde_periodo:
        qs = qs.filter(periodo__gte=desde_periodo)
    if hasta_periodo:
        qs = qs.filter(periodo__lte=hasta_periodo)
    if ruc:
        qs = qs.filter(ruc__icontains=ruc)
    return qs


def compute_kpis(rows: list[RegistroSire], periodo_label: str | None = None) -> dict:
    ventas = [r for r in rows if r.tipo == "VENTA"]
    compras = [r for r in rows if r.tipo == "COMPRA"]

    ventas_totales = _round2(sum(_base_of(r) for r in ventas))
    compras_totales = _round2(sum(_base_of(r) for r in compras))
    igv_ventas = _round2(sum(_igv_of(r) for r in ventas))
    igv_compras = _round2(sum(_igv_of(r) for r in compras))

    return {
        "periodo": periodo_label,
        "ventas_totales": ventas_totales,
        "compras_totales": compras_totales,
        "utilidad_neta": _round2(ventas_totales - compras_totales),
        "ratio_igv": _round2(igv_ventas - igv_compras),
        "igv_ventas": igv_ventas,
        "igv_compras": igv_compras,
        "count_ventas": len(ventas),
        "count_compras": len(compras),
    }


def compute_kpis_by_ruc(rows: list[RegistroSire], periodo_label: str | None) -> list[dict]:
    buckets: dict[str, dict] = defaultdict(lambda: {"razon_social": "", "rows": []})

    for row in rows:
        key = (row.ruc or "").strip() or "SIN_RUC"
        label = (row.razon_social or row.nombre_contraparte or key).strip()
        buckets[key]["razon_social"] = label
        buckets[key]["rows"].append(row)

    result = []
    for ruc_key, data in buckets.items():
        result.append(
            {
                "ruc": ruc_key,
                "razon_social": data["razon_social"],
                "kpis": compute_kpis(data["rows"], periodo_label),
            }
        )

    result.sort(
        key=lambda x: x["kpis"]["ventas_totales"] + x["kpis"]["compras_totales"],
        reverse=True,
    )
    return result
