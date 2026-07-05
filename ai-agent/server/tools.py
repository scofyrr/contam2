"""Herramientas read-only: base de datos + búsqueda web."""

from __future__ import annotations

import json
import re
from datetime import datetime
from html import unescape
from typing import Any
from zoneinfo import ZoneInfo

from duckduckgo_search import DDGS

from config import ALLOWED_TABLES, QUERY_DEFAULT_LIMIT, QUERY_MAX_LIMIT, QUERY_MAX_OFFSET
from db import (
    fetch_all,
    fetch_one,
    fetch_scalar,
    get_table_columns,
    list_existing_tables,
    read_only_connection,
    table_exists,
)

try:
    import httpx
except ImportError:
    httpx = None  # type: ignore[assignment,misc]

RUC_RE = re.compile(r"\d{11}")
COUNT_QUESTION_RE = re.compile(
    r"\b("
    r"cu[aá]nt(o|os|as)|cantidad|n[uú]mero de|total de|"
    r"cu[aá]ntos registros|cuantos registros|"
    r"existen en|hay en|registros hay|registros existen|registros tiene|registros contiene"
    r")\b",
    re.IGNORECASE,
)
TABLE_REFERENCE_RE = re.compile(r"\b(esa|esta|la|dicha)\s+tabla\b", re.IGNORECASE)
TABLE_ALIASES: dict[str, tuple[str, ...]] = {
    "plan_contable_pcge": (
        "plan de cuentas",
        "plan contable",
        "pcge",
        "cuentas contables",
        "plan contable general",
    ),
    "contribuyentes": ("contribuyente", "contribuyentes", "clientes"),
    "fichas_ruc": ("ficha ruc", "fichas ruc"),
    "asientos_contables": ("asientos contables", "asiento contable"),
    "movimientos_caja": ("movimientos caja", "libro caja"),
    "registros_sire": ("registros sire", "sire"),
    "auth_user": ("usuarios del sistema", "usuario del sistema"),
}
NEWS_KEYWORDS_RE = re.compile(
    r"\b(noticias?|deportes?|partido|resultado|marcador|gol|fútbol|futbol|"
    r"liga|champions|mundial|copa|nba|tenis|boxeo|último|ultimo|hoy|ayer)\b",
    re.IGNORECASE,
)
DDG_HTML_RESULT_RE = re.compile(
    r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>'
    r'.*?<a[^>]+class="result__snippet"[^>]*>(.*?)</a>',
    re.DOTALL | re.IGNORECASE,
)
DDG_LITE_LINK_RE = re.compile(
    r'<a[^>]+rel="nofollow"[^>]+href="([^"]+)"[^>]*>(.*?)</a>',
    re.DOTALL | re.IGNORECASE,
)


def _normalize_ruc(value: str) -> str:
    return "".join(c for c in (value or "") if c.isdigit())[:11]


def _history_text(history: list[dict[str, str]], *, max_messages: int = 12) -> str:
    chunks: list[str] = []
    for item in history[-max_messages:]:
        content = (item.get("content") or "").strip()
        if content:
            chunks.append(content)
    return "\n".join(chunks)


def detect_tables_in_text(text: str) -> list[str]:
    text_lower = (text or "").lower()
    found: list[str] = []
    for table in ALLOWED_TABLES:
        if table in text_lower and table not in found:
            found.append(table)
            continue
        spaced = table.replace("_", " ")
        if spaced in text_lower and table not in found:
            found.append(table)
    for table, aliases in TABLE_ALIASES.items():
        if table in found:
            continue
        for alias in aliases:
            if alias in text_lower:
                found.append(table)
                break
    return found


def is_count_question(text: str) -> bool:
    return bool(COUNT_QUESTION_RE.search(text or ""))


def resolve_tables_for_count(message: str, history: list[dict[str, str]]) -> list[str]:
    message = message or ""
    direct = detect_tables_in_text(message)
    if direct:
        return direct

    full_context = _history_text(history)
    if TABLE_REFERENCE_RE.search(message) or is_count_question(message):
        contextual = detect_tables_in_text(full_context)
        if contextual:
            return [contextual[-1]]
    return []


def build_verified_count_context(message: str, history: list[dict[str, str]]) -> str:
    if not is_count_question(message):
        return ""
    tables = resolve_tables_for_count(message, history)
    if not tables:
        tables = detect_tables_in_text(_history_text(history))
    lines: list[str] = []
    for table in tables:
        result = tool_count_table(table)
        if result.get("error"):
            continue
        lines.append(f"- {table}: {result['count']} registros (COUNT(*) exacto, verificado)")
    if not lines:
        return ""
    return (
        "CONTEO VERIFICADO EN BASE DE DATOS (OBLIGATORIO — NO uses returned_count ni len(rows)):\n"
        + "\n".join(lines)
    )


def try_direct_count_reply(message: str, history: list[dict[str, str]]) -> dict[str, Any] | None:
    if not is_count_question(message):
        return None

    tables = resolve_tables_for_count(message, history)
    if len(tables) != 1:
        return None

    result = tool_count_table(tables[0])
    if result.get("error") or "count" not in result:
        return None

    table = tables[0]
    count = result["count"]
    return {
        "reply": (
            f"En la base de datos del sistema CONTAM, la tabla `{table}` contiene "
            f"**{count} registros** (conteo exacto con COUNT(*), no paginado).\n\n"
            f"*Fuente: Base de datos (tabla: {table})*"
        ),
        "tools_used": ["count_table"],
    }


def _build_filter_clause(filters: dict[str, str] | None) -> tuple[str, list[Any]]:
    where_parts: list[str] = []
    params: list[Any] = []
    for col, val in (filters or {}).items():
        if not re.match(r"^[a-z_][a-z0-9_]*$", col):
            raise ValueError(f"Nombre de columna inválido: {col}")
        where_parts.append(f'"{col}"::text ILIKE %s')
        params.append(f"%{val}%")
    where_sql = f" WHERE {' AND '.join(where_parts)}" if where_parts else ""
    return where_sql, params


def _strip_html(text: str) -> str:
    clean = re.sub(r"<[^>]+>", " ", text or "")
    return re.sub(r"\s+", " ", unescape(clean)).strip()


def _dedupe_results(results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for item in results:
        url = (item.get("url") or "").strip().lower()
        title = (item.get("title") or "").strip().lower()
        key = url or title
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped


def tool_get_datetime_peru() -> dict[str, Any]:
    tz = ZoneInfo("America/Lima")
    now = datetime.now(tz)
    weekdays = {
        0: "lunes",
        1: "martes",
        2: "miércoles",
        3: "jueves",
        4: "viernes",
        5: "sábado",
        6: "domingo",
    }
    return {
        "timezone": "America/Lima",
        "country": "Perú",
        "datetime_iso": now.isoformat(),
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "weekday": weekdays.get(now.weekday(), now.strftime("%A")),
        "formatted": now.strftime("%d/%m/%Y %H:%M:%S"),
    }


def tool_list_tables() -> dict[str, Any]:
    existing = list_existing_tables()
    return {
        "available_tables": existing,
        "note": "Solo lectura. Tablas contables y auth Django disponibles según permisos.",
    }


def tool_count_table(table: str, filters: dict[str, str] | None = None) -> dict[str, Any]:
    if table not in ALLOWED_TABLES:
        return {"error": f"Tabla no permitida: {table}"}

    with read_only_connection() as conn:
        if not table_exists(conn, table):
            return {"error": f"Tabla {table} no existe en la base de datos"}

        try:
            where_sql, params = _build_filter_clause(filters)
        except ValueError as exc:
            return {"error": str(exc)}

        try:
            count = fetch_scalar(conn, f'SELECT COUNT(*) FROM "{table}"{where_sql}', tuple(params))
        except Exception as exc:
            return {"error": f"Error en conteo read-only: {exc}"}

        return {
            "table": table,
            "count": int(count or 0),
            "filters": filters or {},
            "note": "Conteo exacto con COUNT(*), no paginado.",
        }


def tool_describe_table(table: str) -> dict[str, Any]:
    if table not in ALLOWED_TABLES:
        return {"error": f"Tabla no permitida: {table}"}

    with read_only_connection() as conn:
        if not table_exists(conn, table):
            return {"error": f"Tabla {table} no existe en la base de datos"}

        columns = get_table_columns(conn, table)
        try:
            total_rows = fetch_scalar(conn, f'SELECT COUNT(*) FROM "{table}"')
        except Exception as exc:
            return {"error": f"Error al describir tabla: {exc}"}

        return {
            "table": table,
            "total_rows": int(total_rows or 0),
            "column_count": len(columns),
            "columns": columns,
        }


def tool_get_contribuyente(ruc: str) -> dict[str, Any]:
    clean = _normalize_ruc(ruc)
    if len(clean) != 11:
        return {"error": "RUC inválido: debe tener 11 dígitos", "ruc": clean}

    with read_only_connection() as conn:
        if not table_exists(conn, "contribuyentes"):
            return {"error": "Tabla contribuyentes no encontrada en la base de datos"}

        row = fetch_one(
            conn,
            """
            SELECT ruc, razon_social, estado, otros, fecha_vencimiento_declaracion,
                   cat1ra, cat2da, cat3ra, cat4ta_retenciones, cat4ta_cta_propia, cat5ta,
                   validez_cpe, created_at, updated_at
            FROM contribuyentes
            WHERE ruc = %s
            LIMIT 1
            """,
            (clean,),
        )
        if not row:
            return {"found": False, "ruc": clean, "message": "No hay contribuyente con ese RUC"}
        return {"found": True, "contribuyente": row}


def tool_search_contribuyentes(query: str, limit: int = 10) -> dict[str, Any]:
    q = (query or "").strip()
    if not q:
        return {"error": "Consulta vacía"}

    limit = max(1, min(limit, 20))

    with read_only_connection() as conn:
        if not table_exists(conn, "contribuyentes"):
            return {"error": "Tabla contribuyentes no encontrada"}

        if RUC_RE.fullmatch(_normalize_ruc(q)):
            clean = _normalize_ruc(q)
            rows = fetch_all(
                conn,
                """
                SELECT ruc, razon_social, estado, otros
                FROM contribuyentes
                WHERE ruc = %s
                LIMIT %s
                """,
                (clean, limit),
            )
        else:
            pattern = f"%{q}%"
            rows = fetch_all(
                conn,
                """
                SELECT ruc, razon_social, estado, otros
                FROM contribuyentes
                WHERE razon_social ILIKE %s OR ruc ILIKE %s OR otros ILIKE %s
                ORDER BY razon_social
                LIMIT %s
                """,
                (pattern, pattern, pattern, limit),
            )

        return {"count": len(rows), "results": rows}


def tool_get_ficha_ruc(ruc: str) -> dict[str, Any]:
    clean = _normalize_ruc(ruc)
    if len(clean) != 11:
        return {"error": "RUC inválido: debe tener 11 dígitos"}

    with read_only_connection() as conn:
        if not table_exists(conn, "fichas_ruc"):
            return {"error": "Tabla fichas_ruc no encontrada"}

        row = fetch_one(
            conn,
            """
            SELECT ruc, razon_social, nombre_comercial, telefono_fijo1, telefono_fijo2,
                   telefono_movil1, telefono_movil2, correo_electronico1, correo_electronico2,
                   numero_fax, estado_contribuyente, actividad_economica_principal,
                   departamento, provincia, distrito, updated_at
            FROM fichas_ruc
            WHERE ruc = %s
            LIMIT 1
            """,
            (clean,),
        )
        if not row:
            return {"found": False, "ruc": clean, "message": "No hay ficha RUC registrada"}
        return {"found": True, "ficha": row}


def tool_get_auth_user(identifier: str) -> dict[str, Any]:
    ident = (identifier or "").strip()
    if not ident:
        return {"error": "Indica username o email"}

    with read_only_connection() as conn:
        if not table_exists(conn, "auth_user"):
            return {"error": "Tabla auth_user no encontrada"}

        row = fetch_one(
            conn,
            """
            SELECT id, username, first_name, last_name, email,
                   is_active, is_staff, is_superuser, last_login, date_joined
            FROM auth_user
            WHERE username ILIKE %s OR email ILIKE %s
            LIMIT 1
            """,
            (ident, ident),
        )
        if not row:
            return {"found": False, "message": "Usuario no encontrado"}
        return {"found": True, "user": row}


def tool_query_table(
    table: str,
    filters: dict[str, str] | None = None,
    limit: int | None = None,
    offset: int = 0,
) -> dict[str, Any]:
    if table not in ALLOWED_TABLES:
        return {"error": f"Tabla no permitida: {table}"}

    page_limit = QUERY_DEFAULT_LIMIT if limit is None else limit
    page_limit = max(1, min(page_limit, QUERY_MAX_LIMIT))
    page_offset = max(0, min(offset, QUERY_MAX_OFFSET))

    with read_only_connection() as conn:
        if not table_exists(conn, table):
            return {"error": f"Tabla {table} no existe en la base de datos"}

        try:
            where_sql, params = _build_filter_clause(filters)
        except ValueError as exc:
            return {"error": str(exc)}

        try:
            total_count = fetch_scalar(
                conn,
                f'SELECT COUNT(*) FROM "{table}"{where_sql}',
                tuple(params),
            )
        except Exception as exc:
            return {"error": f"Error al contar registros: {exc}"}

        total_count = int(total_count or 0)
        order_sql = " ORDER BY codigo_cuenta" if table == "plan_contable_pcge" else ""
        query = f'SELECT * FROM "{table}"{where_sql}{order_sql} LIMIT %s OFFSET %s'
        query_params = [*params, page_limit, page_offset]

        try:
            rows = fetch_all(conn, query, tuple(query_params))
        except Exception as exc:
            return {"error": f"Error en consulta read-only: {exc}"}

        returned_count = len(rows)
        return {
            "table": table,
            "total_count": total_count,
            "answer_for_total_records": total_count,
            "returned_count": returned_count,
            "offset": page_offset,
            "limit": page_limit,
            "has_more": page_offset + returned_count < total_count,
            "rows": rows,
            "critical_warning": (
                f"TOTAL REAL DE LA TABLA = {total_count}. "
                f"Esta respuesta incluye solo {returned_count} filas (página). "
                f"NUNCA digas {returned_count} como total de registros."
            ),
        }


def _ddg_text_search(query: str, max_results: int) -> list[dict[str, Any]]:
    with DDGS() as ddgs:
        hits = list(ddgs.text(query, max_results=max_results, region="pe-pe"))
    return [
        {
            "title": h.get("title", ""),
            "snippet": h.get("body", ""),
            "url": h.get("href", ""),
            "source": "duckduckgo_text",
        }
        for h in hits
    ]


def _ddg_news_search(query: str, max_results: int) -> list[dict[str, Any]]:
    with DDGS() as ddgs:
        hits = list(ddgs.news(query, max_results=max_results, region="pe-pe"))
    return [
        {
            "title": h.get("title", ""),
            "snippet": h.get("body", ""),
            "url": h.get("url", h.get("href", "")),
            "date": h.get("date", ""),
            "source": "duckduckgo_news",
        }
        for h in hits
    ]


def _httpx_html_fallback(query: str, max_results: int) -> list[dict[str, Any]]:
    if httpx is None:
        return []

    headers = {"User-Agent": "Mozilla/5.0 (compatible; CONTAM-AI/1.0)"}
    results: list[dict[str, Any]] = []

    try:
        with httpx.Client(timeout=12.0, follow_redirects=True, headers=headers) as client:
            resp = client.get("https://html.duckduckgo.com/html/", params={"q": query})
            resp.raise_for_status()
            for match in DDG_HTML_RESULT_RE.finditer(resp.text):
                url, title, snippet = match.groups()
                results.append(
                    {
                        "title": _strip_html(title),
                        "snippet": _strip_html(snippet),
                        "url": url if url.startswith("http") else "",
                        "source": "duckduckgo_html",
                    }
                )
                if len(results) >= max_results:
                    break

            if len(results) < max_results:
                lite = client.post(
                    "https://lite.duckduckgo.com/lite/",
                    data={"q": query},
                )
                lite.raise_for_status()
                for match in DDG_LITE_LINK_RE.finditer(lite.text):
                    url, title = match.groups()
                    if not url.startswith("http"):
                        continue
                    results.append(
                        {
                            "title": _strip_html(title),
                            "snippet": "",
                            "url": url,
                            "source": "duckduckgo_lite",
                        }
                    )
                    if len(results) >= max_results:
                        break
    except Exception:
        return []

    return results


def tool_search_web(query: str, max_results: int = 5) -> dict[str, Any]:
    q = (query or "").strip()
    if not q:
        return {"error": "Consulta web vacía"}

    max_results = max(1, min(max_results, 8))
    results: list[dict[str, Any]] = []
    errors: list[str] = []
    use_news = bool(NEWS_KEYWORDS_RE.search(q))

    try:
        results.extend(_ddg_text_search(q, max_results))
    except Exception as exc:
        errors.append(f"text: {exc}")

    if use_news:
        try:
            results.extend(_ddg_news_search(q, max_results))
        except Exception as exc:
            errors.append(f"news: {exc}")

    results = _dedupe_results(results)

    if not results:
        results = _httpx_html_fallback(q, max_results)
        results = _dedupe_results(results)

    if not results:
        payload: dict[str, Any] = {
            "query": q,
            "count": 0,
            "results": [],
            "message": "No se encontraron resultados en internet. No inventes ni supongas la respuesta.",
        }
        if errors:
            payload["errors"] = errors
        return payload

    return {
        "query": q,
        "count": len(results[:max_results]),
        "results": results[:max_results],
        "sources_used": sorted({r.get("source", "") for r in results[:max_results]}),
    }


TOOL_DEFINITIONS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "get_datetime_peru",
            "description": "Fecha y hora actual real en Perú (zona America/Lima). Obligatorio para preguntas de hora/fecha en Perú.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "count_table",
            "description": "Cuenta exacta de registros con COUNT(*). Obligatorio para 'cuántos registros hay' en una tabla.",
            "parameters": {
                "type": "object",
                "properties": {
                    "table": {"type": "string"},
                    "filters": {
                        "type": "object",
                        "additionalProperties": {"type": "string"},
                        "description": "Filtros opcionales ILIKE por columna.",
                    },
                },
                "required": ["table"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "describe_table",
            "description": "Describe columnas (information_schema) y total_rows exacto de una tabla.",
            "parameters": {
                "type": "object",
                "properties": {"table": {"type": "string"}},
                "required": ["table"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tables",
            "description": "Lista tablas disponibles para consulta read-only.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_contribuyente",
            "description": "Obtiene datos de un contribuyente por RUC (11 dígitos).",
            "parameters": {
                "type": "object",
                "properties": {"ruc": {"type": "string", "description": "RUC de 11 dígitos"}},
                "required": ["ruc"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_contribuyentes",
            "description": "Busca contribuyentes por RUC parcial o razón social.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": 20},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_ficha_ruc",
            "description": "Obtiene teléfonos, correos y datos SUNAT de la ficha RUC.",
            "parameters": {
                "type": "object",
                "properties": {"ruc": {"type": "string"}},
                "required": ["ruc"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_auth_user",
            "description": "Busca usuario del sistema (auth_user) por username o email.",
            "parameters": {
                "type": "object",
                "properties": {"identifier": {"type": "string"}},
                "required": ["identifier"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "query_table",
            "description": "Lista filas paginadas (read-only). NO usar para saber cuántos registros hay en total; para eso usa count_table. El total real está en total_count, nunca en returned_count.",
            "parameters": {
                "type": "object",
                "properties": {
                    "table": {"type": "string"},
                    "filters": {
                        "type": "object",
                        "additionalProperties": {"type": "string"},
                    },
                    "limit": {"type": "integer", "minimum": 1, "maximum": 200},
                    "offset": {"type": "integer", "minimum": 0, "maximum": 50000},
                },
                "required": ["table"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Busca información actual en internet (deportes, noticias, etc.). Obligatorio antes de responder hechos externos.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_results": {"type": "integer", "minimum": 1, "maximum": 8},
                },
                "required": ["query"],
            },
        },
    },
]


def execute_tool(name: str, arguments: dict[str, Any]) -> str:
    if name == "get_datetime_peru":
        result = tool_get_datetime_peru()
    elif name == "count_table":
        result = tool_count_table(
            arguments.get("table", ""),
            arguments.get("filters") or {},
        )
    elif name == "describe_table":
        result = tool_describe_table(arguments.get("table", ""))
    elif name == "list_tables":
        result = tool_list_tables()
    elif name == "get_contribuyente":
        result = tool_get_contribuyente(arguments.get("ruc", ""))
    elif name == "search_contribuyentes":
        result = tool_search_contribuyentes(
            arguments.get("query", ""),
            int(arguments.get("limit", 10)),
        )
    elif name == "get_ficha_ruc":
        result = tool_get_ficha_ruc(arguments.get("ruc", ""))
    elif name == "get_auth_user":
        result = tool_get_auth_user(arguments.get("identifier", ""))
    elif name == "query_table":
        table = arguments.get("table", "")
        filters = arguments.get("filters") or {}
        offset = int(arguments.get("offset", 0))
        limit_arg = arguments.get("limit")

        # Si la IA usa query_table para contar (sin paginar ni filtrar), devolver COUNT(*) directo.
        if not filters and offset == 0 and limit_arg is not None and int(limit_arg) <= 25:
            count_result = tool_count_table(table, filters)
            if not count_result.get("error"):
                count_result["redirected_from"] = "query_table"
                count_result["critical_warning"] = (
                    "Esta consulta era un conteo. Usa el campo count como total exacto. "
                    "NO uses query_table para contar registros."
                )
                result = count_result
            else:
                result = tool_query_table(
                    table,
                    filters,
                    int(limit_arg) if limit_arg is not None else None,
                    offset,
                )
        else:
            result = tool_query_table(
                table,
                filters,
                int(limit_arg) if limit_arg is not None else None,
                offset,
            )
    elif name == "search_web":
        result = tool_search_web(
            arguments.get("query", ""),
            int(arguments.get("max_results", 5)),
        )
    else:
        result = {"error": f"Herramienta desconocida: {name}"}

    return json.dumps(result, ensure_ascii=False, default=str)
