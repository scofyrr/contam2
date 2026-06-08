"""Mapeo FichaRuc UI (JSON anidado) ↔ tablas normalizadas Supabase."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from api.models import FichaRuc


def _s(value: Any) -> str:
    return "" if value is None else str(value).strip()


def _date(value: Any) -> date | None:
    text = _s(value)
    if not text:
        return None
    return date.fromisoformat(text[:10])


def _bool(value: Any) -> bool | None:
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return value
    return str(value).lower() in ("1", "true", "si", "sí", "yes")


def _split_doc(combined: str) -> tuple[str, str]:
    text = _s(combined)
    if not text:
        return "", ""
    if " - " in text:
        a, b = text.split(" - ", 1)
        return a.strip(), b.strip()
    parts = text.split(None, 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return text, ""


def ficha_row_from_payload(data: dict[str, Any]) -> dict[str, Any]:
    """Dict de columnas para insert/update en fichas_ruc."""
    g = data.get("general") or {}
    m = data.get("modificacionContribuyente") or {}
    d = data.get("domicilioFiscal") or {}
    p = data.get("personaNatural") or {}
    e = data.get("empresa") or {}

    ruc = _s(data.get("ruc")).replace(" ", "")[:11]
    return {
        "ruc": ruc,
        "razon_social": _s(g.get("razonSocial")) or _s(data.get("razon_social")),
        "nombre_comercial": _s(m.get("nombreComercial")),
        "tipo_contribuyente": _s(g.get("tipoContribuyente")),
        "estado_contribuyente": _s(g.get("estadoContribuyente")),
        "condicion_domicilio_fiscal": _s(g.get("condicionDomicilioFiscal")),
        "dependencia_sunat": _s(g.get("dependenciaSunat")),
        "tipo_representacion": _s(m.get("tipoRepresentacion")),
        "fecha_inscripcion": _date(g.get("fechaInscripcion")),
        "fecha_inicio_actividades": _date(g.get("fechaInicioActividades")),
        "emisor_electronico_desde": _s(g.get("emisorElectronicoDesde")),
        "fecha_baja": _date(g.get("fechaBaja")),
        "comprobantes_electronicos": _s(g.get("comprobantesElectronicos")),
        "sistema_emision_comprobantes": _s(m.get("sistemaEmisionComprobantes")),
        "sistema_contabilidad": _s(m.get("sistemaContabilidad")),
        "actividad_comercio_exterior": _s(m.get("actividadComercioExterior")),
        "actividad_economica_principal": _s(m.get("actividadEconomicaPrincipal")),
        "actividad_economica_secundaria1": _s(m.get("actividadEconomicaSecundaria1")),
        "actividad_economica_secundaria2": _s(m.get("actividadEconomicaSecundaria2")),
        "actividad_economica": _s(d.get("actividadEconomica")),
        "condicion_inmueble": _s(d.get("condicionInmueble")),
        "licencia_municipal": _s(d.get("licenciaMunicipal")),
        "numero_partida_registral": _s(e.get("numeroPartidaRegistral")),
        "tomo_ficha_folio_asiento": _s(e.get("tomoFichaFolioAsiento")),
        "fecha_inscripcion_rrpp": _date(e.get("fechaInscripcionRrPp")),
        "fecha_nacimiento": _date(p.get("fechaNacimientoSucesion")),
        "sexo": _s(p.get("sexo")),
        "documento_identidad": _s(p.get("documentoIdentidad")),
        "nacionalidad": _s(p.get("nacionalidad")),
        "pais_procedencia": _s(p.get("paisProcedencia")),
        "pais_origen_capital": _s(e.get("paisOrigenCapital")),
        "origen_capital": _s(e.get("origenCapital")),
        "cond_domiciliado": _s(p.get("condDomiciliado")),
        "codigo_profesion_oficio": _s(m.get("codigoProfesionOficio")),
        "departamento": _s(d.get("departamento")),
        "provincia": _s(d.get("provincia")),
        "distrito": _s(d.get("distrito")),
        "ubigeo": _s(d.get("ubigeo")),
        "tipo_via": _s(d.get("tipoNombreVia")),
        "nombre_via": _s(d.get("nombreVia")),
        "numero": _s(d.get("numero") or d.get("nroKmMzLote")),
        "km": _s(d.get("km")),
        "manzana": _s(d.get("manzana")),
        "lote": _s(d.get("lote")),
        "departamento_interno": _s(d.get("departamentoInterno")),
        "interior": _s(d.get("interior")),
        "tipo_zona": _s(d.get("tipoNombreZona")),
        "nombre_zona": _s(d.get("nombreZona")),
        "otras_referencias": _s(d.get("otrasReferencias")),
        "numero_fax": _s(m.get("numeroFax")),
        "telefono_fijo1": _s(m.get("telefonoFijo1")),
        "telefono_fijo2": _s(m.get("telefonoFijo2")),
        "telefono_movil1": _s(m.get("telefonoMovil1")),
        "telefono_movil2": _s(m.get("telefonoMovil2")),
        "correo_electronico1": _s(m.get("correoElectronico1")),
        "correo_electronico2": _s(m.get("correoElectronico2")),
        "pasaporte": _s(p.get("pasaporte")),
    }


FICHA_SCALAR_FIELDS: tuple[str, ...] = (
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
)


def apply_row_to_ficha(ficha: FichaRuc, row: dict[str, Any]) -> None:
    """Asigna columna por columna en el modelo plano (sin JSON payload)."""
    clean = sanitize_ficha_row(row)
    for field in FICHA_SCALAR_FIELDS:
        if field in clean:
            setattr(ficha, field, clean[field])


FICHA_DATE_FIELDS = frozenset(
    {
        "fecha_inscripcion",
        "fecha_inicio_actividades",
        "fecha_baja",
        "fecha_nacimiento",
        "fecha_inscripcion_rrpp",
    }
)

NESTED_DATE_KEYS = frozenset(
    {
        "fechaInscripcion",
        "fechaInicioActividades",
        "fechaBaja",
        "fechaNacimientoSucesion",
        "fechaInscripcionRrPp",
        "fechaAlta",
        "afectoDesde",
        "exoneracionDesde",
        "hasta",
        "fechaDesde",
        "fechaNacimiento",
    }
)


def _coerce_date_value(value: Any) -> date | None:
    if value is None:
        return None
    if isinstance(value, str) and not value.strip():
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return _date(value)


def sanitize_ficha_row(row: dict[str, Any]) -> dict[str, Any]:
    """Convierte '' en None para columnas DateField antes de persistir."""
    out = dict(row)
    for field in FICHA_DATE_FIELDS:
        if field in out:
            out[field] = _coerce_date_value(out[field])
    return out


def sanitize_ficha_source_data(data: dict[str, Any]) -> dict[str, Any]:
    """Limpia fechas vacias en payload anidado (frontend/scraper) o fila plana."""
    if not isinstance(data, dict):
        return data

    out: dict[str, Any] = {}
    for key, val in data.items():
        if key in FICHA_DATE_FIELDS or key in NESTED_DATE_KEYS:
            out[key] = _coerce_date_value(val)
        elif isinstance(val, dict):
            out[key] = sanitize_ficha_source_data(val)
        elif isinstance(val, list):
            out[key] = [
                sanitize_ficha_source_data(item) if isinstance(item, dict) else item
                for item in val
            ]
        else:
            out[key] = val
    return out


def ficha_row_from_flat(data: dict[str, Any]) -> dict[str, Any]:
    """Acepta dict plano (scraper/API) con nombres snake_case de columnas."""
    ruc = _s(data.get("ruc")).replace(" ", "")[:11]
    row: dict[str, Any] = {"ruc": ruc}
    for field in FICHA_SCALAR_FIELDS:
        if field not in data:
            continue
        value = data[field]
        if field in FICHA_DATE_FIELDS:
            row[field] = _date(value) if not isinstance(value, date) else value
        elif value is None:
            row[field] = None
        elif isinstance(value, (date, datetime)):
            row[field] = value
        else:
            row[field] = _s(value)
    return row


def normalize_ficha_input(data: dict[str, Any]) -> dict[str, Any]:
    """UI anidada (payload frontend) o fila plana del scraper → columnas fichas_ruc."""
    if not data:
        return {"ruc": ""}
    data = sanitize_ficha_source_data(dict(data))
    if data.get("general") or data.get("modificacionContribuyente") or data.get("domicilioFiscal"):
        return sanitize_ficha_row(ficha_row_from_payload(data))
    if any(field in data for field in FICHA_SCALAR_FIELDS):
        return sanitize_ficha_row(ficha_row_from_flat(data))
    return sanitize_ficha_row(ficha_row_from_payload(data))


def _iso(d: date | datetime | None) -> str:
    if d is None:
        return ""
    if isinstance(d, datetime):
        return d.date().isoformat()
    return d.isoformat()


def _join_doc(tipo: str | None, numero: str | None) -> str:
    t, n = _s(tipo), _s(numero)
    if t and n:
        return f"{t} - {n}"
    return t or n


def payload_from_ficha(
    ficha: FichaRuc,
    *,
    tributos: list[Any],
    representantes: list[Any],
    personas: list[Any],
    establecimientos: list[Any],
) -> dict[str, Any]:
    return {
        "ruc": ficha.ruc,
        "updatedAt": _iso(ficha.updated_at),
        "general": {
            "razonSocial": ficha.razon_social,
            "tipoContribuyente": ficha.tipo_contribuyente or "",
            "fechaInscripcion": _iso(ficha.fecha_inscripcion),
            "fechaInicioActividades": _iso(ficha.fecha_inicio_actividades),
            "estadoContribuyente": ficha.estado_contribuyente or "",
            "dependenciaSunat": ficha.dependencia_sunat or "",
            "condicionDomicilioFiscal": ficha.condicion_domicilio_fiscal or "",
            "emisorElectronicoDesde": ficha.emisor_electronico_desde or "",
            "comprobantesElectronicos": ficha.comprobantes_electronicos or "",
            "fechaBaja": _iso(ficha.fecha_baja),
        },
        "modificacionContribuyente": {
            "nombreComercial": ficha.nombre_comercial or "",
            "tipoRepresentacion": ficha.tipo_representacion or "",
            "actividadEconomicaPrincipal": ficha.actividad_economica_principal or "",
            "actividadEconomicaSecundaria1": ficha.actividad_economica_secundaria1 or "",
            "actividadEconomicaSecundaria2": ficha.actividad_economica_secundaria2 or "",
            "sistemaEmisionComprobantes": ficha.sistema_emision_comprobantes or "",
            "sistemaContabilidad": ficha.sistema_contabilidad or "",
            "codigoProfesionOficio": ficha.codigo_profesion_oficio or "",
            "actividadComercioExterior": ficha.actividad_comercio_exterior or "",
            "numeroFax": ficha.numero_fax or "",
            "telefonoFijo1": ficha.telefono_fijo1 or "",
            "telefonoFijo2": ficha.telefono_fijo2 or "",
            "telefonoMovil1": ficha.telefono_movil1 or "",
            "telefonoMovil2": ficha.telefono_movil2 or "",
            "correoElectronico1": ficha.correo_electronico1 or "",
            "correoElectronico2": ficha.correo_electronico2 or "",
        },
        "domicilioFiscal": {
            "actividadEconomica": ficha.actividad_economica or "",
            "departamento": ficha.departamento or "",
            "provincia": ficha.provincia or "",
            "distrito": ficha.distrito or "",
            "ubigeo": ficha.ubigeo or "",
            "tipoNombreZona": ficha.tipo_zona or "",
            "nombreZona": ficha.nombre_zona or "",
            "tipoNombreVia": ficha.tipo_via or "",
            "nombreVia": ficha.nombre_via or "",
            "numero": ficha.numero or "",
            "nroKmMzLote": ficha.numero or "",
            "km": ficha.km or "",
            "manzana": ficha.manzana or "",
            "lote": ficha.lote or "",
            "departamentoInterno": ficha.departamento_interno or "",
            "interior": ficha.interior or "",
            "otrasReferencias": ficha.otras_referencias or "",
            "condicionInmueble": ficha.condicion_inmueble or "",
            "licenciaMunicipal": ficha.licencia_municipal or "",
        },
        "personaNatural": {
            "documentoIdentidad": ficha.documento_identidad or "",
            "fechaNacimientoSucesion": _iso(ficha.fecha_nacimiento),
            "sexo": ficha.sexo or "",
            "pasaporte": ficha.pasaporte or "",
            "nacionalidad": ficha.nacionalidad or "",
            "paisProcedencia": ficha.pais_procedencia or "",
            "condDomiciliado": ficha.cond_domiciliado or "",
        },
        "empresa": {
            "fechaInscripcionRrPp": _iso(ficha.fecha_inscripcion_rrpp),
            "numeroPartidaRegistral": ficha.numero_partida_registral or "",
            "tomoFichaFolioAsiento": ficha.tomo_ficha_folio_asiento or "",
            "origenCapital": ficha.origen_capital or "",
            "paisOrigenCapital": ficha.pais_origen_capital or "",
        },
        "tributosAfectos": [
            {
                "id": str(t.id),
                "tributo": t.tributo or "",
                "fechaAlta": _iso(t.fecha_alta),
                "afectoDesde": _iso(t.afecto_desde),
                "marcaExoneracion": "SI" if t.marca_exoneracion else "NO",
                "exoneracionDesde": _iso(t.exoneracion_desde),
                "hasta": _iso(t.hasta),
                "modificacion": t.modificacion or "",
            }
            for t in tributos
        ],
        "representantesLegales": [
            {
                "id": str(r.id),
                "tipoNroDoc": _join_doc(r.tipo_documento, r.numero_documento),
                "apellidosNombres": r.apellidos_nombres or "",
                "fechaNacimiento": _iso(r.fecha_nacimiento),
                "cargo": r.cargo or "",
                "fechaDesde": _iso(r.fecha_desde),
                "nroOrdenRepresentacion": r.numero_orden_representacion or "",
            }
            for r in representantes
        ],
        "personasVinculadas": [
            {
                "id": str(p.id),
                "tipoNroDoc": _join_doc(p.tipo_documento, p.numero_documento),
                "apellidosNombres": p.apellidos_nombres or "",
                "fechaNacimiento": _iso(p.fecha_nacimiento),
                "vinculo": "",
                "fechaDesde": _iso(p.fecha_desde),
                "residencia": "",
                "porcentaje": str(p.porcentaje or ""),
            }
            for p in personas
        ],
        "establecimientosAnexos": [
            {
                "id": str(e.id),
                "codigo": e.codigo or "",
                "tipo": e.tipo or "",
                "denominacion": e.denominacion or "",
                "ubigeo": e.ubigeo or "",
                "domicilio": e.domicilio or "",
                "otrasReferencias": e.otras_referencias or "",
                "condLegal": e.condicion_legal or "",
                "licenciaMunicipal": e.licencia_municipal or "",
                "actEcon": e.actividad_economica or "",
                "modificacion": e.modificacion or "",
            }
            for e in establecimientos
        ],
    }


def sync_child_tables_optional(ruc: str, data: dict[str, Any]) -> None:
    """Tablas hijas opcionales; en despliegue payload-only no hace nada."""
    try:
        sync_child_tables(ruc, data)
    except Exception:
        import logging

        logging.getLogger(__name__).warning(
            "Ficha RUC %s: tablas hijas no sincronizadas (payload jsonb).",
            ruc,
            exc_info=True,
        )


def sync_child_tables(ruc: str, data: dict[str, Any]) -> None:
    from api.models import (
        EstablecimientoAnexo,
        OtraPersonaVinculada,
        RepresentanteLegal,
        TributoAfecto,
    )

    TributoAfecto.objects.filter(ruc=ruc).delete()
    RepresentanteLegal.objects.filter(ruc=ruc).delete()
    OtraPersonaVinculada.objects.filter(ruc=ruc).delete()
    EstablecimientoAnexo.objects.filter(ruc=ruc).delete()

    for i, row in enumerate(data.get("tributosAfectos") or []):
        TributoAfecto.objects.create(
            ruc=ruc,
            tributo=_s(row.get("tributo")),
            fecha_alta=_date(row.get("fechaAlta")),
            afecto_desde=_date(row.get("afectoDesde")),
            exoneracion_desde=_date(row.get("exoneracionDesde")),
            hasta=_date(row.get("hasta")),
            marca_exoneracion=_bool(row.get("marcaExoneracion")),
            modificacion=_s(row.get("modificacion")),
            orden=i,
        )

    for i, row in enumerate(data.get("representantesLegales") or []):
        tipo, numero = _split_doc(_s(row.get("tipoNroDoc")))
        RepresentanteLegal.objects.create(
            ruc=ruc,
            tipo_documento=tipo,
            numero_documento=numero,
            apellidos_nombres=_s(row.get("apellidosNombres")),
            cargo=_s(row.get("cargo")),
            fecha_desde=_date(row.get("fechaDesde")),
            fecha_nacimiento=_date(row.get("fechaNacimiento")),
            numero_orden_representacion=_s(row.get("nroOrdenRepresentacion")),
            orden=i,
        )

    for i, row in enumerate(data.get("personasVinculadas") or []):
        tipo, numero = _split_doc(_s(row.get("tipoNroDoc")))
        pct = _s(row.get("porcentaje"))
        OtraPersonaVinculada.objects.create(
            ruc=ruc,
            tipo_documento=tipo,
            numero_documento=numero,
            apellidos_nombres=_s(row.get("apellidosNombres")),
            fecha_desde=_date(row.get("fechaDesde")),
            fecha_nacimiento=_date(row.get("fechaNacimiento")),
            porcentaje=Decimal(pct) if pct else None,
            orden=i,
        )

    for i, row in enumerate(data.get("establecimientosAnexos") or []):
        EstablecimientoAnexo.objects.create(
            ruc=ruc,
            codigo=_s(row.get("codigo")),
            tipo=_s(row.get("tipo")),
            denominacion=_s(row.get("denominacion")),
            ubigeo=_s(row.get("ubigeo")),
            domicilio=_s(row.get("domicilio")),
            otras_referencias=_s(row.get("otrasReferencias")),
            condicion_legal=_s(row.get("condLegal")),
            licencia_municipal=_s(row.get("licenciaMunicipal")),
            actividad_economica=_s(row.get("actEcon")),
            modificacion=_s(row.get("modificacion")),
            orden=i,
        )
