"""Fuentes de datos read-only para Composer — mapeo BD → campos de formulario."""

from __future__ import annotations

import json
import re
from datetime import date, datetime
from typing import Any

from db import fetch_one, read_only_connection, table_exists
from sunat_client import sunat_ficha_ruc_note, validate_sol_credentials

RUC_RE = re.compile(r"\d{11}")


def _normalize_ruc(value: str) -> str:
    return "".join(c for c in (value or "") if c.isdigit())[:11]


def _s(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        return value.isoformat()[:10]
    text = str(value).strip()
    if text.lower() in {"null", "none", "undefined"}:
        return ""
    return text


def _fetch_sol_credentials_internal(conn, ruc: str) -> dict[str, str] | None:
    """Solo uso interno Composer — nunca exponer al LLM ni al frontend."""
    if not table_exists(conn, "contribuyentes"):
        return None
    with conn.cursor() as cur:
        cur.execute(
            "SELECT clave_sol FROM contribuyentes WHERE ruc = %s LIMIT 1",
            (ruc,),
        )
        row = cur.fetchone()
    if not row or not row[0]:
        return None
    raw = row[0]
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            return None
    if not isinstance(raw, dict):
        return None
    usuario = _s(raw.get("usuario"))
    clave = _s(raw.get("clave"))
    if not usuario or not clave:
        return None
    return {"usuario": usuario, "clave": clave}


def _map_ficha_row_to_paths(row: dict[str, Any]) -> dict[str, str]:
    """Mapea columnas planas fichas_ruc → paths del formulario CONTAM."""
    via = _s(row.get("tipo_via"))
    nombre_via = _s(row.get("nombre_via"))
    tipo_nombre_via = " ".join(p for p in [via, nombre_via] if p).strip()

    zona = _s(row.get("tipo_zona"))
    nombre_zona = _s(row.get("nombre_zona"))
    tipo_nombre_zona = " ".join(p for p in [zona, nombre_zona] if p).strip()

    nro_parts = [
        _s(row.get("numero")),
        _s(row.get("km")),
        _s(row.get("manzana")),
        _s(row.get("lote")),
    ]
    nro_km = " ".join(p for p in nro_parts if p).strip()

    mapped: dict[str, str] = {
        "ruc": _s(row.get("ruc")),
        "general.razonSocial": _s(row.get("razon_social")),
        "general.tipoContribuyente": _s(row.get("tipo_contribuyente")),
        "general.fechaInscripcion": _s(row.get("fecha_inscripcion")),
        "general.fechaInicioActividades": _s(row.get("fecha_inicio_actividades")),
        "general.estadoContribuyente": _s(row.get("estado_contribuyente")),
        "general.dependenciaSunat": _s(row.get("dependencia_sunat")),
        "general.condicionDomicilioFiscal": _s(row.get("condicion_domicilio_fiscal")),
        "general.emisorElectronicoDesde": _s(row.get("emisor_electronico_desde")),
        "general.comprobantesElectronicos": _s(row.get("comprobantes_electronicos")),
        "general.fechaBaja": _s(row.get("fecha_baja")),
        "modificacionContribuyente.nombreComercial": _s(row.get("nombre_comercial")),
        "modificacionContribuyente.tipoRepresentacion": _s(row.get("tipo_representacion")),
        "modificacionContribuyente.actividadEconomicaPrincipal": _s(row.get("actividad_economica_principal")),
        "modificacionContribuyente.actividadEconomicaSecundaria1": _s(row.get("actividad_economica_secundaria1")),
        "modificacionContribuyente.actividadEconomicaSecundaria2": _s(row.get("actividad_economica_secundaria2")),
        "modificacionContribuyente.sistemaEmisionComprobantes": _s(row.get("sistema_emision_comprobantes")),
        "modificacionContribuyente.sistemaContabilidad": _s(row.get("sistema_contabilidad")),
        "modificacionContribuyente.codigoProfesionOficio": _s(row.get("codigo_profesion_oficio")),
        "modificacionContribuyente.actividadComercioExterior": _s(row.get("actividad_comercio_exterior")),
        "modificacionContribuyente.numeroFax": _s(row.get("numero_fax")),
        "modificacionContribuyente.telefonoFijo1": _s(row.get("telefono_fijo1")),
        "modificacionContribuyente.telefonoFijo2": _s(row.get("telefono_fijo2")),
        "modificacionContribuyente.telefonoMovil1": _s(row.get("telefono_movil1")),
        "modificacionContribuyente.telefonoMovil2": _s(row.get("telefono_movil2")),
        "modificacionContribuyente.correoElectronico1": _s(row.get("correo_electronico1")),
        "modificacionContribuyente.correoElectronico2": _s(row.get("correo_electronico2")),
        "domicilioFiscal.actividadEconomica": _s(row.get("actividad_economica")),
        "domicilioFiscal.departamento": _s(row.get("departamento")),
        "domicilioFiscal.provincia": _s(row.get("provincia")),
        "domicilioFiscal.distrito": _s(row.get("distrito")),
        "domicilioFiscal.tipoNombreZona": tipo_nombre_zona,
        "domicilioFiscal.tipoNombreVia": tipo_nombre_via,
        "domicilioFiscal.nroKmMzLote": nro_km,
        "domicilioFiscal.otrasReferencias": _s(row.get("otras_referencias")),
        "domicilioFiscal.condicionInmueble": _s(row.get("condicion_inmueble")),
        "domicilioFiscal.licenciaMunicipal": _s(row.get("licencia_municipal")),
        "personaNatural.documentoIdentidad": _s(row.get("documento_identidad")),
        "personaNatural.fechaNacimientoSucesion": _s(row.get("fecha_nacimiento")),
        "personaNatural.sexo": _s(row.get("sexo")),
        "personaNatural.pasaporte": _s(row.get("pasaporte")),
        "personaNatural.nacionalidad": _s(row.get("nacionalidad")),
        "personaNatural.paisProcedencia": _s(row.get("pais_procedencia")),
        "personaNatural.condDomiciliado": _s(row.get("cond_domiciliado")),
        "empresa.fechaInscripcionRrPp": _s(row.get("fecha_inscripcion_rrpp")),
        "empresa.numeroPartidaRegistral": _s(row.get("numero_partida_registral")),
        "empresa.tomoFichaFolioAsiento": _s(row.get("tomo_ficha_folio_asiento")),
        "empresa.origenCapital": _s(row.get("origen_capital")),
        "empresa.paisOrigenCapital": _s(row.get("pais_origen_capital")),
    }
    return {k: v for k, v in mapped.items() if v}


def _map_contribuyente_row_to_paths(row: dict[str, Any]) -> dict[str, str]:
    mapped = {
        "ruc": _s(row.get("ruc")),
        "razonSocial": _s(row.get("razon_social")),
        "estado": _s(row.get("estado")),
        "otros": _s(row.get("otros")),
        "fechaVencimientoDeclaracion": _s(row.get("fecha_vencimiento_declaracion")),
    }
    return {k: v for k, v in mapped.items() if v}


def resolve_sol_credentials(
    ruc: str,
    page_sol: dict[str, str] | None,
) -> tuple[dict[str, str] | None, str]:
    """Prioridad: credenciales enviadas en page_context (sesión UI), luego BD interna."""
    if page_sol:
        usuario = _s(page_sol.get("usuario"))
        clave = _s(page_sol.get("clave"))
        if usuario and clave:
            return {"usuario": usuario, "clave": clave}, "page_context"

    with read_only_connection() as conn:
        internal = _fetch_sol_credentials_internal(conn, ruc)
    if internal:
        return internal, "bd_contribuyentes"
    return None, "none"


def gather_composer_data(
    ruc: str,
    page_id: str,
    *,
    page_sol: dict[str, str] | None = None,
    validate_sol: bool = True,
) -> dict[str, Any]:
    clean = _normalize_ruc(ruc)
    if len(clean) != 11:
        return {"error": "RUC inválido (11 dígitos)", "values": {}, "sources": []}

    values: dict[str, str] = {"ruc": clean}
    sources: list[str] = []
    meta: dict[str, Any] = {}

    with read_only_connection() as conn:
        if page_id == "ficha-ruc" and table_exists(conn, "fichas_ruc"):
            row = fetch_one(conn, "SELECT * FROM fichas_ruc WHERE ruc = %s LIMIT 1", (clean,))
            if row:
                mapped = _map_ficha_row_to_paths(row)
                values.update(mapped)
                sources.append("bd:fichas_ruc")
                meta["ficha_found"] = True
            else:
                meta["ficha_found"] = False

        if table_exists(conn, "contribuyentes"):
            contrib = fetch_one(
                conn,
                """
                SELECT ruc, razon_social, estado, otros, fecha_vencimiento_declaracion
                FROM contribuyentes WHERE ruc = %s LIMIT 1
                """,
                (clean,),
            )
            if contrib:
                if page_id == "contribuyentes":
                    values.update(_map_contribuyente_row_to_paths(contrib))
                elif page_id == "ficha-ruc" and not values.get("general.razonSocial"):
                    values["general.razonSocial"] = _s(contrib.get("razon_social"))
                sources.append("bd:contribuyentes")

    sol_creds, sol_origin = resolve_sol_credentials(clean, page_sol)
    meta["sol_credentials_origin"] = sol_origin

    if validate_sol and sol_creds:
        check = validate_sol_credentials(clean, sol_creds["usuario"], sol_creds["clave"])
        meta["sol_validation"] = {
            "ok": check.get("ok"),
            "message": check.get("message") or check.get("error"),
        }
        if check.get("ok"):
            sources.append("sunat:clave_sol_validada")
    elif validate_sol:
        meta["sol_validation"] = {
            "ok": False,
            "message": "No hay Clave SOL en la pantalla ni en contribuyentes (solo lectura)",
        }

    meta["sunat_note"] = sunat_ficha_ruc_note()

    return {
        "ruc": clean,
        "page_id": page_id,
        "values": values,
        "sources": sorted(set(sources)),
        "meta": meta,
    }


def build_fill_plan(
    fields: list[dict[str, Any]],
    available: dict[str, str],
    *,
    overwrite: bool = False,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Genera acciones de relleno determinísticas.
    Solo asigna valores con fuente verificada — nunca inventa.
    """
    fills: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []

    for field in fields:
        path = _s(field.get("path") or field.get("field_path"))
        if not path:
            continue
        label = _s(field.get("label")) or path
        current = _s(field.get("value"))
        readonly = bool(field.get("readonly") or field.get("disabled"))
        sensitive = bool(field.get("sensitive"))

        if readonly or sensitive:
            skipped.append(
                {
                    "field_path": path,
                    "label": label,
                    "reason": "Campo de solo lectura o sensible — el contador debe completarlo",
                }
            )
            continue

        new_value = available.get(path)
        if not new_value:
            skipped.append(
                {
                    "field_path": path,
                    "label": label,
                    "reason": "Sin dato en Clave SOL / BD — complétalo manualmente",
                }
            )
            continue

        if current and not overwrite and current == new_value:
            skipped.append(
                {
                    "field_path": path,
                    "label": label,
                    "reason": "Ya tiene el valor correcto",
                    "current_value": current,
                }
            )
            continue

        if current and not overwrite:
            skipped.append(
                {
                    "field_path": path,
                    "label": label,
                    "reason": "Ya tiene valor — no sobrescrito (revisa tú si debe cambiar)",
                    "current_value": current,
                }
            )
            continue

        fills.append(
            {
                "field_path": path,
                "label": label,
                "value": new_value,
                "source": "bd:fichas_ruc" if path != "ruc" else "bd:contribuyentes",
            }
        )

    return fills, skipped


def _normalize_compare(value: str) -> str:
    return _s(value).lower()


def verify_fields_against_source(
    fields: list[dict[str, Any]],
    expected: dict[str, str],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Compara valores actuales del formulario vs fuente BD.
    Devuelve: (correcciones, correctos, incidencias).
    """
    fixes: list[dict[str, Any]] = []
    correct: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []

    for field in fields:
        path = _s(field.get("path") or field.get("field_path"))
        if not path:
            continue
        label = _s(field.get("label")) or path
        current = _s(field.get("value"))
        readonly = bool(field.get("readonly") or field.get("disabled"))
        sensitive = bool(field.get("sensitive"))

        if readonly or sensitive:
            continue

        expected_val = _s(expected.get(path))
        if not expected_val:
            if current:
                issues.append(
                    {
                        "field_path": path,
                        "label": label,
                        "issue_type": "no_reference",
                        "current_value": current,
                        "expected_value": "",
                        "fixed": False,
                        "message": "Hay valor en pantalla pero no hay referencia en BD para verificar",
                    }
                )
            continue

        if _normalize_compare(current) == _normalize_compare(expected_val):
            correct.append(
                {
                    "field_path": path,
                    "label": label,
                    "issue_type": "ok",
                    "current_value": current,
                    "expected_value": expected_val,
                    "fixed": False,
                    "message": "Correcto",
                }
            )
            continue

        if not current:
            issue_type = "missing"
            msg = f"Faltaba dato — debía ser: {expected_val}"
        else:
            issue_type = "incorrect"
            msg = f"Valor incorrecto: «{current}» → debía ser «{expected_val}»"

        issues.append(
            {
                "field_path": path,
                "label": label,
                "issue_type": issue_type,
                "current_value": current,
                "expected_value": expected_val,
                "fixed": True,
                "message": msg,
            }
        )
        fixes.append(
            {
                "field_path": path,
                "label": label,
                "value": expected_val,
                "source": "bd:fichas_ruc",
                "fix_reason": msg,
            }
        )

    return fixes, correct, issues
