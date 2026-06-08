"""
Centralización Libro Caja → Libro Diario (referencia única por lote).

Agrupa movimientos sin asiento_id por cuenta_contable, inserta líneas tipo CAJA
y vincula todos los movimientos al UUID de la primera línea insertada.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import date
from decimal import Decimal
from typing import Any
from uuid import UUID

from django.db import transaction
from django.utils import timezone

from api.models import AsientoContable, MovimientoCaja
from api.services.cuenta_contable import normalize_cuenta_contable

GLOSA_CENTRALIZACION_PREFIX = "Centralización libro caja"


def _round2(value: Decimal | float | int) -> Decimal:
    return Decimal(str(round(float(value), 2)))


def centralizar_periodo_caja(ruc: str, periodo: str) -> dict[str, Any]:
    ruc = "".join(c for c in (ruc or "") if c.isdigit())[:11]
    periodo = (periodo or "").strip()
    if len(ruc) != 11:
        raise ValueError("RUC inválido.")
    if len(periodo) != 6:
        raise ValueError("Periodo inválido (use AAAAMM).")

    movimientos = list(
        MovimientoCaja.objects.filter(
            ruc=ruc,
            periodo=periodo,
            asiento_id__isnull=True,
        ).order_by("fecha_operacion", "fecha", "id")
    )
    if not movimientos:
        raise ValueError("No hay movimientos pendientes de centralizar en este periodo.")

    por_cuenta: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"debe": Decimal("0"), "haber": Decimal("0"), "fecha": date.min}
    )

    for mov in movimientos:
        cuenta = normalize_cuenta_contable(mov.cuenta_contable)
        if not cuenta:
            raise ValueError(f"Movimiento {mov.id} sin cuenta_contable válida.")
        fecha = mov.fecha_operacion or mov.fecha or date.today()
        agg = por_cuenta[cuenta]
        agg["debe"] += mov.debe or Decimal("0")
        agg["haber"] += mov.haber or Decimal("0")
        if fecha > agg["fecha"]:
            agg["fecha"] = fecha

    fecha_asiento = max((a["fecha"] for a in por_cuenta.values()), default=date.today())
    glosa = f"{GLOSA_CENTRALIZACION_PREFIX} {periodo}"
    now = timezone.now()

    filas: list[AsientoContable] = []
    for cuenta, agg in por_cuenta.items():
        debe = _round2(agg["debe"])
        haber = _round2(agg["haber"])
        filas.append(
            AsientoContable(
                sire_registro_id=None,
                fecha_asiento=fecha_asiento,
                periodo=periodo,
                cuenta_contable=cuenta,
                glosa=glosa,
                debe=debe,
                haber=haber,
                tipo_asiento="CAJA",
                naturaleza="debe" if debe > 0 else "haber",
                tipo_registro="CAJA",
                serie_cdp=None,
                nro_cdp_inicial=None,
                ruc_contraparte=ruc,
                nombre_contraparte=None,
                created_at=now,
            )
        )

    total_debe = sum((f.debe or Decimal("0") for f in filas), Decimal("0"))
    total_haber = sum((f.haber or Decimal("0") for f in filas), Decimal("0"))
    if abs(total_debe - total_haber) > Decimal("0.01"):
        raise ValueError(
            f"Centralización descuadrada: Debe {total_debe} ≠ Haber {total_haber}."
        )

    mov_ids = [m.id for m in movimientos]

    with transaction.atomic():
        creados = AsientoContable.objects.bulk_create(filas)
        referencia_lote_id: UUID = creados[0].id
        MovimientoCaja.objects.filter(id__in=mov_ids).update(asiento_id=referencia_lote_id)

    return {
        "asiento_referencia_id": str(referencia_lote_id),
        "movimientos_vinculados": len(mov_ids),
        "lineas_diario": len(creados),
        "periodo": periodo,
        "ruc": ruc,
    }
